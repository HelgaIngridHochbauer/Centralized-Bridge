'use client';

import { useState } from 'react';
import { ethers } from 'ethers';
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';

interface BridgeFormProps {
  ethSigner: ethers.JsonRpcSigner | null;
  ethAddress: string;
  isEthConnected: boolean;
  isSuiConnected: boolean;
  suiAddress: string;
  onBridgeComplete: () => void;
}

// IMPORTANT: Update these after each deployment!
const ETH_IBT_ADDRESS = process.env.NEXT_PUBLIC_ETH_IBT_ADDRESS || '0x0165878A594ca255338adfa4d48449f69242Eb8F';
const SUI_PACKAGE_ID = process.env.NEXT_PUBLIC_SUI_PACKAGE_ID || '0x15acb438665830a0f57a5615b3f9b3a123b79936505864cf49c224e294a51f39';
const SUI_TREASURY_CAP = process.env.NEXT_PUBLIC_SUI_TREASURY_CAP || '0xab92f066eb1d48101d80d5026c18d5a511affd8f1f18353f26b04c0d802174c7';

export function BridgeForm({
  ethSigner,
  ethAddress,
  isEthConnected,
  isSuiConnected,
  suiAddress,
  onBridgeComplete,
}: BridgeFormProps) {
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const [amount, setAmount] = useState('');
  const [direction, setDirection] = useState<'ethereum-to-sui' | 'sui-to-ethereum'>('ethereum-to-sui');
  const [isBridging, setIsBridging] = useState(false);

  const handleBridge = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (direction === 'ethereum-to-sui') {
      if (!isEthConnected || !ethSigner) {
        alert('Please connect your Ethereum wallet');
        return;
      }
      await bridgeFromEthereumToSui(amount);
    } else {
      if (!isSuiConnected) {
        alert('Please connect your Sui wallet');
        return;
      }
      await bridgeFromSuiToEthereum(amount);
    }
  };

  const bridgeFromEthereumToSui = async (amountStr: string) => {
    if (!ethSigner || !ETH_IBT_ADDRESS) {
      alert('Ethereum wallet not connected');
      return;
    }
    if (!isSuiConnected || !suiAddress) {
      alert('Please connect your Sui wallet first!');
      return;
    }

    setIsBridging(true);
    try {
      // Step 1: Burn tokens on Ethereum
      console.log('Step 1: Burning tokens on Ethereum...');
      const abi = [
        'function burnOwn(uint256 amount)',
        'function decimals() view returns (uint8)',
      ];
      const contract = new ethers.Contract(ETH_IBT_ADDRESS, abi, ethSigner);
      const decimals = await contract.decimals();
      const amountWei = ethers.parseUnits(amountStr, decimals);

      const tx = await contract.burnOwn(amountWei);
      console.log('Ethereum burn transaction sent:', tx.hash);
      await tx.wait();
      console.log('Ethereum burn confirmed!');

      // Step 2: Mint tokens on Sui
      // Note: Your Slush wallet must own the TreasuryCap for this to work
      console.log('Step 2: Minting tokens on Sui...');
      const amountSui = Math.floor(parseFloat(amountStr) * 1e9);
      
      const tx2 = new Transaction();
      tx2.moveCall({
        target: `${SUI_PACKAGE_ID}::ibt::mint`,
        arguments: [
          tx2.object(SUI_TREASURY_CAP),
          tx2.pure.u64(amountSui),
          tx2.pure.address(suiAddress),
        ],
      });

      const suiResult = await signAndExecuteTransaction({
        transaction: tx2,
      });

      console.log('Sui mint successful!', suiResult);
      alert(
        `🎉 Bridge successful!\n\n` +
        `Burned on Ethereum: ${tx.hash}\n` +
        `Minted on Sui: ${suiResult.digest}\n\n` +
        `${amountStr} IBT transferred from Ethereum to Sui!`
      );
      
      onBridgeComplete();
    } catch (error: any) {
      console.error('Bridge error details:', error);
      alert(`Bridge failed: ${error.message || error.toString()}`);
    } finally {
      setIsBridging(false);
    }
  };

  const bridgeFromSuiToEthereum = async (amountStr: string) => {
    if (!isSuiConnected || !SUI_PACKAGE_ID || !SUI_TREASURY_CAP) {
      alert('Please connect your Sui wallet and ensure contract addresses are configured');
      return;
    }

    setIsBridging(true);
    try {
      const amount = Math.floor(parseFloat(amountStr) * 1e9);
      
      const txb = new Transaction();
      
      // For a centralized bridge, the deployer (treasury cap holder) burns tokens
      // This is a simplified version - in production, users would transfer to a bridge contract
      // which then burns them
      
      // Since we can't directly burn user's tokens without their approval in Move,
      // we'll show a message that this requires the deployer to handle
      // In a production bridge, you'd have a bridge contract that users transfer to
      
      alert(`Sui to Ethereum bridging:\n\n` +
            `Amount: ${amountStr} IBT\n\n` +
            `In a production bridge, you would:\n` +
            `1. Transfer tokens to bridge contract\n` +
            `2. Bridge contract burns tokens\n` +
            `3. Relayer mints on Ethereum\n\n` +
            `For this demo, the deployer can manually handle the burn/mint.`);
      
      // In a real implementation with a bridge contract:
      // txb.moveCall({
      //   target: `${SUI_PACKAGE_ID}::bridge::burn_for_bridge`,
      //   arguments: [txb.object(SUI_TREASURY_CAP), txb.pure(amount)],
      // });
      // await signAndExecuteTransactionBlock({ transactionBlock: txb });
      
      onBridgeComplete();
    } catch (error: any) {
      console.error('Bridge error:', error);
      alert(`Bridge failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsBridging(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-light mb-6 text-rose-800">
        Bridge Tokens
      </h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-light text-rose-700 mb-3">
            Direction
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => setDirection('ethereum-to-sui')}
              className={`flex-1 px-5 py-3 rounded-xl font-light transition-all ${
                direction === 'ethereum-to-sui'
                  ? 'bg-gradient-to-r from-rose-400 to-pink-400 text-white shadow-sm'
                  : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
              }`}
            >
              Ethereum → Sui
            </button>
            <button
              onClick={() => setDirection('sui-to-ethereum')}
              className={`flex-1 px-5 py-3 rounded-xl font-light transition-all ${
                direction === 'sui-to-ethereum'
                  ? 'bg-gradient-to-r from-rose-400 to-pink-400 text-white shadow-sm'
                  : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
              }`}
            >
              Sui → Ethereum
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-light text-rose-700 mb-3">
            Amount (IBT)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            step="0.0001"
            min="0"
            className="w-full px-5 py-3 border border-rose-200 rounded-xl bg-white text-rose-900 placeholder-rose-300 focus:ring-2 focus:ring-rose-300 focus:border-transparent font-light text-lg transition-all"
          />
        </div>

        <button
          onClick={handleBridge}
          disabled={isBridging || !amount}
          className="w-full px-6 py-4 bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white font-light text-lg rounded-xl transition-all shadow-md hover:shadow-lg"
        >
          {isBridging ? 'Bridging...' : 'Bridge Tokens'}
        </button>

        <div className="mt-6 p-4 bg-rose-50 border border-rose-100 rounded-xl">
          <p className="text-sm text-rose-600 font-light">
            <span className="font-normal">Note:</span> This is a centralized bridge. In production, a relayer service would handle cross-chain communication.
          </p>
        </div>
      </div>
    </div>
  );
}

