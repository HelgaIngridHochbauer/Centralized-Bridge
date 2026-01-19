'use client';

import { useEffect, useState } from 'react';
import { BridgeInterface } from './BridgeInterface';

/**
 * Wrapper component that ensures BridgeInterface only renders
 * after WalletProvider is mounted and ready
 */
export function BridgeInterfaceWrapper() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Wait longer to ensure WalletProvider is fully mounted and ready
    const timer = setTimeout(() => {
      setMounted(true);
    }, 300); // Increased delay to ensure provider initialization
    
    return () => clearTimeout(timer);
  }, []);

  // Show loading state until mounted (WalletProvider is ready)
  if (!mounted) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-sm border border-rose-100 p-8">
          <p className="text-center text-rose-600 font-light">
            Initializing...
          </p>
        </div>
      </div>
    );
  }

  // Now WalletProvider should be ready, safe to render BridgeInterface
  return <BridgeInterface />;
}
