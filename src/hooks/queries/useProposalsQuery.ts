"use client";

import { Address } from "viem";
import { useReadContract, useAccount } from "wagmi";
import { useQueries } from "@tanstack/react-query";
import { readContract } from "wagmi/actions";
import AuthorizeABI from "../../../abis/Authorize.json";
import { WithdrawalProposal } from "../../utils/types/proposal";
import { useConfig } from "wagmi";

// 🎯 Option 3: React Query 배치 처리 (병렬)
export const useWithdrawalProposals = (
  authorizeAddress: Address,
  requiredSignatures?: number
) => {
  const { address } = useAccount();
  const config = useConfig();

  // 1단계: 카운트 가져오기
  const {
    data: proposalCount,
    isLoading: isCountLoading,
    error: countError,
  } = useReadContract({
    address: authorizeAddress,
    abi: AuthorizeABI,
    functionName: "withdrawProposalCount",
    query: {
      staleTime: 30000, // 30초
      refetchInterval: 60000, // 1분
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    },
  });

  // 2단계: 모든 proposal을 병렬로 가져오기 🚀
  const proposalQueries = useQueries({
    queries: Array.from({ length: Number(proposalCount || 0) }, (_, index) => ({
      queryKey: ["withdrawalProposal", authorizeAddress, index],
      queryFn: async (): Promise<WithdrawalProposal | null> => {
        try {
          // 병렬로 proposal 데이터와 서명 상태 동시 요청
          const [proposalData, hasSignedData] = await Promise.all([
            readContract(config, {
              address: authorizeAddress,
              abi: AuthorizeABI,
              functionName: "getWithdrawalProposals",
              args: [index],
            }),
            address
              ? readContract(config, {
                  address: authorizeAddress,
                  abi: AuthorizeABI,
                  functionName: "hasSignedWithdrawalProposal",
                  args: [index, address],
                })
              : Promise.resolve(false),
          ]);

          // 데이터 가공
          if (
            proposalData &&
            Array.isArray(proposalData) &&
            proposalData.length >= 6
          ) {
            const [receiver, amount, signatureCount, executed, , target] =
              proposalData;

            return {
              id: index,
              type: "withdrawal",
              receiver,
              amount,
              target,
              signatureCount: Number(signatureCount),
              executed: Boolean(executed),
              requiredSignatures: requiredSignatures || 0,
              hasSigned: Boolean(hasSignedData),
            };
          }

          return null;
        } catch (error) {
          console.error(`Failed to fetch proposal ${index}:`, error);
          return null;
        }
      },
      enabled:
        !!proposalCount &&
        Number(proposalCount) > 0 &&
        index < Number(proposalCount),
      staleTime: 30000,
      retry: 2, // 실패시 2번 재시도
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    })),
  });

  // 3단계: 결과 정리
  const proposals = proposalQueries
    .map((query) => query.data)
    .filter((proposal): proposal is WithdrawalProposal => proposal !== null);

  const isLoading =
    isCountLoading || proposalQueries.some((query) => query.isLoading);
  const hasError = countError || proposalQueries.some((query) => query.error);

  // 개별 쿼리 상태 (디버깅용)
  const queryStates = proposalQueries.map((query, index) => ({
    index,
    isLoading: query.isLoading,
    error: query.error,
    data: !!query.data,
  }));

  return {
    // 📊 데이터
    proposals,
    proposalCount,

    // 📈 상태
    isLoading,
    error: hasError,

    // 🔧 디버깅 & 확장성 (페이지네이션 준비)
    queryStates,
    totalCount: Number(proposalCount || 0),
    loadedCount: proposals.length,

    // 개별 로딩 상태
    isCountLoading,
    individualQueries: proposalQueries, // 필요시 개별 접근 가능
  };
};

// Owner Proposals는 복잡해서 일단 보류
export const useOwnerProposals = (authorizeAddress: Address) => {
  return {
    proposals: [],
    isLoading: false,
    error: null,
    totalCount: 0,
    loadedCount: 0,
  };
};
