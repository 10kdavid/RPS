import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import {
  ConnectionProvider,
  WalletProvider as SolanaWalletProvider,
  useConnection,
  useWallet as useSolanaWallet
} from '@solana/wallet-adapter-react';
import { WalletModalProvider, useWalletModal } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl, Connection } from '@solana/web3.js';
import { 
  PhantomWalletAdapter, 
  SolflareWalletAdapter, 
  TorusWalletAdapter
} from '@solana/wallet-adapter-wallets';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

// Import wallet adapter CSS
require('@solana/wallet-adapter-react-ui/styles.css');

// Define wallet context interface
export interface WalletContextValue {
  balance: number;
  connected: boolean;
  publicKey: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  openWalletModal: () => void;
  refreshBalance: () => Promise<void>;
}

// Create context with default values
const WalletContext = createContext<WalletContextValue>({
  balance: 0,
  connected: false,
  publicKey: null,
  connectWallet: async () => {},
  disconnectWallet: async () => {},
  openWalletModal: () => {},
  refreshBalance: async () => {}
});

// Create hook for using the wallet context
export const useWallet = () => useContext(WalletContext);

// Wallet context provider component
export const WalletContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { connection } = useConnection();
  const wallet = useSolanaWallet();
  const { setVisible } = useWalletModal();
  const [balance, setBalance] = useState<number>(0);

  // Connect wallet function
  const connectWallet = async (): Promise<void> => {
    try {
      // Open the wallet modal to let user select a wallet
      setVisible(true);
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  // Disconnect wallet function
  const disconnectWallet = async (): Promise<void> => {
    try {
      await wallet.disconnect();
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  // Function to open wallet modal
  const openWalletModal = () => {
    setVisible(true);
  };

  // Function to manually refresh the balance
  const refreshBalance = async (): Promise<void> => {
    if (wallet.publicKey && connection) {
      try {
        // Create a direct connection to Solana mainnet for this specific call
        const directConnection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
        
        // Try both connections to get balance
        let walletBalance;
        try {
          walletBalance = await connection.getBalance(wallet.publicKey);
        } catch (err) {
          console.log("Primary connection failed, trying direct connection");
          walletBalance = await directConnection.getBalance(wallet.publicKey);
        }
        
        const solBalance = walletBalance / LAMPORTS_PER_SOL;
        setBalance(solBalance);
        console.log("Refreshed balance:", solBalance);
      } catch (error) {
        console.error('Error refreshing balance:', error);
      }
    }
  };

  // Fetch wallet balance whenever the wallet is connected
  useEffect(() => {
    if (wallet.publicKey && connection) {
      const fetchBalance = async () => {
        try {
          // Create a direct connection to Solana mainnet for this specific call
          const directConnection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
          
          // Try both connections to get balance
          let walletBalance;
          try {
            walletBalance = await connection.getBalance(wallet.publicKey!);
          } catch (err) {
            console.log("Primary connection failed, trying direct connection");
            walletBalance = await directConnection.getBalance(wallet.publicKey!);
          }
          
          const solBalance = walletBalance / LAMPORTS_PER_SOL;
          setBalance(solBalance);
          console.log("Updated balance:", solBalance);
        } catch (error) {
          console.error('Error fetching balance:', error);
          setBalance(0);
        }
      };

      fetchBalance();

      // Set up interval to update balance every 10 seconds
      const intervalId = setInterval(fetchBalance, 10000);

      return () => clearInterval(intervalId);
    } else {
      setBalance(0);
    }
  }, [wallet.publicKey, connection, wallet.connected]);

  // Create context value object
  const contextValue: WalletContextValue = {
    balance,
    connected: wallet.connected,
    publicKey: wallet.publicKey ? wallet.publicKey.toString() : null,
    connectWallet,
    disconnectWallet,
    openWalletModal,
    refreshBalance
  };

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
};

// Wallet provider wrapper component
export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Use the most reliable public Solana RPC endpoint
  const network = 'https://api.mainnet-beta.solana.com';
  
  // Define supported wallet adapters
  const wallets = [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
    new TorusWalletAdapter()
  ];

  return (
    <ConnectionProvider endpoint={network}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <WalletContextProvider>
            {children}
          </WalletContextProvider>
        </WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
};

export default WalletProvider; 