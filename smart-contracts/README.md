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
```

Deploy to Sepolia (requires constructor parameter `usdcAddress`):

```bash
npx hardhat ignition deploy \
  --network sepolia \
  ignition/modules/Job.ts \
  --parameters '{"JobsModule":{"usdcAddress":"0xYourSepoliaUSDCAddress"}}'
```

## Notes for Frontend Integration

- Contract escrows ERC20 USDC-style tokens (not native ETH).
- Client must `approve` escrow contract before `fundEscrow`.
- `fundEscrow` pulls exactly `budget` amount.
- Final release updates status to `Released` and zeroes escrow balance.
- Useful events for UI timeline:
  - `JobCreated`
  - `JobAccepted`
  - `EscrowFunded`
  - `WorkDelivered`
  - `PaymentReleased`
