import type { Abi, Address } from "viem";

export const LOCALHOST_CHAIN_ID = 31_337;
export const SEPOLIA_CHAIN_ID = 11_155_111;

export const LOCALHOST_MOCK_USDC_ADDRESS =
  "0x5FbDB2315678afecb367f032d93F642f64180aa3" as Address;
export const LOCALHOST_JOB_ESCROW_ADDRESS =
  "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512" as Address;
export const LOCALHOST_DEMO_WORKER_ADDRESS =
  "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" as Address;

export const mockUsdcAbi = [
  {
    type: "function",
    name: "mint",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const satisfies Abi;

export const jobEscrowAbi = [
  {
    type: "function",
    name: "jobCount",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "createJob",
    stateMutability: "nonpayable",
    inputs: [{ name: "_budget", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "acceptFreelancer",
    stateMutability: "nonpayable",
    inputs: [
      { name: "_jobId", type: "uint256" },
      { name: "_worker", type: "address" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "fundEscrow",
    stateMutability: "nonpayable",
    inputs: [{ name: "_jobId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "submitWork",
    stateMutability: "nonpayable",
    inputs: [{ name: "_jobId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "releasePayment",
    stateMutability: "nonpayable",
    inputs: [{ name: "_jobId", type: "uint256" }],
    outputs: [],
  },
] as const satisfies Abi;

export function getEscrowAddresses(chainId?: number) {
  if (chainId === LOCALHOST_CHAIN_ID) {
    return {
      jobEscrowAddress: LOCALHOST_JOB_ESCROW_ADDRESS,
      mockUsdcAddress: LOCALHOST_MOCK_USDC_ADDRESS,
    };
  }

  if (chainId === SEPOLIA_CHAIN_ID) {
    const jobEscrowAddress = process.env.NEXT_PUBLIC_SEPOLIA_JOB_ESCROW_ADDRESS as
      | Address
      | undefined;
    const mockUsdcAddress = process.env.NEXT_PUBLIC_SEPOLIA_MOCK_USDC_ADDRESS as
      | Address
      | undefined;

    if (!jobEscrowAddress || !mockUsdcAddress) {
      return null;
    }

    return {
      jobEscrowAddress,
      mockUsdcAddress,
    };
  }

  return null;
}
