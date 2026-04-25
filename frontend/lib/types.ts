// TypeScript types for PROVET SDK

import { Address, Hash } from 'viem';

// Chain configuration
export type SupportedChain = 'baseSepolia' | 'hardhat' | 'base';

// Model types
export interface Model {
  id: Hash;
  owner: Address;
  name: string;
  currentVersion: string;
  modelHash: Hash;
  metadataURI: string;
  registeredAt: bigint;
  updatedAt: bigint;
  isActive: boolean;
  totalVersions: bigint;
  attestationsCount: bigint;
}

export interface ModelVersion {
  versionHash: Hash;
  version: string;
  changeNotes: string;
  metadataURI: string;
  timestamp: bigint;
  isCertified: boolean;
  certifiedBy: Address;
}

export interface ModelInput {
  name: string;
  version: string;
  modelHash: Hash;
  metadataURI: string;
  tags?: string[];
}

export interface ModelUpdateInput {
  newVersion: string;
  newVersionHash: Hash;
  changeNotes: string;
  newMetadataURI: string;
}

// Attestation types
export interface Attestation {
  id: Hash;
  modelId: Hash;
  inputHash: Hash;
  outputHash: Hash;
  metadataURI: string;
  timestamp: bigint;
  isRevoked: boolean;
}

export interface AttestationInput {
  modelId: Hash;
  inputHash: Hash;
  outputHash: Hash;
  metadataURI: string;
  deadline: bigint;
  v: number;
  r: Hash;
  s: Hash;
}

// EIP-712 Signature types
export interface EIP712Domain {
  name: string;
  version: string;
  chainId: number;
  verifyingContract: Address;
}

export interface PredictionData {
  modelId: Hash;
  inputHash: Hash;
  outputHash: Hash;
  deadline: bigint;
  [key: string]: Hash | bigint;
}

export interface VerificationResult {
  isValid: boolean;
  attestationId: Hash | null;
  model?: Model;
  attestation?: Attestation;
}

// Prediction types
export interface PredictionInput {
  modelId: string;
  input: string;
  output: string;
}

export interface PredictionOutput {
  attestationId: string;
  signature: string;
  timestamp: number;
}

// SDK Configuration
export interface ProvetConfig {
  chain: SupportedChain;
  modelRegistryAddress?: Address;
  attestationRegistryAddress?: Address;
  rpcUrl?: string;
}

// Transaction result
export interface TransactionResult<T = Hash> {
  success: boolean;
  data?: T;
  error?: string;
  hash?: Hash;
}

// Protocol stats
export interface ProtocolStats {
  totalModels: bigint;
  totalAttestations: bigint;
  registrationFee: bigint;
  feesEnabled: boolean;
  totalFeesCollected: bigint;
}

// Error types
export enum ErrorCode {
  WALLET_NOT_CONNECTED = 'WALLET_NOT_CONNECTED',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  USER_REJECTED = 'USER_REJECTED',
  CONTRACT_ERROR = 'CONTRACT_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  NETWORK_ERROR = 'NETWORK_ERROR',
  NOT_AUTHORIZED = 'NOT_AUTHORIZED',
  MODEL_NOT_FOUND = 'MODEL_NOT_FOUND',
  ATTESTATION_NOT_FOUND = 'ATTESTATION_NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
}

export interface SDKError {
  code: ErrorCode;
  message: string;
  originalError?: Error;
}
