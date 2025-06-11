"use client";

import React, { useMemo, useCallback } from "react";
import { Address } from "viem";
import { useAuthWithdrawal } from "@/hooks/on-chain/dao/useAuthWithdrawal";
import { useAuthOwner } from "@/hooks/on-chain/dao/useAuthOwner";
import {
  useWithdrawalProposal,
  useOwnerProposal,
  useIsOwner,
} from "@/hooks/queries/useProposalsQuery";
import { useAccount } from "wagmi";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { PROPOSAL_TYPES, type ProposalType } from "@/utils/constants/contracts";
import {
  ContractAddress,
  SafeBigInt,
  safeToNumber,
  formatWeiToEther,
} from "@/utils/types/contracts";
import {
  type WithdrawalProposal,
  type OwnerProposal,
} from "@/utils/types/proposal";

// 🔒 타입 가드 함수들
const isWithdrawalProposal = (
  proposal: WithdrawalProposal | OwnerProposal
): proposal is WithdrawalProposal => {
  return proposal.type === "withdrawal";
};

const isOwnerProposal = (
  proposal: WithdrawalProposal | OwnerProposal
): proposal is OwnerProposal => {
  return proposal.type === "owner";
};

interface SingleProposalViewProps {
  authorizeAddress: ContractAddress;
  proposalType: string;
  proposalId: number;
}

// 🚀 성능 최적화: 액션 버튼 메모이제이션
const ProposalActions = React.memo<{
  onSign: () => Promise<void>;
  onExecute: () => Promise<void>;
  isPending: boolean;
  executed: boolean;
  signatureCount: number;
  requiredSignatures: number;
  hasUserSigned: boolean;
  isOwner: boolean;
  isConnected: boolean;
}>(
  ({
    onSign,
    onExecute,
    isPending,
    executed,
    signatureCount,
    requiredSignatures,
    hasUserSigned,
    isOwner,
    isConnected,
  }) => {
    const canExecute = signatureCount >= requiredSignatures && !executed;
    const canInteract = isOwner && isConnected;
    const canSign = canInteract && !hasUserSigned;

    return (
      <div className="flex gap-3 pt-4 border-t">
        <div className="flex-1 relative group">
          <Button
            onClick={onSign}
            disabled={executed || isPending || !canSign}
            className={`w-full ${
              hasUserSigned
                ? "bg-green-600 hover:bg-green-600 cursor-default"
                : !canInteract
                ? "cursor-not-allowed opacity-50"
                : ""
            }`}
            variant={hasUserSigned ? "default" : "default"}
          >
            {isPending && !hasUserSigned ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Signing...
              </>
            ) : (
              <>{hasUserSigned ? "Signed ✓" : "Sign Proposal"}</>
            )}
          </Button>

          {/* 권한 없음 툴팁 */}
          {!canInteract && !hasUserSigned && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
              {!isConnected
                ? "Connect wallet to sign"
                : "Only owners can sign proposals"}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
            </div>
          )}
        </div>

        <Button
          onClick={onExecute}
          disabled={!canExecute || isPending}
          variant="secondary"
          className="flex-1"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Executing...
            </>
          ) : (
            "Execute Proposal"
          )}
        </Button>
      </div>
    );
  }
);

ProposalActions.displayName = "ProposalActions";

// 🚀 성능 최적화: 프로포잘 상세 정보 메모이제이션 (타입 안전성 강화)
const ProposalDetails = React.memo<{
  proposal: WithdrawalProposal | OwnerProposal;
  isWithdrawalType: boolean;
  signatureCount: number;
  requiredSignatures: number;
}>(({ proposal, isWithdrawalType, signatureCount, requiredSignatures }) => {
  const progressPercentage = useMemo(() => {
    return Math.min(
      (signatureCount / Math.max(requiredSignatures, 1)) * 100,
      100
    );
  }, [signatureCount, requiredSignatures]);

  return (
    <div className="space-y-4">
      {/* 🔒 타입 가드를 사용한 안전한 렌더링 */}
      {isWithdrawalType && isWithdrawalProposal(proposal) && (
        <>
          <div>
            <label className="text-sm font-medium text-gray-700">
              Recipient
            </label>
            <p className="font-mono text-sm bg-gray-50 p-2 rounded">
              {proposal.receiver}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">
              Amount (ETH)
            </label>
            <p className="text-lg font-semibold">
              {formatWeiToEther(proposal.amount)} ETH
            </p>
          </div>
        </>
      )}

      {!isWithdrawalType && isOwnerProposal(proposal) && (
        <div>
          <label className="text-sm font-medium text-gray-700">
            Owner Address
          </label>
          <p className="font-mono text-sm bg-gray-50 p-2 rounded">
            {proposal.owner}
          </p>
        </div>
      )}

      <div>
        <label className="text-sm font-medium text-gray-700">
          Signatures ({signatureCount} / {requiredSignatures})
        </label>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <span className="text-sm text-gray-600">
            {signatureCount} / {requiredSignatures}
          </span>
        </div>
      </div>
    </div>
  );
});

ProposalDetails.displayName = "ProposalDetails";

// 🚀 성능 최적화: 로딩/에러 상태 통합 훅 (기존 쿼리 훅 활용)
const useProposalState = (
  authorizeAddress: ContractAddress,
  proposalId: number,
  proposalType: string
) => {
  const isWithdrawalType = proposalType === PROPOSAL_TYPES.WITHDRAWAL;

  const withdrawalResult = useWithdrawalProposal(authorizeAddress, proposalId);
  const ownerResult = useOwnerProposal(authorizeAddress, proposalId);

  return useMemo(
    () => ({
      proposal: isWithdrawalType
        ? withdrawalResult.proposal
        : ownerResult.proposal,
      isLoading: isWithdrawalType
        ? withdrawalResult.isLoading
        : ownerResult.isLoading,
      error: isWithdrawalType ? withdrawalResult.error : ownerResult.error,
      isWithdrawalType,
    }),
    [
      isWithdrawalType,
      withdrawalResult.proposal,
      withdrawalResult.isLoading,
      withdrawalResult.error,
      ownerResult.proposal,
      ownerResult.isLoading,
      ownerResult.error,
    ]
  );
};

export const SingleProposalView = ({
  authorizeAddress,
  proposalType,
  proposalId,
}: SingleProposalViewProps) => {
  // 🔐 지갑 연결 상태 및 사용자 정보 - 직접 wagmi 사용
  const { address: userAddress, isConnected } = useAccount();
  const { isOwner } = useIsOwner(authorizeAddress);

  // 🚀 통합된 상태 관리
  const { proposal, isLoading, error, isWithdrawalType } = useProposalState(
    authorizeAddress,
    proposalId,
    proposalType
  );

  // 🎯 비즈니스 로직: 데이터 가져오기
  const {
    signWithdrawalProposal,
    executeWithdrawalProposal,
    requiredSignatures,
    isPending: isWithdrawalPending,
  } = useAuthWithdrawal({ authorizeAddress });

  const ownerHooks = useAuthOwner({ authorizeAddress });

  const isPending = isWithdrawalType
    ? isWithdrawalPending
    : ownerHooks.isPending;

  // 🚀 성능 최적화: 메모이제이션된 콜백
  const handleSign = useCallback(async () => {
    try {
      if (isWithdrawalType) {
        await signWithdrawalProposal(proposalId);
      } else {
        await ownerHooks.signOwnerProposal(proposalId);
      }
    } catch (error) {
      console.error("Error signing proposal:", error);
    }
  }, [
    isWithdrawalType,
    signWithdrawalProposal,
    ownerHooks.signOwnerProposal,
    proposalId,
  ]);

  const handleExecute = useCallback(async () => {
    try {
      if (isWithdrawalType) {
        await executeWithdrawalProposal(proposalId);
      } else {
        await ownerHooks.executeOwnerProposal(proposalId);
      }
    } catch (error) {
      console.error("Error executing proposal:", error);
    }
  }, [
    isWithdrawalType,
    executeWithdrawalProposal,
    ownerHooks.executeOwnerProposal,
    proposalId,
  ]);

  // 🚀 성능 최적화: 계산된 값들 메모이제이션 (타입 안전성 강화)
  const computedValues = useMemo(() => {
    if (!proposal) return null;

    const safeRequiredSignatures =
      typeof requiredSignatures === "bigint"
        ? requiredSignatures
        : BigInt(requiredSignatures || 0);

    return {
      signatureCount: safeToNumber(proposal.signatureCount),
      requiredSignaturesNum: safeToNumber(safeRequiredSignatures),
      executed: Boolean(proposal.executed),
    };
  }, [proposal, requiredSignatures]);

  // 🎨 UI: 로딩 상태
  if (isLoading) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading proposal...</span>
        </CardContent>
      </Card>
    );
  }

  // 🎨 UI: 에러 상태
  if (error) {
    return (
      <Card className="max-w-2xl mx-auto border-red-200 bg-red-50">
        <CardContent className="text-center py-8">
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Error Loading Proposal
          </h3>
          <p className="text-red-600">
            Failed to load {proposalType} proposal #{proposalId}
          </p>
        </CardContent>
      </Card>
    );
  }

  // 🎨 UI: 찾지 못한 경우
  if (!proposal || !computedValues) {
    return (
      <Card className="max-w-2xl mx-auto border-red-200 bg-red-50">
        <CardContent className="text-center py-8">
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Proposal Not Found
          </h3>
          <p className="text-red-600">
            No {proposalType} proposal found with ID {proposalId}
          </p>
        </CardContent>
      </Card>
    );
  }

  const { signatureCount, requiredSignaturesNum, executed } = computedValues;

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              {isWithdrawalType ? "Withdrawal" : "Owner"} Proposal #{proposalId}
              <Badge variant={executed ? "default" : "secondary"}>
                {executed ? "Executed" : "Pending"}
              </Badge>
            </CardTitle>
            <CardDescription>
              {isWithdrawalType
                ? "Multisig withdrawal proposal"
                : "Owner management proposal"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 🚀 메모이제이션된 상세 정보 (타입 안전성 강화) */}
        <ProposalDetails
          proposal={proposal}
          isWithdrawalType={isWithdrawalType}
          signatureCount={signatureCount}
          requiredSignatures={requiredSignaturesNum}
        />

        {/* 🚀 메모이제이션된 액션 버튼 */}
        <ProposalActions
          onSign={handleSign}
          onExecute={handleExecute}
          isPending={isPending}
          executed={executed}
          signatureCount={signatureCount}
          requiredSignatures={requiredSignaturesNum}
          hasUserSigned={Boolean(proposal?.hasSigned)}
          isOwner={isOwner}
          isConnected={isConnected}
        />

        {/* 🎨 UI: 실행 완료 메시지 */}
        {executed && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 text-sm">
              ✅ This proposal has been executed successfully.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
