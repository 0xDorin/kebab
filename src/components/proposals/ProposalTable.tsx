"use client";

import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import { BaseProposal, ProposalTableProps } from "../../utils/types/proposal";

export function ProposalTable<T extends BaseProposal>({
  title,
  description,
  proposals,
  columns,
  onSign,
  onExecute,
  isPending,
  emptyMessage = "No proposals found",
}: ProposalTableProps<T>) {
  const getProposalStatus = (proposal: T) => {
    if (proposal.executed) return "Executed";
    if (proposal.signatureCount >= proposal.requiredSignatures)
      return "Ready to Execute";
    return `${proposal.signatureCount}/${proposal.requiredSignatures} Signatures`;
  };

  const getStatusBadgeVariant = (status: string) => {
    if (status === "Executed") return "secondary";
    if (status === "Ready to Execute") return "default";
    return "outline";
  };

  const canExecute = (proposal: T) =>
    proposal.signatureCount >= proposal.requiredSignatures &&
    !proposal.executed;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {proposals.length === 0 ? (
          <p className="text-muted-foreground">{emptyMessage}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column.key} className={column.className}>
                    {column.label}
                  </TableHead>
                ))}
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {proposals.map((proposal) => {
                const status = getProposalStatus(proposal);

                return (
                  <TableRow key={proposal.id}>
                    {columns.map((column) => (
                      <TableCell key={column.key} className={column.className}>
                        {column.render(proposal)}
                      </TableCell>
                    ))}
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(status)}>
                        {status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {!proposal.hasSigned && !proposal.executed && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onSign(proposal.id)}
                            disabled={isPending}
                          >
                            Sign
                          </Button>
                        )}
                        {canExecute(proposal) && (
                          <Button
                            size="sm"
                            onClick={() => onExecute(proposal.id)}
                            disabled={isPending}
                          >
                            Execute
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
