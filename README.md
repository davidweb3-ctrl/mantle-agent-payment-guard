# Mantle Agent Payment Guard

AI-assisted payment safety for onchain agent actions on Mantle.

## Pitch

AI agents are becoming capable of initiating payments, subscriptions, and treasury actions. Mantle Agent Payment Guard adds a review step before value moves: the app analyzes a payment intent, shows human-readable risk signals, and records a compact payment-safety receipt on a Mantle smart contract.

## What It Does

- Reviews an AI-agent payment intent before an onchain write.
- Scores risk based on amount, recipient format, purpose, and risky language.
- Creates an intent hash for a reproducible audit trail.
- Records a payment-safety receipt on Mantle Sepolia.
- Shows users the transaction link after recording.

## Architecture

```text
User / wallet
  -> React frontend
  -> local AI-style risk review engine
  -> Mantle Sepolia smart contract
  -> PaymentIntentRecorded event / receipt lookup
```

The current demo uses a deterministic local review engine so the app is easy to run and verify during the hackathon. A production version would call a hosted model or policy engine before writing the receipt.

## Smart Contract

`contracts/AgentPaymentGuard.sol` stores reviewed payment intent receipts:

- user address;
- agent address;
- recipient;
- amount;
- token symbol;
- intent hash;
- risk score;
- risk summary;
- source chain id;
- timestamp.

## Mantle Network

The project targets Mantle Sepolia for low-cost hackathon proof:

- Chain ID: `5003`
- RPC: `https://rpc.sepolia.mantle.xyz`
- Explorer: `https://explorer.sepolia.mantle.xyz`

## Local Setup

```bash
npm install
npm run test:contracts
npm run dev
```

Open the printed Vite URL and test the local review flow.

## Public Frontend

Current public demo:

```text
https://davidweb3-ctrl.github.io/mantle-agent-payment-guard/
```

The static frontend can be published with GitHub Pages:

```bash
npm run deploy:pages
```

## Deploy To Mantle Sepolia

Create `.env` from `.env.example`, then set:

```text
PRIVATE_KEY=your_test_wallet_private_key
MANTLE_SEPOLIA_RPC_URL=https://rpc.sepolia.mantle.xyz
```

Deploy:

```bash
source .env
npm run deploy:mantle-sepolia
```

After deployment, set:

```text
VITE_CONTRACT_ADDRESS=0x...
```

Then rebuild and publish the frontend.

## Current Deployment

Public frontend:

```text
https://davidweb3-ctrl.github.io/mantle-agent-payment-guard/
```

Mantle Sepolia contract:

```text
0x4965e045fBA701c8d98B445155e82B2E153e7335
```

Explorer:

```text
https://explorer.sepolia.mantle.xyz/address/0x4965e045fBA701c8d98B445155e82B2E153e7335
```

Deployment transaction:

```text
0x45f245e4d916d0f4cf0f97438e21267d399059069a27f4cfe2a3dae405160dce
```

Transaction explorer:

```text
https://explorer.sepolia.mantle.xyz/tx/0x45f245e4d916d0f4cf0f97438e21267d399059069a27f4cfe2a3dae405160dce
```

Deployment block:

```text
39163481
```

First usage transaction:

```text
0x7264d23c8e5c0a3e57559e9af64b81bfba42dd13f5c65ae3e13299101633c1fa
```

Usage transaction explorer:

```text
https://sepolia.mantlescan.xyz/tx/0x7264d23c8e5c0a3e57559e9af64b81bfba42dd13f5c65ae3e13299101633c1fa
```

Usage block:

```text
39163828
```

Onchain receipt count:

```text
1
```

Final DoraHacks submission should still wait until a 2+ minute demo video URL is available.

## Verification

Local verification completed on 2026-05-27:

```bash
npm run test:contracts
npm run build
```

Result:

- Foundry: 4 contract tests passed.
- Vite: production build passed.
- Browser check: local and GitHub Pages frontend loaded with live risk scoring.
- Mantle Sepolia RPC check: deployed contract bytecode exists and deployment receipt has `status 1`.
- Mantle Sepolia usage check: first `recordPaymentIntent` transaction has `status 1`, emitted `PaymentIntentRecorded`, and `receiptCount()` returns `1`.

## Hackathon Track

The Turing Test Hackathon 2026 - `AI DevTools`.
