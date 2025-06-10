import { isAddress } from "viem";

// 🔒 타입 안전성: Contract 주소 타입 정의
export type ContractAddress = `0x${string}`;

// 🔒 타입 가드: 유효한 주소인지 확인
export const isValidAddress = (addr: string): addr is ContractAddress => {
  return /^0x[a-fA-F0-9]{40}$/.test(addr) && isAddress(addr);
};

// 🔒 타입 안전성: BigInt 처리 유틸리티
export type SafeBigInt = bigint;

// 🔒 BigInt 안전 파싱
export const safeParseBigInt = (value: unknown): SafeBigInt => {
  if (typeof value === "bigint") return value;
  if (typeof value === "number") return BigInt(value);
  if (typeof value === "string") {
    try {
      return BigInt(value);
    } catch {
      return BigInt(0);
    }
  }
  return BigInt(0);
};

// 🔒 BigInt를 안전하게 Number로 변환 (오버플로우 체크)
export const safeToNumber = (value: SafeBigInt): number => {
  if (value > BigInt(Number.MAX_SAFE_INTEGER)) {
    console.warn(
      "BigInt value exceeds MAX_SAFE_INTEGER, precision may be lost"
    );
    return Number.MAX_SAFE_INTEGER;
  }
  if (value < BigInt(Number.MIN_SAFE_INTEGER)) {
    console.warn(
      "BigInt value exceeds MIN_SAFE_INTEGER, precision may be lost"
    );
    return Number.MIN_SAFE_INTEGER;
  }
  return Number(value);
};

// 🔒 Wei 단위 처리 타입
export type WeiAmount = SafeBigInt;
export type EtherAmount = string;

// 🔒 Wei <-> Ether 안전 변환
export const formatWeiToEther = (
  wei: WeiAmount,
  decimals: number = 4
): EtherAmount => {
  return (Number(wei) / 1e18).toFixed(decimals);
};

// 🔒 환경변수 타입 안전 처리
export const getEnvAddress = (key: string): ContractAddress => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  if (!isValidAddress(value)) {
    throw new Error(
      `Environment variable ${key} is not a valid address: ${value}`
    );
  }
  return value;
};

// 🔒 Proposal 관련 타입 정의
export interface BaseProposal {
  id: number;
  executed: boolean;
  signatureCount: SafeBigInt;
}

export interface WithdrawalProposal extends BaseProposal {
  receiver: ContractAddress;
  amount: WeiAmount;
  target: number;
}

export interface OwnerProposal extends BaseProposal {
  owner: ContractAddress;
  actionType: "add" | "remove";
}

// 🔒 타입 가드 함수들
export const isWithdrawalProposal = (
  proposal: any
): proposal is WithdrawalProposal => {
  return (
    proposal &&
    typeof proposal.receiver === "string" &&
    isValidAddress(proposal.receiver) &&
    typeof proposal.amount !== "undefined"
  );
};

export const isOwnerProposal = (proposal: any): proposal is OwnerProposal => {
  return (
    proposal &&
    typeof proposal.owner === "string" &&
    isValidAddress(proposal.owner as string)
  );
};
