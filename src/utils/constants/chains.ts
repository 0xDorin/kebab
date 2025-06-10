import { Chain } from "viem";

export const monadTestnet: Chain = {
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: {
    name: "TMON",
    symbol: "TMON",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      // http: ["http://localhost:8545"],
      http: ["https://monad-testnet.drpc.org"],
    },
  },
  blockExplorers: {
    default: {
      name: "Monad Testnet Explorer",
      url: "https://testnet.monadexplorer.com/",
    },
  },
};

export const chains = [monadTestnet];

export const defaultChain = monadTestnet;
