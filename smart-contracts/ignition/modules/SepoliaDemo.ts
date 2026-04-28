import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("SepoliaDemoModule", (m) => {
  const usdc = m.contract("MockUSDC");
  const jobs = m.contract("JobEscrow", [usdc]);

  return { jobs, usdc };
});
