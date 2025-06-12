import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { monadTestnet } from "@/utils/constants/chains";

const ERROR_MESSAGES = {
  CHAIN_ADD_REJECTED: "Please add Monad Testnet to your wallet to continue",
  CHAIN_SWITCH_REJECTED: "Please switch to Monad Testnet to continue",
  SWITCH_FAILED: "Failed to switch network. Please try again.",
} as const;

const CHAIN_ERROR_CODES = {
  CHAIN_NOT_ADDED: 4902,
  USER_REJECTED: 4001,
} as const;

const logError = (message: string, error: any) => {
  console.error(`[Wallet Error] ${message}:`, error);
};

const logInfo = (message: string) => {
  console.log(`[Wallet Info] ${message}`);
};

export const useWallet = () => {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

  const isCorrectChain = chain?.id === monadTestnet.id;
  const chainId = chain?.id;

  const switchToCorrectChain = async () => {
    try {
      await switchChain({ chainId: monadTestnet.id });
    } catch (error: any) {
      logError("Switch chain error", error);
      
      // 체인이 없는 경우 (4902)
      if (error?.code === CHAIN_ERROR_CODES.CHAIN_NOT_ADDED) {
        try {
          logInfo("Attempting to add Monad Testnet to wallet");
          // wagmi의 switchChain은 체인이 없을 경우 자동으로 추가를 시도합니다
          await switchChain({ 
            chainId: monadTestnet.id,
            addEthereumChainParameter: {
              chainName: monadTestnet.name,
              nativeCurrency: monadTestnet.nativeCurrency,
              rpcUrls: monadTestnet.rpcUrls.default.http,
              blockExplorerUrls: monadTestnet.blockExplorers?.default.url ? [monadTestnet.blockExplorers.default.url] : undefined,
            }
          });
          logInfo("Successfully added and switched to Monad Testnet");
        } catch (addError: any) {
          logError("Failed to add chain", addError);
          if (addError.code === CHAIN_ERROR_CODES.USER_REJECTED) {
            throw new Error(ERROR_MESSAGES.CHAIN_ADD_REJECTED);
          }
          throw addError;
        }
      } 
      // 사용자가 체인 전환을 거부한 경우
      else if (error?.code === CHAIN_ERROR_CODES.USER_REJECTED) {
        throw new Error(ERROR_MESSAGES.CHAIN_SWITCH_REJECTED);
      }
      // 다른 에러
      else {
        logError("Failed to switch chain", error);
        throw new Error(ERROR_MESSAGES.SWITCH_FAILED);
      }
    }
  };

  return {
    address,
    isConnected,
    chain,
    isCorrectChain,
    chainId,
    connect,
    disconnect,
    connectors,
    switchToCorrectChain,
  };
}; 