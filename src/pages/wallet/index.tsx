import React, { useState } from 'react';
import styled from 'styled-components';
import Head from 'next/head';
import { useWallet } from '../../contexts/WalletContext';

const PageContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const PageTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 20px;
  color: var(--text-primary);
`;

const WalletSection = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  
  @media (max-width: 900px) {
    flex-direction: column;
  }
`;

const WalletCard = styled.div`
  flex: 1;
  background-color: var(--card-bg);
  border-radius: 8px;
  padding: 20px;
`;

const WalletHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const WalletTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
`;

const WalletBalance = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 30px 0;
`;

const BalanceLabel = styled.div`
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-bottom: 5px;
`;

const BalanceAmount = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--accent-green);
`;

const BalanceCurrency = styled.span`
  font-size: 1rem;
  color: var(--text-secondary);
  margin-left: 5px;
`;

const AddressContainer = styled.div`
  background-color: var(--primary-bg);
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const AddressLabel = styled.div`
  color: var(--text-secondary);
  font-size: 0.75rem;
  margin-bottom: 5px;
`;

const AddressValue = styled.div`
  font-size: 0.875rem;
  word-break: break-all;
`;

const CopyButton = styled.button`
  background-color: var(--accent-blue);
  color: white;
  font-size: 0.75rem;
  padding: 4px 8px;
  border-radius: 4px;
  margin-left: 10px;
  
  &:hover {
    background-color: #3665c7;
  }
`;

const WalletActionButtons = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 20px;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 12px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.875rem;
  background-color: var(--button-primary);
  color: white;
  
  &:hover {
    background-color: var(--button-hover);
  }
  
  &:disabled {
    background-color: var(--primary-bg);
    color: var(--text-secondary);
    cursor: not-allowed;
  }
`;

const TabsContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--border-color);
`;

interface TabProps {
  active: boolean;
}

const Tab = styled.button<TabProps>`
  padding: 10px 15px;
  font-weight: ${props => props.active ? '600' : '400'};
  color: ${props => props.active ? 'var(--text-primary)' : 'var(--text-secondary)'};
  border-bottom: 2px solid ${props => props.active ? 'var(--button-primary)' : 'transparent'};
  
  &:hover {
    color: var(--text-primary);
  }
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const FormLabel = styled.label`
  display: block;
  color: var(--text-secondary);
  margin-bottom: 8px;
  font-size: 0.875rem;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 12px;
  background-color: var(--primary-bg);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-primary);
  
  &:focus {
    border-color: var(--button-primary);
    outline: none;
  }
`;

const TransactionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const TransactionItem = styled.div`
  background-color: var(--primary-bg);
  border-radius: 6px;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TransactionInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const TransactionType = styled.div`
  font-weight: 600;
  color: var(--text-primary);
`;

const TransactionDate = styled.div`
  font-size: 0.75rem;
  color: var(--text-secondary);
`;

const TransactionHash = styled.div`
  font-size: 0.75rem;
  color: var(--text-secondary);
`;

interface TransactionAmountProps {
  type: 'deposit' | 'withdraw' | 'win' | 'loss';
}

const TransactionAmount = styled.div<TransactionAmountProps>`
  font-weight: 600;
  color: ${props => {
    if (props.type === 'deposit' || props.type === 'win') return 'var(--accent-green)';
    if (props.type === 'withdraw' || props.type === 'loss') return 'var(--accent-red)';
    return 'var(--text-primary)';
  }};
`;

interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'win' | 'loss';
  amount: number;
  timestamp: Date;
  hash: string;
  game?: string;
}

enum WalletTab {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  HISTORY = 'history'
}

const WalletPage = () => {
  const { connected, balance, publicKey, openWalletModal } = useWallet();
  const [activeTab, setActiveTab] = useState<WalletTab>(WalletTab.DEPOSIT);
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [withdrawAddress, setWithdrawAddress] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Sample transaction history
  const transactions: Transaction[] = [
    {
      id: '1',
      type: 'deposit',
      amount: 2.5,
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      hash: '5xGh2...7Yfr'
    },
    {
      id: '2',
      type: 'win',
      amount: 1.98,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      hash: '8dKm3...9Pzt',
      game: 'Rock Paper Scissors'
    },
    {
      id: '3',
      type: 'loss',
      amount: 1.0,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
      hash: '3rFp6...2Tqw',
      game: 'Dice Roll'
    },
    {
      id: '4',
      type: 'withdraw',
      amount: 5.0,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      hash: '7jHs9...4Gvb'
    },
    {
      id: '5',
      type: 'deposit',
      amount: 10.0,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      hash: '2xTf8...5Lqn'
    }
  ];
  
  // Format wallet address
  const formatAddress = (address: string | null) => {
    if (!address) return '';
    return `${address.substring(0, 10)}...${address.substring(address.length - 10)}`;
  };
  
  // Copy address to clipboard
  const copyAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey);
      alert('Address copied to clipboard!');
    }
  };
  
  // Handle deposit form submission
  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositAmount || parseFloat(depositAmount) <= 0) return;
    
    setIsLoading(true);
    // Simulate deposit process
    setTimeout(() => {
      alert(`Successfully initiated deposit of ${depositAmount} SOL`);
      setDepositAmount('');
      setIsLoading(false);
    }, 1500);
  };
  
  // Handle withdraw form submission
  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) return;
    if (parseFloat(withdrawAmount) > balance) {
      alert('Insufficient balance');
      return;
    }
    
    setIsLoading(true);
    // Simulate withdrawal process
    setTimeout(() => {
      alert(`Successfully withdrawn ${withdrawAmount} SOL to ${withdrawAddress || 'your wallet'}`);
      setWithdrawAmount('');
      setWithdrawAddress('');
      setIsLoading(false);
    }, 1500);
  };
  
  // Format date for transaction history
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else {
      return `${Math.floor(diffInHours / 24)} days ago`;
    }
  };
  
  return (
    <>
      <Head>
        <title>Wallet | Rock Paper Solana</title>
        <meta name="description" content="Manage your Solana wallet and transaction history" />
      </Head>
      
      <PageContainer>
        <PageTitle>Wallet</PageTitle>
        
        {connected ? (
          <>
            <WalletSection>
              <WalletCard>
                <WalletHeader>
                  <WalletTitle>Wallet Balance</WalletTitle>
                </WalletHeader>
                
                <WalletBalance>
                  <BalanceLabel>Current Balance</BalanceLabel>
                  <BalanceAmount>{balance.toFixed(4)}<BalanceCurrency>SOL</BalanceCurrency></BalanceAmount>
                </WalletBalance>
                
                <AddressContainer>
                  <div>
                    <AddressLabel>Wallet Address</AddressLabel>
                    <AddressValue>{formatAddress(publicKey)}</AddressValue>
                  </div>
                  <CopyButton onClick={copyAddress}>Copy</CopyButton>
                </AddressContainer>
              </WalletCard>
            </WalletSection>
            
            <WalletCard>
              <TabsContainer>
                <Tab 
                  active={activeTab === WalletTab.DEPOSIT} 
                  onClick={() => setActiveTab(WalletTab.DEPOSIT)}
                >
                  Deposit
                </Tab>
                <Tab 
                  active={activeTab === WalletTab.WITHDRAW} 
                  onClick={() => setActiveTab(WalletTab.WITHDRAW)}
                >
                  Withdraw
                </Tab>
                <Tab 
                  active={activeTab === WalletTab.HISTORY} 
                  onClick={() => setActiveTab(WalletTab.HISTORY)}
                >
                  Transaction History
                </Tab>
              </TabsContainer>
              
              {activeTab === WalletTab.DEPOSIT && (
                <form onSubmit={handleDeposit}>
                  <FormGroup>
                    <FormLabel>Amount to Deposit (SOL)</FormLabel>
                    <FormInput 
                      type="number" 
                      min="0.001" 
                      step="0.001" 
                      value={depositAmount} 
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder="Enter amount"
                      required
                    />
                  </FormGroup>
                  
                  <ActionButton type="submit" disabled={isLoading}>
                    {isLoading ? 'Processing...' : 'Deposit'}
                  </ActionButton>
                </form>
              )}
              
              {activeTab === WalletTab.WITHDRAW && (
                <form onSubmit={handleWithdraw}>
                  <FormGroup>
                    <FormLabel>Amount to Withdraw (SOL)</FormLabel>
                    <FormInput 
                      type="number" 
                      min="0.001" 
                      step="0.001" 
                      max={balance} 
                      value={withdrawAmount} 
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder="Enter amount"
                      required
                    />
                  </FormGroup>
                  
                  <FormGroup>
                    <FormLabel>Destination Address (Optional)</FormLabel>
                    <FormInput 
                      type="text" 
                      value={withdrawAddress} 
                      onChange={(e) => setWithdrawAddress(e.target.value)}
                      placeholder="Leave empty to use connected wallet"
                    />
                  </FormGroup>
                  
                  <ActionButton type="submit" disabled={isLoading || !withdrawAmount || parseFloat(withdrawAmount) > balance}>
                    {isLoading ? 'Processing...' : 'Withdraw'}
                  </ActionButton>
                </form>
              )}
              
              {activeTab === WalletTab.HISTORY && (
                <TransactionList>
                  {transactions.map(transaction => (
                    <TransactionItem key={transaction.id}>
                      <TransactionInfo>
                        <TransactionType>
                          {transaction.type === 'deposit' ? 'Deposit' : 
                           transaction.type === 'withdraw' ? 'Withdrawal' : 
                           transaction.type === 'win' ? `Win (${transaction.game})` : 
                           `Loss (${transaction.game})`}
                        </TransactionType>
                        <TransactionDate>{formatDate(transaction.timestamp)}</TransactionDate>
                        <TransactionHash>Tx: {transaction.hash}</TransactionHash>
                      </TransactionInfo>
                      <TransactionAmount type={transaction.type}>
                        {transaction.type === 'deposit' || transaction.type === 'win' ? '+' : '-'}
                        {transaction.amount.toFixed(4)} SOL
                      </TransactionAmount>
                    </TransactionItem>
                  ))}
                </TransactionList>
              )}
            </WalletCard>
          </>
        ) : (
          <WalletCard>
            <WalletBalance>
              <BalanceLabel>Connect your wallet to view balance and transactions</BalanceLabel>
              <ActionButton onClick={openWalletModal}>Connect Wallet</ActionButton>
            </WalletBalance>
          </WalletCard>
        )}
      </PageContainer>
    </>
  );
};

export default WalletPage; 