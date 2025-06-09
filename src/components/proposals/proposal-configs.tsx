import { formatEther } from "viem";
import { Badge } from "../ui/badge";
import {
  WithdrawalProposal,
  OwnerProposal,
  ProposalTableColumn,
} from "../../utils/types/proposal";

export const withdrawalColumns: ProposalTableColumn<WithdrawalProposal>[] = [
  {
    key: "id",
    label: "ID",
    render: (proposal) => proposal.id,
  },
  {
    key: "receiver",
    label: "Receiver",
    render: (proposal) => (
      <span className="font-mono text-sm">
        {proposal.receiver?.slice(0, 6)}...{proposal.receiver?.slice(-4)}
      </span>
    ),
  },
  {
    key: "amount",
    label: "Amount",
    render: (proposal) => `${formatEther(proposal.amount)} MON`,
  },
  {
    key: "target",
    label: "Target",
    render: (proposal) => (proposal.target === 0 ? "Fee Vault" : "Treasury"),
  },
];

export const ownerColumns: ProposalTableColumn<OwnerProposal>[] = [
  {
    key: "id",
    label: "ID",
    render: (proposal) => proposal.id,
  },
  {
    key: "owner",
    label: "Owner",
    render: (proposal) => (
      <span className="font-mono text-sm">
        {proposal.owner?.slice(0, 6)}...{proposal.owner?.slice(-4)}
      </span>
    ),
  },
  {
    key: "action",
    label: "Action",
    render: (proposal) => (
      <Badge variant={proposal.isAdd ? "default" : "destructive"}>
        {proposal.isAdd ? "Add" : "Remove"}
      </Badge>
    ),
  },
];
