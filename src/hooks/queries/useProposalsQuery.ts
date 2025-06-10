"use client";

import { Address } from "viem";
import { useReadContract } from "wagmi";
import { useWalletAddress } from "@/stores/walletStore";
import AuthorizeABI from "../../../abis/Authorize.json";
import { WithdrawalProposal, OwnerProposal } from "../../utils/types/proposal";

// 🎯 단일 Withdrawal Proposal 조회
export const useWithdrawalProposal = (
  authorizeAddress: Address,
  proposalId: number
) => {
  const address = useWalletAddress();

  // Proposal 데이터 가져오기
  const {
    data: proposalData,
    isLoading: isProposalLoading,
    error: proposalError,
  } = useReadContract({
    address: authorizeAddress,
    abi: AuthorizeABI,
    functionName: "getWithdrawalProposals",
    args: [proposalId],
    query: {
      staleTime: 30 * 1000,
      refetchInterval: 30 * 1000,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      retry: 3,
    },
  });

  // 서명 여부 확인
  const {
    data: hasSignedData,
    isLoading: isSignatureLoading,
    error: signatureError,
  } = useReadContract({
    address: authorizeAddress,
    abi: AuthorizeABI,
    functionName: "hasSignedWithdrawalProposal",
    args: [proposalId, address],
    query: {
      enabled: !!address,
      staleTime: 10 * 1000, // 더 자주 확인
      refetchInterval: 10 * 1000,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
    },
  });

  // 🎯 데이터 가공
  const proposal: WithdrawalProposal | null =
    proposalData && Array.isArray(proposalData) && proposalData.length >= 6
      ? {
          id: proposalId,
          type: "withdrawal",
          receiver: proposalData[0],
          amount: proposalData[1],
          target: proposalData[5],
          signatureCount: BigInt(proposalData[2] || 0),
          executed: Boolean(proposalData[3]),
          requiredSignatures: BigInt(0), // 별도 hook에서 가져오기
          hasSigned: Boolean(hasSignedData),
        }
      : null;

  return {
    proposal,
    isLoading: isProposalLoading || isSignatureLoading,
    error: proposalError || signatureError,
  };
};

// 🎯 단일 Owner Proposal 조회
export const useOwnerProposal = (
  authorizeAddress: Address,
  proposalId: number
) => {
  const address = useWalletAddress();

  // Proposal 데이터 가져오기
  const {
    data: proposalData,
    isLoading: isProposalLoading,
    error: proposalError,
  } = useReadContract({
    address: authorizeAddress,
    abi: AuthorizeABI,
    functionName: "getOwnerProposals",
    args: [proposalId],
    query: {
      staleTime: 30 * 1000,
      refetchInterval: 30 * 1000,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      retry: 3,
    },
  });

  // 서명 여부 확인
  const {
    data: hasSignedData,
    isLoading: isSignatureLoading,
    error: signatureError,
  } = useReadContract({
    address: authorizeAddress,
    abi: AuthorizeABI,
    functionName: "hasSignedOwnerProposal",
    args: [proposalId, address],
    query: {
      enabled: !!address,
      staleTime: 10 * 1000,
      refetchInterval: 10 * 1000,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
    },
  });

  // 🎯 데이터 가공
  const proposal: OwnerProposal | null =
    proposalData && Array.isArray(proposalData) && proposalData.length >= 5
      ? {
          id: proposalId,
          type: "owner",
          owner: proposalData[0],
          isAdd: Boolean(proposalData[1]),
          signatureCount: BigInt(proposalData[2] || 0),
          executed: Boolean(proposalData[3]),
          requiredSignatures: BigInt(0), // 별도 hook에서 가져오기
          hasSigned: Boolean(hasSignedData),
        }
      : null;

  return {
    proposal,
    isLoading: isProposalLoading || isSignatureLoading,
    error: proposalError || signatureError,
  };
};

// 🎯 Proposal 개수만 조회 (검색용)
export const useProposalCounts = (authorizeAddress: Address) => {
  const {
    data: withdrawalCount,
    isLoading: isWithdrawalCountLoading,
    error: withdrawalCountError,
  } = useReadContract({
    address: authorizeAddress,
    abi: AuthorizeABI,
    functionName: "withdrawProposalCount",
    query: {
      staleTime: 60 * 1000, // 개수는 덜 자주 바뀜
      refetchInterval: 60 * 1000,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
    },
  });

  const {
    data: ownerCount,
    isLoading: isOwnerCountLoading,
    error: ownerCountError,
  } = useReadContract({
    address: authorizeAddress,
    abi: AuthorizeABI,
    functionName: "ownerProposalCount",
    query: {
      staleTime: 60 * 1000,
      refetchInterval: 60 * 1000,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
    },
  });

  return {
    withdrawalCount: Number(withdrawalCount || 0),
    ownerCount: Number(ownerCount || 0),
    isLoading: isWithdrawalCountLoading || isOwnerCountLoading,
    error: withdrawalCountError || ownerCountError,
  };
};

// 🎯 기존 호환성 (deprecated, 새로운 hook 사용 권장)
export const useWithdrawalProposals = (authorizeAddress: Address) => {
  return {
    proposals: [],
    isLoading: false,
    error: null,
    totalCount: 0,
    loadedCount: 0,
  };
};

export const useOwnerProposals = (authorizeAddress: Address) => {
  return {
    proposals: [],
    isLoading: false,
    error: null,
    totalCount: 0,
    loadedCount: 0,
  };
};

// 🔐 현재 사용자의 오너 권한 확인
export const useIsOwner = (authorizeAddress: Address) => {
  const address = useWalletAddress();

  const {
    data: isOwnerData,
    isLoading,
    error,
  } = useReadContract({
    address: authorizeAddress,
    abi: AuthorizeABI,
    functionName: "isOwner",
    args: [address],
    query: {
      enabled: !!address,
      staleTime: 60 * 1000, // 오너 권한은 자주 바뀌지 않음
      refetchInterval: 60 * 1000,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
    },
  });

  return {
    isOwner: Boolean(isOwnerData && address),
    isLoading,
    error,
  };
};
