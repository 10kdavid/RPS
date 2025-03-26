import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useCrossmintWallet } from '../contexts/CrossmintWalletContext';

const WalletContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const WalletButton = styled.button<{ connected: boolean; error: boolean }>`
  background: ${props => {
    if (props.error) return 'var(--button-danger)';
    return props.connected ? 'var(--button-success)' : 'var(--button-primary)';
  }};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: ${props => {
      if (props.error) return '#d32f2f';
      return props.connected ? 'var(--button-success-hover)' : 'var(--button-hover)';
    }};
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const BalanceDisplay = styled.span`
  background: rgba(255, 255, 255, 0.15);
  padding: 4px 8px;
  border-radius: 6px;
  margin-left: 8px;
  font-size: 13px;
`;

const WalletDropdown = styled.div`
  position: absolute;
  top: 40px;
  right: 0;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  width: 280px;
  padding: 12px;
  z-index: 100;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const AddressDisplay = styled.div`
  font-size: 12px;
  background: rgba(0, 0, 0, 0.2);
  padding: 8px;
  border-radius: 6px;
  word-break: break-all;
  margin-bottom: 8px;
`;

const DropdownButton = styled.button`
  background: var(--button-primary);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 13px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background: var(--button-hover);
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: 16px;
  cursor: pointer;
  
  &:hover {
    color: var(--text-primary);
  }
`;

const LoadingIndicator = styled.div`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const ErrorDisplay = styled.div`
  color: var(--button-danger);
  font-size: 13px;
  padding: 8px;
  background: rgba(211, 47, 47, 0.1);
  border-radius: 6px;
  margin-bottom: 8px;
`;

const CrossmintWalletButton: React.FC = () => {
  const { 
    connected, 
    balance, 
    walletAddress, 
    connectWallet, 
    createNewWallet, 
    refreshBalance, 
    isLoading,
    error
  } = useCrossmintWallet();
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Auto retry connection if we have a wallet address but no balance
  useEffect(() => {
    if (connected && walletAddress && balance === 0 && !isLoading && retryCount < 3) {
      const timer = setTimeout(() => {
        console.log(`Auto-refreshing balance (attempt ${retryCount + 1})`);
        refreshBalance();
        setRetryCount(prev => prev + 1);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [connected, walletAddress, balance, isLoading, refreshBalance, retryCount]);

  const handleConnect = async () => {
    if (connected) {
      setDropdownOpen(!dropdownOpen);
    } else {
      await connectWallet();
    }
  };

  const formatAddress = (address: string | null) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Format balance for display
  const formatBalance = (bal: number): string => {
    if (bal === 0) return "0.0000";
    if (bal < 0.001 && bal > 0) return bal.toExponential(2);
    return bal.toFixed(4);
  };

  return (
    <WalletContainer>
      <WalletButton 
        connected={connected}
        onClick={handleConnect}
        disabled={isLoading}
        error={!!error}
      >
        {isLoading ? (
          <LoadingIndicator />
        ) : connected ? (
          <>
            {formatAddress(walletAddress)}
            <BalanceDisplay>{formatBalance(balance)} SOL</BalanceDisplay>
          </>
        ) : error ? (
          'Wallet Error'
        ) : (
          'Crossmint'
        )}
      </WalletButton>
      
      {dropdownOpen && (
        <WalletDropdown>
          <CloseButton onClick={() => setDropdownOpen(false)}>×</CloseButton>
          <h4 style={{ margin: '0 0 8px 0' }}>Crossmint Wallet</h4>
          
          {error && (
            <ErrorDisplay>
              {error}
              <DropdownButton 
                style={{ marginTop: '8px', width: '100%' }}
                onClick={() => {
                  refreshBalance();
                }}
              >
                Retry Connection
              </DropdownButton>
            </ErrorDisplay>
          )}
          
          {connected ? (
            <>
              <div>
                <strong>Balance:</strong> {formatBalance(balance)} SOL
              </div>
              
              <AddressDisplay>
                <div style={{ fontSize: '10px', marginBottom: '4px', color: 'var(--text-secondary)' }}>
                  Wallet Address:
                </div>
                {walletAddress}
              </AddressDisplay>
              
              <DropdownButton onClick={() => {
                refreshBalance();
                setRetryCount(0);
              }}>
                Refresh Balance
              </DropdownButton>
              
              <DropdownButton onClick={() => {
                window.location.href = '/wallet';
                setDropdownOpen(false);
              }}>
                Wallet Details
              </DropdownButton>
            </>
          ) : (
            <>
              <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                Connect to a Crossmint Smart Wallet to see your balance and transact with SOL.
              </p>
              
              <DropdownButton onClick={() => {
                connectWallet();
                setDropdownOpen(false);
              }}>
                Connect Existing Wallet
              </DropdownButton>
              
              <DropdownButton onClick={() => {
                createNewWallet();
                setDropdownOpen(false);
              }}>
                Create New Wallet
              </DropdownButton>
            </>
          )}
        </WalletDropdown>
      )}
    </WalletContainer>
  );
};

export default CrossmintWalletButton; 