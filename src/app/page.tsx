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

// Get contract addresses from environment variables
const AUTHORIZE_CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_AUTHORIZE_CONTRACT_ADDRESS as `0x${string}`;

// Validate that all required environment variables are set
if (!AUTHORIZE_CONTRACT_ADDRESS) {
  console.error(
    "Missing required environment variables. Please check your .env.local file."
  );
}

export default function Home() {
  const handleRefresh = () => {
    // 새로고침 제거 - 에러 핸들링으로 대체
    console.log("Proposal created - refresh disabled");
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
            <CardDescription>Connected contracts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 font-mono text-sm">
              <div>
                <strong>Authorize Contract:</strong>{" "}
                {AUTHORIZE_CONTRACT_ADDRESS}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Forms */}
        <div className="grid md:grid-cols-2 gap-6">
          <WithdrawalForm
            authorizeAddress={AUTHORIZE_CONTRACT_ADDRESS}
            onProposalCreated={handleRefresh}
          />
          <OwnerForm
            authorizeAddress={AUTHORIZE_CONTRACT_ADDRESS}
            onProposalCreated={handleRefresh}
          />
        </div>

        {/* Proposals List */}
        <ProposalList authorizeAddress={AUTHORIZE_CONTRACT_ADDRESS} />
      </div>
    </Wrapper>
  );
}
