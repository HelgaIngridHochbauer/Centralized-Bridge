'use client';

import { BridgeInterfaceWrapper } from '@/components/BridgeInterfaceWrapper';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-peach-50" style={{backgroundImage: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 25%, #fecdd3 50%, #fed7aa 100%)'}}>
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-light text-rose-800 mb-3 tracking-tight">
            IBT Bridge
          </h1>
          <p className="text-lg text-rose-600 font-light">
            Cross-Chain Token Bridge
          </p>
        </div>
        <BridgeInterfaceWrapper />
      </div>
    </main>
  );
}