// Contract addresses and ABIs for ROVET
import { Abi } from 'viem';

// Base Sepolia testnet addresses
export const CONTRACT_ADDRESSES = {
  baseSepolia: {
    modelRegistry: '0x...', // Replace with deployed address
    attestationRegistry: '0x...', // Replace with deployed address
  },
  base: {
    modelRegistry: '0x...', // Replace with deployed address
    attestationRegistry: '0x...', // Replace with deployed address
  },
  hardhat: {
    modelRegistry: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    attestationRegistry: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
  },
};

// ModelRegistry ABI
export const MODEL_REGISTRY_ABI: Abi = [
  {
    inputs: [],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [
      { name: '_name', type: 'string' },
      { name: '_version', type: 'string' },
      { name: '_modelHash', type: 'bytes32' },
      { name: '_metadataURI', type: 'string' },
    ],
    name: 'registerModel',
    outputs: [{ name: '', type: 'bytes32' }],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      { name: '_modelId', type: 'bytes32' },
      { name: '_newVersion', type: 'string' },
      { name: '_newVersionHash', type: 'bytes32' },
      { name: '_changeNotes', type: 'string' },
      { name: '_newMetadataURI', type: 'string' },
    ],
    name: 'updateModelVersion',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: '_modelId', type: 'bytes32' }],
    name: 'deactivateModel',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: '_modelId', type: 'bytes32' }],
    name: 'getModel',
    outputs: [{
      components: [
        { name: 'id', type: 'bytes32' },
        { name: 'owner', type: 'address' },
        { name: 'name', type: 'string' },
        { name: 'currentVersion', type: 'string' },
        { name: 'modelHash', type: 'bytes32' },
        { name: 'metadataURI', type: 'string' },
        { name: 'registeredAt', type: 'uint256' },
        { name: 'updatedAt', type: 'uint256' },
        { name: 'isActive', type: 'bool' },
        { name: 'totalVersions', type: 'uint256' },
        { name: 'attestationsCount', type: 'uint256' },
      ],
      name: '',
      type: 'tuple',
    }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getAllModels',
    outputs: [{
      components: [
        { name: 'id', type: 'bytes32' },
        { name: 'owner', type: 'address' },
        { name: 'name', type: 'string' },
        { name: 'currentVersion', type: 'string' },
        { name: 'modelHash', type: 'bytes32' },
        { name: 'metadataURI', type: 'string' },
        { name: 'registeredAt', type: 'uint256' },
        { name: 'updatedAt', type: 'uint256' },
        { name: 'isActive', type: 'bool' },
        { name: 'totalVersions', type: 'uint256' },
        { name: 'attestationsCount', type: 'uint256' },
      ],
      name: '',
      type: 'tuple[]',
    }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'getOwnerModels',
    outputs: [{ name: '', type: 'bytes32[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '_modelId', type: 'bytes32' }],
    name: 'modelExists',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: '_offset', type: 'uint256' },
      { name: '_limit', type: 'uint256' },
    ],
    name: 'getModelsPaginated',
    outputs: [{
      components: [
        { name: 'id', type: 'bytes32' },
        { name: 'owner', type: 'address' },
        { name: 'name', type: 'string' },
        { name: 'currentVersion', type: 'string' },
        { name: 'modelHash', type: 'bytes32' },
        { name: 'metadataURI', type: 'string' },
        { name: 'registeredAt', type: 'uint256' },
        { name: 'updatedAt', type: 'uint256' },
        { name: 'isActive', type: 'bool' },
        { name: 'totalVersions', type: 'uint256' },
        { name: 'attestationsCount', type: 'uint256' },
      ],
      name: '',
      type: 'tuple[]',
    }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: '_offset', type: 'uint256' },
      { name: '_limit', type: 'uint256' },
    ],
    name: 'getActiveModelsPaginated',
    outputs: [{
      components: [
        { name: 'id', type: 'bytes32' },
        { name: 'owner', type: 'address' },
        { name: 'name', type: 'string' },
        { name: 'currentVersion', type: 'string' },
        { name: 'modelHash', type: 'bytes32' },
        { name: 'metadataURI', type: 'string' },
        { name: 'registeredAt', type: 'uint256' },
        { name: 'updatedAt', type: 'uint256' },
        { name: 'isActive', type: 'bool' },
        { name: 'totalVersions', type: 'uint256' },
        { name: 'attestationsCount', type: 'uint256' },
      ],
      name: '',
      type: 'tuple[]',
    }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: '_owner', type: 'address' },
      { name: '_offset', type: 'uint256' },
      { name: '_limit', type: 'uint256' },
    ],
    name: 'getOwnerModelsPaginated',
    outputs: [{ name: '', type: 'bytes32[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getTotalModels',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalModels',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'registrationFee',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '', type: 'bytes32' }],
    name: 'models',
    outputs: [
      { name: 'id', type: 'bytes32' },
      { name: 'owner', type: 'address' },
      { name: 'name', type: 'string' },
      { name: 'currentVersion', type: 'string' },
      { name: 'modelHash', type: 'bytes32' },
      { name: 'metadataURI', type: 'string' },
      { name: 'registeredAt', type: 'uint256' },
      { name: 'updatedAt', type: 'uint256' },
      { name: 'isActive', type: 'bool' },
      { name: 'totalVersions', type: 'uint256' },
      { name: 'attestationsCount', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'id', type: 'bytes32' },
      { indexed: true, name: 'owner', type: 'address' },
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'timestamp', type: 'uint256' },
    ],
    name: 'ModelRegistered',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'id', type: 'bytes32' },
      { name: 'newVersionHash', type: 'bytes32' },
      { name: 'newVersion', type: 'string' },
      { name: 'changeNotes', type: 'string' },
      { name: 'timestamp', type: 'uint256' },
    ],
    name: 'ModelUpdated',
    type: 'event',
  },
];

// AttestationRegistry ABI - Updated for deadline-based EIP-712 signatures
export const ATTESTATION_REGISTRY_ABI: Abi = [
  {
    inputs: [
      { name: '_modelId', type: 'bytes32' },
      { name: '_inputHash', type: 'bytes32' },
      { name: '_outputHash', type: 'bytes32' },
      { name: '_metadataURI', type: 'string' },
      { name: '_deadline', type: 'uint256' },
      { name: '_v', type: 'uint8' },
      { name: '_r', type: 'bytes32' },
      { name: '_s', type: 'bytes32' },
    ],
    name: 'createAttestation',
    outputs: [{ name: '', type: 'bytes32' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: '_attestationId', type: 'bytes32' }],
    name: 'getAttestation',
    outputs: [{
      components: [
        { name: 'id', type: 'bytes32' },
        { name: 'modelId', type: 'bytes32' },
        { name: 'inputHash', type: 'bytes32' },
        { name: 'outputHash', type: 'bytes32' },
        { name: 'metadataURI', type: 'string' },
        { name: 'timestamp', type: 'uint256' },
        { name: 'isRevoked', type: 'bool' },
      ],
      name: '',
      type: 'tuple',
    }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: '_modelId', type: 'bytes32' },
      { name: '_inputHash', type: 'bytes32' },
      { name: '_outputHash', type: 'bytes32' },
    ],
    name: 'verifyAttestation',
    outputs: [
      { name: 'isValid', type: 'bool' },
      { name: 'attestationId', type: 'bytes32' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: '_inputHash', type: 'bytes32' },
      { name: '_outputHash', type: 'bytes32' },
    ],
    name: 'isPredictionAttested',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'PREDICTION_TYPEHASH',
    outputs: [{ name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'id', type: 'bytes32' },
      { indexed: true, name: 'modelId', type: 'bytes32' },
      { name: 'inputHash', type: 'bytes32' },
      { name: 'outputHash', type: 'bytes32' },
      { indexed: true, name: 'attester', type: 'address' },
      { name: 'deadline', type: 'uint256' },
    ],
    name: 'AttestationCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'id', type: 'bytes32' },
      { name: 'reason', type: 'string' },
    ],
    name: 'AttestationRevoked',
    type: 'event',
  },
];
