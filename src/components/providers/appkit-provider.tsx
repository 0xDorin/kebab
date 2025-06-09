"use client";

import { createAppKit } from "@reown/appkit/react";
import {
  Config,
  cookieStorage,
  cookieToInitialState,
  createStorage,
  fallback,
  http,
  injected,
  WagmiProvider,
} from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import {
  ReactNode,
  Suspense,
  useLayoutEffect,
  useState,
  useEffect,
} from "react";
import { defaultChain } from "@/utils/constants/chains";

// 0. Setup queryClient
const queryClient = new QueryClient();

// 1. Get projectId from https://cloud.reown.com
export const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID;

if (!projectId) {
  throw new Error("Project ID is not defined");
}

// 2. Create a metadata object - optional
const metadata = {};

// 월렛 ID 정의
const walletIds = [
  //backpack wallet id
  "2bd8c14e035c2d48f184aaa168559e86b0e3433228d3c4075900a221785019b0",
  "a797aa35c0fadbfc1a53e7f675162ed5226968b44a19ee3d24385c64d1d3c393",
  //okx
  "971e689d0a5be527bac79629b4ee9b925e82208e5168b733496a09c0faed0709",
  //add HaHa as featured wallet
  "719bd888109f5e8dd23419b20e749900ce4d2fc6858cf588395f19c82fd036b3",
  //other wallet ids
  "c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96",
];

// 4. Create Wagmi Adapter
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  networks: [defaultChain], // chains 대신 defaultChain만 사용
  projectId,
  multiInjectedProviderDiscovery: true,
  ssr: true,
  transports: {
    [defaultChain.id]: fallback([http(defaultChain.rpcUrls.default.http[0])]),
  },
  chains: [defaultChain],
  connectors: [
    injected({ shimDisconnect: true }), // shimDisconnect 옵션 추가
  ],
});

// 쿠키 정보를 지우는 함수 추가 (cookieStorage 사용)
export const clearWagmiCookies = () => {
  if (typeof window === "undefined") return;

  // wagmi.store 쿠키 삭제
  cookieStorage.removeItem("wagmi.store");

  // wagmi.recentConnectorId 쿠키 삭제
  cookieStorage.removeItem("wagmi.recentConnectorId");

  // 기타 wagmi 관련 쿠키들 삭제
  cookieStorage.removeItem("wagmi.connected");

  localStorage.removeItem("auth-storage");
  localStorage.removeItem("ethereum-https://testnet.nad.fun");
  localStorage.removeItem("ethereum-http://localhost:3000");
  localStorage.removeItem("@appkit/ens_cache");
  localStorage.removeItem("@appkit/connection_status");
  localStorage.removeItem("@appkit/native_balance_cache");
  localStorage.removeItem("@appkit/eip155:connected_connector_id");

  // 다른 지갑 관련 쿠키들도 필요하다면 여기에 추가
};

// 5. Create modal
createAppKit({
  adapters: [wagmiAdapter],
  networks: [defaultChain], // 단일 네트워크만 사용
  projectId,
  metadata,
  features: {
    analytics: false,
    connectMethodsOrder: ["wallet"],
  },
  enableWalletConnect: true,
  defaultNetwork: defaultChain,
  allowUnsupportedChain: false, // 지원되지 않는 네트워크 차단
  featuredWalletIds: walletIds, // 정의된 월렛 ID 사용
});

// function WalletProvider({ children, cookies }: { children: ReactNode; cookies: string | null }) {
//   const [initialState, setInitialState] = useState<any>({})
//   const [isInitialized, setIsInitialized] = useState(false)

//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       if (cookies) {
//         const state = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies)
//         setInitialState(state)
//       }
//       setIsInitialized(true)
//     }
//   }, [cookies])

//   if (!isInitialized) {
//     return null
//   }

//   return (
//     <WagmiProvider config={wagmiAdapter.wagmiConfig} initialState={initialState}>
//       {children}
//     </WagmiProvider>
//   )
// }

export function AppKitProvider({
  children,
  cookies,
}: {
  children: ReactNode;
  cookies: string | null;
}) {
  const initialState = cookieToInitialState(
    wagmiAdapter.wagmiConfig as Config,
    cookies
  );
  return (
    <WagmiProvider
      config={wagmiAdapter.wagmiConfig}
      initialState={initialState}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
