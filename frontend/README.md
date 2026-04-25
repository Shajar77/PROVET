# PROVET Frontend

Next.js 16 web application for the PROVET on-chain AI model provenance protocol.

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Pages

- `/` — Landing page with protocol overview
- `/models` — Browse registered models with search, filter, and pagination
- `/verify` — Verify a prediction against its on-chain attestation
- `/dashboard` — Register a new AI model on-chain

## Configuration

Update contract addresses in `lib/contracts.ts` after deploying the smart contracts.
