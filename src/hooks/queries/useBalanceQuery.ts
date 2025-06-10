"use client";

import { Address } from "viem";
import { useReadContracts } from "wagmi";
import ERC20ABI from "../../../abis/Erc20.json";
import { CONTRACT_ADDRESSES } from "@/utils/constants/contracts";

interface VaultBalances {
  feeVault: {
    address: Address;
    balance: bigint;
    symbol: string;
  };
  treasury: {
    address: Address;
    balance: bigint;
    symbol: string;
  };
}

export const useVaultBalances = () => {
  const {
    data: contractResults,
    isLoading,
    error,
    refetch,
  } = useReadContracts({
    contracts: [
      // Fee Vault 잔고
      {
        address: CONTRACT_ADDRESSES.WMON,
        abi: ERC20ABI,
        functionName: "balanceOf",
        args: [CONTRACT_ADDRESSES.FEE_VAULT],
      },
      // Treasury 잔고
      {
        address: CONTRACT_ADDRESSES.WMON,
        abi: ERC20ABI,
        functionName: "balanceOf",
        args: [CONTRACT_ADDRESSES.TREASURY],
      },
      // Symbol
      {
        address: CONTRACT_ADDRESSES.WMON,
        abi: ERC20ABI,
        functionName: "symbol",
      },
    ],
    query: {
      enabled: true,
      staleTime: 30 * 1000,
      refetchInterval: 30 * 1000,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchIntervalInBackground: false,
      retry: 1,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  });

  const balances: VaultBalances | null = contractResults
    ? {
        feeVault: {
          address: CONTRACT_ADDRESSES.FEE_VAULT,
          balance: (contractResults[0]?.result as bigint) || BigInt(0),
          symbol: (contractResults[2]?.result as string) || "wMON",
        },
        treasury: {
          address: CONTRACT_ADDRESSES.TREASURY,
          balance: (contractResults[1]?.result as bigint) || BigInt(0),
          symbol: (contractResults[2]?.result as string) || "wMON",
        },
      }
    : null;

  return {
    balances,
    isLoading,
    error,
    refetch,
    feeVaultBalance: balances?.feeVault.balance || BigInt(0),
    treasuryBalance: balances?.treasury.balance || BigInt(0),
    symbol: balances?.feeVault.symbol || "wMON",
    totalBalance:
      (balances?.feeVault.balance || BigInt(0)) +
      (balances?.treasury.balance || BigInt(0)),
  };
};
