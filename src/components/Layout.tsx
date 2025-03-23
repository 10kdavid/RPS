import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { useWallet, WalletProvider } from '../contexts/WalletContext';
import GlobalChat from './GlobalChat';
import Link from 'next/link';

interface LayoutProps {
  children: React.ReactNode;
}

interface MainProps {
  collapsed: boolean;
}

const Main = styled.main<MainProps>`
  min-height: calc(100vh - 70px);
  background-color: var(--primary-bg);
  color: var(--text-primary);
  margin-left: ${props => props.collapsed ? '60px' : '200px'};
  transition: margin-left 0.3s ease-in-out;
  
  @media (max-width: 768px) {
    margin-left: 0;
  }
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: var(--card-bg);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 100;
`;

interface LogoProps {
  collapsed: boolean;
}

const Logo = styled.div<LogoProps>`
  display: flex;
  align-items: center;
  font-weight: 700;
  font-size: 1.2rem;
  letter-spacing: 0.5px;
  margin-left: ${props => props.collapsed ? '70px' : '210px'};
  transition: margin-left 0.3s ease-in-out;
  
  @media (max-width: 768px) {
    margin-left: 20px;
  }
`;

const LogoLink = styled(Link)`
  display: flex;
  align-items: center;
  text-decoration: none;
  color: inherit;
`;

const LogoText = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-weight: 800;
  letter-spacing: 1px;
  background: linear-gradient(120deg, #00ecaa, #00a3ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const RPSLogo = styled.div`
  background: linear-gradient(120deg, #00ecaa, #00a3ff);
  border-radius: 12px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.8rem;
  color: #0e1c30;
  box-shadow: 0 2px 10px rgba(0, 236, 170, 0.3);
  margin-right: 10px;
`;

const HeaderNav = styled.nav`
  display: flex;
  gap: 20px;

  @media (max-width: 768px) {
    display: none;
  }
`;

interface NavLinkProps {
  isActive: boolean;
}

const StyledNavLink = styled(Link)<NavLinkProps>`
  color: ${props => props.isActive ? 'var(--accent-blue)' : 'var(--text-primary)'};
  font-weight: ${props => props.isActive ? '600' : '500'};
  padding: 5px 10px;
  border-radius: 6px;
  transition: background-color 0.2s, color 0.2s;
  text-decoration: none;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
    color: var(--accent-blue);
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const WalletInfo = styled.div`
  background-color: rgba(255, 255, 255, 0.05);
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.9rem;
`;

const WalletAddress = styled.span`
  color: var(--text-secondary);
  font-size: 0.85rem;
  margin-left: 8px;
`;

const DropdownIcon = styled.span`
  margin-left: 8px;
  color: var(--text-secondary);
`;

const SecondaryButton = styled.button`
  background-color: rgba(255, 255, 255, 0.05);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const PrimaryButton = styled.button`
  background-color: var(--button-primary);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  }
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

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  const { connected, balance, publicKey, openWalletModal, disconnectWallet } = useWallet();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [walletDropdownOpen, setWalletDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  
  // Format wallet address for display
  const formatWalletAddress = (address: string | null) => {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };
  
  const toggleChat = () => {
    setIsChatOpen(prev => !prev);
  };

  const closeChat = () => {
    setIsChatOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  const toggleWalletDropdown = () => {
    setWalletDropdownOpen(!walletDropdownOpen);
  };

  return (
    <>
      <Header>
        <Logo collapsed={sidebarCollapsed}>
          <LogoLink href="/">
            <RPSLogo>RPS</RPSLogo>
            <LogoText>ROCK PAPER SOLANA</LogoText>
          </LogoLink>
        </Logo>
        
        <HeaderNav>
          <StyledNavLink href="/" isActive={router.pathname === '/'}>
            Home
          </StyledNavLink>
          <StyledNavLink href="/games" isActive={router.pathname === '/games' || router.pathname.startsWith('/game/')}>
            Games
          </StyledNavLink>
          <StyledNavLink href="/wallet" isActive={router.pathname === '/wallet'}>
            Wallet
          </StyledNavLink>
          <StyledNavLink href="/settings" isActive={router.pathname === '/settings'}>
            Settings
          </StyledNavLink>
          <StyledNavLink href="/about" isActive={router.pathname === '/about'}>
            About
          </StyledNavLink>
          <StyledNavLink href="/contact" isActive={router.pathname === '/contact'}>
            Contact
          </StyledNavLink>
          <StyledNavLink href="/help" isActive={router.pathname === '/help'}>
            Help
          </StyledNavLink>
        </HeaderNav>
        
        <HeaderActions>
          {connected ? (
            <>
              <WalletInfo onClick={toggleWalletDropdown} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <span>{balance?.toFixed(4) || '0.0000'} SOL</span>
                <WalletAddress>{formatWalletAddress(publicKey)}</WalletAddress>
                <DropdownIcon>▼</DropdownIcon>
              </WalletInfo>
              <PrimaryButton onClick={() => router.push('/wallet')} style={{ background: '#00c853' }}>
                My Wallet
              </PrimaryButton>
            </>
          ) : (
            <>
              <SecondaryButton onClick={openWalletModal}>
                Login
              </SecondaryButton>
              <PrimaryButton onClick={openWalletModal} style={{ background: '#00c853' }}>
                Connect Wallet
              </PrimaryButton>
            </>
          )}
          
          <MobileMenuButton onClick={toggleMobileMenu}>
            ☰
          </MobileMenuButton>
        </HeaderActions>
      </Header>
      
      {mobileMenuOpen && (
        <MobileMenu>
          <MobileNavLink>
            <StyledNavLink href="/" isActive={router.pathname === '/'}>
              Home
            </StyledNavLink>
          </MobileNavLink>
          <MobileNavLink>
            <StyledNavLink href="/games" isActive={router.pathname === '/games' || router.pathname.startsWith('/game/')}>
              Games
            </StyledNavLink>
          </MobileNavLink>
          <MobileNavLink>
            <StyledNavLink href="/wallet" isActive={router.pathname === '/wallet'}>
              Wallet
            </StyledNavLink>
          </MobileNavLink>
          <MobileNavLink>
            <StyledNavLink href="/settings" isActive={router.pathname === '/settings'}>
              Settings
            </StyledNavLink>
          </MobileNavLink>
          <MobileNavLink>
            <StyledNavLink href="/about" isActive={router.pathname === '/about'}>
              About
            </StyledNavLink>
          </MobileNavLink>
          <MobileNavLink>
            <StyledNavLink href="/contact" isActive={router.pathname === '/contact'}>
              Contact
            </StyledNavLink>
          </MobileNavLink>
          <MobileNavLink>
            <StyledNavLink href="/help" isActive={router.pathname === '/help'}>
              Help
            </StyledNavLink>
          </MobileNavLink>
        </MobileMenu>
      )}
      
      <Main collapsed={sidebarCollapsed}>
        {children}
        {isChatOpen && <GlobalChat onClose={closeChat} />}
      </Main>
    </>
  );
};

const LayoutWithProvider: React.FC<LayoutProps> = (props) => {
  return (
    <WalletProvider>
      <Layout {...props} />
    </WalletProvider>
  );
};

export default LayoutWithProvider; 