import type { NextApiRequest, NextApiResponse } from 'next';

const CROSSMINT_API_KEY = 'sk_production_5YcBgonNBeEhyGBnWLbzgQU1hbJsxtr1GGuX8wSE1M6CgS2q5NuFJc25b5Pn3VXjn9WEj6HwKb65NKJgKV3NuvwQgLx84wpRt5dESVTh24svfFnyzHSNyx9eg1TZpLAHiyAFizeHNTTretuhbkg8AewfS4Qx5QrgoBoRjdsN1qvq3HDvRoNNv66yoKaTQafUoeGievHp8bMPLT1arB2EWsZf';
const CROSSMINT_API_URL = 'https://www.crossmint.com/api';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST and GET requests
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log(`Processing ${req.method} request to /api/crossmint/wallet`);
    
    if (req.method === 'POST') {
      // Create a new wallet
      const response = await fetch(`${CROSSMINT_API_URL}/2022-06-09/wallets`, {
        method: 'POST',
        headers: {
          'X-API-KEY': CROSSMINT_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'solana-smart-wallet',
          config: {
            adminSigner: {
              type: 'solana-keypair',
            },
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Crossmint API Error: ${response.status} - ${errorText}`);
        return res.status(response.status).json({ 
          error: `Failed to create wallet: ${response.statusText}`,
          details: errorText
        });
      }

      const data = await response.json();
      return res.status(200).json(data);
    } else {
      // GET request - Return a message that direct GET is not supported
      return res.status(400).json({ error: 'Direct GET is not supported. Please use /api/crossmint/balance/:address for balance inquiries.' });
    }
  } catch (error) {
    console.error('Proxy API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 