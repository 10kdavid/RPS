import type { NextApiRequest, NextApiResponse } from 'next';
import { PublicKey, Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';

const HELIUS_RPC_URL = 'https://mainnet.helius-rpc.com/?api-key=3b6552f4-0ce5-4800-b8b6-a1cc7480d494';

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
    
    try {
      // Create a direct connection to the Helius RPC
      const connection = new Connection(HELIUS_RPC_URL, 'confirmed');
      
      // Create a PublicKey from the address
      const publicKey = new PublicKey(address);
      
      // Get the balance
      const balance = await connection.getBalance(publicKey);
      console.log(`Raw balance for ${address}:`, balance);
      
      // Convert to SOL
      const solBalance = balance / LAMPORTS_PER_SOL;
      
      return res.status(200).json({
        lamports: balance,
        sol: solBalance,
        address: address
      });
    } catch (error) {
      console.error(`Error fetching balance for ${address}:`, error);
      return res.status(500).json({ 
        error: 'Failed to fetch balance',
        message: error instanceof Error ? error.message : 'Unknown error',
        address: address
      });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 