import { Address } from "viem";
import { ReactNode } from "react";

// 기본 Proposal 인터페이스
export interface BaseProposal {
  id: number;
  signatureCount: number;
  executed: boolean;
  requiredSignatures: number;
  hasSigned: boolean;
}

// Withdrawal Proposal
export interface WithdrawalProposal extends BaseProposal {
  type: "withdrawal";
  receiver: Address;
  amount: bigint;
  target: number; // 0: Fee Vault, 1: Treasury
}

// Owner Proposal
export interface OwnerProposal extends BaseProposal {
  type: "owner";
  owner: Address;
  isAdd: boolean;
}

// Union type
export type Proposal = WithdrawalProposal | OwnerProposal;

// 테이블 컬럼 타입
export interface ProposalTableColumn<T> {
  key: string;
  label: string;
  render: (proposal: T) => ReactNode;
  className?: string;
}

// 테이블 Props
export interface ProposalTableProps<T extends BaseProposal> {
  title: string;
  description: string;
  proposals: T[];
  columns: ProposalTableColumn<T>[];
  onSign: (id: number) => void;
  onExecute: (id: number) => void;
  isPending: boolean;
  emptyMessage?: string;
}

// Actions 타입
export interface ProposalActions {
  onSign: (id: number) => void;
  onExecute: (id: number) => void;
  isPending: boolean;
}

// Provider 컨텍스트 타입
export interface ProposalContextType {
  withdrawalProposals: WithdrawalProposal[];
  ownerProposals: OwnerProposal[];
  withdrawProposalCount?: bigint;
  ownerProposalCount?: number;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

// UI Props 타입
export interface ProposalListUIProps {
  withdrawalProposals: WithdrawalProposal[];
  ownerProposals: OwnerProposal[];
  withdrawalActions: ProposalActions;
  ownerActions: ProposalActions;
  withdrawProposalCount?: bigint;
  isLoading?: boolean;
}
