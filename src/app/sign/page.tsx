"use client";

import { useState } from "react";
import { Wrapper } from "@/components/layouts/Wrapper";
import { SingleProposalView } from "@/components/proposals/SingleProposalView";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

// Get contract addresses from environment variables
const AUTHORIZE_CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_AUTHORIZE_CONTRACT_ADDRESS as `0x${string}`;

// Validate that all required environment variables are set
if (!AUTHORIZE_CONTRACT_ADDRESS) {
  console.error(
    "Missing required environment variables. Please check your .env.local file."
  );
}

export default function SignPage() {
  const [proposalType, setProposalType] = useState<string>("withdrawal");
  const [proposalId, setProposalId] = useState<string>("");
  const [searchedProposal, setSearchedProposal] = useState<{
    type: string;
    id: number;
  } | null>(null);

  const handleSearch = () => {
    const id = parseInt(proposalId);
    if (isNaN(id) || id < 0) {
      alert("Please enter a valid proposal ID");
      return;
    }
    setSearchedProposal({ type: proposalType, id });
  };

  const handleClear = () => {
    setSearchedProposal(null);
    setProposalId("");
  };

  return (
    <Wrapper>
      <div className="max-w-6xl mx-auto">
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold">Sign Proposal</h1>
            <p className="text-muted-foreground">
              Search and sign specific multisig proposals
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 min-h-[600px]">
            <div className="flex-1 lg:min-w-0">
              <div className="h-full">
                {searchedProposal ? (
                  <SingleProposalView
                    authorizeAddress={AUTHORIZE_CONTRACT_ADDRESS}
                    proposalType={searchedProposal.type}
                    proposalId={searchedProposal.id}
                  />
                ) : (
                  <Card className="h-full min-h-[400px]">
                    <CardContent className="flex items-center justify-center h-full py-16">
                      <div className="text-center space-y-4">
                        <div className="text-muted-foreground">
                          <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">
                          No proposal selected
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Search for a proposal using the panel on the right
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            <div className="w-full lg:w-80 lg:flex-shrink-0">
              <Card className="sticky top-8 h-fit">
                <CardHeader>
                  <CardTitle>Search Proposal</CardTitle>
                  <CardDescription>
                    Find a specific proposal by type and ID
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="proposal-type">Proposal Type</Label>
                    <Select
                      value={proposalType}
                      onValueChange={setProposalType}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select proposal type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="withdrawal">Withdrawal</SelectItem>
                        <SelectItem value="owner">Owner Management</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="proposal-id">Proposal ID</Label>
                    <Input
                      id="proposal-id"
                      type="number"
                      placeholder="Enter proposal ID"
                      value={proposalId}
                      onChange={(e) => setProposalId(e.target.value)}
                      min="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Button
                      onClick={handleSearch}
                      disabled={!proposalId}
                      className="w-full"
                    >
                      Search Proposal
                    </Button>
                    {searchedProposal && (
                      <Button
                        variant="outline"
                        onClick={handleClear}
                        className="w-full"
                      >
                        Clear Search
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Wrapper>
  );
}
