import { useState } from "react";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi";
import { Address, parseEther, formatEther } from "viem";
import AuthorizeABI from "../../../../abis/Authorize.json";

// WithdrawalTarget enum
export enum WithdrawalTarget {
  FeeVault = 0,
  Treasury = 1,
}

interface UseAuthWithdrawalProps {
  authorizeAddress: Address;
  onTransactionComplete?: () => void;
}

export const useAuthWithdrawal = ({
  authorizeAddress,
  onTransactionComplete,
}: UseAuthWithdrawalProps) => {
  const [tx, setTx] = useState<string | null>(null);

  // Contract write hook
  const { writeContractAsync, isPending } = useWriteContract();

  // Transaction receipt hook
  const { data: txReceipt, isLoading } = useWaitForTransactionReceipt({
    hash: tx as `0x${string}`,
  });

  // Read current proposal count
  const { data: withdrawProposalCount, refetch: refetchCount } =
    useReadContract({
      address: authorizeAddress,
      abi: AuthorizeABI,
      functionName: "withdrawProposalCount",
    });

  // Read required signatures
  const { data: requiredSignatures } = useReadContract({
    address: authorizeAddress,
    abi: AuthorizeABI,
    functionName: "requiredSignatures",
  });

  // Create withdrawal proposal - 파라미터로 받음
  const proposeWithdrawal = async (
    receiver: string,
    amount: string,
    target: WithdrawalTarget
  ) => {
    if (!receiver || !amount) {
      throw new Error("Missing required fields");
    }

    try {
      const hash = await writeContractAsync({
        address: authorizeAddress,
        abi: AuthorizeABI,
        functionName: "proposeWithdrawal",
        args: [receiver as Address, parseEther(amount), target],
      });

      setTx(hash);

      // Refetch proposal count after transaction
      setTimeout(() => {
        refetchCount();
      }, 2000);

      return hash;
    } catch (error) {
      console.error("Failed to propose withdrawal:", error);
      throw error;
    }
  };

  // Sign withdrawal proposal
  const signWithdrawalProposal = async (proposalId: number) => {
    try {
      const hash = await writeContractAsync({
        address: authorizeAddress,
        abi: AuthorizeABI,
        functionName: "signWithdrawalProposal",
        args: [proposalId],
      });

      setTx(hash);
      return hash;
    } catch (error) {
      console.error("Failed to sign withdrawal proposal:", error);
      throw error;
    }
  };

  // Execute withdrawal proposal
  const executeWithdrawalProposal = async (proposalId: number) => {
    try {
      const hash = await writeContractAsync({
        address: authorizeAddress,
        abi: AuthorizeABI,
        functionName: "executeWithdrawalProposal",
        args: [proposalId],
      });

      setTx(hash);

      if (onTransactionComplete) {
        setTimeout(() => {
          onTransactionComplete();
        }, 2000);
      }

      return hash;
    } catch (error) {
      console.error("Failed to execute withdrawal proposal:", error);
      throw error;
    }
  };

  // Get withdrawal proposal details
  const getWithdrawalProposal = (proposalId: number) => {
    return useReadContract({
      address: authorizeAddress,
      abi: AuthorizeABI,
      functionName: "getWithdrawalProposals",
      args: [proposalId],
    });
  };

  // Check if user has signed proposal
  const hasSignedWithdrawalProposal = (
    proposalId: number,
    userAddress: Address
  ) => {
    return useReadContract({
      address: authorizeAddress,
      abi: AuthorizeABI,
      functionName: "hasSignedWithdrawalProposal",
      args: [proposalId, userAddress],
    });
  };

  return {
    // Transaction status
    isPending,
    isLoading,
    txReceipt,
    tx,

    // Read data
    withdrawProposalCount: withdrawProposalCount as number,
    requiredSignatures: requiredSignatures as number,

    // Actions (파라미터를 받는 함수들)
    proposeWithdrawal,
    signWithdrawalProposal,
    executeWithdrawalProposal,

    // Helper functions
    getWithdrawalProposal,
    hasSignedWithdrawalProposal,
  };
};
