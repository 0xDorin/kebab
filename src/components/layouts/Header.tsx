import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAccount, useConnect, useDisconnect } from "wagmi";

export const Header: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();

  const handleDisconnect = () => {
    disconnect();
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <header className="border-b bg-white shadow-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Title */}
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">Auth CMS</h1>
            <span className="text-sm text-gray-500">Multisig Management</span>
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
                    {formatAddress(address)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDisconnect}
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
