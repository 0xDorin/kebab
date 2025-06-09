import { monadTestnet } from "@/utils/constants/chains";
import { http, createConfig } from "wagmi";
import { injected, metaMask, walletConnect } from "wagmi/connectors";

const projectId = "YOUR_WALLETCONNECT_PROJECT_ID";

export const config = createConfig({
  chains: [monadTestnet],
  connectors: [injected(), walletConnect({ projectId }), metaMask()],
  transports: {
    [monadTestnet.id]: http(),
  },
});
