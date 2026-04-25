// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ModelRegistry.sol";

contract AttestationRegistry {
    struct Attestation {
        bytes32 id;
        bytes32 modelId;
        bytes32 inputHash;
        bytes32 outputHash;
        string metadataURI;
        uint256 timestamp;
        bool isRevoked;
    }
    
    struct PredictionData {
        bytes32 modelId;
        bytes32 inputHash;
        bytes32 outputHash;
        uint256 deadline;
    }

    ModelRegistry public modelRegistry;
    
    mapping(bytes32 => Attestation) public attestations;
    mapping(bytes32 => bytes32[]) public modelAttestations;
    mapping(bytes32 => bool) public predictionHashes;
    
    bytes32 public DOMAIN_SEPARATOR;
    bytes32 public constant PREDICTION_TYPEHASH = keccak256(
        "PredictionData(bytes32 modelId,bytes32 inputHash,bytes32 outputHash,uint256 deadline)"
    );
    
    event AttestationCreated(
        bytes32 indexed id,
        bytes32 indexed modelId,
        bytes32 inputHash,
        bytes32 outputHash,
        address indexed attester,
        uint256 deadline,
        string metadataURI
    );
    
    event AttestationRevoked(
        bytes32 indexed id,
        string reason
    );

    constructor(address _modelRegistry) {
        modelRegistry = ModelRegistry(payable(_modelRegistry));
        
        DOMAIN_SEPARATOR = keccak256(abi.encode(
            keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
            keccak256(bytes("VerifiableAI")),
            keccak256(bytes("1")),
            block.chainid,
            address(this)
        ));
    }
    
    function createAttestation(
        bytes32 _modelId,
        bytes32 _inputHash,
        bytes32 _outputHash,
        string calldata _metadataURI,
        uint256 _deadline,
        uint8 _v,
        bytes32 _r,
        bytes32 _s
    ) external returns (bytes32) {
        ModelRegistry.Model memory model = modelRegistry.getModel(_modelId);
        require(model.owner != address(0), "Model not found");
        require(model.isActive, "Model not active");
        require(block.timestamp <= _deadline, "Signature expired");
        
        // Create unique prediction hash from input/output
        bytes32 predictionHash = keccak256(abi.encodePacked(_inputHash, _outputHash));
        require(!predictionHashes[predictionHash], "Prediction already attested");
        
        // EIP-712 signature verification with deadline
        bytes32 structHash = keccak256(abi.encode(
            PREDICTION_TYPEHASH,
            _modelId,
            _inputHash,
            _outputHash,
            _deadline
        ));
        
        bytes32 hash = keccak256(abi.encodePacked(
            "\x19\x01",
            DOMAIN_SEPARATOR,
            structHash
        ));
        
        address signer = ecrecover(hash, _v, _r, _s);
        require(signer == model.owner, "Invalid signature");
        
        bytes32 attestationId = keccak256(abi.encodePacked(
            _modelId, predictionHash, block.timestamp, msg.sender
        ));
        
        attestations[attestationId] = Attestation({
            id: attestationId,
            modelId: _modelId,
            inputHash: _inputHash,
            outputHash: _outputHash,
            metadataURI: _metadataURI,
            timestamp: block.timestamp,
            isRevoked: false
        });
        
        modelAttestations[_modelId].push(attestationId);
        predictionHashes[predictionHash] = true;
        modelRegistry.incrementAttestationCount(_modelId);
        
        emit AttestationCreated(attestationId, _modelId, _inputHash, _outputHash, signer, _deadline, _metadataURI);
        
        return attestationId;
    }
    
    function revokeAttestation(bytes32 _attestationId, string calldata _reason) external {
        Attestation storage att = attestations[_attestationId];
        ModelRegistry.Model memory model = modelRegistry.getModel(att.modelId);
        
        require(msg.sender == model.owner, "Only owner can revoke");
        require(!att.isRevoked, "Already revoked");
        
        att.isRevoked = true;
        emit AttestationRevoked(_attestationId, _reason);
    }
    
    function getAttestation(bytes32 _id) external view returns (Attestation memory) {
        return attestations[_id];
    }
    
    function getModelAttestations(bytes32 _modelId) external view returns (bytes32[] memory) {
        return modelAttestations[_modelId];
    }
    
    function isPredictionAttested(bytes32 _inputHash, bytes32 _outputHash) external view returns (bool) {
        bytes32 predictionHash = keccak256(abi.encodePacked(_inputHash, _outputHash));
        return predictionHashes[predictionHash];
    }
    
    function verifyAttestation(
        bytes32 _modelId,
        bytes32 _inputHash,
        bytes32 _outputHash
    ) external view returns (bool isValid, bytes32 attestationId) {
        bytes32 predictionHash = keccak256(abi.encodePacked(_inputHash, _outputHash));
        
        if (!predictionHashes[predictionHash]) {
            return (false, bytes32(0));
        }
        
        // Find the attestation for this prediction
        bytes32[] memory modelAtts = modelAttestations[_modelId];
        for (uint256 i = 0; i < modelAtts.length; i++) {
            Attestation memory att = attestations[modelAtts[i]];
            if (att.inputHash == _inputHash && att.outputHash == _outputHash && !att.isRevoked) {
                return (true, modelAtts[i]);
            }
        }
        
        return (false, bytes32(0));
    }
}
