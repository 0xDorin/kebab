"use client";

import { ProposalTable } from "./ProposalTable";
import { ProposalListUIProps } from "../../utils/types/proposal";
import { withdrawalColumns, ownerColumns } from "./proposal-configs";

export const ProposalListUI = ({
  withdrawalProposals,
  ownerProposals,
  withdrawalActions,
  ownerActions,
  withdrawProposalCount,
  isLoading,
}: ProposalListUIProps) => {
  // 🎯 바로 렌더링 - CSR로 동작
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center p-8">
          <div className="text-muted-foreground">Loading proposals...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProposalTable
        title="Withdrawal Proposals"
        description="Proposals to withdraw funds from vault or treasury"
        proposals={withdrawalProposals}
        columns={withdrawalColumns}
        onSign={withdrawalActions.onSign}
        onExecute={withdrawalActions.onExecute}
        isPending={withdrawalActions.isPending}
        emptyMessage={`No withdrawal proposals found${
          withdrawProposalCount ? ` (Count: ${withdrawProposalCount})` : ""
        }`}
      />

      <ProposalTable
        title="Owner Proposals"
        description="Proposals to add or remove multisig owners"
        proposals={ownerProposals}
        columns={ownerColumns}
        onSign={ownerActions.onSign}
        onExecute={ownerActions.onExecute}
        isPending={ownerActions.isPending}
        emptyMessage="No owner proposals found"
      />
    </div>
  );
};
