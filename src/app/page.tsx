"use client";

import Link from "next/link";
import { Wrapper } from "../components/layouts/Wrapper";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Plus, FileSearch, Settings } from "lucide-react";
import { CONTRACT_ADDRESSES } from "@/utils/constants/contracts";

export default function Home() {
  return (
    <Wrapper>
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Multisig Dashboard</h1>
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
                {CONTRACT_ADDRESSES.AUTHORIZE}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-blue-600" />
                Create Proposal
              </CardTitle>
              <CardDescription>
                Create new withdrawal or owner management proposals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/create">
                <Button className="w-full">Go to Create Page</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSearch className="h-5 w-5 text-green-600" />
                Sign Proposal
              </CardTitle>
              <CardDescription>
                Search and sign specific proposals by ID
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/sign">
                <Button variant="outline" className="w-full">
                  Go to Sign Page
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Getting Started Guide */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-purple-600" />
              Getting Started
            </CardTitle>
            <CardDescription>How to use the multisig system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
                  1
                </div>
                <div>
                  <h4 className="font-semibold">Create a Proposal</h4>
                  <p className="text-sm text-muted-foreground">
                    Use the Create page to submit withdrawal or owner management
                    proposals
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-semibold text-sm">
                  2
                </div>
                <div>
                  <h4 className="font-semibold">Sign Proposals</h4>
                  <p className="text-sm text-muted-foreground">
                    Use the Sign page to find and sign specific proposals by
                    their ID
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold text-sm">
                  3
                </div>
                <div>
                  <h4 className="font-semibold">Execute</h4>
                  <p className="text-sm text-muted-foreground">
                    Once enough signatures are collected, execute the proposal
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Wrapper>
  );
}
