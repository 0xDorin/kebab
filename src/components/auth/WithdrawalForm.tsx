import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useAuthWithdrawal,
  WithdrawalTarget,
} from "@/hooks/on-chain/dao/use-auth-withdrawal";
import { isAddress } from "viem";

interface WithdrawalFormProps {
  authorizeAddress: `0x${string}`;
  onProposalCreated?: () => void;
}

export const WithdrawalForm: React.FC<WithdrawalFormProps> = ({
  authorizeAddress,
  onProposalCreated,
}) => {
  // 폼 상태는 컴포넌트에서 관리
  const [amount, setAmount] = useState("");
  const [receiver, setReceiver] = useState("");
  const [target, setTarget] = useState<string>("0");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  // Hook에서는 비즈니스 로직만
  const { proposeWithdrawal, isPending } = useAuthWithdrawal({
    authorizeAddress,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // 유효성 검사
    if (!receiver.trim()) {
      setError("Please enter receiver address");
      return;
    }

    if (!isAddress(receiver)) {
      setError("Invalid receiver address");
      return;
    }

    if (!amount.trim() || parseFloat(amount) <= 0) {
      setError("Please enter valid amount");
      return;
    }

    try {
      // Hook 함수에 파라미터 전달
      const targetEnum =
        target === "1" ? WithdrawalTarget.Treasury : WithdrawalTarget.FeeVault;
      await proposeWithdrawal(receiver, amount, targetEnum);

      setSuccess("Withdrawal proposal created successfully!");
      console.log("Withdrawal proposal created:", { receiver, amount, target });

      // 폼 초기화
      setAmount("");
      setReceiver("");
      setTarget("0");

      if (onProposalCreated) {
        onProposalCreated();
      }
    } catch (error) {
      console.error("Error creating withdrawal proposal:", error);
      setError("Failed to create withdrawal proposal");
    }
  };

  const handleTargetChange = (value: string) => {
    setTarget(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Withdrawal Proposal</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="receiver">Receiver Address</Label>
            <Input
              id="receiver"
              type="text"
              placeholder="0x..."
              value={receiver}
              onChange={(e) => setReceiver(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="amount">Amount (MON)</Label>
            <Input
              id="amount"
              type="number"
              step="0.000001"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="target">Target Vault</Label>
            <Select value={target} onValueChange={handleTargetChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Fee Vault</SelectItem>
                <SelectItem value="1">Treasury</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Creating Proposal..." : "Create Proposal"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
