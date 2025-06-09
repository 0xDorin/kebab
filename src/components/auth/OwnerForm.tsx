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
import { useAuthOwner } from "@/hooks/on-chain/dao/use-auth-owner";
import { isAddress } from "viem";

interface OwnerFormProps {
  authorizeAddress: `0x${string}`;
  onProposalCreated?: () => void;
}

export const OwnerForm: React.FC<OwnerFormProps> = ({
  authorizeAddress,
  onProposalCreated,
}) => {
  // 폼 상태는 컴포넌트에서 관리
  const [ownerAddress, setOwnerAddress] = useState("");
  const [actionType, setActionType] = useState<"add" | "remove">("add");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  // Hook에서는 비즈니스 로직만
  const { proposeAddOwner, proposeRemoveOwner, isPending } = useAuthOwner({
    authorizeAddress,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // 유효성 검사
    if (!ownerAddress.trim()) {
      setError("Please enter owner address");
      return;
    }

    if (!isAddress(ownerAddress)) {
      setError("Invalid owner address");
      return;
    }

    try {
      // 액션 타입에 따라 적절한 함수 호출
      if (actionType === "add") {
        await proposeAddOwner(ownerAddress);
        setSuccess("Add owner proposal created successfully!");
      } else {
        await proposeRemoveOwner(ownerAddress);
        setSuccess("Remove owner proposal created successfully!");
      }

      console.log(`${actionType} owner proposal created:`, {
        ownerAddress,
        actionType,
      });

      // 폼 초기화
      setOwnerAddress("");

      if (onProposalCreated) {
        onProposalCreated();
      }
    } catch (error) {
      console.error(`Error creating ${actionType} owner proposal:`, error);
      setError(`Failed to create ${actionType} owner proposal`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Owner</CardTitle>
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
            <Label htmlFor="action">Action</Label>
            <Select
              value={actionType}
              onValueChange={(value: "add" | "remove") => setActionType(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="add">Add Owner</SelectItem>
                <SelectItem value="remove">Remove Owner</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="ownerAddress">Owner Address</Label>
            <Input
              id="ownerAddress"
              type="text"
              placeholder="0x..."
              value={ownerAddress}
              onChange={(e) => setOwnerAddress(e.target.value)}
              required
            />
          </div>

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending
              ? `${actionType === "add" ? "Adding" : "Removing"} Owner...`
              : `${actionType === "add" ? "Add" : "Remove"} Owner`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
