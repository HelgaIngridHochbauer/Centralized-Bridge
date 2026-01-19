'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SuiClientProvider } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui.js/client';
import { useState } from 'react';
import { WalletProviderWrapper } from './WalletProviderWrapper';

// Styles for the dApp Kit UI
import '@mysten/dapp-kit/dist/index.css';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const suiRpcUrl = process.env.NEXT_PUBLIC_SUI_RPC_URL || getFullnodeUrl('localnet');
  
  // Configure the networks
  const networkConfig = {
    localnet: { url: suiRpcUrl },
  };

  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="localnet">
        <WalletProviderWrapper>
          {children}
        </WalletProviderWrapper>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}

