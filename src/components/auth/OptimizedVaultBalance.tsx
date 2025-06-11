"use client";

import React, { useState, useEffect } from "react";
import { formatEther } from "viem";
import { Badge } from "../ui/badge";
import { useVaultBalances } from "@/hooks/queries/useBalanceQuery";
import { CONTRACT_ADDRESSES } from "@/utils/constants/contracts";
import { formatWalletAddress } from "@/utils/walletUtils";

interface OptimizedVaultBalanceProps {
  address: `0x${string}` | undefined;
  name: string;
  icon: React.ReactNode;
  isSelected: boolean;
}

export const OptimizedVaultBalance: React.FC<OptimizedVaultBalanceProps> = ({
  address,
  name,
  icon,
  isSelected,
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 🚀 공통 훅 사용 (중복 요청 제거)
  const { balances, isLoading, error } = useVaultBalances();

  // 🎯 어떤 vault인지 판단
  const getVaultData = () => {
    if (!address || !balances) return null;

    if (address === CONTRACT_ADDRESSES.FEE_VAULT) {
      return balances.feeVault;
    } else if (address === CONTRACT_ADDRESSES.TREASURY) {
      return balances.treasury;
    }
    return null;
  };

  const vaultData = getVaultData();

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
        <div className="text-sm text-gray-500 mt-1">Address not configured</div>
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
        <div className="text-sm text-gray-500 mt-1">Loading balance...</div>
      </div>
    );
  }

  if (error || !vaultData) {
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
          {`${parseFloat(formatEther(vaultData.balance)).toFixed(6)} ${
            vaultData.symbol
          }`}
        </div>
        <div className="text-sm text-gray-500">
          Address: {formatWalletAddress(address)}
        </div>
      </div>
    </div>
  );
};
