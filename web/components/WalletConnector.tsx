'use client';

interface WalletConnectorProps {
  chain: string;
  isConnected: boolean;
  address: string;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function WalletConnector({ chain, isConnected, address, onConnect, onDisconnect }: WalletConnectorProps) {
  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="border border-rose-100 rounded-2xl p-5 bg-gradient-to-br from-white to-rose-50/30 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-light text-rose-900 text-lg mb-1">{chain}</h3>
          {isConnected && address ? (
            <p className="text-sm text-rose-600 font-mono font-light">
              {formatAddress(address)}
            </p>
          ) : (
            <p className="text-sm text-rose-400 font-light">Not connected</p>
          )}
        </div>
        <button
          onClick={() => {
            if (isConnected) {
              onDisconnect();
            } else {
              onConnect();
            }
          }}
          className={`px-6 py-2 rounded-full font-light transition-all ${
            isConnected
              ? 'bg-rose-200 hover:bg-rose-300 text-rose-800'
              : 'bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white shadow-sm'
          }`}
        >
          {isConnected ? 'Disconnect' : 'Connect'}
        </button>
      </div>
    </div>
  );
}

