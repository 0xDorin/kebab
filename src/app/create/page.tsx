"use client";

import { useState } from "react";
import { WithdrawalForm } from "@/components/auth/WithdrawalForm";
import { OwnerForm } from "@/components/auth/OwnerForm";
import { Wrapper } from "@/components/layouts/Wrapper";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormSkeleton } from "@/components/ui/skeleton";

// Get contract addresses from environment variables
const AUTHORIZE_CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_AUTHORIZE_CONTRACT_ADDRESS as `0x${string}`;

// Validate that all required environment variables are set
if (!AUTHORIZE_CONTRACT_ADDRESS) {
  console.error(
    "Missing required environment variables. Please check your .env.local file."
  );
}

export default function CreatePage() {
  const [selectedAction, setSelectedAction] = useState<string>("withdraw");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleRefresh = () => {};

  return (
    <Wrapper>
      <div className="max-w-6xl mx-auto">
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold">Create Proposal</h1>
            <p className="text-muted-foreground">
              Create new multisig proposals for vault operations
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 justify-center">
            {/* Left Side - Form Area */}
            <div className="flex-1 max-w-2xl">
              {isLoading ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Loading...</CardTitle>
                    <CardDescription>Preparing form</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FormSkeleton />
                  </CardContent>
                </Card>
              ) : (
                <>
                  {selectedAction === "withdraw" && (
                    <WithdrawalForm
                      authorizeAddress={AUTHORIZE_CONTRACT_ADDRESS}
                      onProposalCreated={handleRefresh}
                    />
                  )}
                  {selectedAction === "owneradd" && (
                    <OwnerForm
                      authorizeAddress={AUTHORIZE_CONTRACT_ADDRESS}
                      onProposalCreated={handleRefresh}
                    />
                  )}
                </>
              )}
            </div>

            {/* Right Side - Action Selector (Fixed) */}
            <div className="w-full lg:w-80 lg:flex-shrink-0">
              <Card className="sticky top-8">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Action Type</CardTitle>
                  <CardDescription>
                    Select the type of proposal to create
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Select
                    value={selectedAction}
                    onValueChange={setSelectedAction}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="withdraw">Withdraw</SelectItem>
                      <SelectItem value="owneradd">Owner Add</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Wrapper>
  );
}
