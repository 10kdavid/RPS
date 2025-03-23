import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import {
  ConnectionProvider,
  WalletProvider as SolanaWalletProvider,
  useConnection,
  useWallet as useSolanaWallet
} from '@solana/wallet-adapter-react';
import { WalletModalProvider, useWalletModal } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
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
}

// Create context with default values
const WalletContext = createContext<WalletContextValue>({
  balance: 0,
  connected: false,
  publicKey: null,
  connectWallet: async () => {},
  disconnectWallet: async () => {},
  openWalletModal: () => {}
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

  // Fetch wallet balance whenever the wallet is connected
  useEffect(() => {
    if (wallet.publicKey && connection) {
      const fetchBalance = async () => {
        try {
          const walletBalance = await connection.getBalance(wallet.publicKey!);
          setBalance(walletBalance / LAMPORTS_PER_SOL); // Convert lamports to SOL
        } catch (error) {
          console.error('Error fetching balance:', error);
          setBalance(0);
        }
      };

      fetchBalance();

      // Set up interval to update balance every 15 seconds
      const intervalId = setInterval(fetchBalance, 15000);

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
    openWalletModal
  };

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
};

// Wallet provider wrapper component
export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Set up Solana network (Use mainnet-beta for production)
  const network = clusterApiUrl('mainnet-beta');

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