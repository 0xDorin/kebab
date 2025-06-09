import { useAccount, useConnect, useDisconnect } from "wagmi";

export function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <div className="p-4">
        <div>Connected: {address}</div>
        <button
          onClick={() => disconnect()}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2>Connect Wallet</h2>
      {connectors.map((connector) => (
        <button
          key={connector.uid}
          onClick={() => connect({ connector })}
          className="px-4 py-2 m-2 bg-blue-500 text-white rounded"
        >
          {connector.name}
        </button>
      ))}
    </div>
  );
}
