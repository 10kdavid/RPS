import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * API route that acts as a proxy for RPC and other API calls to avoid CORS issues
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { url, body, headers: customHeaders } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    // Only allow specific domains
    const allowedDomains = [
      'api.devnet.solana.com',
      'solana-devnet.g.alchemy.com',
      'devnet.helius-rpc.com',
      'firestore.googleapis.com',
      'firebasedatabase.app'
    ];
    
    const urlObj = new URL(url);
    const isAllowed = allowedDomains.some(domain => urlObj.hostname.includes(domain));
    
    if (!isAllowed) {
      return res.status(403).json({ error: 'Domain not allowed' });
    }
    
    // Set up headers
    const headers = {
      'Content-Type': 'application/json',
      ...customHeaders
    };
    
    // Forward the request
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    
    // Get the response
    const data = await response.json();
    
    // Return the response
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ error: 'Proxy error', message: error.message });
  }
} 