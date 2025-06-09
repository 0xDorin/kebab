import React, { useEffect, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Wallet, TrendingUp } from "lucide-react";
import { useReadContract } from "wagmi";
import { formatEther } from "viem";
import {
  useAuthWithdrawal,
  WithdrawalTarget,
} from "@/hooks/on-chain/dao/use-auth-withdrawal";
import ERC20ABI from "../../../abis/Erc20.json";
import { isAddress } from "viem";

// Vault 주소들과 wMON 컨트랙트 주소
const VAULT_ADDRESSES = {
  FEE_VAULT: process.env.NEXT_PUBLIC_FEE_VAULT_ADDRESS as `0x${string}`,
  TREASURY: process.env.NEXT_PUBLIC_TREASURY_ADDRESS as `0x${string}`,
};

const WMON_CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_WMON_CONTRACT_ADDRESS as `0x${string}`;

interface VaultBalanceProps {
  address: `0x${string}` | undefined;
  name: string;
  icon: React.ReactNode;
  isSelected: boolean;
}

const VaultBalance: React.FC<VaultBalanceProps> = ({
  address,
  name,
  icon,
  isSelected,
}) => {
  // 🚨 Hydration 에러 방지 - 클라이언트에서만 렌더링
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // wMON 토큰 잔액 조회
  const ERC20_ABI = ERC20ABI;
  const {
    data: balance,
    isLoading: isBalanceLoading,
    error: balanceError,
    refetch: refetchBalance,
  } = useReadContract({
    address: WMON_CONTRACT_ADDRESS,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!WMON_CONTRACT_ADDRESS && isMounted, // 🚨 마운트 후에만 활성화
      refetchInterval: 10000, // 10초마다 refetch
      staleTime: 5000, // 5초 동안 fresh 상태 유지
    },
  });

  // wMON 토큰 심볼 조회
  const { data: symbol, isLoading: isSymbolLoading } = useReadContract({
    address: WMON_CONTRACT_ADDRESS,
    abi: ERC20_ABI,
    functionName: "symbol",
    query: {
      enabled: !!WMON_CONTRACT_ADDRESS && isMounted, // 🚨 마운트 후에만 활성화
      staleTime: 60000, // 1분 동안 캐시 유지 (심볼은 잘 안 바뀜)
    },
  });

  const isLoading = isBalanceLoading || isSymbolLoading;

  // 디버깅용 로그
  // React.useEffect(() => {
  //   console.log(`[${name}] Debug Info:`, {
  //     address,
  //     wmonContract: WMON_CONTRACT_ADDRESS,
  //     balance,
  //     isBalanceLoading,
  //     balanceError,
  //     symbol,
  //     isSymbolLoading,
  //   });
  // }, [
  //   address,
  //   balance,
  //   isBalanceLoading,
  //   balanceError,
  //   symbol,
  //   isSymbolLoading,
  //   name,
  // ]);

  // 🚨 마운트되기 전에는 로딩 상태 표시
  if (!isMounted) {
    return (
      <div
        className={`p-3 rounded-lg border ${
          isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200"
        }`}
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-medium">{name}</span>
        </div>
        <div className="text-sm text-gray-500 mt-1">Loading...</div>
      </div>
    );
  }

  if (!address) {
    return (
      <div
        className={`p-3 rounded-lg border ${
          isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200"
        }`}
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-medium">{name}</span>
        </div>
        <div className="text-sm text-gray-500 mt-1">
          Address not configured in environment variables
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        className={`p-3 rounded-lg border ${
          isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200"
        }`}
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-medium">{name}</span>
        </div>
        <div className="text-sm text-gray-500 mt-1">Loading...</div>
      </div>
    );
  }

  if (balanceError || balance === undefined) {
    return (
      <div
        className={`p-3 rounded-lg border ${
          isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200"
        }`}
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-medium">{name}</span>
        </div>
        <div className="text-sm text-red-500 mt-1">Failed to load balance</div>
      </div>
    );
  }

  return (
    <div
      className={`p-3 rounded-lg border transition-colors ${
        isSelected
          ? "border-blue-500 bg-blue-50"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-medium">{name}</span>
          {isSelected && (
            <Badge variant="secondary" className="text-xs">
              Selected
            </Badge>
          )}
        </div>
      </div>
      <div className="mt-2">
        <div className="text-lg font-semibold">
          {balance !== undefined && typeof balance === "bigint"
            ? `${parseFloat(formatEther(balance)).toFixed(6)} ${
                symbol || "wMON"
              }`
            : "0.000000 wMON"}
        </div>
        <div className="text-sm text-gray-500">
          Address: {address.slice(0, 6)}...{address.slice(-4)}
        </div>
      </div>
    </div>
  );
};

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

        {/* Vault Balances Section */}
        <div className="mb-6">
          <Label className="text-base font-semibold mb-3 block">
            Select Target Vault
          </Label>
          <div className="grid gap-3">
            <div
              className={`cursor-pointer ${
                target === "0" ? "ring-2 ring-blue-500" : ""
              }`}
              onClick={() => setTarget("0")}
            >
              <VaultBalance
                address={VAULT_ADDRESSES.FEE_VAULT}
                name="Fee Vault"
                icon={<Wallet className="w-4 h-4" />}
                isSelected={target === "0"}
              />
            </div>
            <div
              className={`cursor-pointer ${
                target === "1" ? "ring-2 ring-blue-500" : ""
              }`}
              onClick={() => setTarget("1")}
            >
              <VaultBalance
                address={VAULT_ADDRESSES.TREASURY}
                name="Treasury"
                icon={<TrendingUp className="w-4 h-4" />}
                isSelected={target === "1"}
              />
            </div>
          </div>
        </div>

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

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Creating Proposal..." : "Create Proposal"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
