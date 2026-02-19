import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("JobsModule", (m) => {
  const jobs = m.contract("JobEscrow");

  return { jobs };
});
