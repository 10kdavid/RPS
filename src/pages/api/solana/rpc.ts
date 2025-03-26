import type { NextApiRequest, NextApiResponse } from 'next';

const HELIUS_RPC_URL = 'https://mainnet.helius-rpc.com/?api-key=3b6552f4-0ce5-4800-b8b6-a1cc7480d494';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests for RPC
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Log the request for debugging
    console.log(`Processing Solana RPC request:`, req.body);
    
    // Forward the request to Helius RPC
    const response = await fetch(HELIUS_RPC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Helius RPC Error: ${response.status} - ${errorText}`);
      return res.status(response.status).json({ 
        error: `RPC request failed: ${response.statusText}`,
        details: errorText
      });
    }

    const data = await response.json();
    
    // Log response for debugging
    console.log(`RPC Response:`, data);
    
    // For getBalance method, ensure we return a proper number
    if (req.body.method === 'getBalance' && data.result !== undefined) {
      // Make sure result is treated as a number
      const result = typeof data.result === 'string' 
        ? parseInt(data.result, 10) 
        : Number(data.result);
      
      console.log(`Processed balance value: ${result}`);
      
      return res.status(200).json({
        jsonrpc: '2.0',
        id: data.id,
        result: result
      });
    }

    // Return the data as-is for other methods
    return res.status(200).json(data);
  } catch (error) {
    console.error('Proxy RPC Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 