import { useState } from "react";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi";
import { Address } from "viem";
import AuthorizeABI from "../../../../abis/Authorize.json";

interface UseAuthOwnerProps {
  authorizeAddress: Address;
  onTransactionComplete?: () => void;
}

export const useAuthOwner = ({
  authorizeAddress,
  onTransactionComplete,
}: UseAuthOwnerProps) => {
  const [tx, setTx] = useState<string | null>(null);

  // Contract write hook
  const { writeContractAsync, isPending } = useWriteContract();

  // Transaction receipt hook
  const { data: txReceipt, isLoading } = useWaitForTransactionReceipt({
    hash: tx as `0x${string}`,
  });

  // Read current proposal count
  const { data: ownerProposalCount, refetch: refetchCount } = useReadContract({
    address: authorizeAddress,
    abi: AuthorizeABI,
    functionName: "ownerProposalCount",
  });

  // Read required signatures
  const { data: requiredSignatures } = useReadContract({
    address: authorizeAddress,
    abi: AuthorizeABI,
    functionName: "requiredSignatures",
  });

  // Propose add owner - 파라미터로 받음
  const proposeAddOwner = async (newOwner: string) => {
    if (!newOwner) {
      throw new Error("Owner address is required");
    }

    try {
      const hash = await writeContractAsync({
        address: authorizeAddress,
        abi: AuthorizeABI,
        functionName: "proposeAddOwner",
        args: [newOwner as Address],
      });

      setTx(hash);

      // Refetch proposal count after transaction
      setTimeout(() => {
        refetchCount();
      }, 2000);

      return hash;
    } catch (error) {
      console.error("Failed to propose add owner:", error);
      throw error;
    }
  };

  // Propose remove owner - 파라미터로 받음
  const proposeRemoveOwner = async (ownerToRemove: string) => {
    if (!ownerToRemove) {
      throw new Error("Owner address is required");
    }

    try {
      const hash = await writeContractAsync({
        address: authorizeAddress,
        abi: AuthorizeABI,
        functionName: "proposeRemoveOwner",
        args: [ownerToRemove as Address],
      });

      setTx(hash);

      // Refetch proposal count after transaction
      setTimeout(() => {
        refetchCount();
      }, 2000);

      return hash;
    } catch (error) {
      console.error("Failed to propose remove owner:", error);
      throw error;
    }
  };

  // Sign owner proposal
  const signOwnerProposal = async (proposalId: number) => {
    try {
      const hash = await writeContractAsync({
        address: authorizeAddress,
        abi: AuthorizeABI,
        functionName: "signOwnerProposal",
        args: [proposalId],
      });

      setTx(hash);
      return hash;
    } catch (error) {
      console.error("Failed to sign owner proposal:", error);
      throw error;
    }
  };

  // Execute owner proposal
  const executeOwnerProposal = async (proposalId: number) => {
    try {
      const hash = await writeContractAsync({
        address: authorizeAddress,
        abi: AuthorizeABI,
        functionName: "executeOwnerProposal",
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
      console.error("Failed to execute owner proposal:", error);
      throw error;
    }
  };

  // Get owner proposal details
  const getOwnerProposal = (proposalId: number) => {
    return useReadContract({
      address: authorizeAddress,
      abi: AuthorizeABI,
      functionName: "getOwnerProposals",
      args: [proposalId],
    });
  };

  // Check if user has signed proposal
  const hasSignedOwnerProposal = (proposalId: number, userAddress: Address) => {
    return useReadContract({
      address: authorizeAddress,
      abi: AuthorizeABI,
      functionName: "hasSignedOwnerProposal",
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
    ownerProposalCount: ownerProposalCount as number,
    requiredSignatures: requiredSignatures as number,

    // Actions (파라미터를 받는 함수들)
    proposeAddOwner,
    proposeRemoveOwner,
    signOwnerProposal,
    executeOwnerProposal,

    // Helper functions
    getOwnerProposal,
    hasSignedOwnerProposal,
  };
};
