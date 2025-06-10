import { useAccount, useDisconnect, useSwitchChain, useConnect } from "wagmi";
import { ContractAddress } from "@/utils/types/contracts";
import { monadTestnet } from "@/utils/constants/chains";

// 🎯 단순한 유틸리티 함수들만 Zustand로 관리
export const walletUtils = {
  formatAddress: (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  },

  isCorrectChain: (chainId: number | undefined) => {
    return chainId === monadTestnet.id;
  },
};

// 🚀 wagmi 훅들을 조합한 커스텀 훅 (Context와 동일한 방식)
export const useWallet = () => {
  const { address, isConnected, isConnecting, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const { connect, connectors } = useConnect();

  const isCorrectChain = walletUtils.isCorrectChain(chain?.id);

  const handleSwitchToCorrectChain = async () => {
    try {
      await switchChain({ chainId: monadTestnet.id });
    } catch (error) {
      console.error("Failed to switch chain:", error);
      throw error;
    }
  };

  return {
    // 기본 상태
    address: address as ContractAddress | undefined,
    isConnected,
    isConnecting,
    chainId: chain?.id,
    isCorrectChain,

    // 액션들
    disconnect,
    connect,
    connectors,
    switchToCorrectChain: handleSwitchToCorrectChain,

    // 유틸리티
    formatAddress: walletUtils.formatAddress,
  };
};

// 🎯 선택적 구독을 위한 개별 훅들
export const useWalletAddress = () => {
  const { address } = useAccount();
  return address as ContractAddress | undefined;
};

export const useIsConnected = () => {
  const { isConnected } = useAccount();
  return isConnected;
};

export const useIsCorrectChain = () => {
  const { chain } = useAccount();
  return walletUtils.isCorrectChain(chain?.id);
};

export const useFormattedAddress = () => {
  const { address } = useAccount();
  return address ? walletUtils.formatAddress(address) : "";
};
