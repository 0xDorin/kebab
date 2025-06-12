"use client";

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
import { useAuthOwner } from "@/hooks/on-chain/dao/useAuthOwner";
import { useFormState } from "@/hooks/useFormState";
import {
  validateOwnerForm,
  getFirstError,
  type OwnerFormData,
} from "@/utils/validation/formValidation";

interface OwnerFormProps {
  authorizeAddress: `0x${string}`;
  onProposalCreated?: () => void;
}

export const OwnerForm: React.FC<OwnerFormProps> = ({
  authorizeAddress,
  onProposalCreated,
}) => {
  // 🎨 UI 상태
  const [formData, setFormData] = useState<OwnerFormData>({
    ownerAddress: "",
    actionType: "add",
  });

  // 🎯 비즈니스 로직 (훅으로 분리)
  const { proposeAddOwner, proposeRemoveOwner, isPending } = useAuthOwner({
    authorizeAddress,
  });
  const { error, success, setError, setSuccess, clearMessages } =
    useFormState();

  // 🎨 UI 핸들러
  const updateField = (field: keyof OwnerFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    clearMessages(); // 입력시 메시지 클리어
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    // 🎯 비즈니스 로직: 검증
    const validationErrors = validateOwnerForm(formData);
    if (validationErrors.length > 0) {
      setError(getFirstError(validationErrors));
      return;
    }

    try {
      // 🎯 비즈니스 로직: 제출
      if (formData.actionType === "add") {
        await proposeAddOwner(formData.ownerAddress);
      } else {
        await proposeRemoveOwner(formData.ownerAddress);
      }

      // 🎨 UI 피드백
      const successMessage = `${
        formData.actionType === "add" ? "Add" : "Remove"
      } owner proposal created successfully!`;
      setSuccess(successMessage);

      // 🎨 UI 초기화
      setFormData((prev) => ({ ...prev, ownerAddress: "" }));

      // 🎯 비즈니스 콜백
      onProposalCreated?.();
    } catch (error) {
      console.error(
        `Error creating ${formData.actionType} owner proposal:`,
        error
      );
      const errorMessage = `Failed to create ${formData.actionType} owner proposal`;
      setError(errorMessage);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Owner</CardTitle>
      </CardHeader>
      <CardContent>
        {/* 🎨 UI: 상태 메시지 */}
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

        {/* 🎨 UI: 폼 필드 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="action">Action</Label>
            <Select
              value={formData.actionType}
              onValueChange={(value: "add" | "remove") =>
                updateField("actionType", value)
              }
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
              value={formData.ownerAddress}
              onChange={(e) => updateField("ownerAddress", e.target.value)}
              required
            />
          </div>

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending
              ? "Creating Proposal..." : "Create Proposal" }
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
