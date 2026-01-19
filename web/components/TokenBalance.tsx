'use client';

interface TokenBalanceProps {
  chain: string;
  balance: string;
  symbol: string;
}

export function TokenBalance({ chain, balance, symbol }: TokenBalanceProps) {
  const balanceNum = parseFloat(balance);
  const displayBalance = isNaN(balanceNum) ? '0' : balanceNum.toLocaleString(undefined, { maximumFractionDigits: 4 });
  
  return (
    <div className="border border-rose-100 rounded-2xl p-5 bg-gradient-to-br from-white to-rose-50/30">
      <h3 className="font-light text-rose-900 text-lg mb-2">{chain}</h3>
      <p className="text-3xl font-light text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-pink-500">
        {displayBalance} {symbol}
      </p>
    </div>
  );
}

