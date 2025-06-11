import { monadTestnet } from "@/utils/constants/chains";

// 🎯 순수 함수 - 주소 포맷팅만 담당
export const formatWalletAddress = (address?: string): string => {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const isMonadTestnet = (chainId?: number): boolean => {
  return chainId === monadTestnet.id;
};

export const getNetworkStatus = (chainId?: number, isConnected?: boolean) => {
  if (!isConnected) return "disconnected";
  if (!chainId) return "unknown";
  if (isMonadTestnet(chainId)) return "correct";
  return "wrong";
};
