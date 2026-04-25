# PROVET

On-chain AI model provenance protocol. Register AI models, attest to predictions with EIP-712 signatures, and verify which model made every decision — all on Base.

---

## Overview

PROVET is a decentralized protocol for establishing trust and accountability in AI systems. It provides an immutable, on-chain registry where AI model owners can register their models, cryptographically attest to predictions using EIP-712 typed data signatures, and allow anyone to independently verify which model produced a given output.

The protocol is designed for teams and organizations that need transparent, auditable records of AI model behavior — whether for regulatory compliance, user trust, or internal governance.

---

## Architecture

The project is organized into three packages:

```
provet/
  contracts/     Solidity smart contracts (Hardhat)
  frontend/      Web application (Next.js 16, React, wagmi)
  subgraph/      The Graph indexer for querying on-chain data
```

### Smart Contracts

Two core contracts deployed on Base Sepolia:

- **ModelRegistry** — Handles model registration, version management, tagging, certification, and protocol fee collection. Supports batch operations and paginated queries.
- **AttestationRegistry** — Manages EIP-712 signed attestations that link specific inputs and outputs to a registered model. Supports revocation and on-chain verification.

### Frontend

A Next.js 16 application with a brutalist design aesthetic. Built with:

- **wagmi + viem** for wallet connectivity and contract interaction
- **RainbowKit** for wallet connection UI
- **Framer Motion** for animations
- **next-themes** for dark/light mode support

### Subgraph

A Graph Protocol subgraph that indexes ModelRegistered, ModelUpdated, AttestationCreated, and AttestationRevoked events for efficient off-chain querying.

---

## Features

- Register AI models on-chain with version history and metadata URIs
- Create cryptographic attestations using EIP-712 typed data signatures
- Verify any prediction against its on-chain attestation
- Model version tracking with optional third-party certification
- Protocol fee system (configurable, disabled by default)
- Paginated contract queries for efficient data retrieval
- Search, filter, and pagination on the models registry page
- Responsive design across all screen sizes
- Custom 404 page and error boundaries
- Route transition loading states

---

## Prerequisites

- Node.js 18 or later
- A wallet with Base Sepolia ETH (for contract deployment)
- Git

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Shajar77/PROVET.git
cd PROVET
```

### 2. Smart Contracts

```bash
cd contracts
npm install
```

Create a `.env` file in the `contracts/` directory:

```
PRIVATE_KEY=0x<your_wallet_private_key>
BASESCAN_API_KEY=<optional_for_contract_verification>
```

Run tests:

```bash
npx hardhat test
```

Deploy to Base Sepolia:

```bash
npx hardhat run scripts/deploy.ts --network baseSepolia
```

The deploy script will output contract addresses and save them to `deployment.json`. Copy the addresses into `frontend/lib/contracts.ts` under the `baseSepolia` entry.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

The application will be available at `http://localhost:3000`.

### 4. Subgraph (Optional)

The subgraph requires a Graph Node instance. Update `subgraph/subgraph.yaml` with your deployed contract addresses, then deploy to The Graph's hosted service or a self-hosted node.

---

## Contract Addresses

After deployment, update the following file with your contract addresses:

**File:** `frontend/lib/contracts.ts`

```typescript
export const CONTRACT_ADDRESSES = {
  baseSepolia: {
    modelRegistry: '<ModelRegistry_address>',
    attestationRegistry: '<AttestationRegistry_address>',
  },
};
```

---

## Project Structure

```
contracts/
  contracts/
    ModelRegistry.sol          Core model registration and management
    AttestationRegistry.sol    EIP-712 attestation creation and verification
  scripts/
    deploy.ts                  Deployment script with auto-verification
  test/
    ModelRegistry.ts           Model registry test suite
    AttestationRegistry.ts     Attestation registry test suite
  hardhat.config.ts            Hardhat configuration (Base Sepolia)

frontend/
  app/
    page.tsx                   Landing page
    dashboard/page.tsx         Model registration form (connected to SDK)
    models/page.tsx            Model registry browser with search/filter/pagination
    verify/page.tsx            Prediction verification interface
    not-found.tsx              Custom 404 page
    error.tsx                  Error boundary
    global-error.tsx           Global error boundary
    loading.tsx                Route loading skeleton
    layout.tsx                 Root layout with SEO metadata
    web3-provider.tsx          RainbowKit and wagmi configuration
    web3-context.tsx           Web3 state context
    providers.tsx              Provider composition with lazy loading
  components/
    navbar.tsx                 Responsive navigation with mobile drawer
    hero-section.tsx           Landing page hero
    about-section.tsx          Protocol description
    feature-grid.tsx           Feature cards
    protocol-features.tsx      Detailed feature breakdown
    pricing-section.tsx        Tier comparison
    faq-section.tsx            Frequently asked questions
    footer.tsx                 Site footer
    connect-wallet.tsx         Wallet connection button
    blink-dot.tsx              Shared UI component
    navigation-loader.tsx      Route change progress bar
    page-loader.tsx            Full-page loading spinner
  lib/
    sdk.ts                     PROVET SDK (contract interaction layer)
    contracts.ts               Contract ABIs and addresses
    types.ts                   TypeScript type definitions
  hooks/
    use-transaction.ts         Transaction state management hook

subgraph/
  schema.graphql               GraphQL schema
  subgraph.yaml                Subgraph manifest
  src/
    modelRegistry.ts           ModelRegistry event handlers
    attestationRegistry.ts     AttestationRegistry event handlers
```

---

## How It Works

1. **Register a Model** — A model owner submits the model name, version, and a keccak256 hash of the model weights to the ModelRegistry contract. The model receives a unique bytes32 identifier.

2. **Attest to a Prediction** — When the model makes a prediction, the owner signs an EIP-712 typed data message containing the model ID, input hash, output hash, and a deadline. This signature and the prediction data are submitted to the AttestationRegistry contract, which verifies the signature matches the model owner.

3. **Verify a Prediction** — Anyone can call `verifyAttestation` with a model ID, input hash, and output hash. The contract returns whether a valid, non-revoked attestation exists for that prediction.

---

## EIP-712 Domain

The attestation system uses the following EIP-712 domain:

```
name:               PROVET
version:            1
chainId:            <chain_id>
verifyingContract:  <AttestationRegistry_address>
```

The typed data structure for predictions:

```
PredictionData(
  bytes32 modelId,
  bytes32 inputHash,
  bytes32 outputHash,
  uint256 deadline
)
```

---

## Technology Stack

| Layer        | Technology                                      |
|--------------|------------------------------------------------|
| Blockchain   | Base Sepolia (Ethereum L2)                     |
| Contracts    | Solidity 0.8.20, OpenZeppelin, Hardhat         |
| Frontend     | Next.js 16, React, TypeScript                  |
| Web3         | wagmi, viem, RainbowKit                        |
| Styling      | Tailwind CSS, Framer Motion                    |
| Indexing     | The Graph Protocol                             |
| Signatures   | EIP-712 Typed Data                             |

---

## Environment Variables

### contracts/.env

```
PRIVATE_KEY=0x<deployer_wallet_private_key>
BASESCAN_API_KEY=<basescan_api_key_for_verification>
```

### frontend/.env.local (optional)

```
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=<walletconnect_project_id>
```

---

## Testing

Run the smart contract test suite:

```bash
cd contracts
npx hardhat test
```

The test suite covers:

- Model registration, updates, deactivation, and reactivation
- EIP-712 signature creation and verification
- Attestation creation with valid and invalid signatures
- Attestation revocation and access control
- Duplicate prediction prevention
- Batch operations and paginated queries

---

## Deployment

### Local Development

```bash
# Terminal 1 — Start local blockchain
cd contracts
npx hardhat node

# Terminal 2 — Deploy contracts locally
cd contracts
npx hardhat run scripts/deploy.ts --network localhost

# Terminal 3 — Start frontend
cd frontend
npm run dev
```

### Base Sepolia Testnet

1. Fund your wallet with Base Sepolia ETH from https://www.base.org/faucets
2. Set your private key in `contracts/.env`
3. Deploy: `npx hardhat run scripts/deploy.ts --network baseSepolia`
4. Update contract addresses in `frontend/lib/contracts.ts`
5. Build and deploy the frontend to your hosting provider

---

## License

MIT
