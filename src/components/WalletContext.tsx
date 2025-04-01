import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl, Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';

// Default styles from Solana
require('@solana/wallet-adapter-react-ui/styles.css');

type WalletContextType = {
  balance: number | null;
  network: string;
  isDevnet: boolean;
};

const WalletStatusContext = createContext<WalletContextType>({
  balance: null,
  network: 'devnet',
  isDevnet: true,
});

export const useWalletStatus = () => useContext(WalletStatusContext);

export default function WalletContextProvider({ children }: { children: ReactNode }) {
  // Always use devnet for this application
  const network = WalletAdapterNetwork.Devnet;
  
  // State for balance and network display
  const [balance, setBalance] = useState<number | null>(null);
  const [isDevnet, setIsDevnet] = useState<boolean>(true);
  
  // Solana RPC endpoint - prefer the one from env vars, fallback to clusterApiUrl
  const endpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl(network);
  
  // For the wallet adapter
  const wallets = [new PhantomWalletAdapter()];
  
  // Log connection info on startup
  useEffect(() => {
    console.log(`Connecting to Solana ${network} at:`, endpoint);
    
    // Simple check if we're on devnet
    if (endpoint.includes('devnet')) {
      setIsDevnet(true);
      console.log('Confirmed running on devnet');
    } else {
      setIsDevnet(false);
      console.warn('WARNING: Not running on devnet! This app is designed for devnet only.');
    }
  }, [endpoint, network]);
  
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={true}>
        <WalletModalProvider>
          <WalletStatusContext.Provider value={{ balance, network: 'devnet', isDevnet }}>
            {children}
          </WalletStatusContext.Provider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
} 