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
  // Add escrow functionality
  createEscrowWallet: (gameId: string) => Promise<string>;
  sendToEscrow: (gameId: string, escrowAddress: string, amount: number) => Promise<any>;
  releaseEscrow: (gameId: string, escrowAddress: string, winnerAddress: string) => Promise<any>;
  getEscrowBalance: (escrowAddress: string) => Promise<number>;
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
  error: null,
  // Add escrow defaults
  createEscrowWallet: async () => '',
  sendToEscrow: async () => ({}),
  releaseEscrow: async () => ({}),
  getEscrowBalance: async () => 0
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
  // Map to keep track of escrow wallets
  const [escrowWallets, setEscrowWallets] = useState<Record<string, string>>({});

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

  // Create a new escrow wallet for a game
  const createEscrowWallet = async (gameId: string): Promise<string> => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log(`Creating escrow wallet for game: ${gameId}`);
      
      // Check if we already have an escrow wallet for this game
      if (escrowWallets[gameId]) {
        console.log(`Escrow wallet for game ${gameId} already exists: ${escrowWallets[gameId]}`);
        return escrowWallets[gameId];
      }
      
      // Create a new wallet via Crossmint
      const wallet = await createWallet();
      console.log(`Escrow wallet created for game ${gameId}:`, wallet);
      
      if (!wallet || !wallet.address) {
        throw new Error("Escrow wallet creation failed");
      }
      
      // Store escrow wallet in state
      setEscrowWallets(prev => ({
        ...prev,
        [gameId]: wallet.address
      }));
      
      // Also store in localStorage for persistence
      const storedEscrows = JSON.parse(localStorage.getItem('crossmint_escrows') || '{}');
      storedEscrows[gameId] = wallet.address;
      localStorage.setItem('crossmint_escrows', JSON.stringify(storedEscrows));
      
      return wallet.address;
    } catch (error) {
      console.error('Error creating escrow wallet:', error);
      setError(`Failed to create escrow wallet: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Send funds to an escrow wallet
  const sendToEscrow = async (gameId: string, escrowAddress: string, amount: number): Promise<any> => {
    if (!walletAddress) throw new Error('Wallet not connected');
    
    try {
      setIsLoading(true);
      setError(null);
      
      console.log(`Sending ${amount} SOL to escrow wallet ${escrowAddress} for game ${gameId}`);
      
      // Send the transaction
      const result = await createTransaction(walletAddress, escrowAddress, amount);
      console.log(`Escrow funding result for game ${gameId}:`, result);
      
      // Refresh balance after sending
      await refreshBalance();
      
      return result;
    } catch (error) {
      console.error('Error sending to escrow:', error);
      setError(`Failed to send to escrow: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Release funds from escrow to winner
  const releaseEscrow = async (gameId: string, escrowAddress: string, winnerAddress: string): Promise<any> => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log(`Releasing escrow for game ${gameId} from ${escrowAddress} to winner ${winnerAddress}`);
      
      // Get escrow wallet balance first
      const balances = await getWalletBalance(escrowAddress);
      const solBalance = balances.find(b => b.token.toLowerCase() === 'sol');
      
      if (!solBalance || parseFloat(solBalance.amount) <= 0) {
        throw new Error("Escrow wallet has insufficient balance");
      }
      
      // Send all funds to winner
      const amount = parseFloat(solBalance.amount);
      console.log(`Sending ${amount} SOL from escrow to winner`);
      
      // Use the escrow wallet's address directly to send from it to the winner
      // Note: This requires server-side handling for security
      const response = await fetch(`/api/crossmint/escrow/release`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          escrowAddress,
          winnerAddress,
          amount: amount.toString(),
          gameId
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to release escrow: ${JSON.stringify(errorData)}`);
      }
      
      const result = await response.json();
      
      // Remove escrow from state once released
      setEscrowWallets(prev => {
        const newState = { ...prev };
        delete newState[gameId];
        return newState;
      });
      
      // Also remove from localStorage
      const storedEscrows = JSON.parse(localStorage.getItem('crossmint_escrows') || '{}');
      delete storedEscrows[gameId];
      localStorage.setItem('crossmint_escrows', JSON.stringify(storedEscrows));
      
      return result;
    } catch (error) {
      console.error('Error releasing escrow:', error);
      setError(`Failed to release escrow: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Get balance of escrow wallet
  const getEscrowBalance = async (escrowAddress: string): Promise<number> => {
    try {
      console.log(`Getting balance for escrow wallet: ${escrowAddress}`);
      const balances = await getWalletBalance(escrowAddress);
      const solBalance = balances.find(b => b.token.toLowerCase() === 'sol');
      
      if (solBalance) {
        const amount = parseFloat(solBalance.amount);
        console.log(`Escrow wallet has ${amount} SOL`);
        return amount;
      }
      
      return 0;
    } catch (error) {
      console.error('Error getting escrow balance:', error);
      return 0;
    }
  };

  // Load escrow wallets from localStorage
  useEffect(() => {
    try {
      const storedEscrows = JSON.parse(localStorage.getItem('crossmint_escrows') || '{}');
      setEscrowWallets(storedEscrows);
      console.log("Loaded escrow wallets from storage:", storedEscrows);
    } catch (error) {
      console.error("Error loading escrow wallets:", error);
    }
  }, []);

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
    error,
    // Add escrow functions
    createEscrowWallet,
    sendToEscrow, 
    releaseEscrow,
    getEscrowBalance
  };

  return (
    <CrossmintWalletContext.Provider value={contextValue}>
      {children}
    </CrossmintWalletContext.Provider>
  );
};

export default CrossmintWalletProvider; 