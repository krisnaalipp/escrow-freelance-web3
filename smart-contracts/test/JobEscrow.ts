import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe("JobEscrow (USDC)", function () {
  it("creates job, accepts worker, funds escrow with USDC, submits and releases", async function () {
    const [client, worker] = await ethers.getSigners();

    const usdc = await ethers.deployContract("MockUSDC", client);
    const escrow = await ethers.deployContract("JobEscrow", [usdc.target], client);

    const budget = 1_500_000n; // 1.5 USDC with 6 decimals

    await usdc.connect(client).mint(client.address, budget);

    await expect(escrow.connect(client).createJob(budget))
      .to.emit(escrow, "JobCreated")
      .withArgs(1n, client.address, budget);

    await expect(escrow.connect(client).acceptFreelancer(1n, worker.address))
      .to.emit(escrow, "JobAccepted")
      .withArgs(1n, worker.address);

    await usdc.connect(client).approve(escrow.target, budget);

    await expect(escrow.connect(client).fundEscrow(1n))
      .to.emit(escrow, "EscrowFunded")
      .withArgs(1n, budget);

    await expect(escrow.connect(worker).submitWork(1n))
      .to.emit(escrow, "WorkDelivered")
      .withArgs(1n);

    await expect(escrow.connect(client).releasePayment(1n))
      .to.emit(escrow, "PaymentReleased")
      .withArgs(1n, worker.address, budget);

    const job = await escrow.jobs(1n);
    expect(job.status).to.equal(4n); // Released
    expect(job.escrowBalance).to.equal(0n);
    expect(await usdc.balanceOf(worker.address)).to.equal(budget);
  });

  it("does not allow non-client to accept", async function () {
    const [client, worker] = await ethers.getSigners();

    const usdc = await ethers.deployContract("MockUSDC", client);
    const escrow = await ethers.deployContract("JobEscrow", [usdc.target], client);

    await escrow.connect(client).createJob(1_000_000n);

    await expect(
      escrow.connect(worker).acceptFreelancer(1n, worker.address),
    ).to.be.revertedWith("Only client can accept");
  });

  it("requires approval before funding escrow", async function () {
    const [client, worker] = await ethers.getSigners();

    const usdc = await ethers.deployContract("MockUSDC", client);
    const escrow = await ethers.deployContract("JobEscrow", [usdc.target], client);

    const budget = 1_000_000n;
    await usdc.connect(client).mint(client.address, budget);

    await escrow.connect(client).createJob(budget);
    await escrow.connect(client).acceptFreelancer(1n, worker.address);

    await expect(escrow.connect(client).fundEscrow(1n)).to.be.revertedWith(
      "USDC transfer failed",
    );
  });

  it("does not allow client to hire self", async function () {
    const [client] = await ethers.getSigners();

    const usdc = await ethers.deployContract("MockUSDC", client);
    const escrow = await ethers.deployContract("JobEscrow", [usdc.target], client);

    await escrow.connect(client).createJob(1_000_000n);

    await expect(
      escrow.connect(client).acceptFreelancer(1n, client.address),
    ).to.be.revertedWith("Client cannot hire self");
  });
});
