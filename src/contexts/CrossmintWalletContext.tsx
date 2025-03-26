import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { 
  createWallet, 
  getWalletBalance, 
  createTransaction,
  getTransactionHistory
} from './crossmint/api';

// Define wallet context interface
export interface CrossmintWalletContextValue {
  balance: number;
  usdcBalance: number;
  connected: boolean;
  walletAddress: string | null;
  connectWallet: () => Promise<void>;
  createNewWallet: () => Promise<void>;
  refreshBalance: () => Promise<void>;
  sendTransaction: (toAddress: string, amount: number) => Promise<any>;
  getHistory: () => Promise<any[]>;
  isLoading: boolean;
  error: string | null;
}

// Create context with default values
const CrossmintWalletContext = createContext<CrossmintWalletContextValue>({
  balance: 0,
  usdcBalance: 0,
  connected: false,
  walletAddress: null,
  connectWallet: async () => {},
  createNewWallet: async () => {},
  refreshBalance: async () => {},
  sendTransaction: async () => ({}),
  getHistory: async () => [],
  isLoading: false,
  error: null
});

// Create hook for using the wallet context
export const useCrossmintWallet = () => useContext(CrossmintWalletContext);

// Wallet context provider component
export const CrossmintWalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [balance, setBalance] = useState<number>(0);
  const [usdcBalance, setUsdcBalance] = useState<number>(0);
  const [connected, setConnected] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load wallet from local storage on mount
  useEffect(() => {
    const loadSavedWallet = async () => {
      try {
        const savedWallet = localStorage.getItem('crossmint_wallet');
        if (savedWallet) {
          console.log("Found saved wallet in localStorage:", savedWallet);
          const wallet = JSON.parse(savedWallet);
          setWalletAddress(wallet.address);
          setConnected(true);
          await refreshBalance();
        }
      } catch (error) {
        console.error("Error loading wallet from localStorage:", error);
        setError("Failed to load saved wallet");
      }
    };
    
    loadSavedWallet();
  }, []);

  // Connect existing wallet
  const connectWallet = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Ask user for wallet address
      const address = window.prompt('Enter your Solana wallet address or type "new" to create a new wallet');
      
      if (!address) {
        setIsLoading(false);
        return;
      }
      
      if (address.toLowerCase() === 'new') {
        await createNewWallet();
        return;
      }
      
      console.log("Connecting to wallet address:", address);
      
      // Save to local storage
      localStorage.setItem('crossmint_wallet', JSON.stringify({ address }));
      
      // Set state
      setWalletAddress(address);
      setConnected(true);
      
      // Get balance
      await refreshBalance();
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setError(`Failed to connect wallet: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new wallet
  const createNewWallet = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log("Creating new Crossmint wallet...");
      const wallet = await createWallet();
      console.log("Wallet created successfully:", wallet);
      
      if (!wallet || !wallet.address) {
        throw new Error("Wallet creation failed - no address returned");
      }
      
      // Save to local storage
      localStorage.setItem('crossmint_wallet', JSON.stringify({ address: wallet.address }));
      
      // Set state
      setWalletAddress(wallet.address);
      setConnected(true);
      
      // Show the wallet address to user
      alert(`Your new wallet address: ${wallet.address}\nPlease save this address for future reference.`);
      
      // Set initial balance
      setBalance(0);
      setUsdcBalance(0);
    } catch (error) {
      console.error('Error creating wallet:', error);
      setError(`Failed to create wallet: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to manually refresh the balance
  const refreshBalance = async (): Promise<void> => {
    if (!walletAddress) {
      console.warn("Cannot refresh balance: no wallet address");
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      console.log(`Refreshing balance for wallet: ${walletAddress}`);
      const balances = await getWalletBalance(walletAddress);
      console.log("Received balances:", balances);
      
      if (!balances || balances.length === 0) {
        console.warn("No balances returned from API");
        setBalance(0);
        setUsdcBalance(0);
        return;
      }
      
      // Find SOL balance
      const solBalance = balances.find(b => b.token.toLowerCase() === 'sol');
      if (solBalance) {
        console.log("Found SOL balance:", solBalance.amount);
        setBalance(parseFloat(solBalance.amount));
      } else {
        console.warn("No SOL balance found");
        setBalance(0);
      }
      
      // Find USDC balance
      const usdc = balances.find(b => b.token.toLowerCase() === 'usdc');
      if (usdc) {
        console.log("Found USDC balance:", usdc.amount);
        setUsdcBalance(parseFloat(usdc.amount));
      } else {
        console.warn("No USDC balance found");
        setUsdcBalance(0);
      }
    } catch (error) {
      console.error('Error refreshing balance:', error);
      setError(`Failed to refresh balance: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Send a transaction
  const sendTransaction = async (toAddress: string, amount: number): Promise<any> => {
    if (!walletAddress) throw new Error('Wallet not connected');
    
    try {
      setIsLoading(true);
      setError(null);
      
      console.log(`Sending ${amount} SOL to ${toAddress}`);
      const result = await createTransaction(walletAddress, toAddress, amount);
      console.log("Transaction result:", result);
      
      await refreshBalance();
      return result;
    } catch (error) {
      console.error('Error sending transaction:', error);
      setError(`Failed to send transaction: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Get transaction history
  const getHistory = async (): Promise<any[]> => {
    if (!walletAddress) return [];
    
    try {
      setIsLoading(true);
      setError(null);
      
      console.log(`Getting transaction history for wallet: ${walletAddress}`);
      const history = await getTransactionHistory(walletAddress);
      console.log("Transaction history:", history);
      
      return history;
    } catch (error) {
      console.error('Error getting transaction history:', error);
      setError(`Failed to get transaction history: ${error instanceof Error ? error.message : String(error)}`);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Set up automatic balance refresh
  useEffect(() => {
    if (connected && walletAddress) {
      console.log("Setting up automatic balance refresh");
      
      // Refresh immediately on connection
      refreshBalance();
      
      // Set up interval to update balance every 30 seconds
      const intervalId = setInterval(refreshBalance, 30000);
      return () => clearInterval(intervalId);
    }
  }, [connected, walletAddress]);

  // Create context value object
  const contextValue: CrossmintWalletContextValue = {
    balance,
    usdcBalance,
    connected,
    walletAddress,
    connectWallet,
    createNewWallet,
    refreshBalance,
    sendTransaction,
    getHistory,
    isLoading,
    error
  };

  return (
    <CrossmintWalletContext.Provider value={contextValue}>
      {children}
    </CrossmintWalletContext.Provider>
  );
};

export default CrossmintWalletProvider; 