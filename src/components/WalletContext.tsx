import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider, useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
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

// Inner provider that has access to wallet hooks
const InnerWalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const [isDevnet, setIsDevnet] = useState<boolean>(true);
  
  // Function to fetch wallet balance
  const fetchBalance = async () => {
    if (publicKey && connection) {
      try {
        console.log("Fetching wallet balance for", publicKey.toString());
        const walletBalance = await connection.getBalance(publicKey);
        const solBalance = walletBalance / LAMPORTS_PER_SOL;
        console.log(`Wallet balance: ${solBalance} SOL (devnet)`);
        setBalance(solBalance);
      } catch (error) {
        console.error('Error fetching balance:', error);
      }
    } else {
      setBalance(null);
    }
  };
  
  // Fetch balance when wallet connects or changes
  useEffect(() => {
    if (connected && publicKey) {
      fetchBalance();
      
      // Set up interval to refresh balance every 15 seconds
      const intervalId = setInterval(fetchBalance, 15000);
      
      // Clean up interval when component unmounts
      return () => clearInterval(intervalId);
    } else {
      setBalance(null);
    }
  }, [connected, publicKey, connection]);
  
  return (
    <WalletStatusContext.Provider value={{ balance, network: 'devnet', isDevnet }}>
      {children}
    </WalletStatusContext.Provider>
  );
};

export default function WalletContextProvider({ children }: { children: ReactNode }) {
  // Always use devnet for this application
  const network = WalletAdapterNetwork.Devnet;
  
  // Solana RPC endpoint - prefer the one from env vars, fallback to clusterApiUrl
  const endpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl(network);
  
  // For the wallet adapter - add more wallet options
  const wallets = [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
  ];
  
  // Log connection info on startup
  useEffect(() => {
    console.log(`Connecting to Solana ${network} at:`, endpoint);
    
    // Simple check if we're on devnet
    if (endpoint.includes('devnet')) {
      console.log('Confirmed running on devnet');
    } else {
      console.warn('WARNING: Not running on devnet! This app is designed for devnet only.');
    }
  }, [endpoint, network]);
  
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={true}>
        <WalletModalProvider>
          <InnerWalletProvider>
            {children}
          </InnerWalletProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
} 