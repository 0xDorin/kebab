"use client";

import { useState, useEffect } from "react";
import { useAuthWithdrawal } from "../../hooks/on-chain/dao/use-auth-withdrawal";
import { useAuthOwner } from "../../hooks/on-chain/dao/use-auth-owner";
import { Address, formatEther } from "viem";
import { useAccount } from "wagmi";
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

interface ProposalListProps {
  authorizeAddress: Address;
}

export const ProposalList = ({ authorizeAddress }: ProposalListProps) => {
  const { address } = useAccount();

  const withdrawalHooks = useAuthWithdrawal({ authorizeAddress });
  const ownerHooks = useAuthOwner({ authorizeAddress });

  const [withdrawalProposals, setWithdrawalProposals] = useState<any[]>([]);
  const [ownerProposals, setOwnerProposals] = useState<any[]>([]);

  // Fetch withdrawal proposals
  useEffect(() => {
    const fetchWithdrawalProposals = async () => {
      if (!withdrawalHooks.withdrawProposalCount) return;

      const proposals = [];
      for (let i = 0; i < withdrawalHooks.withdrawProposalCount; i++) {
        const proposalData = withdrawalHooks.getWithdrawalProposal(i);
        const hasSignedData = address
          ? withdrawalHooks.hasSignedWithdrawalProposal(i, address)
          : null;

        proposals.push({
          id: i,
          type: "withdrawal",
          proposalData,
          hasSignedData,
        });
      }
      setWithdrawalProposals(proposals);
    };

    fetchWithdrawalProposals();
  }, [withdrawalHooks.withdrawProposalCount, address]);

  // Fetch owner proposals
  useEffect(() => {
    const fetchOwnerProposals = async () => {
      if (!ownerHooks.ownerProposalCount) return;

      const proposals = [];
      for (let i = 0; i < ownerHooks.ownerProposalCount; i++) {
        const proposalData = ownerHooks.getOwnerProposal(i);
        const hasSignedData = address
          ? ownerHooks.hasSignedOwnerProposal(i, address)
          : null;

        proposals.push({
          id: i,
          type: "owner",
          proposalData,
          hasSignedData,
        });
      }
      setOwnerProposals(proposals);
    };

    fetchOwnerProposals();
  }, [ownerHooks.ownerProposalCount, address]);

  const handleSignWithdrawal = async (proposalId: number) => {
    try {
      await withdrawalHooks.signWithdrawalProposal(proposalId);
      alert("Proposal signed successfully!");
    } catch (error) {
      console.error("Error signing proposal:", error);
      alert("Failed to sign proposal");
    }
  };

  const handleExecuteWithdrawal = async (proposalId: number) => {
    try {
      await withdrawalHooks.executeWithdrawalProposal(proposalId);
      alert("Proposal executed successfully!");
    } catch (error) {
      console.error("Error executing proposal:", error);
      alert("Failed to execute proposal");
    }
  };

  const handleSignOwner = async (proposalId: number) => {
    try {
      await ownerHooks.signOwnerProposal(proposalId);
      alert("Proposal signed successfully!");
    } catch (error) {
      console.error("Error signing proposal:", error);
      alert("Failed to sign proposal");
    }
  };

  const handleExecuteOwner = async (proposalId: number) => {
    try {
      await ownerHooks.executeOwnerProposal(proposalId);
      alert("Proposal executed successfully!");
    } catch (error) {
      console.error("Error executing proposal:", error);
      alert("Failed to execute proposal");
    }
  };

  const getProposalStatus = (proposal: any) => {
    const { data: proposalData } = proposal.proposalData;
    if (!proposalData) return "Loading...";

    const [, , , signatureCount, executed] = proposalData;
    const requiredSignatures =
      withdrawalHooks.requiredSignatures || ownerHooks.requiredSignatures;

    if (executed) return "Executed";
    if (signatureCount >= requiredSignatures) return "Ready to Execute";
    return `${signatureCount}/${requiredSignatures} Signatures`;
  };

  const getStatusBadgeVariant = (status: string) => {
    if (status === "Executed") return "secondary";
    if (status === "Ready to Execute") return "default";
    return "outline";
  };

  return (
    <div className="space-y-6">
      {/* Withdrawal Proposals */}
      <Card>
        <CardHeader>
          <CardTitle>Withdrawal Proposals</CardTitle>
          <CardDescription>
            Proposals to withdraw funds from vault or treasury
          </CardDescription>
        </CardHeader>
        <CardContent>
          {withdrawalProposals.length === 0 ? (
            <p className="text-muted-foreground">
              No withdrawal proposals found
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Receiver</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawalProposals.map((proposal) => {
                  const { data: proposalData } = proposal.proposalData;
                  const { data: hasSigned } = proposal.hasSignedData || {};

                  if (!proposalData) return null;

                  const [receiver, amount, signatureCount, executed, , target] =
                    proposalData;
                  const status = getProposalStatus(proposal);
                  const canExecute =
                    signatureCount >=
                      (withdrawalHooks.requiredSignatures || 0) && !executed;

                  return (
                    <TableRow key={proposal.id}>
                      <TableCell>{proposal.id}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {receiver?.slice(0, 6)}...{receiver?.slice(-4)}
                      </TableCell>
                      <TableCell>{formatEther(amount || 0n)} MON</TableCell>
                      <TableCell>
                        {target === 0 ? "Fee Vault" : "Treasury"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(status)}>
                          {status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {!hasSigned && !executed && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSignWithdrawal(proposal.id)}
                              disabled={withdrawalHooks.isPending}
                            >
                              Sign
                            </Button>
                          )}
                          {canExecute && (
                            <Button
                              size="sm"
                              onClick={() =>
                                handleExecuteWithdrawal(proposal.id)
                              }
                              disabled={withdrawalHooks.isPending}
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

      {/* Owner Proposals */}
      <Card>
        <CardHeader>
          <CardTitle>Owner Proposals</CardTitle>
          <CardDescription>
            Proposals to add or remove multisig owners
          </CardDescription>
        </CardHeader>
        <CardContent>
          {ownerProposals.length === 0 ? (
            <p className="text-muted-foreground">No owner proposals found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ownerProposals.map((proposal) => {
                  const { data: proposalData } = proposal.proposalData;
                  const { data: hasSigned } = proposal.hasSignedData || {};

                  if (!proposalData) return null;

                  const [owner, isAdd, signatureCount, executed] = proposalData;
                  const status = getProposalStatus(proposal);
                  const canExecute =
                    signatureCount >= (ownerHooks.requiredSignatures || 0) &&
                    !executed;

                  return (
                    <TableRow key={proposal.id}>
                      <TableCell>{proposal.id}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {owner?.slice(0, 6)}...{owner?.slice(-4)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={isAdd ? "default" : "destructive"}>
                          {isAdd ? "Add" : "Remove"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(status)}>
                          {status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {!hasSigned && !executed && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSignOwner(proposal.id)}
                              disabled={ownerHooks.isPending}
                            >
                              Sign
                            </Button>
                          )}
                          {canExecute && (
                            <Button
                              size="sm"
                              onClick={() => handleExecuteOwner(proposal.id)}
                              disabled={ownerHooks.isPending}
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
    </div>
  );
};
