"use client";

import { Address } from "viem";
import { useAuthWithdrawal } from "../../hooks/on-chain/dao/use-auth-withdrawal";
import { useAuthOwner } from "../../hooks/on-chain/dao/use-auth-owner";
import {
  useWithdrawalProposals,
  useOwnerProposals,
} from "../../hooks/queries/useProposalsQuery";
import { ProposalListUI } from "./proposal-list-ui";
import { ProposalActions } from "../../utils/types/proposal";

interface ProposalListProps {
  authorizeAddress: Address;
}

export const ProposalList = ({ authorizeAddress }: ProposalListProps) => {
  // 🎯 통합된 hook 사용 - 훨씬 단순해짐!
  const {
    signWithdrawalProposal,
    executeWithdrawalProposal,
    requiredSignatures,
    isPending: isWithdrawalPending,
  } = useAuthWithdrawal({ authorizeAddress });

  const ownerHooks = useAuthOwner({ authorizeAddress });

  // 🎯 하나의 hook으로 모든 데이터 가져오기
  const {
    proposals: withdrawalProposals,
    proposalCount: withdrawProposalCount,
    isLoading: isWithdrawalLoading,
  } = useWithdrawalProposals(authorizeAddress, requiredSignatures);

  const { proposals: ownerProposals, isLoading: isOwnerLoading } =
    useOwnerProposals(authorizeAddress);

  // 전체 로딩 상태
  const isLoading = isWithdrawalLoading || isOwnerLoading;

  // Event handlers
  const handleSignWithdrawal = async (proposalId: number) => {
    try {
      await signWithdrawalProposal(proposalId);
      alert("Proposal signed successfully!");
      // React Query가 자동으로 캐시 무효화 & refetch
    } catch (error) {
      console.error("Error signing proposal:", error);
      alert("Failed to sign proposal");
    }
  };

  const handleExecuteWithdrawal = async (proposalId: number) => {
    try {
      await executeWithdrawalProposal(proposalId);
      alert("Proposal executed successfully!");
      // React Query가 자동으로 캐시 무효화 & refetch
    } catch (error) {
      console.error("Error executing proposal:", error);
      alert("Failed to execute proposal");
    }
  };

  const handleSignOwner = async (proposalId: number) => {
    try {
      await ownerHooks.signOwnerProposal(proposalId);
      alert("Proposal signed successfully!");
    } catch (error) {
      console.error("Error signing proposal:", error);
      alert("Failed to sign proposal");
    }
  };

  const handleExecuteOwner = async (proposalId: number) => {
    try {
      await ownerHooks.executeOwnerProposal(proposalId);
      alert("Proposal executed successfully!");
    } catch (error) {
      console.error("Error executing proposal:", error);
      alert("Failed to execute proposal");
    }
  };

  // Actions 객체
  const withdrawalActions: ProposalActions = {
    onSign: handleSignWithdrawal,
    onExecute: handleExecuteWithdrawal,
    isPending: isWithdrawalPending,
  };

  const ownerActions: ProposalActions = {
    onSign: handleSignOwner,
    onExecute: handleExecuteOwner,
    isPending: ownerHooks.isPending,
  };

  return (
    <ProposalListUI
      withdrawalProposals={withdrawalProposals}
      ownerProposals={ownerProposals}
      withdrawalActions={withdrawalActions}
      ownerActions={ownerActions}
      withdrawProposalCount={withdrawProposalCount as bigint}
      isLoading={isLoading}
    />
  );
};
