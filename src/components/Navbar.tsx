import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useWallet } from '../contexts/WalletContext';

const NavbarContainer = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: var(--card-bg);
  border-bottom: 1px solid var(--border-color);
`;

const Logo = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  
  span {
    margin-left: 10px;
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: 20px;
`;

interface NavLinkProps {
  isActive: boolean;
}

const NavLink = styled.a<NavLinkProps>`
  color: ${props => props.isActive ? 'var(--accent-blue)' : 'var(--text-primary)'};
  font-weight: ${props => props.isActive ? '600' : '500'};
  padding: 5px 10px;
  border-radius: 6px;
  transition: background-color 0.2s, color 0.2s;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
    color: var(--accent-blue);
  }
`;

const WalletSection = styled.div`
  display: flex;
  align-items: center;
  position: relative;
`;

const WalletButton = styled.button`
  background-color: var(--button-primary);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-weight: 500;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: var(--button-hover);
  }
`;

const BalanceDisplay = styled.div`
  background-color: var(--primary-bg);
  border-radius: 6px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-right: 10px;
  border: 1px solid var(--border-color);
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
`;

const Balance = styled.span`
  font-weight: 600;
  color: var(--text-primary);
  margin-right: 8px;
`;

const WalletAddress = styled.span`
  color: var(--text-secondary);
  font-size: 0.85rem;
`;

const DropdownIcon = styled.span`
  margin-left: 8px;
  color: var(--text-secondary);
`;

const WalletDropdown = styled.div`
  position: absolute;
  top: 45px;
  right: 0;
  background-color: var(--card-bg);
  border-radius: 8px;
  width: 220px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 1px solid var(--border-color);
  z-index: 100;
`;

const DropdownItem = styled.div`
  padding: 12px 15px;
  color: var(--text-primary);
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
  
  &:first-child {
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
  }
  
  &:last-child {
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
  }
`;

const DropdownIcon2 = styled.span`
  margin-right: 8px;
  font-size: 1rem;
`;

const MobileMenuButton = styled.button`
  display: none;
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-size: 1.5rem;
  cursor: pointer;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const MobileMenu = styled.div`
  display: none;
  flex-direction: column;
  position: absolute;
  top: 70px;
  left: 0;
  right: 0;
  background-color: var(--card-bg);
  z-index: 100;
  border-bottom: 1px solid var(--border-color);
  
  @media (max-width: 768px) {
    display: flex;
  }
`;

const MobileNavLink = styled.div`
  padding: 15px 20px;
  border-top: 1px solid var(--border-color);
`;

const Navbar = () => {
  const router = useRouter();
  const { connected, balance, publicKey, openWalletModal, disconnectWallet } = useWallet();
  const [walletDropdownOpen, setWalletDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Format wallet address for display
  const formatWalletAddress = (address: string | null) => {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };
  
  // Handle clicking outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setWalletDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Copy wallet address to clipboard
  const copyAddressToClipboard = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey);
      alert('Wallet address copied to clipboard');
      setWalletDropdownOpen(false);
    }
  };
  
  // Navigate to wallet page
  const navigateToWallet = () => {
    router.push('/wallet');
    setWalletDropdownOpen(false);
  };
  
  // Handle wallet disconnect
  const handleDisconnect = async () => {
    await disconnectWallet();
    setWalletDropdownOpen(false);
  };
  
  // Toggle wallet dropdown
  const toggleWalletDropdown = () => {
    setWalletDropdownOpen(!walletDropdownOpen);
  };
  
  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  return (
    <>
      <NavbarContainer>
        <Logo>
          <Link href="/" passHref>
            🪨📄✂️ <span>Rock Paper Solana</span>
          </Link>
        </Logo>
        
        <NavLinks>
          <Link href="/" passHref>
            <NavLink isActive={router.pathname === '/'}>Home</NavLink>
          </Link>
          <Link href="/games" passHref>
            <NavLink isActive={router.pathname === '/games' || router.pathname.startsWith('/game/')}>
              Games
            </NavLink>
          </Link>
          <Link href="/wallet" passHref>
            <NavLink isActive={router.pathname === '/wallet'}>Wallet</NavLink>
          </Link>
          <Link href="/settings" passHref>
            <NavLink isActive={router.pathname === '/settings'}>Settings</NavLink>
          </Link>
          <Link href="/about" passHref>
            <NavLink isActive={router.pathname === '/about'}>About</NavLink>
          </Link>
          <Link href="/contact" passHref>
            <NavLink isActive={router.pathname === '/contact'}>Contact</NavLink>
          </Link>
          <Link href="/help" passHref>
            <NavLink isActive={router.pathname === '/help'}>Help</NavLink>
          </Link>
        </NavLinks>
        
        <WalletSection ref={dropdownRef}>
          {connected ? (
            <>
              <BalanceDisplay onClick={toggleWalletDropdown}>
                <Balance>{balance.toFixed(4)} SOL</Balance>
                <WalletAddress>{formatWalletAddress(publicKey)}</WalletAddress>
                <DropdownIcon>▼</DropdownIcon>
              </BalanceDisplay>
              
              {walletDropdownOpen && (
                <WalletDropdown>
                  <DropdownItem onClick={navigateToWallet}>
                    <DropdownIcon2>💰</DropdownIcon2> Wallet
                  </DropdownItem>
                  <DropdownItem onClick={copyAddressToClipboard}>
                    <DropdownIcon2>📋</DropdownIcon2> Copy Address
                  </DropdownItem>
                  <DropdownItem onClick={handleDisconnect}>
                    <DropdownIcon2>🔌</DropdownIcon2> Disconnect
                  </DropdownItem>
                </WalletDropdown>
              )}
            </>
          ) : (
            <WalletButton onClick={openWalletModal}>
              Connect Wallet
            </WalletButton>
          )}
          
          <MobileMenuButton onClick={toggleMobileMenu}>
            ☰
          </MobileMenuButton>
        </WalletSection>
      </NavbarContainer>
      
      {mobileMenuOpen && (
        <MobileMenu>
          <MobileNavLink>
            <Link href="/" passHref>
              <NavLink isActive={router.pathname === '/'}>Home</NavLink>
            </Link>
          </MobileNavLink>
          <MobileNavLink>
            <Link href="/games" passHref>
              <NavLink isActive={router.pathname === '/games' || router.pathname.startsWith('/game/')}>
                Games
              </NavLink>
            </Link>
          </MobileNavLink>
          <MobileNavLink>
            <Link href="/wallet" passHref>
              <NavLink isActive={router.pathname === '/wallet'}>Wallet</NavLink>
            </Link>
          </MobileNavLink>
          <MobileNavLink>
            <Link href="/settings" passHref>
              <NavLink isActive={router.pathname === '/settings'}>Settings</NavLink>
            </Link>
          </MobileNavLink>
          <MobileNavLink>
            <Link href="/about" passHref>
              <NavLink isActive={router.pathname === '/about'}>About</NavLink>
            </Link>
          </MobileNavLink>
          <MobileNavLink>
            <Link href="/contact" passHref>
              <NavLink isActive={router.pathname === '/contact'}>Contact</NavLink>
            </Link>
          </MobileNavLink>
          <MobileNavLink>
            <Link href="/help" passHref>
              <NavLink isActive={router.pathname === '/help'}>Help</NavLink>
            </Link>
          </MobileNavLink>
        </MobileMenu>
      )}
    </>
  );
};

export default Navbar; 