import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, TrendingUp } from "lucide-react";
import { OptimizedVaultBalance } from "./OptimizedVaultBalance";
import {
  useAuthWithdrawal,
  WithdrawalTarget,
} from "@/hooks/on-chain/dao/useAuthWithdrawal";
import { useFormState } from "@/hooks/useFormState";
import {
  validateWithdrawalForm,
  getFirstError,
  type WithdrawalFormData,
} from "@/utils/validation/formValidation";
import { VAULT_INFO } from "@/utils/constants/contracts";

interface WithdrawalFormProps {
  authorizeAddress: `0x${string}`;
  onProposalCreated?: () => void;
}

export const WithdrawalForm: React.FC<WithdrawalFormProps> = ({
  authorizeAddress,
  onProposalCreated,
}) => {
  // 🎨 UI 상태
  const [formData, setFormData] = useState<WithdrawalFormData>({
    amount: "",
    receiver: "",
    target: "0",
  });

  // 🎯 비즈니스 로직 (훅으로 분리)
  const { proposeWithdrawal, isPending } = useAuthWithdrawal({
    authorizeAddress,
  });
  const { error, success, setError, setSuccess, clearMessages } =
    useFormState();

  // 🎨 UI 핸들러
  const updateField = (field: keyof WithdrawalFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    clearMessages(); // 입력시 메시지 클리어
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    // 🎯 비즈니스 로직: 검증
    const validationErrors = validateWithdrawalForm(formData);
    if (validationErrors.length > 0) {
      setError(getFirstError(validationErrors));
      return;
    }

    try {
      // 🎯 비즈니스 로직: 제출
      const targetEnum =
        formData.target === "1"
          ? WithdrawalTarget.Treasury
          : WithdrawalTarget.FeeVault;

      await proposeWithdrawal(formData.receiver, formData.amount, targetEnum);

      // 🎨 UI 피드백
      setSuccess("Withdrawal proposal created successfully!");

      // 🎨 UI 초기화
      setFormData({ amount: "", receiver: "", target: "0" });

      // 🎯 비즈니스 콜백
      onProposalCreated?.();
    } catch (error) {
      console.error("Error creating withdrawal proposal:", error);
      const errorMessage = "Failed to create withdrawal proposal";
      setError(errorMessage);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Withdrawal Proposal</CardTitle>
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

        {/* 🎨 UI: Vault 선택 */}
        <div className="mb-6">
          <Label className="text-base font-semibold mb-3 block">
            Select Target Vault
          </Label>
          <div className="grid gap-3">
            <div
              className={`cursor-pointer ${
                formData.target === "0" ? "ring-2 ring-blue-500" : ""
              }`}
              onClick={() => updateField("target", "0")}
            >
              <OptimizedVaultBalance
                address={VAULT_INFO.FEE_VAULT.address}
                name={VAULT_INFO.FEE_VAULT.name}
                icon={<Wallet className="w-4 h-4" />}
                isSelected={formData.target === "0"}
              />
            </div>
            <div
              className={`cursor-pointer ${
                formData.target === "1" ? "ring-2 ring-blue-500" : ""
              }`}
              onClick={() => updateField("target", "1")}
            >
              <OptimizedVaultBalance
                address={VAULT_INFO.TREASURY.address}
                name={VAULT_INFO.TREASURY.name}
                icon={<TrendingUp className="w-4 h-4" />}
                isSelected={formData.target === "1"}
              />
            </div>
          </div>
        </div>

        {/* 🎨 UI: 폼 필드 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="receiver">Receiver Address</Label>
            <Input
              id="receiver"
              type="text"
              placeholder="0x..."
              value={formData.receiver}
              onChange={(e) => updateField("receiver", e.target.value)}
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
              value={formData.amount}
              onChange={(e) => updateField("amount", e.target.value)}
              required
            />
          </div>

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Creating Proposal..." : "Create Proposal"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
