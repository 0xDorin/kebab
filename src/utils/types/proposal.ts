import { ContractAddress, SafeBigInt, WeiAmount } from "./contracts";

// 기본 Proposal 인터페이스
export interface BaseProposal {
  id: number;
  signatureCount: SafeBigInt;
  executed: boolean;
  requiredSignatures: SafeBigInt;
  hasSigned: boolean;
}

// Withdrawal Proposal
export interface WithdrawalProposal extends BaseProposal {
  type: "withdrawal";
  receiver: ContractAddress;
  amount: WeiAmount;
  target: number; // 0: Fee Vault, 1: Treasury
}

// Owner Proposal
export interface OwnerProposal extends BaseProposal {
  type: "owner";
  owner: ContractAddress;
  isAdd: boolean;
}

// Union type
export type Proposal = WithdrawalProposal | OwnerProposal;

// Actions 타입
export interface ProposalActions {
  onSign: (id: number) => void;
  onExecute: (id: number) => void;
  isPending: boolean;
}
