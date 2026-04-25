// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract ModelRegistry is Ownable {
    struct Model {
        bytes32 id;
        address owner;
        string name;
        string currentVersion;
        bytes32 modelHash;
        string metadataURI;
        uint256 registeredAt;
        uint256 updatedAt;
        bool isActive;
        uint256 totalVersions;
        uint256 attestationsCount;
    }
    
    struct ModelVersion {
        bytes32 versionHash;
        string version;
        string changeNotes;
        string metadataURI;
        uint256 timestamp;
        bool isCertified;
        address certifiedBy;
    }
    
    // Protocol fee settings
    uint256 public registrationFee = 0.001 ether;
    bool public feesEnabled = false;
    
    // Protocol stats
    uint256 public totalModels;
    uint256 public totalAttestations;
    uint256 public totalFeesCollected;

    mapping(bytes32 => Model) public models;
    mapping(bytes32 => ModelVersion[]) public modelVersions;
    mapping(address => bytes32[]) public ownerModels;
    mapping(bytes32 => bool) public modelExists;
    bytes32[] public allModelIds;
    
    // Authorized verifiers (for certification)
    mapping(address => bool) public authorizedVerifiers;
    
    // Model categories/tags
    mapping(bytes32 => string[]) public modelTags;

    address public attestationRegistry;
    
    event ModelRegistered(
        bytes32 indexed id,
        address indexed owner,
        string name,
        string version,
        uint256 timestamp
    );
    
    event ModelUpdated(
        bytes32 indexed id,
        bytes32 newVersionHash,
        string newVersion,
        string changeNotes,
        string metadataURI,
        uint256 timestamp
    );
    
    event ModelDeactivated(bytes32 indexed id, uint256 timestamp);
    event ModelReactivated(bytes32 indexed id, uint256 timestamp);
    event ModelCertified(bytes32 indexed id, uint256 versionIndex, address certifiedBy);
    event FeeUpdated(uint256 newFee);
    event FeesToggled(bool enabled);
    event VerifierAuthorized(address verifier);
    event VerifierRevoked(address verifier);
    event FundsWithdrawn(address to, uint256 amount);
    event AttestationRegistryUpdated(address attestationRegistry);

    constructor() Ownable(msg.sender) {}
    
    modifier onlyModelOwner(bytes32 _modelId) {
        require(models[_modelId].owner == msg.sender, "Not model owner");
        _;
    }
    
    modifier modelMustExist(bytes32 _modelId) {
        require(modelExists[_modelId], "Model does not exist");
        _;
    }

    modifier onlyAttestationRegistry() {
        require(msg.sender == attestationRegistry, "Only AttestationRegistry");
        _;
    }
    
    // Internal registration function
    function _registerModel(
        string calldata _name,
        string calldata _version,
        bytes32 _modelHash,
        string calldata _metadataURI,
        string[] memory _tags
    ) internal returns (bytes32) {
        bytes32 id = keccak256(abi.encodePacked(
            msg.sender, _name, _version, block.timestamp, block.number
        ));
        
        require(!modelExists[id], "Model already exists");
        
        models[id] = Model({
            id: id,
            owner: msg.sender,
            name: _name,
            currentVersion: _version,
            modelHash: _modelHash,
            metadataURI: _metadataURI,
            registeredAt: block.timestamp,
            updatedAt: block.timestamp,
            isActive: true,
            totalVersions: 1,
            attestationsCount: 0
        });
        
        // Store initial version
        modelVersions[id].push(ModelVersion({
            versionHash: _modelHash,
            version: _version,
            changeNotes: "Initial model registration",
            metadataURI: _metadataURI,
            timestamp: block.timestamp,
            isCertified: false,
            certifiedBy: address(0)
        }));
        
        // Store tags - copy from calldata to storage
        for (uint i = 0; i < _tags.length; i++) {
            modelTags[id].push(_tags[i]);
        }
        
        ownerModels[msg.sender].push(id);
        allModelIds.push(id);
        modelExists[id] = true;
        totalModels++;
        
        emit ModelRegistered(id, msg.sender, _name, _version, block.timestamp);
        return id;
    }

    function registerModelWithTags(
        string calldata _name,
        string calldata _version,
        bytes32 _modelHash,
        string calldata _metadataURI,
        string[] calldata _tags
    ) external payable returns (bytes32) {
        // Check fees if enabled
        if (feesEnabled) {
            require(msg.value >= registrationFee, "Insufficient registration fee");
            totalFeesCollected += msg.value;
        }
        return _registerModel(_name, _version, _modelHash, _metadataURI, _tags);
    }
    
    function registerModel(
        string calldata _name,
        string calldata _version,
        bytes32 _modelHash,
        string calldata _metadataURI
    ) external payable returns (bytes32) {
        // Check fees if enabled
        if (feesEnabled) {
            require(msg.value >= registrationFee, "Insufficient registration fee");
            totalFeesCollected += msg.value;
        }
        string[] memory emptyTags = new string[](0);
        return _registerModel(_name, _version, _modelHash, _metadataURI, emptyTags);
    }
    
    function updateModelVersion(
        bytes32 _modelId,
        string calldata _newVersion,
        bytes32 _newVersionHash,
        string calldata _changeNotes,
        string calldata _newMetadataURI
    ) external onlyModelOwner(_modelId) modelMustExist(_modelId) {
        Model storage model = models[_modelId];
        require(model.isActive, "Model is deactivated");
        
        // Add new version
        modelVersions[_modelId].push(ModelVersion({
            versionHash: _newVersionHash,
            version: _newVersion,
            changeNotes: _changeNotes,
            metadataURI: _newMetadataURI,
            timestamp: block.timestamp,
            isCertified: false,
            certifiedBy: address(0)
        }));
        
        // Update current model
        model.modelHash = _newVersionHash;
        model.currentVersion = _newVersion;
        model.metadataURI = _newMetadataURI;
        model.updatedAt = block.timestamp;
        model.totalVersions++;
        
        emit ModelUpdated(_modelId, _newVersionHash, _newVersion, _changeNotes, _newMetadataURI, block.timestamp);
    }
    
    function deactivateModel(bytes32 _modelId) external onlyModelOwner(_modelId) modelMustExist(_modelId) {
        models[_modelId].isActive = false;
        emit ModelDeactivated(_modelId, block.timestamp);
    }
    
    function reactivateModel(bytes32 _modelId) external onlyModelOwner(_modelId) modelMustExist(_modelId) {
        models[_modelId].isActive = true;
        emit ModelReactivated(_modelId, block.timestamp);
    }
    
    function certifyModelVersion(
        bytes32 _modelId,
        uint256 _versionIndex
    ) external {
        require(authorizedVerifiers[msg.sender] || msg.sender == owner(), "Not authorized");
        require(_versionIndex < modelVersions[_modelId].length, "Invalid version");
        
        ModelVersion storage version = modelVersions[_modelId][_versionIndex];
        version.isCertified = true;
        version.certifiedBy = msg.sender;
        
        emit ModelCertified(_modelId, _versionIndex, msg.sender);
    }
    
    function updateModelTags(bytes32 _modelId, string[] calldata _newTags) 
        external 
        onlyModelOwner(_modelId) 
        modelMustExist(_modelId) 
    {
        delete modelTags[_modelId];
        for (uint256 i = 0; i < _newTags.length; i++) {
            modelTags[_modelId].push(_newTags[i]);
        }
    }
    
    function setAttestationRegistry(address _attestationRegistry) external onlyOwner {
        attestationRegistry = _attestationRegistry;
        emit AttestationRegistryUpdated(_attestationRegistry);
    }

    function incrementAttestationCount(bytes32 _modelId) external onlyAttestationRegistry modelMustExist(_modelId) {
        models[_modelId].attestationsCount++;
        totalAttestations++;
    }
    
    function getModel(bytes32 _id) external view returns (Model memory) {
        return models[_id];
    }
    
    function getOwnerModels(address _owner) external view returns (bytes32[] memory) {
        return ownerModels[_owner];
    }
    
    function getModelVersionHistory(bytes32 _modelId) external view returns (ModelVersion[] memory) {
        return modelVersions[_modelId];
    }
    
    function getAllModels() external view returns (Model[] memory) {
        Model[] memory result = new Model[](allModelIds.length);
        for (uint i = 0; i < allModelIds.length; i++) {
            result[i] = models[allModelIds[i]];
        }
        return result;
    }
    
    function getActiveModels() external view returns (Model[] memory) {
        uint256 activeCount = 0;
        for (uint i = 0; i < allModelIds.length; i++) {
            if (models[allModelIds[i]].isActive) {
                activeCount++;
            }
        }
        
        Model[] memory result = new Model[](activeCount);
        uint256 index = 0;
        for (uint i = 0; i < allModelIds.length; i++) {
            if (models[allModelIds[i]].isActive) {
                result[index] = models[allModelIds[i]];
                index++;
            }
        }
        return result;
    }
    
    function getModelTags(bytes32 _modelId) external view returns (string[] memory) {
        return modelTags[_modelId];
    }
    
    // Admin functions
    function setRegistrationFee(uint256 _newFee) external onlyOwner {
        registrationFee = _newFee;
        emit FeeUpdated(_newFee);
    }
    
    function toggleFees() external onlyOwner {
        feesEnabled = !feesEnabled;
        emit FeesToggled(feesEnabled);
    }
    
    function authorizeVerifier(address _verifier) external onlyOwner {
        authorizedVerifiers[_verifier] = true;
        emit VerifierAuthorized(_verifier);
    }
    
    function revokeVerifier(address _verifier) external onlyOwner {
        authorizedVerifiers[_verifier] = false;
        emit VerifierRevoked(_verifier);
    }
    
    function withdrawFunds(address payable _to, uint256 _amount) external onlyOwner {
        require(_amount <= address(this).balance, "Insufficient balance");
        (bool success, ) = _to.call{value: _amount}("");
        require(success, "Transfer failed");
        emit FundsWithdrawn(_to, _amount);
    }
    
    // Batch operations
    function batchRegisterModels(
        string[] calldata _names,
        string[] calldata _versions,
        bytes32[] calldata _modelHashes,
        string[] calldata _metadataURIs
    ) external payable returns (bytes32[] memory) {
        require(
            _names.length == _versions.length && 
            _versions.length == _modelHashes.length && 
            _modelHashes.length == _metadataURIs.length,
            "Array lengths must match"
        );
        
        if (feesEnabled) {
            require(msg.value >= registrationFee * _names.length, "Insufficient fee");
        }
        
        bytes32[] memory ids = new bytes32[](_names.length);
        for (uint i = 0; i < _names.length; i++) {
            string[] memory emptyTags = new string[](0);
            ids[i] = _registerModel(_names[i], _versions[i], _modelHashes[i], _metadataURIs[i], emptyTags);
        }
        
        return ids;
    }
    
    // ============ PAGINATED QUERIES ============
    
    function getModelsPaginated(uint256 _offset, uint256 _limit) external view returns (Model[] memory) {
        require(_limit <= 100, "Limit too high");
        
        uint256 end = _offset + _limit;
        if (end > allModelIds.length) {
            end = allModelIds.length;
        }
        
        uint256 count = end > _offset ? end - _offset : 0;
        Model[] memory result = new Model[](count);
        
        for (uint256 i = 0; i < count; i++) {
            result[i] = models[allModelIds[_offset + i]];
        }
        
        return result;
    }
    
    function getActiveModelsPaginated(uint256 _offset, uint256 _limit) external view returns (Model[] memory) {
        require(_limit <= 100, "Limit too high");
        
        // First pass: count active models in range
        uint256 activeCount = 0;
        for (uint256 i = _offset; i < allModelIds.length && activeCount < _limit; i++) {
            if (models[allModelIds[i]].isActive) {
                activeCount++;
            }
        }
        
        // Second pass: populate result
        Model[] memory result = new Model[](activeCount);
        uint256 index = 0;
        for (uint256 i = _offset; i < allModelIds.length && index < activeCount; i++) {
            if (models[allModelIds[i]].isActive) {
                result[index] = models[allModelIds[i]];
                index++;
            }
        }
        
        return result;
    }
    
    function getOwnerModelsPaginated(address _owner, uint256 _offset, uint256 _limit) external view returns (bytes32[] memory) {
        require(_limit <= 100, "Limit too high");
        
        bytes32[] memory ownerModelsList = ownerModels[_owner];
        
        uint256 end = _offset + _limit;
        if (end > ownerModelsList.length) {
            end = ownerModelsList.length;
        }
        
        uint256 count = end > _offset ? end - _offset : 0;
        bytes32[] memory result = new bytes32[](count);
        
        for (uint256 i = 0; i < count; i++) {
            result[i] = ownerModelsList[_offset + i];
        }
        
        return result;
    }
    
    function getTotalModels() external view returns (uint256) {
        return allModelIds.length;
    }
    
    receive() external payable {
        totalFeesCollected += msg.value;
    }
}
