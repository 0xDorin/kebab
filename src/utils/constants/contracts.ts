// 🎯 비즈니스 상수: 스마트 컨트랙트 주소들
export const CONTRACT_ADDRESSES = {
  WMON: process.env.NEXT_PUBLIC_WMON_CONTRACT_ADDRESS as `0x${string}`,
  AUTHORIZE: process.env
    .NEXT_PUBLIC_AUTHORIZE_CONTRACT_ADDRESS as `0x${string}`,
  FEE_VAULT: process.env.NEXT_PUBLIC_FEE_VAULT_ADDRESS as `0x${string}`,
  TREASURY: process.env.NEXT_PUBLIC_TREASURY_ADDRESS as `0x${string}`,
} as const;

// 환경변수 검증
export const validateContractAddresses = () => {
  const missing: string[] = [];

  Object.entries(CONTRACT_ADDRESSES).forEach(([key, value]) => {
    if (!value) {
      missing.push(`NEXT_PUBLIC_${key}_CONTRACT_ADDRESS`);
    }
  });

  if (missing.length > 0) {
    console.error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
    return false;
  }

  return true;
};

// Vault 정보
export const VAULT_INFO = {
  FEE_VAULT: {
    address: CONTRACT_ADDRESSES.FEE_VAULT,
    name: "Fee Vault",
    description: "Collection of transaction fees",
  },
  TREASURY: {
    address: CONTRACT_ADDRESSES.TREASURY,
    name: "Treasury",
    description: "Main treasury for protocol funds",
  },
} as const;

// Proposal 타입
export const PROPOSAL_TYPES = {
  WITHDRAWAL: "withdrawal",
  OWNER: "owner",
} as const;

export type ProposalType = (typeof PROPOSAL_TYPES)[keyof typeof PROPOSAL_TYPES];
