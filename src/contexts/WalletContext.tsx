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

// Define Helius RPC URL with API key
const HELIUS_RPC_URL = 'https://mainnet.helius-rpc.com/?api-key=3b6552f4-0ce5-4800-b8b6-a1cc7480d494';
// Define proxy RPC URL
const PROXY_RPC_URL = '/api/solana/rpc';

// Create a custom connection that uses our proxy
class ProxyConnection extends Connection {
  constructor() {
    // Initialize with Helius URL but we'll override the fetch behavior
    super(HELIUS_RPC_URL, 'confirmed');
  }

  async sendRpcRequest(method: string, params: any[]): Promise<any> {
    try {
      console.log(`Sending RPC request via proxy: ${method}`, params);
      const response = await fetch(PROXY_RPC_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: Date.now(),
          method,
          params,
        }),
      });

      if (!response.ok) {
        throw new Error(`RPC request failed: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`Proxy RPC response:`, data);
      
      if (data.error) {
        throw new Error(`RPC error: ${JSON.stringify(data.error)}`);
      }

      return data.result;
    } catch (error) {
      console.error('Proxy RPC request failed:', error);
      throw error;
    }
  }

  // Override the getBalance method to use our proxy
  async getBalance(publicKey: any): Promise<number> {
    try {
      // Try the RPC proxy first
      const result = await this.sendRpcRequest('getBalance', [publicKey.toBase58()]);
      console.log(`Raw balance result from proxy:`, result, typeof result);
      
      // Ensure we have a valid number
      if (result === null || result === undefined) {
        console.warn('Received null or undefined balance, trying dedicated balance endpoint');
        return this.getBalanceFromDedicatedEndpoint(publicKey.toBase58());
      }
      
      // Convert to number if it's a string
      const numericResult = typeof result === 'string' ? parseInt(result, 10) : Number(result);
      
      // Check for NaN
      if (isNaN(numericResult)) {
        console.warn(`Invalid balance value resulted in NaN: ${result}, trying dedicated balance endpoint`);
        return this.getBalanceFromDedicatedEndpoint(publicKey.toBase58());
      }
      
      return numericResult;
    } catch (error) {
      console.error('Error getting balance via proxy:', error);
      return this.getBalanceFromDedicatedEndpoint(publicKey.toBase58());
    }
  }
  
  // Helper method to get balance from our dedicated endpoint
  async getBalanceFromDedicatedEndpoint(address: string): Promise<number> {
    try {
      console.log(`Trying dedicated balance endpoint for ${address}`);
      const response = await fetch(`/api/solana/balance/${address}`);
      
      if (!response.ok) {
        throw new Error(`Balance endpoint failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`Dedicated balance endpoint response:`, data);
      
      if (data && typeof data.lamports === 'number') {
        return data.lamports;
      }
      
      throw new Error('Invalid response from balance endpoint');
    } catch (error) {
      console.error('Error getting balance from dedicated endpoint:', error);
      return 0; // Last resort fallback
    }
  }
}

// Initialize our proxy connection
const proxyConnection = new ProxyConnection();

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
    if (wallet.publicKey) {
      try {
        // Try to get balance using our proxy connection
        const walletBalance = await proxyConnection.getBalance(wallet.publicKey);
        console.log("Raw wallet balance from proxy:", walletBalance);
        
        // Safely calculate SOL balance
        const solBalance = (walletBalance && !isNaN(walletBalance)) 
          ? walletBalance / LAMPORTS_PER_SOL 
          : 0;
          
        console.log("LAMPORTS_PER_SOL:", LAMPORTS_PER_SOL);
        console.log("Calculated SOL balance:", solBalance);
        
        setBalance(solBalance);
        console.log("Refreshed balance via proxy:", solBalance);
      } catch (proxyError) {
        console.error('Error refreshing balance via proxy:', proxyError);
        
        try {
          // Fallback to direct connection if proxy fails
          console.log("Proxy failed, trying direct connection");
          const directConnection = new Connection(HELIUS_RPC_URL, 'confirmed');
          const walletBalance = await directConnection.getBalance(wallet.publicKey);
          console.log("Raw wallet balance from direct connection:", walletBalance);
          
          // Safely calculate SOL balance
          const solBalance = (walletBalance && !isNaN(walletBalance)) 
            ? walletBalance / LAMPORTS_PER_SOL 
            : 0;
            
          setBalance(solBalance);
          console.log("Refreshed balance via direct connection:", solBalance);
        } catch (directError) {
          console.error('Direct connection also failed:', directError);
          
          try {
            // If all else fails, try the provided connection
            console.log("All direct connections failed, trying provided connection");
            const walletBalance = await connection.getBalance(wallet.publicKey);
            console.log("Raw wallet balance from provided connection:", walletBalance);
            
            // Safely calculate SOL balance
            const solBalance = (walletBalance && !isNaN(walletBalance)) 
              ? walletBalance / LAMPORTS_PER_SOL 
              : 0;
              
            setBalance(solBalance);
            console.log("Refreshed balance via provided connection:", solBalance);
          } catch (error) {
            console.error('All balance refresh attempts failed:', error);
            setBalance(0);
          }
        }
      }
    }
  };

  // Fetch wallet balance whenever the wallet is connected
  useEffect(() => {
    if (wallet.publicKey) {
      const fetchBalance = async () => {
        await refreshBalance();
      };

      fetchBalance();

      // Set up interval to update balance every 10 seconds
      const intervalId = setInterval(fetchBalance, 10000);

      return () => clearInterval(intervalId);
    } else {
      setBalance(0);
    }
  }, [wallet.publicKey, wallet.connected]);

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
  // Use the Helius RPC endpoint for the main connection
  const network = HELIUS_RPC_URL;
  
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