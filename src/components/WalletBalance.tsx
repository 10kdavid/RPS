import React, { useEffect, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import styled from 'styled-components';

const BalanceContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background-color: #1a1f2e;
  border-radius: 8px;
  margin: 0.5rem 0;
`;

const NetworkBadge = styled.span`
  background-color: #ff9d00;
  color: #000;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: bold;
  margin-left: 0.5rem;
`;

const BalanceText = styled.div`
  display: flex;
  flex-direction: column;
`;

const BalanceAmount = styled.span`
  font-weight: bold;
  font-size: 1.1rem;
`;

const BalanceLabel = styled.span`
  font-size: 0.8rem;
  opacity: 0.8;
`;

export default function WalletBalance() {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Function to fetch the balance
  const fetchBalance = async () => {
    if (publicKey && connection) {
      try {
        setIsLoading(true);
        const walletBalance = await connection.getBalance(publicKey);
        setBalance(walletBalance / LAMPORTS_PER_SOL);
        console.log(`Wallet balance: ${walletBalance / LAMPORTS_PER_SOL} SOL (devnet)`);
      } catch (error) {
        console.error('Error fetching balance:', error);
        setBalance(null);
      } finally {
        setIsLoading(false);
      }
    } else {
      setBalance(null);
    }
  };

  // Fetch balance when wallet connects or changes
  useEffect(() => {
    if (connected && publicKey) {
      fetchBalance();
      
      // Set up interval to refresh balance every 15 seconds
      const intervalId = setInterval(fetchBalance, 15000);
      
      // Clean up interval when component unmounts
      return () => clearInterval(intervalId);
    }
  }, [connected, publicKey, connection]);

  if (!connected) {
    return null;
  }

  return (
    <BalanceContainer>
      <BalanceText>
        <BalanceLabel>Balance:</BalanceLabel>
        <BalanceAmount>
          {isLoading 
            ? 'Loading...' 
            : balance !== null 
              ? `◎ ${balance.toFixed(4)} SOL` 
              : 'Error'
          }
        </BalanceAmount>
      </BalanceText>
      <NetworkBadge>DEVNET</NetworkBadge>
    </BalanceContainer>
  );
} 