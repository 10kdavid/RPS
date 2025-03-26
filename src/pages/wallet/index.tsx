import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Head from 'next/head';
import { useWallet } from '../../contexts/WalletContext';
import { useCrossmintWallet } from '../../contexts/CrossmintWalletContext';

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

const WalletCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const WalletType = styled.span`
  background: var(--primary-bg);
  padding: 4px 10px;
  border-radius: 15px;
  font-size: 0.75rem;
  color: var(--text-secondary);
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-top-color: var(--button-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-left: 10px;
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

enum WalletTab {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  HISTORY = 'history',
  CROSSMINT = 'crossmint'
}

const WalletPage = () => {
  const { connected, balance, publicKey, openWalletModal } = useWallet();
  const { 
    connected: crossmintConnected, 
    balance: crossmintBalance, 
    walletAddress: crossmintAddress,
    connectWallet: connectCrossmint,
    createNewWallet: createCrossmintWallet,
    refreshBalance: refreshCrossmintBalance,
    isLoading: crossmintLoading
  } = useCrossmintWallet();
  
  const [activeTab, setActiveTab] = useState<WalletTab>(WalletTab.DEPOSIT);
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [withdrawAddress, setWithdrawAddress] = useState<string>('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  useEffect(() => {
    // Load transaction history
    setTransactions([
      {
        id: '1',
        type: 'deposit',
        amount: 1.5,
        timestamp: new Date(Date.now() - 3600000 * 24 * 2), // 2 days ago
        hash: '0x4a3d...7b21',
      },
      {
        id: '2',
        type: 'win',
        amount: 0.35,
        timestamp: new Date(Date.now() - 3600000 * 20), // 20 hours ago
        hash: '0x8c7e...3f49',
        game: 'Minesweeper'
      },
      {
        id: '3',
        type: 'loss',
        amount: 0.12,
        timestamp: new Date(Date.now() - 3600000 * 10), // 10 hours ago
        hash: '0x2f5a...9d62',
        game: 'Blackjack'
      }
    ]);
  }, []);

  // Format wallet address for display
  const formatAddress = (address: string | null) => {
    if (!address) return 'Not connected';
    if (address.length > 20) {
      return `${address.substring(0, 10)}...${address.substring(address.length - 10)}`;
    }
    return address;
  };
  
  // Copy address to clipboard
  const copyAddress = (address: string | null) => {
    if (address) {
      navigator.clipboard.writeText(address);
      alert('Address copied to clipboard');
    }
  };
  
  // Format balance for display
  const formatBalance = (bal: number): string => {
    if (bal === 0) return "0.0000";
    if (bal < 0.001 && bal > 0) return bal.toExponential(2);
    return bal.toFixed(4);
  };
  
  // Handle deposit form submission
  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositAmount || isNaN(parseFloat(depositAmount)) || parseFloat(depositAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    alert(`Deposit of ${depositAmount} SOL initiated. Please send SOL to the provided address.`);
    setDepositAmount('');
  };
  
  // Handle withdraw form submission
  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAmount || isNaN(parseFloat(withdrawAmount)) || parseFloat(withdrawAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    if (parseFloat(withdrawAmount) > balance) {
      alert('Insufficient balance');
      return;
    }
    
    alert(`Successfully withdrawn ${withdrawAmount} SOL to ${withdrawAddress || 'your wallet'}`);
    setWithdrawAmount('');
    setWithdrawAddress('');
  };
  
  // Format date for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };
  
  return (
    <>
      <Head>
        <title>Wallet | Rock Paper Solana</title>
        <meta name="description" content="Manage your Solana wallet and transaction history" />
      </Head>
      
      <PageContainer>
        <PageTitle>Wallet</PageTitle>
        
        {connected || crossmintConnected ? (
          <>
            <WalletSection>
              {/* Regular Solana Wallet */}
              <WalletCard>
                <WalletCardHeader>
                  <WalletTitle>Solana Wallet</WalletTitle>
                  <WalletType>Standard</WalletType>
                </WalletCardHeader>
                
                <WalletBalance>
                  <BalanceLabel>Available Balance</BalanceLabel>
                  <BalanceAmount>{formatBalance(balance)}<BalanceCurrency>SOL</BalanceCurrency></BalanceAmount>
                </WalletBalance>
                
                <AddressLabel>Wallet Address</AddressLabel>
                <AddressContainer>
                  <AddressValue>{formatAddress(publicKey)}</AddressValue>
                  <CopyButton onClick={() => copyAddress(publicKey)}>Copy</CopyButton>
                </AddressContainer>
              </WalletCard>
              
              {/* Crossmint Smart Wallet */}
              <WalletCard>
                <WalletCardHeader>
                  <WalletTitle>Crossmint Wallet</WalletTitle>
                  <WalletType>Smart Wallet</WalletType>
                </WalletCardHeader>
                
                {crossmintConnected ? (
                  <>
                    <WalletBalance>
                      <BalanceLabel>Available Balance</BalanceLabel>
                      <BalanceAmount>
                        {formatBalance(crossmintBalance)}
                        <BalanceCurrency>SOL</BalanceCurrency>
                        {crossmintLoading && <LoadingSpinner />}
                      </BalanceAmount>
                    </WalletBalance>
                    
                    <AddressLabel>Wallet Address</AddressLabel>
                    <AddressContainer>
                      <AddressValue>{formatAddress(crossmintAddress)}</AddressValue>
                      <CopyButton onClick={() => copyAddress(crossmintAddress)}>Copy</CopyButton>
                    </AddressContainer>
                    
                    <WalletActionButtons>
                      <ActionButton onClick={refreshCrossmintBalance} disabled={crossmintLoading}>
                        {crossmintLoading ? 'Refreshing...' : 'Refresh Balance'}
                      </ActionButton>
                    </WalletActionButtons>
                  </>
                ) : (
                  <WalletBalance>
                    <BalanceLabel>Connect your Crossmint wallet</BalanceLabel>
                    <ActionButton onClick={connectCrossmint} disabled={crossmintLoading}>
                      {crossmintLoading ? 'Connecting...' : 'Connect Crossmint'}
                    </ActionButton>
                    <div style={{ margin: '15px 0', textAlign: 'center' }}>or</div>
                    <ActionButton onClick={createCrossmintWallet} disabled={crossmintLoading}>
                      {crossmintLoading ? 'Creating...' : 'Create New Wallet'}
                    </ActionButton>
                  </WalletBalance>
                )}
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
                  History
                </Tab>
                <Tab 
                  active={activeTab === WalletTab.CROSSMINT}
                  onClick={() => setActiveTab(WalletTab.CROSSMINT)}
                >
                  Crossmint
                </Tab>
              </TabsContainer>
              
              {activeTab === WalletTab.DEPOSIT && (
                <form onSubmit={handleDeposit}>
                  <FormGroup>
                    <FormLabel>Deposit Amount (SOL)</FormLabel>
                    <FormInput 
                      type="number" 
                      placeholder="0.00" 
                      step="0.01"
                      min="0.01"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      required
                    />
                  </FormGroup>
                  
                  <FormGroup>
                    <FormLabel>Your Deposit Address</FormLabel>
                    <AddressContainer>
                      <AddressValue>{formatAddress(publicKey)}</AddressValue>
                      <CopyButton onClick={() => copyAddress(publicKey)}>Copy</CopyButton>
                    </AddressContainer>
                  </FormGroup>
                  
                  <ActionButton type="submit">Deposit SOL</ActionButton>
                </form>
              )}
              
              {activeTab === WalletTab.WITHDRAW && (
                <form onSubmit={handleWithdraw}>
                  <FormGroup>
                    <FormLabel>Withdraw Amount (SOL)</FormLabel>
                    <FormInput 
                      type="number" 
                      placeholder="0.00" 
                      step="0.01"
                      min="0.01"
                      max={balance.toString()}
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      required
                    />
                  </FormGroup>
                  
                  <FormGroup>
                    <FormLabel>Destination Address (Optional)</FormLabel>
                    <FormInput 
                      type="text" 
                      placeholder="Leave empty to use connected wallet"
                      value={withdrawAddress}
                      onChange={(e) => setWithdrawAddress(e.target.value)}
                    />
                  </FormGroup>
                  
                  <ActionButton type="submit">Withdraw SOL</ActionButton>
                </form>
              )}
              
              {activeTab === WalletTab.HISTORY && (
                <TransactionList>
                  {transactions.length > 0 ? transactions.map(tx => (
                    <TransactionItem key={tx.id}>
                      <TransactionInfo>
                        <TransactionType>
                          {tx.type === 'deposit' ? 'Deposit' : 
                           tx.type === 'withdraw' ? 'Withdrawal' : 
                           tx.type === 'win' ? `Win (${tx.game})` :
                           `Loss (${tx.game})`}
                        </TransactionType>
                        <TransactionDate>{formatDate(tx.timestamp)}</TransactionDate>
                        <TransactionHash>Tx: {tx.hash}</TransactionHash>
                      </TransactionInfo>
                      <TransactionAmount type={tx.type}>
                        {tx.type === 'deposit' || tx.type === 'win' ? '+' : '-'}{tx.amount} SOL
                      </TransactionAmount>
                    </TransactionItem>
                  )) : (
                    <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
                      No transaction history yet
                    </div>
                  )}
                </TransactionList>
              )}
              
              {activeTab === WalletTab.CROSSMINT && (
                <div>
                  <FormGroup>
                    <FormLabel>Crossmint Smart Wallet</FormLabel>
                    <p style={{ marginBottom: '15px', color: 'var(--text-secondary)' }}>
                      Your Crossmint Smart Wallet allows you to perform transactions with ease. It's a non-custodial wallet solution that gives you full control of your assets.
                    </p>
                    
                    {crossmintConnected ? (
                      <>
                        <FormLabel>Your Crossmint Address</FormLabel>
                        <AddressContainer>
                          <AddressValue>{crossmintAddress}</AddressValue>
                          <CopyButton onClick={() => copyAddress(crossmintAddress)}>Copy</CopyButton>
                        </AddressContainer>
                        
                        <div style={{ margin: '20px 0' }}>
                          <FormLabel>Current Balance</FormLabel>
                          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-green)' }}>
                            {formatBalance(crossmintBalance)} SOL
                            {crossmintLoading && <LoadingSpinner />}
                          </div>
                        </div>
                        
                        <ActionButton onClick={refreshCrossmintBalance} disabled={crossmintLoading}>
                          {crossmintLoading ? 'Refreshing...' : 'Refresh Balance'}
                        </ActionButton>
                      </>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '20px' }}>
                        <p style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>
                          You haven't connected a Crossmint wallet yet. Connect an existing wallet or create a new one.
                        </p>
                        <WalletActionButtons>
                          <ActionButton onClick={connectCrossmint} disabled={crossmintLoading}>
                            {crossmintLoading ? 'Connecting...' : 'Connect Existing'}
                          </ActionButton>
                          <ActionButton onClick={createCrossmintWallet} disabled={crossmintLoading}>
                            {crossmintLoading ? 'Creating...' : 'Create New'}
                          </ActionButton>
                        </WalletActionButtons>
                      </div>
                    )}
                  </FormGroup>
                </div>
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