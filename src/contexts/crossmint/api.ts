// Crossmint API client - using server-side proxy

// Define interfaces
interface WalletResponse {
  id: string;
  address: string;
  type: string;
  createdAt: string;
}

interface BalanceResponse {
  chain: string;
  token: string;
  amount: string;
  usdValue: number;
}

// Perform API call with proper error handling
async function callProxyAPI(endpoint: string, options: RequestInit = {}) {
  try {
    console.log(`Calling proxy API: ${endpoint}`);
    
    const response = await fetch(endpoint, options);
    
    // Log the response status
    console.log(`API Response Status: ${response.status}`);
    
    if (!response.ok) {
      // Try to get detailed error message
      let errorText = '';
      try {
        const errorData = await response.json();
        errorText = JSON.stringify(errorData);
      } catch (e) {
        errorText = response.statusText;
      }
      
      throw new Error(`API Error (${response.status}): ${errorText}`);
    }
    
    const data = await response.json();
    console.log('API Response Data:', data);
    return data;
  } catch (error) {
    console.error('API Call Failed:', error);
    throw error;
  }
}

// Create a new wallet
export const createWallet = async (): Promise<WalletResponse> => {
  return callProxyAPI('/api/crossmint/wallet', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }
  });
};

// Get wallet balance
export const getWalletBalance = async (walletAddress: string): Promise<BalanceResponse[]> => {
  const data = await callProxyAPI(`/api/crossmint/balance/${walletAddress}?tokens=sol,usdc&chains=solana-mainnet`);
  
  // Return empty array if balances isn't defined
  return data.balances || [];
};

// Create a transaction
export const createTransaction = async (
  walletAddress: string, 
  toAddress: string, 
  amount: number
): Promise<any> => {
  return callProxyAPI(`/api/crossmint/transactions/${walletAddress}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      toAddress,
      amount: amount.toString(),
      token: 'sol',
      chain: 'solana-mainnet',
    }),
  });
};

// Get transaction history
export const getTransactionHistory = async (walletAddress: string): Promise<any[]> => {
  const data = await callProxyAPI(`/api/crossmint/transactions/${walletAddress}`);
  return data.transactions || [];
}; 