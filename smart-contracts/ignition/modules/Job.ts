import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("JobsModule", (m) => {
  const usdcAddress = m.getParameter("usdcAddress");
  const jobs = m.contract("JobEscrow", [usdcAddress]);

  return { jobs };
});
