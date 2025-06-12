import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { monadTestnet } from "@/utils/constants/chains";
import { formatWalletAddress } from "@/utils/walletUtils";
import { useWallet } from "@/hooks/useWallet";

export const Header: React.FC = () => {
  const pathname = usePathname();

  // 🚀 직접 wagmi 훅 사용 - 불필요한 추상화 제거
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchToCorrectChain } = useWallet();

  const isCorrectChain = chain?.id === monadTestnet.id;
  const chainId = chain?.id;


  // 🔒 체인 검증 로직 (기존과 동일)
  useEffect(() => {
    if (isConnected && !isCorrectChain) {
      const handleChainMismatch = async () => {
        const shouldSwitch = window.confirm(
          `You are connected to chain ${chainId}.\nThis app requires Monad Testnet.\n\nWould you like to switch to Monad Testnet?`
        );

        if (shouldSwitch) {
          try {
            await switchToCorrectChain();
          } catch (error) {
            console.error("Failed to switch chain:", error);
            alert("Failed to switch network. Disconnecting wallet...");
            disconnect();
          }
        } else {
          alert("Disconnecting wallet due to wrong network.");
          disconnect();
        }
      };

      const timer = setTimeout(handleChainMismatch, 500);
      return () => clearTimeout(timer);
    }
  }, [isConnected, isCorrectChain, chainId, switchToCorrectChain, disconnect]);

  const navItems = [
    { href: "/create", label: "Create" },
    { href: "/sign", label: "Sign" },
  ];

  return (
    <header className="border-b bg-white shadow-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Title */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Auth CMS</h1>
              <span className="text-sm text-gray-500">Multisig Management</span>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                    pathname === item.href
                      ? "text-blue-600 border-b-2 border-blue-600 pb-1"
                      : "text-gray-700"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            {isConnected && address ? (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="flex items-center space-x-3 p-3">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span className="text-sm font-medium text-green-800">
                      Connected
                    </span>
                  </div>
                  <span className="text-sm font-mono text-green-700">
                    {formatWalletAddress(address)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => disconnect()}
                    className="border-green-300 text-green-700 hover:bg-green-100"
                  >
                    Disconnect
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="flex items-center space-x-3 p-3">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                    <span className="text-sm font-medium text-orange-800">
                      Not Connected
                    </span>
                  </div>
                  {connectors.length > 0 && (
                    <Button
                      size="sm"
                      onClick={() => connect({ connector: connectors[0] })}
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      Connect Wallet
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
