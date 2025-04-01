import React from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import WalletBalance from './WalletBalance';

interface SidebarContainerProps {
  collapsed: boolean;
}

const SidebarContainer = styled.div<SidebarContainerProps>`
  width: ${props => props.collapsed ? '60px' : '240px'};
  background-color: #0e1c30;
  padding: 10px 0;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 10;
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  transition: width 0.3s ease-in-out;
  font-family: 'Inter', 'Montserrat', sans-serif;
  padding-top: 80px;
  padding-bottom: 40px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 10px;
  }
`;

const SidebarLogo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 10px;
  margin-bottom: 20px;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 20%;
    width: 60%;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  }
`;

const RPSLogo = styled.div`
  background: linear-gradient(120deg, #00ecaa, #00a3ff);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
  color: #0e1c30;
  box-shadow: 0 4px 20px rgba(0, 236, 170, 0.4);
  position: relative;
  overflow: hidden;
  
  &:before {
    content: '';
    position: absolute;
    top: -10px;
    left: -10px;
    right: -10px;
    bottom: -10px;
    background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transform: rotate(45deg);
    animation: shine 3s infinite;
  }
  
  @keyframes shine {
    0% {
      transform: translateX(-100%) rotate(45deg);
    }
    20%, 100% {
      transform: translateX(100%) rotate(45deg);
    }
  }
`;

const ToggleButton = styled.button`
  position: absolute;
  top: 40px;
  right: -15px;
  width: 30px;
  height: 30px;
  background-color: #0e1c30;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  z-index: 11;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: #00ecaa;
    transform: scale(1.1);
    box-shadow: 0 0 15px rgba(0, 236, 170, 0.3);
  }
`;

const SidebarSection = styled.div`
  margin-bottom: 30px;
  position: relative;
`;

interface SidebarHeaderProps {
  collapsed: boolean;
}

const SidebarHeader = styled.div<SidebarHeaderProps>`
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  padding: 8px 20px;
  font-weight: 700;
  letter-spacing: 1.2px;
  white-space: nowrap;
  overflow: hidden;
  opacity: ${props => props.collapsed ? 0 : 1};
  transition: opacity 0.3s ease-in-out, color 0.3s ease;
  height: ${props => props.collapsed ? '0' : 'auto'};
  margin-bottom: 12px;
  position: relative;
  text-shadow: 0 0 10px rgba(0, 236, 170, 0.2);
  
  &:after {
    content: '';
    position: absolute;
    left: 20px;
    bottom: 4px;
    width: 30px;
    height: 2px;
    background: linear-gradient(90deg, #00ecaa, transparent);
    border-radius: 2px;
  }
`;

interface SidebarLinkProps {
  collapsed: boolean;
  active?: boolean;
}

const SidebarLink = styled.a<SidebarLinkProps>`
  display: flex;
  align-items: center;
  padding: ${props => props.collapsed ? '14px 0' : '14px 20px'};
  justify-content: ${props => props.collapsed ? 'center' : 'flex-start'};
  color: rgba(255, 255, 255, ${props => props.active ? '1' : '0.75'});
  font-size: 0.95rem;
  font-weight: ${props => props.active ? '600' : '400'};
  letter-spacing: 0.3px;
  transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
  cursor: pointer;
  white-space: nowrap;
  overflow: visible;
  background-color: ${props => props.active ? 'rgba(255, 255, 255, 0.08)' : 'transparent'};
  border-left: ${props => props.active ? '3px solid #00ecaa' : 'none'};
  padding-left: ${props => props.active && !props.collapsed ? '17px' : (props.collapsed ? '0' : '20px')};
  text-decoration: none;
  position: relative;
  margin-bottom: 6px;
  backdrop-filter: ${props => props.active ? 'blur(4px)' : 'none'};
  
  &:hover {
    background-color: ${props => props.active ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.06)'};
    color: ${props => props.active ? '#ffffff' : 'rgba(255, 255, 255, 0.95)'};
    transform: translateX(${props => props.collapsed ? '0' : '3px'});
    text-shadow: ${props => props.active ? '0 0 8px rgba(255, 255, 255, 0.4)' : 'none'};
  }
  
  &:before {
    content: '';
    position: absolute;
    left: ${props => props.active ? '0' : '20px'};
    bottom: 0;
    width: ${props => props.active ? '0' : '0'};
    height: 1px;
    background: linear-gradient(90deg, rgba(0, 236, 170, 0.5), transparent);
    transition: width 0.3s ease;
    opacity: 0;
  }
  
  &:hover:before {
    width: ${props => props.active ? '0' : '30%'};
    opacity: 1;
  }
  
  span {
    margin-left: ${props => props.collapsed ? '0' : '10px'};
    opacity: ${props => props.collapsed ? 0 : 1};
    transition: opacity 0.2s ease-in-out, transform 0.2s ease;
    display: ${props => props.collapsed ? 'none' : 'inline'};
    position: relative;
    max-width: 170px;
    text-overflow: ellipsis;
    overflow: hidden;
    
    &:after {
      content: '';
      position: absolute;
      left: 0;
      bottom: -2px;
      width: 0;
      height: 1px;
      background: #00ecaa;
      transition: width 0.3s ease;
    }
  }
  
  &:hover span:after {
    width: ${props => props.active ? '0' : '100%'};
  }
  
  .icon {
    font-size: 1.25rem;
    min-width: ${props => props.collapsed ? '100%' : '24px'};
    text-align: center;
    transition: transform 0.2s ease, color 0.2s ease;
    filter: ${props => props.active ? 'drop-shadow(0 0 3px rgba(0, 236, 170, 0.5))' : 'none'};
    
    ${props => props.active ? `
      background: linear-gradient(135deg, #00ecaa, #00a3ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      filter: drop-shadow(0 0 1px rgba(0, 236, 170, 0.2));
      animation: pulse 2s infinite;
      
      @keyframes pulse {
        0% {
          filter: drop-shadow(0 0 1px rgba(0, 236, 170, 0.2));
        }
        50% {
          filter: drop-shadow(0 0 6px rgba(0, 236, 170, 0.6));
        }
        100% {
          filter: drop-shadow(0 0 1px rgba(0, 236, 170, 0.2));
        }
      }
    ` : ''}
  }
  
  &:hover .icon {
    transform: scale(1.1);
    ${props => !props.active ? `
      background: linear-gradient(135deg, #00ecaa, #00a3ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    ` : ''}
  }
`;

// Add this after the SidebarLink styled component
const WalletContainer = styled.div`
  margin-top: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
`;

interface SidebarProps {
  collapsed: boolean;
  currentPage: string;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, currentPage, toggleSidebar }) => {
  return (
    <SidebarContainer collapsed={collapsed}>
      <ToggleButton onClick={toggleSidebar}>
        {collapsed ? '→' : '←'}
      </ToggleButton>
      
      <SidebarSection style={{ marginTop: '15px' }}>
        <Link href="/" passHref legacyBehavior>
          <SidebarLink collapsed={collapsed} active={currentPage === 'home'}>
            <div className="icon">⭐</div>
            <span>Favorites</span>
          </SidebarLink>
        </Link>
        <Link href="/" passHref legacyBehavior>
          <SidebarLink collapsed={collapsed}>
            <div className="icon">🕒</div>
            <span>Recent</span>
          </SidebarLink>
        </Link>
        <Link href="/" passHref legacyBehavior>
          <SidebarLink collapsed={collapsed}>
            <div className="icon">🏆</div>
            <span>Challenges</span>
          </SidebarLink>
        </Link>
        <Link href="/" passHref legacyBehavior>
          <SidebarLink collapsed={collapsed}>
            <div className="icon">🎮</div>
            <span>My Game Play</span>
          </SidebarLink>
        </Link>
      </SidebarSection>
      
      <SidebarSection>
        <SidebarHeader collapsed={collapsed}>GAMES</SidebarHeader>
        <Link href="/game/rock-paper-scissors" passHref legacyBehavior>
          <SidebarLink collapsed={collapsed} active={currentPage === 'rock-paper-scissors'}>
            <div className="icon">✊</div>
            <span>Rock Paper Scissors</span>
          </SidebarLink>
        </Link>
        <Link href="/game/blackjack" passHref legacyBehavior>
          <SidebarLink collapsed={collapsed} active={currentPage === 'blackjack'}>
            <div className="icon">🃏</div>
            <span>Blackjack</span>
          </SidebarLink>
        </Link>
        <Link href="/game/minesweeper" passHref legacyBehavior>
          <SidebarLink collapsed={collapsed} active={currentPage === 'minesweeper'}>
            <div className="icon">💣</div>
            <span>Mines</span>
          </SidebarLink>
        </Link>
      </SidebarSection>
      
      <SidebarSection>
        <SidebarHeader collapsed={collapsed}>MORE</SidebarHeader>
        <Link href="/support" passHref legacyBehavior>
          <SidebarLink collapsed={collapsed} active={currentPage === 'support'}>
            <div className="icon">💬</div>
            <span>Support</span>
          </SidebarLink>
        </Link>
        <Link href="/responsible-gaming" passHref legacyBehavior>
          <SidebarLink collapsed={collapsed} active={currentPage === 'responsible-gaming'}>
            <div className="icon">🛡️</div>
            <span>Responsible Gaming</span>
          </SidebarLink>
        </Link>
      </SidebarSection>
      
      <WalletContainer>
        <WalletMultiButton />
        <WalletBalance />
      </WalletContainer>
    </SidebarContainer>
  );
};

export default Sidebar; 