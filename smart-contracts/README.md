# JobEscrow Smart Contracts (USDC-based)

This folder contains the `JobEscrow` contract used by the frontend portfolio flow:

`Open -> Accepted -> Funded -> Delivered -> Released`

## Contract Overview

Main contract:
- `contracts/Job.sol` (`JobEscrow`)

Main actions:
1. `createJob(budget)` by client
2. `acceptFreelancer(jobId, worker)` by client
3. `fundEscrow(jobId)` by client (pulls USDC via `transferFrom`)
4. `submitWork(jobId)` by worker
5. `releasePayment(jobId)` by client

## Scripts

```bash
npm run compile
npm run test
npm run deploy:local
npm run deploy:sepolia:demo
npm run smoke
```

Deploy to Sepolia (requires constructor parameter `usdcAddress`):

```bash
npx hardhat ignition deploy \
  --network sepolia \
  ignition/modules/Job.ts \
  --parameters '{"JobsModule":{"usdcAddress":"0xYourSepoliaUSDCAddress"}}'
```

Deploy a full Sepolia demo stack with your own mock stablecoin:

```bash
npm run deploy:sepolia:demo
```

This deploys:
- `MockUSDC` on Sepolia
- `JobEscrow` on Sepolia using that `MockUSDC` address

Required environment variables:

```bash
export SEPOLIA_RPC_URL="https://sepolia.infura.io/v3/YOUR_KEY"
export SEPOLIA_PRIVATE_KEY="0xyour_private_key"
```

After deployment, copy the two addresses into your frontend env:

```bash
NEXT_PUBLIC_SEPOLIA_MOCK_USDC_ADDRESS=0x...
NEXT_PUBLIC_SEPOLIA_JOB_ESCROW_ADDRESS=0x...
```

Deploy locally with a fresh mock USDC plus escrow contract:

1. Start a local node:

```bash
npx hardhat node
```

2. Deploy from another terminal:

```bash
npm run deploy:local
```

Run a happy-path smoke test without using the console:

```bash
npm run smoke
```

Or target your running localhost node:

```bash
npm run smoke:local
```

## Notes for Frontend Integration

- Contract escrows ERC20 USDC-style tokens (not native ETH).
- The Sepolia demo path can use your own `MockUSDC`, which keeps the portfolio flow self-contained.
- Client must `approve` escrow contract before `fundEscrow`.
- `fundEscrow` pulls exactly `budget` amount.
- Final release updates status to `Released` and zeroes escrow balance.
- Useful events for UI timeline:
  - `JobCreated`
  - `JobAccepted`
  - `EscrowFunded`
  - `WorkDelivered`
  - `PaymentReleased`
