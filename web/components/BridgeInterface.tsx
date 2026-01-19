'use client';

import { useState, useEffect, useCallback } from 'react';
import { useCurrentWallet, useConnectWallet, useDisconnectWallet, useWallets } from '@mysten/dapp-kit';
import { ethers } from 'ethers';
import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import { WalletConnector } from './WalletConnector';
import { BridgeForm } from './BridgeForm';
import { TokenBalance } from './TokenBalance';

// Contract addresses - IMPORTANT: Update these after each deployment!
const ETH_IBT_ADDRESS = process.env.NEXT_PUBLIC_ETH_IBT_ADDRESS || '0x0165878A594ca255338adfa4d48449f69242Eb8F';
const SUI_PACKAGE_ID = process.env.NEXT_PUBLIC_SUI_PACKAGE_ID || '0x15acb438665830a0f57a5615b3f9b3a123b79936505864cf49c224e294a51f39';
const ETH_RPC_URL = process.env.NEXT_PUBLIC_ETH_RPC_URL || 'http://127.0.0.1:8545';
const ETH_CHAIN_ID = 31337;

// Debug: Log configuration on load
if (typeof window !== 'undefined') {
  console.log('=== Bridge Configuration ===');
  console.log('ETH Contract:', ETH_IBT_ADDRESS);
  console.log('SUI Package:', SUI_PACKAGE_ID);
}

function getSuiRpcUrl(): string {
  if (process.env.NEXT_PUBLIC_SUI_RPC_URL) {
    return process.env.NEXT_PUBLIC_SUI_RPC_URL;
  }
  try {
    return getFullnodeUrl('localnet');
  } catch {
    return 'http://127.0.0.1:9000';
  }
}

const SUI_RPC_URL = getSuiRpcUrl();

export function BridgeInterface() {
  const walletData = useCurrentWallet();
  const currentWallet = walletData?.currentWallet ?? null;
  const isSuiConnected = walletData?.isConnected ?? false;
  
  const { mutate: connectWallet } = useConnectWallet();
  const { mutate: disconnectWallet } = useDisconnectWallet();
  const wallets = useWallets();
  
  const [ethProvider, setEthProvider] = useState<ethers.BrowserProvider | null>(null);
  const [ethSigner, setEthSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [ethAddress, setEthAddress] = useState<string>('');
  const [isEthConnected, setIsEthConnected] = useState(false);
  const [ethBalance, setEthBalance] = useState<string>('0');
  const [suiBalance, setSuiBalance] = useState<string>('0');

  const connectEthereum = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert('Please install MetaMask browser extension!');
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (!accounts || accounts.length === 0) {
        alert('Please unlock your MetaMask wallet and try again.');
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${ETH_CHAIN_ID.toString(16)}` }],
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: `0x${ETH_CHAIN_ID.toString(16)}`,
                chainName: 'Local Anvil',
                nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
                rpcUrls: [ETH_RPC_URL],
                blockExplorerUrls: [],
              }],
            });
          } catch (addError) {
            console.error('Error adding network:', addError);
            alert('Failed to add local network. Please add it manually in MetaMask.');
            return;
          }
        }
      }

      setEthProvider(provider);
      setEthSigner(signer);
      setEthAddress(address);
      setIsEthConnected(true);
      await updateEthBalance(provider, address);
    } catch (error: any) {
      console.error('Error connecting to Ethereum:', error);
      if (error.code === 4001) {
        alert('Connection rejected. Please approve the connection request in MetaMask.');
      } else {
        alert(`Failed to connect to Ethereum wallet: ${error.message || 'Unknown error'}`);
      }
    }
  };

  const connectSui = useCallback(() => {
    console.log('Connect button clicked');
    console.log('Wallets available:', wallets);
    console.log('Already connected:', isSuiConnected);
    
    if (!wallets || wallets.length === 0) {
      console.error('No wallets found');
      alert('No Sui wallet detected! Please install a Sui wallet extension and refresh this page.');
      return;
    }
    
    let targetWallet = wallets.find(w => 
      w.name?.toLowerCase().includes('sui') || 
      w.name?.toLowerCase().includes('suiet') ||
      w.name?.toLowerCase().includes('slush')
    );
    
    if (!targetWallet) {
      targetWallet = wallets[0];
    }
    
    console.log('Attempting to connect to wallet:', targetWallet.name);
    
    connectWallet(
      { wallet: targetWallet },
      {
        onSuccess: () => {
          console.log('Connection successful');
        },
        onError: (error) => {
          console.error('Connection error:', error);
          alert('Failed to connect: ' + error.message);
        }
      }
    );
  }, [connectWallet, wallets, isSuiConnected]);

  const disconnectSui = useCallback(() => {
    disconnectWallet();
  }, [disconnectWallet]);

  const updateEthBalance = useCallback(async (provider: ethers.BrowserProvider, address: string) => {
    console.log('=== Fetching ETH Balance ===');
    console.log('Contract address:', ETH_IBT_ADDRESS);
    console.log('User address:', address);
    
    if (!ETH_IBT_ADDRESS) {
      console.error('No ETH_IBT_ADDRESS configured');
      return;
    }
    
    try {
      const abi = [
        'function balanceOf(address owner) view returns (uint256)',
        'function decimals() view returns (uint8)',
      ];
      const contract = new ethers.Contract(ETH_IBT_ADDRESS, abi, provider);
      const balance = await contract.balanceOf(address);
      const decimals = await contract.decimals();
      const formattedBalance = ethers.formatUnits(balance, decimals);
      console.log('ETH IBT Balance:', formattedBalance);
      setEthBalance(formattedBalance);
    } catch (error) {
      console.error('Error fetching ETH balance:', error);
      setEthBalance('Error');
    }
  }, []);

  const updateSuiBalance = useCallback(async () => {
    console.log('=== Fetching Sui Balance ===');
    console.log('Package ID:', SUI_PACKAGE_ID);
    console.log('Is connected:', isSuiConnected);
    console.log('Current wallet:', currentWallet?.name);
    
    if (!isSuiConnected || !currentWallet || !SUI_PACKAGE_ID) {
      console.log('Not fetching - missing requirements');
      setSuiBalance('0');
      return;
    }
    
    try {
      const suiAddress = currentWallet.accounts[0]?.address;
      console.log('Sui address:', suiAddress);
      
      if (!suiAddress) {
        setSuiBalance('0');
        return;
      }

      const client = new SuiClient({ url: SUI_RPC_URL });
      const coinType = `${SUI_PACKAGE_ID}::ibt::IBT`;
      console.log('Coin type:', coinType);
      
      try {
        const coins = await client.getCoins({
          owner: suiAddress,
          coinType: coinType,
        });
        
        console.log('Coins found:', coins.data.length);
        
        let totalBalance = 0;
        for (const coin of coins.data) {
          totalBalance += parseInt(coin.balance || '0');
        }
        
        const formattedBalance = (totalBalance / 1e9).toString();
        console.log('Sui IBT Balance:', formattedBalance);
        setSuiBalance(formattedBalance);
      } catch (error) {
        console.error('Error fetching Sui coins:', error);
        setSuiBalance('0');
      }
    } catch (error) {
      console.error('Error fetching Sui balance:', error);
      setSuiBalance('0');
    }
  }, [isSuiConnected, currentWallet]);

  useEffect(() => {
    if (isSuiConnected) {
      updateSuiBalance();
      const interval = setInterval(updateSuiBalance, 5000);
      return () => clearInterval(interval);
    }
  }, [isSuiConnected, updateSuiBalance]);

  useEffect(() => {
    if (ethProvider && ethAddress) {
      updateEthBalance(ethProvider, ethAddress);
      const interval = setInterval(() => updateEthBalance(ethProvider, ethAddress), 5000);
      return () => clearInterval(interval);
    }
  }, [ethProvider, ethAddress, updateEthBalance]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-sm border border-rose-100 p-8 mb-6">
        <h2 className="text-xl font-light mb-6 text-rose-800">
          Wallet Connections
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <WalletConnector
            chain="Ethereum"
            isConnected={isEthConnected}
            address={ethAddress}
            onConnect={connectEthereum}
            onDisconnect={() => {
              setIsEthConnected(false);
              setEthAddress('');
              setEthProvider(null);
              setEthSigner(null);
            }}
          />
          <WalletConnector
            chain="Sui"
            isConnected={isSuiConnected}
            address={currentWallet?.accounts?.[0]?.address || ''}
            onConnect={connectSui}
            onDisconnect={disconnectSui}
          />
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-sm border border-rose-100 p-8 mb-6">
        <h2 className="text-xl font-light mb-6 text-rose-800">
          Token Balances
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TokenBalance chain="Ethereum" balance={ethBalance} symbol="IBT" />
          <TokenBalance chain="Sui" balance={suiBalance} symbol="IBT" />
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-sm border border-rose-100 p-8">
        <BridgeForm
          ethSigner={ethSigner}
          ethAddress={ethAddress}
          isEthConnected={isEthConnected}
          isSuiConnected={isSuiConnected}
          suiAddress={currentWallet?.accounts[0]?.address || ''}
          onBridgeComplete={async () => {
            if (ethProvider && ethAddress) {
              await updateEthBalance(ethProvider, ethAddress);
            }
            await updateSuiBalance();
          }}
        />
      </div>
    </div>
  );
}

declare global {
  interface Window {
    ethereum?: any;
  }
}
