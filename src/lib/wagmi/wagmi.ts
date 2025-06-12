import { monadTestnet } from "@/utils/constants/chains";
import { http, createConfig } from "wagmi";
import { injected, metaMask } from "wagmi/connectors";

export const config = createConfig({
  chains: [monadTestnet],
  connectors: [injected(), metaMask()],
  transports: {
    [monadTestnet.id]: http(),
  },
});
