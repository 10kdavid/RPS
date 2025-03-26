import type { NextApiRequest, NextApiResponse } from 'next';

const CROSSMINT_API_KEY = 'sk_production_5YcBgonNBeEhyGBnWLbzgQU1hbJsxtr1GGuX8wSE1M6CgS2q5NuFJc25b5Pn3VXjn9WEj6HwKb65NKJgKV3NuvwQgLx84wpRt5dESVTh24svfFnyzHSNyx9eg1TZpLAHiyAFizeHNTTretuhbkg8AewfS4Qx5QrgoBoRjdsN1qvq3HDvRoNNv66yoKaTQafUoeGievHp8bMPLT1arB2EWsZf';
const CROSSMINT_API_URL = 'https://www.crossmint.com/api';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { escrowAddress, winnerAddress, amount, gameId } = req.body;
    
    // Validate required fields
    if (!escrowAddress || !winnerAddress || !amount || !gameId) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        message: 'escrowAddress, winnerAddress, amount, and gameId are required' 
      });
    }
    
    console.log(`Processing escrow release for game ${gameId}: ${amount} SOL from ${escrowAddress} to ${winnerAddress}`);
    
    // Get escrow wallet balance first to verify
    const balanceResponse = await fetch(`${CROSSMINT_API_URL}/v1-alpha2/wallets/${escrowAddress}/balances?tokens=sol&chains=solana-mainnet`, {
      headers: {
        'X-API-KEY': CROSSMINT_API_KEY,
        'Content-Type': 'application/json',
      }
    });
    
    if (!balanceResponse.ok) {
      return res.status(500).json({ 
        error: 'Failed to get escrow balance', 
        details: await balanceResponse.text() 
      });
    }
    
    const balanceData = await balanceResponse.json();
    console.log("Escrow balance response:", balanceData);
    
    const solBalance = balanceData.balances?.find((b: any) => b.token.toLowerCase() === 'sol');
    if (!solBalance || parseFloat(solBalance.amount) <= 0) {
      return res.status(400).json({ 
        error: 'Insufficient escrow balance', 
        amount: solBalance?.amount || 0 
      });
    }
    
    // Send the transaction from escrow to winner
    const transactionResponse = await fetch(`${CROSSMINT_API_URL}/v1-alpha2/wallets/${escrowAddress}/transactions`, {
      method: 'POST',
      headers: {
        'X-API-KEY': CROSSMINT_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'transfer',
        toAddress: winnerAddress,
        token: 'sol',
        amount: amount,
        chain: 'solana-mainnet',
      }),
    });
    
    if (!transactionResponse.ok) {
      const errorText = await transactionResponse.text();
      console.error(`Failed to release escrow for game ${gameId}:`, errorText);
      return res.status(500).json({ 
        error: 'Failed to release escrow funds', 
        details: errorText 
      });
    }
    
    const transactionData = await transactionResponse.json();
    console.log(`Successfully released escrow for game ${gameId}:`, transactionData);
    
    // Return success response
    return res.status(200).json({
      success: true,
      gameId,
      winner: winnerAddress,
      amount,
      transaction: transactionData
    });
  } catch (error) {
    console.error('Error processing escrow release:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 