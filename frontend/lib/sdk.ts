// PROVET SDK - Main entry point
import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  Address,
  Hash,
  keccak256,
  toBytes,
} from 'viem';
import { baseSepolia, hardhat, base } from 'wagmi/chains';
import { 
  CONTRACT_ADDRESSES, 
  MODEL_REGISTRY_ABI, 
  ATTESTATION_REGISTRY_ABI 
} from './contracts';
import {
  Model,
  ModelInput,
  ModelUpdateInput,
  AttestationInput,
  VerificationResult,
  ProvetConfig,
  TransactionResult,
  ProtocolStats,
  SupportedChain,
  ErrorCode,
  PredictionData,
} from './types';

// Custom error class
class SDKError extends Error {
  code: ErrorCode;

  constructor(code: ErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = 'SDKError';
  }
}

export class Provet {
  private chain: SupportedChain;
  private modelRegistryAddress: Address;
  private attestationRegistryAddress: Address;
  private rpcUrl: string;
  private subgraphUrl: string | null = null;

  constructor(config: ProvetConfig) {
    this.chain = config.chain;
    
    // Set addresses
    const addresses = CONTRACT_ADDRESSES as Record<SupportedChain, { modelRegistry: string; attestationRegistry: string }>;
    this.modelRegistryAddress = config.modelRegistryAddress || 
      addresses[config.chain].modelRegistry as Address;
    this.attestationRegistryAddress = config.attestationRegistryAddress || 
      addresses[config.chain].attestationRegistry as Address;
    
    // Set RPC URL
    if (config.rpcUrl) {
      this.rpcUrl = config.rpcUrl;
    } else {
      switch (config.chain) {
        case 'baseSepolia':
          this.rpcUrl = 'https://sepolia.base.org';
          break;
        case 'base':
          this.rpcUrl = 'https://mainnet.base.org';
          break;
        case 'hardhat':
          this.rpcUrl = 'http://127.0.0.1:8545';
          break;
        default:
          this.rpcUrl = 'http://127.0.0.1:8545';
      }
    }
  }

  // Get the chain object
  private getChain() {
    switch (this.chain) {
      case 'baseSepolia':
        return baseSepolia;
      case 'base':
        return base;
      case 'hardhat':
        return hardhat;
      default:
        return hardhat;
    }
  }

  // Create public client for reading
  private getPublicClient() {
    return createPublicClient({
      chain: this.getChain(),
      transport: http(this.rpcUrl),
    });
  }

  // Create wallet client for writing
  private getWalletClient() {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new SDKError(
        ErrorCode.WALLET_NOT_CONNECTED,
        'No wallet provider found. Please install MetaMask or another Web3 wallet.'
      );
    }
    
    return createWalletClient({
      chain: this.getChain(),
      transport: custom(window.ethereum),
    });
  }

  // ============ MODEL REGISTRY ============

  /**
   * Register a new AI model
   */
  async registerModel(input: ModelInput): Promise<TransactionResult<Hash>> {
    try {
      const walletClient = this.getWalletClient();
      const [account] = await walletClient.getAddresses();

      const hash = await walletClient.writeContract({
        address: this.modelRegistryAddress,
        abi: MODEL_REGISTRY_ABI,
        functionName: 'registerModel',
        args: [
          input.name,
          input.version,
          input.modelHash,
          input.metadataURI,
        ],
        account,
      });

      return {
        success: true,
        hash,
        data: hash,
      };
    } catch (error) {
      return this.handleError<Hash>(error, 'Failed to register model');
    }
  }

  /**
   * Update model version
   */
  async updateModelVersion(
    modelId: Hash,
    input: ModelUpdateInput
  ): Promise<TransactionResult<Hash>> {
    try {
      const walletClient = this.getWalletClient();
      const [account] = await walletClient.getAddresses();

      const hash = await walletClient.writeContract({
        address: this.modelRegistryAddress,
        abi: MODEL_REGISTRY_ABI,
        functionName: 'updateModelVersion',
        args: [
          modelId,
          input.newVersion,
          input.newVersionHash,
          input.changeNotes,
          input.newMetadataURI,
        ],
        account,
      });

      return {
        success: true,
        hash,
        data: hash,
      };
    } catch (error) {
      return this.handleError<Hash>(error, 'Failed to update model version');
    }
  }

  /**
   * Deactivate a model
   */
  async deactivateModel(modelId: Hash): Promise<TransactionResult<Hash>> {
    try {
      const walletClient = this.getWalletClient();
      const [account] = await walletClient.getAddresses();

      const hash = await walletClient.writeContract({
        address: this.modelRegistryAddress,
        abi: MODEL_REGISTRY_ABI,
        functionName: 'deactivateModel',
        args: [modelId],
        account,
      });

      return {
        success: true,
        hash,
        data: hash,
      };
    } catch (error) {
      return this.handleError<Hash>(error, 'Failed to deactivate model');
    }
  }

  /**
   * Get a model by ID
   */
  async getModel(modelId: Hash): Promise<Model | null> {
    try {
      const publicClient = this.getPublicClient();

      const result = await publicClient.readContract({
        address: this.modelRegistryAddress,
        abi: MODEL_REGISTRY_ABI,
        functionName: 'getModel',
        args: [modelId],
      }) as Model;

      return result;
    } catch (error) {
      console.error('Failed to get model:', error);
      return null;
    }
  }

  /**
   * Get all registered models
   */
  async getAllModels(): Promise<Model[]> {
    try {
      const publicClient = this.getPublicClient();

      const models = await publicClient.readContract({
        address: this.modelRegistryAddress,
        abi: MODEL_REGISTRY_ABI,
        functionName: 'getAllModels',
        args: [],
      }) as Model[];

      return models;
    } catch (error) {
      console.error('Failed to get all models:', error);
      return [];
    }
  }

  /**
   * Get models owned by an address
   */
  async getOwnerModels(ownerAddress: Address): Promise<Hash[]> {
    try {
      const publicClient = this.getPublicClient();

      const modelIds = await publicClient.readContract({
        address: this.modelRegistryAddress,
        abi: MODEL_REGISTRY_ABI,
        functionName: 'getOwnerModels',
        args: [ownerAddress],
      }) as Hash[];

      return modelIds;
    } catch (error) {
      console.error('Failed to get owner models:', error);
      return [];
    }
  }

  /**
   * Check if a model exists
   */
  async modelExists(modelId: Hash): Promise<boolean> {
    try {
      const publicClient = this.getPublicClient();

      const exists = await publicClient.readContract({
        address: this.modelRegistryAddress,
        abi: MODEL_REGISTRY_ABI,
        functionName: 'modelExists',
        args: [modelId],
      }) as boolean;

      return exists;
    } catch {
      return false;
    }
  }

  // ============ ATTESTATION REGISTRY ============

  /**
   * Generate EIP-712 signature for attestation
   * Signature is valid for 1 hour by default
   */
  async generateAttestationSignature(
    modelId: Hash,
    inputHash: Hash,
    outputHash: Hash,
    deadlineMinutes: number = 60
  ): Promise<{ v: number; r: Hash; s: Hash; deadline: bigint }> {
    try {
      const walletClient = this.getWalletClient();
      const [account] = await walletClient.getAddresses();
      const chain = this.getChain();

      const deadline = BigInt(Math.floor(Date.now() / 1000) + deadlineMinutes * 60);

      const domain = {
        name: 'PROVET',
        version: '1',
        chainId: chain.id,
        verifyingContract: this.attestationRegistryAddress,
      };

      const types = {
        PredictionData: [
          { name: 'modelId', type: 'bytes32' },
          { name: 'inputHash', type: 'bytes32' },
          { name: 'outputHash', type: 'bytes32' },
          { name: 'deadline', type: 'uint256' },
        ],
      };

      const message: PredictionData = {
        modelId,
        inputHash,
        outputHash,
        deadline,
      };

      const signature = await walletClient.signTypedData({
        domain,
        types,
        primaryType: 'PredictionData',
        message,
        account,
      });

      // Split signature into v, r, s components
      const r = signature.slice(0, 66) as Hash;
      const s = ('0x' + signature.slice(66, 130)) as Hash;
      const v = parseInt(signature.slice(130, 132), 16);

      return { v, r, s, deadline };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new SDKError(
        ErrorCode.CONTRACT_ERROR,
        `Failed to generate attestation signature: ${message}`
      );
    }
  }

  /**
   * Create an attestation for a prediction
   */
  async createAttestation(input: AttestationInput): Promise<TransactionResult<Hash>> {
    try {
      const walletClient = this.getWalletClient();
      const [account] = await walletClient.getAddresses();

      const hash = await walletClient.writeContract({
        address: this.attestationRegistryAddress,
        abi: ATTESTATION_REGISTRY_ABI,
        functionName: 'createAttestation',
        args: [
          input.modelId,
          input.inputHash,
          input.outputHash,
          input.metadataURI,
          input.deadline,
          input.v,
          input.r,
          input.s,
        ],
        account,
      });

      return {
        success: true,
        hash,
        data: hash,
      };
    } catch (error) {
      return this.handleError<Hash>(error, 'Failed to create attestation');
    }
  }

  /**
   * Verify an attestation
   */
  async verifyAttestation(
    modelId: Hash,
    inputHash: Hash,
    outputHash: Hash
  ): Promise<VerificationResult> {
    try {
      const publicClient = this.getPublicClient();

      const result = await publicClient.readContract({
        address: this.attestationRegistryAddress,
        abi: ATTESTATION_REGISTRY_ABI,
        functionName: 'verifyAttestation',
        args: [modelId, inputHash, outputHash],
      }) as [boolean, Hash];

      const [isValid, attestationId] = result;

      return {
        isValid,
        attestationId: isValid ? attestationId : null,
      };
    } catch (error) {
      console.error('Failed to verify attestation:', error);
      return {
        isValid: false,
        attestationId: null,
      };
    }
  }

  // ============ PROTOCOL STATS ============

  /**
   * Get protocol statistics
   */
  async getProtocolStats(): Promise<ProtocolStats | null> {
    try {
      const publicClient = this.getPublicClient();

      const [totalModels, registrationFee] = await Promise.all([
        publicClient.readContract({
          address: this.modelRegistryAddress,
          abi: MODEL_REGISTRY_ABI,
          functionName: 'totalModels',
          args: [],
        }) as Promise<bigint>,
        publicClient.readContract({
          address: this.modelRegistryAddress,
          abi: MODEL_REGISTRY_ABI,
          functionName: 'registrationFee',
          args: [],
        }) as Promise<bigint>,
      ]);

      return {
        totalModels,
        totalAttestations: BigInt(0),
        registrationFee,
        feesEnabled: false,
        totalFeesCollected: BigInt(0),
      };
    } catch (error) {
      console.error('Failed to get protocol stats:', error);
      return null;
    }
  }

  // ============ SUBGRAPH QUERIES ============

  setSubgraphUrl(url: string) {
    this.subgraphUrl = url;
  }

  async querySubgraph<T>(query: string, variables?: Record<string, unknown>): Promise<T | null> {
    if (!this.subgraphUrl) {
      throw new SDKError(ErrorCode.NETWORK_ERROR, 'Subgraph URL not set');
    }

    try {
      const response = await fetch(this.subgraphUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, variables }),
      });

      if (!response.ok) {
        throw new Error(`Subgraph query failed: ${response.statusText}`);
      }

      const payload = (await response.json()) as { data: T; errors?: Array<{ message: string }> };
      if (payload.errors?.length) {
        throw new Error(payload.errors[0]?.message || 'Subgraph query returned errors');
      }

      return payload.data;
    } catch (error) {
      console.error('Subgraph query failed:', error);
      return null;
    }
  }

  /**
   * Get paginated models from subgraph
   */
  async getModelsSubgraph(skip: number = 0, first: number = 100): Promise<Model[]> {
    const query = `
      query GetModels($skip: Int!, $first: Int!) {
        models(skip: $skip, first: $first, orderBy: registeredAt, orderDirection: desc) {
          id
          modelId
          owner
          name
          currentVersion
          modelHash
          metadataURI
          isActive
          totalVersions
          attestationsCount
          registeredAt
          updatedAt
          tags
        }
      }
    `;

    const result = await this.querySubgraph<{ models: Model[] }>(query, { skip, first });
    return result?.models || [];
  }

  /**
   * Get active models from subgraph
   */
  async getActiveModelsSubgraph(skip: number = 0, first: number = 100): Promise<Model[]> {
    const query = `
      query GetActiveModels($skip: Int!, $first: Int!) {
        models(
          skip: $skip,
          first: $first,
          where: { isActive: true },
          orderBy: registeredAt,
          orderDirection: desc
        ) {
          id
          modelId
          owner
          name
          currentVersion
          modelHash
          metadataURI
          isActive
          totalVersions
          attestationsCount
          registeredAt
          updatedAt
          tags
        }
      }
    `;

    const result = await this.querySubgraph<{ models: Model[] }>(query, { skip, first });
    return result?.models || [];
  }

  /**
   * Get model attestations from subgraph
   */
  async getModelAttestationsSubgraph(modelId: Hash): Promise<unknown[]> {
    const query = `
      query GetModelAttestations($modelId: String!) {
        attestations(
          where: { model: $modelId }
          orderBy: timestamp
          orderDirection: desc
        ) {
          id
          attestationId
          inputHash
          outputHash
          metadataURI
          attester
          deadline
          timestamp
          isRevoked
        }
      }
    `;

    const result = await this.querySubgraph<{ attestations: unknown[] }>(query, { modelId });
    return result?.attestations || [];
  }

  /**
   * Get protocol stats from subgraph
   */
  async getProtocolStatsSubgraph(): Promise<ProtocolStats | null> {
    const query = `
      query GetProtocolStats {
        protocolStats(id: "0") {
          totalModels
          totalAttestations
          activeModels
          revokedAttestations
        }
      }
    `;

    const result = await this.querySubgraph<{ protocolStats: ProtocolStats }>(query);
    return result?.protocolStats || null;
  }

  // ============ PAGINATED CONTRACT QUERIES (Fallback) ============

  /**
   * Get paginated models from contract (fallback when subgraph unavailable)
   */
  async getModelsPaginated(offset: bigint, limit: bigint): Promise<Model[]> {
    try {
      const publicClient = this.getPublicClient();

      const result = await publicClient.readContract({
        address: this.modelRegistryAddress,
        abi: MODEL_REGISTRY_ABI,
        functionName: 'getModelsPaginated',
        args: [offset, limit],
      }) as unknown as unknown[];

      return result.map(m => this.parseContractModel(m));
    } catch (error) {
      console.error('Failed to get paginated models:', error);
      return [];
    }
  }

  /**
   * Get paginated active models from contract
   */
  async getActiveModelsPaginated(offset: bigint, limit: bigint): Promise<Model[]> {
    try {
      const publicClient = this.getPublicClient();

      const result = await publicClient.readContract({
        address: this.modelRegistryAddress,
        abi: MODEL_REGISTRY_ABI,
        functionName: 'getActiveModelsPaginated',
        args: [offset, limit],
      }) as unknown as unknown[];

      return result.map(m => this.parseContractModel(m));
    } catch (error) {
      console.error('Failed to get paginated active models:', error);
      return [];
    }
  }

  private parseContractModel(m: unknown): Model {
    const model = m as Model;
    return {
      id: model.id,
      owner: model.owner,
      name: model.name,
      currentVersion: model.currentVersion,
      modelHash: model.modelHash,
      metadataURI: model.metadataURI,
      registeredAt: model.registeredAt,
      updatedAt: model.updatedAt,
      isActive: model.isActive,
      totalVersions: model.totalVersions,
      attestationsCount: model.attestationsCount,
    };
  }

  // ============ UTILITY ============

  /**
   * Generate input/output hash for attestation
   */
  generateHash(input: string): Hash {
    return keccak256(toBytes(input));
  }

  /**
   * Handle errors
   */
  private handleError<T>(error: unknown, context: string): TransactionResult<T> {
    console.error(`${context}:`, error);

    const message = error instanceof Error ? error.message : String(error);
    let errorMessage = context;

    if (message.includes('User rejected')) {
      errorMessage = 'Transaction rejected by user';
    } else if (message.includes('insufficient funds')) {
      errorMessage = 'Insufficient funds for transaction';
    } else if (message.includes('not authorized')) {
      errorMessage = 'Not authorized to perform this action';
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

// Export factory function
export function createProvet(config: ProvetConfig): Provet {
  return new Provet(config);
}
