import type { NextApiRequest, NextApiResponse } from 'next';

const CROSSMINT_API_KEY = 'sk_production_5YcBgonNBeEhyGBnWLbzgQU1hbJsxtr1GGuX8wSE1M6CgS2q5NuFJc25b5Pn3VXjn9WEj6HwKb65NKJgKV3NuvwQgLx84wpRt5dESVTh24svfFnyzHSNyx9eg1TZpLAHiyAFizeHNTTretuhbkg8AewfS4Qx5QrgoBoRjdsN1qvq3HDvRoNNv66yoKaTQafUoeGievHp8bMPLT1arB2EWsZf';
const CROSSMINT_API_URL = 'https://www.crossmint.com/api';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { address } = req.query;
    
    if (!address || typeof address !== 'string') {
      return res.status(400).json({ error: 'Wallet address is required' });
    }
    
    console.log(`Fetching balance for wallet: ${address}`);
    
    // Define tokens and chains
    const tokens = req.query.tokens || 'sol,usdc';
    const chains = req.query.chains || 'solana-mainnet';
    
    // Build query string
    const params = new URLSearchParams({
      tokens: typeof tokens === 'string' ? tokens : tokens.join(','),
      chains: typeof chains === 'string' ? chains : chains.join(',')
    }).toString();
    
    // Make request to Crossmint API
    const response = await fetch(`${CROSSMINT_API_URL}/v1-alpha2/wallets/${address}/balances?${params}`, {
      method: 'GET',
      headers: {
        'X-API-KEY': CROSSMINT_API_KEY,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      let errorText = '';
      try {
        const errorData = await response.json();
        errorText = JSON.stringify(errorData);
      } catch (e) {
        errorText = await response.text();
      }
      
      console.error(`Crossmint API Error: ${response.status} - ${errorText}`);
      return res.status(response.status).json({ 
        error: `Failed to get wallet balance: ${response.statusText}`,
        details: errorText
      });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Proxy API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 