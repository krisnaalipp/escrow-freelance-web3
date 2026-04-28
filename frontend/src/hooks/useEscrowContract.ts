"use client";

import { useCallback, useState } from "react";
import {
  useAccount,
  useChainId,
  usePublicClient,
  useWriteContract,
} from "wagmi";

import {
  getEscrowAddresses,
  jobEscrowAbi,
  LOCALHOST_CHAIN_ID,
  mockUsdcAbi,
  SEPOLIA_CHAIN_ID,
} from "../lib/escrowContract";

type CreateJobInput = {
  budget: number;
};

type AcceptJobInput = {
  jobId: number;
  workerAddress: `0x${string}`;
};

type FundJobInput = {
  budget: number;
  jobId: number;
};

type MintInput = {
  amount: number;
};

type IdOnlyInput = {
  jobId: number;
};

function toUsdcUnits(amount: number) {
  return BigInt(Math.round(amount * 1_000_000));
}

function getReadableError(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong while sending the transaction.";
}

export function useEscrowContract() {
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { address, isConnected } = useAccount();
  const { isPending, writeContractAsync } = useWriteContract();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [tokenBalance, setTokenBalance] = useState<string | null>(null);
  const [tokenBalanceRaw, setTokenBalanceRaw] = useState<bigint | null>(null);

  const assertReady = useCallback(() => {
    if (!isConnected || !address) {
      throw new Error("Connect your wallet before using the escrow flow.");
    }

    if (chainId !== LOCALHOST_CHAIN_ID && chainId !== SEPOLIA_CHAIN_ID) {
      throw new Error(
        "Switch your wallet to Localhost 31337 or Sepolia for this demo flow.",
      );
    }

    if (!publicClient) {
      throw new Error("Wallet client is still loading. Try again in a moment.");
    }

    const addresses = getEscrowAddresses(chainId);

    if (!addresses) {
      throw new Error("Contract addresses are not configured for this network.");
    }

    return addresses;
  }, [address, chainId, isConnected, publicClient]);

  const refreshTokenBalance = useCallback(async () => {
    try {
      const addresses = assertReady();
      const balance = (await publicClient!.readContract({
        address: addresses.mockUsdcAddress,
        abi: mockUsdcAbi,
        functionName: "balanceOf",
        args: [address!],
      })) as bigint;

      setTokenBalanceRaw(balance);
      setTokenBalance((Number(balance) / 1_000_000).toFixed(2));
      return balance;
    } catch {
      setTokenBalanceRaw(null);
      setTokenBalance(null);
      return null;
    }
  }, [address, assertReady, publicClient]);

  const createOnchainJob = async ({ budget }: CreateJobInput) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const addresses = assertReady();
      const budgetInUsdc = toUsdcUnits(budget);
      const currentJobCount = (await publicClient!.readContract({
        address: addresses.jobEscrowAddress,
        abi: jobEscrowAbi,
        functionName: "jobCount",
      })) as bigint;

      const hash = await writeContractAsync({
        address: addresses.jobEscrowAddress,
        abi: jobEscrowAbi,
        functionName: "createJob",
        args: [budgetInUsdc],
      });

      await publicClient!.waitForTransactionReceipt({ hash });

      const jobId = Number(currentJobCount + BigInt(1));
      setSuccessMessage(`Job created on-chain. Job ID #${jobId}`);

      return { jobId, txHash: hash };
    } catch (error) {
      setErrorMessage(getReadableError(error));
      return null;
    }
  };

  const acceptOnchainFreelancer = async ({
    jobId,
    workerAddress,
  }: AcceptJobInput) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const addresses = assertReady();
      const hash = await writeContractAsync({
        address: addresses.jobEscrowAddress,
        abi: jobEscrowAbi,
        functionName: "acceptFreelancer",
        args: [BigInt(jobId), workerAddress],
      });

      await publicClient!.waitForTransactionReceipt({ hash });
      setSuccessMessage(`Freelancer accepted on-chain for job #${jobId}`);

      return { txHash: hash };
    } catch (error) {
      setErrorMessage(getReadableError(error));
      return null;
    }
  };

  const fundOnchainEscrow = async ({ budget, jobId }: FundJobInput) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const addresses = assertReady();
      const budgetInUsdc = toUsdcUnits(budget);

      const approveHash = await writeContractAsync({
        address: addresses.mockUsdcAddress,
        abi: mockUsdcAbi,
        functionName: "approve",
        args: [addresses.jobEscrowAddress, budgetInUsdc],
      });
      await publicClient!.waitForTransactionReceipt({ hash: approveHash });

      const fundTxHash = await writeContractAsync({
        address: addresses.jobEscrowAddress,
        abi: jobEscrowAbi,
        functionName: "fundEscrow",
        args: [BigInt(jobId)],
      });
      await publicClient!.waitForTransactionReceipt({ hash: fundTxHash });

      setSuccessMessage(`Escrow funded on-chain for job #${jobId}`);
      await refreshTokenBalance();

      return { txHash: fundTxHash };
    } catch (error) {
      setErrorMessage(getReadableError(error));
      return null;
    }
  };

  const mintMockUsdc = async ({ amount }: MintInput) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const addresses = assertReady();
      const amountInUsdc = toUsdcUnits(amount);

      const hash = await writeContractAsync({
        address: addresses.mockUsdcAddress,
        abi: mockUsdcAbi,
        functionName: "mint",
        args: [address!, amountInUsdc],
      });
      await publicClient!.waitForTransactionReceipt({ hash });
      await refreshTokenBalance();
      setSuccessMessage(`Minted ${amount.toFixed(2)} mUSDC to your wallet.`);
      return { txHash: hash };
    } catch (error) {
      setErrorMessage(getReadableError(error));
      return null;
    }
  };

  const submitOnchainWork = async ({ jobId }: IdOnlyInput) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const addresses = assertReady();
      const hash = await writeContractAsync({
        address: addresses.jobEscrowAddress,
        abi: jobEscrowAbi,
        functionName: "submitWork",
        args: [BigInt(jobId)],
      });
      await publicClient!.waitForTransactionReceipt({ hash });
      setSuccessMessage(`Work marked delivered on-chain for job #${jobId}`);
      return { txHash: hash };
    } catch (error) {
      setErrorMessage(getReadableError(error));
      return null;
    }
  };

  const releaseOnchainPayment = async ({ jobId }: IdOnlyInput) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const addresses = assertReady();
      const hash = await writeContractAsync({
        address: addresses.jobEscrowAddress,
        abi: jobEscrowAbi,
        functionName: "releasePayment",
        args: [BigInt(jobId)],
      });
      await publicClient!.waitForTransactionReceipt({ hash });
      setSuccessMessage(`Payment released on-chain for job #${jobId}`);
      return { txHash: hash };
    } catch (error) {
      setErrorMessage(getReadableError(error));
      return null;
    }
  };

  const resetStatus = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  return {
    acceptOnchainFreelancer,
    createOnchainJob,
    errorMessage,
    fundOnchainEscrow,
    isPending,
    mintMockUsdc,
    releaseOnchainPayment,
    resetStatus,
    refreshTokenBalance,
    submitOnchainWork,
    successMessage,
    tokenBalance,
    tokenBalanceRaw,
  };
}
