# Verifiable AI API Documentation

## Overview

Verifiable AI provides on-chain model registration and attestation for AI predictions. This documentation covers both the smart contract interfaces and the JavaScript SDK.

## Smart Contract Addresses

### Base Sepolia (Testnet)
- **ModelRegistry**: `0x...` (deployed)
- **AttestationRegistry**: `0x...` (deployed)

### Hardhat (Local Development)
- **ModelRegistry**: `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- **AttestationRegistry**: `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`

---

## Smart Contract API

### ModelRegistry

#### Register Model
```solidity
function registerModel(
    string calldata _name,
    string calldata _version,
    bytes32 _modelHash,
    string calldata _metadataURI,
    string[] calldata _tags
) external payable returns (bytes32);
```

**Parameters:**
- `_name`: Model name (e.g., "GPT-4 Wrapper")
- `_version`: Version string (e.g., "v1.0.0")
- `_modelHash`: Hash of the model weights/binary (bytes32)
- `_metadataURI`: IPFS or HTTP link to model metadata
- `_tags`: Array of category tags

**Returns:** `bytes32` - Unique model ID

**Events:**
```solidity
event ModelRegistered(
    bytes32 indexed id,
    address indexed owner,
    string name,
    string version,
    uint256 timestamp
);
```

#### Update Model Version
```solidity
function updateModelVersion(
    bytes32 _modelId,
    string calldata _newVersion,
    bytes32 _newVersionHash,
    string calldata _changeNotes,
    string calldata _newMetadataURI
) external;
```

**Parameters:**
- `_modelId`: Existing model ID
- `_newVersion`: New version string
- `_newVersionHash`: New model hash
- `_changeNotes`: Description of changes
- `_newMetadataURI`: Updated metadata

#### Get Model
```solidity
function getModel(bytes32 _id) external view returns (Model memory);
```

**Returns:**
```solidity
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
```

#### Get All Models
```solidity
function getAllModels() external view returns (Model[] memory);
```

#### Get Owner Models
```solidity
function getOwnerModels(address _owner) external view returns (bytes32[] memory);
```

---

### AttestationRegistry

#### Create Attestation
```solidity
function createAttestation(
    bytes32 _modelId,
    bytes32 _inputHash,
    bytes32 _outputHash,
    string calldata _metadataURI,
    bytes calldata _signature
) external returns (bytes32);
```

**Parameters:**
- `_modelId`: Model used for prediction
- `_inputHash`: Hash of input data
- `_outputHash`: Hash of output/prediction
- `_metadataURI`: Link to full prediction metadata
- `_signature`: EIP-712 signature

**Returns:** `bytes32` - Attestation ID

#### Verify Attestation
```solidity
function verifyAttestation(
    bytes32 _modelId,
    bytes32 _inputHash,
    bytes32 _outputHash
) external view returns (bool isValid, bytes32 attestationId);
```

**Returns:**
- `isValid`: Whether attestation exists and is valid
- `attestationId`: ID of the attestation

---

## JavaScript SDK

### Installation

```bash
npm install @verifiable-ai/sdk viem wagmi
```

### Quick Start

```typescript
import { createVerifiableAI } from '@/lib/sdk';

const vai = createVerifiableAI({
  chain: 'baseSepolia', // or 'hardhat', 'base'
  modelRegistryAddress: '0x...',
  attestationRegistryAddress: '0x...',
});
```

### SDK Methods

#### Register a Model
```typescript
const result = await vai.registerModel({
  name: "My AI Model",
  version: "v1.0.0",
  modelHash: "0x1234...", // keccak256 hash
  metadataURI: "https://ipfs.io/ipfs/Qm...",
  tags: ["nlp", "transformer"]
});

if (result.success) {
  console.log("Model registered! ID:", result.data);
}
```

#### Get Model Details
```typescript
const model = await vai.getModel("0xabcd...");

console.log(model?.name);
console.log(model?.owner);
console.log(model?.totalVersions);
```

#### List All Models
```typescript
const models = await vai.getAllModels();

models.forEach(model => {
  console.log(`${model.name} - ${model.currentVersion}`);
});
```

#### Get Models by Owner
```typescript
const myModels = await vai.getOwnerModels("0xYourAddress...");
```

#### Update Model Version
```typescript
const result = await vai.updateModelVersion(
  "0xmodelId...",
  {
    newVersion: "v1.1.0",
    newVersionHash: "0x5678...",
    changeNotes: "Improved accuracy on edge cases",
    newMetadataURI: "https://ipfs.io/ipfs/QmNew..."
  }
);
```

#### Create Attestation (with SDK)
```typescript
import { keccak256, toBytes } from 'viem';

// Generate hashes
const inputHash = keccak256(toBytes(JSON.stringify(input)));
const outputHash = keccak256(toBytes(JSON.stringify(output)));

// SDK generates signature automatically with 60min deadline
const { v, r, s, deadline } = await vai.generateAttestationSignature(
  modelId,
  inputHash,
  outputHash,
  60 // deadline in minutes (optional, default 60)
);

const result = await vai.createAttestation({
  modelId: "0xmodelId...",
  inputHash,
  outputHash,
  metadataURI: "https://api.example.com/predictions/123",
  deadline,
  v,
  r,
  s
});
```

#### Create Attestation (Manual Signing)
```typescript
// If you need to sign manually without SDK helper
const domain = {
  name: "VerifiableAI",
  version: "1",
  chainId: 84532,
  verifyingContract: "0xAttestationRegistry..."
};

const types = {
  PredictionData: [
    { name: "modelId", type: "bytes32" },
    { name: "inputHash", type: "bytes32" },
    { name: "outputHash", type: "bytes32" },
    { name: "deadline", type: "uint256" }
  ]
};

const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);
const signature = await walletClient.signTypedData({
  domain,
  types,
  primaryType: "PredictionData",
  message: { modelId, inputHash, outputHash, deadline }
});

// Split signature into v, r, s
const r = signature.slice(0, 66);
const s = '0x' + signature.slice(66, 130);
const v = parseInt(signature.slice(130, 132), 16);
```

#### Verify Attestation
```typescript
const { isValid, attestationId } = await vai.verifyAttestation(
  "0xmodelId...",
  inputHash,
  outputHash
);

if (isValid) {
  console.log("Prediction is verified! Attestation:", attestationId);
}
```

---

## EIP-712 Signatures

### Domain
```javascript
{
  name: "VerifiableAI",
  version: "1",
  chainId: 84532, // Base Sepolia
  verifyingContract: "0xAttestationRegistryAddress..."
}
```

### Types (Deadline-based)
```javascript
const types = {
  PredictionData: [
    { name: "modelId", type: "bytes32" },
    { name: "inputHash", type: "bytes32" },
    { name: "outputHash", type: "bytes32" },
    { name: "deadline", type: "uint256" }  // Unix timestamp for signature expiry
  ]
};
```

**Key Changes:**
- Replaced `timestamp` with `deadline` - signatures are now valid for a time window instead of a single block
- Signatures expire after the deadline (recommended: 60 minutes)
- Model owner signs predictions (not arbitrary callers)
- Signature format: `v`, `r`, `s` components passed separately to contract

### Signing Example (Browser)
```typescript
import { createWalletClient, custom } from 'viem';

const walletClient = createWalletClient({
  chain: baseSepolia,
  transport: custom(window.ethereum)
});

const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600); // 1 hour

const signature = await walletClient.signTypedData({
  domain: {
    name: "VerifiableAI",
    version: "1",
    chainId: 84532,
    verifyingContract: "0xAttestationRegistry..."
  },
  types: {
    PredictionData: [
      { name: "modelId", type: "bytes32" },
      { name: "inputHash", type: "bytes32" },
      { name: "outputHash", type: "bytes32" },
      { name: "deadline", type: "uint256" }
    ]
  },
  primaryType: "PredictionData",
  message: {
    modelId: "0x...",
    inputHash: "0x...",
    outputHash: "0x...",
    deadline: BigInt(Math.floor(Date.now() / 1000) + 3600) // 1 hour from now
  }
});
```

---

## React Hooks

### useTransaction
```typescript
import { useTransaction } from '@/hooks/use-transaction';

function RegisterModelButton() {
  const { isLoading, isSuccess, isError, execute, reset } = useTransaction({
    successMessage: "Model registered successfully!",
    errorMessage: "Failed to register model",
    onSuccess: (hash) => {
      console.log("Transaction hash:", hash);
    }
  });

  const handleRegister = async () => {
    await execute(async () => {
      const result = await vai.registerModel({
        name: "My Model",
        version: "v1.0",
        modelHash: "0x...",
        metadataURI: "https://..."
      });
      return result;
    });
  };

  return (
    <button onClick={handleRegister} disabled={isLoading}>
      {isLoading ? "Registering..." : "Register Model"}
    </button>
  );
}
```

---

## Subgraph Queries (The Graph)

The SDK supports querying indexed data via The Graph for scalable access to 1000+ models without hitting gas limits.

### Configure Subgraph
```typescript
vai.setSubgraphUrl('https://api.thegraph.com/subgraphs/name/your-subgraph');
```

### Query Models (Subgraph)
```typescript
// Get all models with pagination
const models = await vai.getModelsSubgraph(0, 100);

// Get active models only
const activeModels = await vai.getActiveModelsSubgraph(0, 100);

// Query time: ~100ms for 1000+ models
```

### Query Attestations (Subgraph)
```typescript
// Get attestations for a specific model
const attestations = await vai.getModelAttestationsSubgraph(modelId);

// Access attestation details
for (const att of attestations) {
  console.log(`Attestation: ${att.id}`);
  console.log(`Input Hash: ${att.inputHash}`);
  console.log(`Output Hash: ${att.outputHash}`);
  console.log(`Revoked: ${att.isRevoked}`);
}
```

### Protocol Stats (Subgraph)
```typescript
const stats = await vai.getProtocolStatsSubgraph();

console.log(`Total Models: ${stats.totalModels}`);
console.log(`Total Attestations: ${stats.totalAttestations}`);
console.log(`Active Models: ${stats.activeModels}`);
console.log(`Revoked Attestations: ${stats.revokedAttestations}`);
```

### Fallback to Contract Queries
If subgraph is unavailable, use paginated contract queries:
```typescript
// Get paginated models directly from contract (max 100 per query)
const models = await vai.getModelsPaginated(BigInt(0), BigInt(50));

// Get paginated active models
const activeModels = await vai.getActiveModelsPaginated(BigInt(0), BigInt(50));

// Get total model count
const total = await vai.getTotalModels();
```

---

## Error Handling

### Error Codes
```typescript
enum ErrorCode {
  WALLET_NOT_CONNECTED = "WALLET_NOT_CONNECTED",
  INSUFFICIENT_FUNDS = "INSUFFICIENT_FUNDS",
  USER_REJECTED = "USER_REJECTED",
  CONTRACT_ERROR = "CONTRACT_ERROR",
  INVALID_INPUT = "INVALID_INPUT",
  NETWORK_ERROR = "NETWORK_ERROR",
  NOT_AUTHORIZED = "NOT_AUTHORIZED",
  MODEL_NOT_FOUND = "MODEL_NOT_FOUND",
  ATTESTATION_NOT_FOUND = "ATTESTATION_NOT_FOUND",
  ALREADY_EXISTS = "ALREADY_EXISTS"
}
```

### Transaction Result
```typescript
interface TransactionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  hash?: Hash;
}
```

---

## Protocol Fees

### Current Fee Structure
- **Model Registration**: 0.001 ETH (when fees enabled)
- **Attestation**: Free

### Admin Functions
```solidity
function setRegistrationFee(uint256 _newFee) external onlyOwner;
function toggleFees() external onlyOwner;
function withdrawFunds(address payable _to, uint256 _amount) external onlyOwner;
```

---

## Testing

### Hardhat Local Testing
```bash
# Start local node
npx hardhat node

# Deploy contracts
npx hardhat run scripts/deploy.ts --network hardhat

# Run tests
npx hardhat test
```

### Test Account (Hardhat)
- **Address**: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
- **Private Key**: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`

---

## Resources

- **GitHub**: https://github.com/verifiable-ai/protocol
- **Documentation**: https://docs.verifiable.ai
- **Base Sepolia Faucet**: https://www.alchemy.com/faucets/base-sepolia
- **Explorer**: https://sepolia.basescan.org

---

## Support

For questions or issues:
- Discord: https://discord.gg/verifiable-ai
- Email: dev@verifiable.ai
- Twitter: @verifiableai
