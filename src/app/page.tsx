"use client";

import { WithdrawalForm } from "../components/auth/WithdrawalForm";
import { OwnerForm } from "../components/auth/OwnerForm";
import { ProposalList } from "../components/proposals/proposal-list";
import { Wrapper } from "../components/layouts/Wrapper";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

// TODO: Replace with actual deployed Authorize contract address
const AUTHORIZE_ADDRESS = "0x1234567890123456789012345678901234567890" as const;

export default function Home() {
  const handleRefresh = () => {
    // Force refresh of proposals
    window.location.reload();
  };

  return (
    <Wrapper>
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage multisig proposals for vault withdrawals and owner management
          </p>
        </div>

        {/* Contract Info */}
        <Card>
          <CardHeader>
            <CardTitle>Contract Information</CardTitle>
            <CardDescription>Connected to Authorize contract</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="font-mono text-sm">
              <strong>Address:</strong> {AUTHORIZE_ADDRESS}
            </div>
          </CardContent>
        </Card>

        {/* Action Forms */}
        <div className="grid md:grid-cols-2 gap-6">
          <WithdrawalForm
            authorizeAddress={AUTHORIZE_ADDRESS}
            onProposalCreated={handleRefresh}
          />
          <OwnerForm
            authorizeAddress={AUTHORIZE_ADDRESS}
            onProposalCreated={handleRefresh}
          />
        </div>

        {/* Proposals List */}
        <ProposalList authorizeAddress={AUTHORIZE_ADDRESS} />
      </div>
    </Wrapper>
  );
}
