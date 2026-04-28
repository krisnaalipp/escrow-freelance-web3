import { network } from "hardhat";

const { ethers } = await network.connect();

async function main() {
  const [client, worker] = await ethers.getSigners();

  console.log("Running JobEscrow smoke test");
  console.log("Client:", client.address);
  console.log("Worker:", worker.address);

  const usdc = await ethers.deployContract("MockUSDC", client);
  await usdc.waitForDeployment();

  const escrow = await ethers.deployContract(
    "JobEscrow",
    [await usdc.getAddress()],
    client,
  );
  await escrow.waitForDeployment();

  console.log("MockUSDC:", await usdc.getAddress());
  console.log("JobEscrow:", await escrow.getAddress());

  const budget = BigInt(1_500_000);

  await (await usdc.mint(client.address, budget)).wait();
  await (await escrow.createJob(budget)).wait();
  await (await escrow.acceptFreelancer(BigInt(1), worker.address)).wait();
  await (await usdc.approve(await escrow.getAddress(), budget)).wait();
  await (await escrow.fundEscrow(BigInt(1))).wait();
  await (await escrow.connect(worker).submitWork(BigInt(1))).wait();
  await (await escrow.releasePayment(BigInt(1))).wait();

  const job = await escrow.jobs(BigInt(1));
  const workerBalance = await usdc.balanceOf(worker.address);

  console.log("Final job:", job);
  console.log("Worker mUSDC balance:", workerBalance.toString());

  if (job.status !== BigInt(4)) {
    throw new Error(`Expected Released status (4), got ${job.status.toString()}`);
  }

  if (job.escrowBalance !== BigInt(0)) {
    throw new Error(
      `Expected escrowBalance 0, got ${job.escrowBalance.toString()}`,
    );
  }

  if (workerBalance !== budget) {
    throw new Error(
      `Expected worker balance ${budget.toString()}, got ${workerBalance.toString()}`,
    );
  }

  console.log("Smoke test passed");
}

await main();
