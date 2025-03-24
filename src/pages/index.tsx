import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useWallet } from '../contexts/WalletContext';
import AppSidebar from '../components/Sidebar';

const PageContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #101d2f;
  color: white;
  position: relative;
`;

interface SidebarProps {
  collapsed: boolean;
}

const SidebarContainer = styled.div<SidebarProps>`
  width: ${props => props.collapsed ? '60px' : '200px'};
  background-color: #0e1c30;
  padding: 10px 0;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  overflow-y: auto;
  z-index: 1000;
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  transition: width 0.3s ease-in-out;
`;

const ToggleButton = styled.button`
  position: absolute;
  top: 20px;
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
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const SidebarSection = styled.div`
  margin-bottom: 24px;
`;

const FirstSidebarSection = styled(SidebarSection)`
  margin-top: 70px; /* Add space to start below header */
`;

const SidebarHeader = styled.div<SidebarProps>`
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  padding: 8px 20px;
  font-weight: 600;
  letter-spacing: 0.5px;
  white-space: nowrap;
  overflow: hidden;
  opacity: ${props => props.collapsed ? 0 : 1};
  transition: opacity 0.2s ease-in-out;
  height: ${props => props.collapsed ? '0' : 'auto'};
`;

interface SidebarLinkProps {
  collapsed: boolean;
  active?: boolean;
}

const SidebarLink = styled.a<SidebarLinkProps>`
  display: flex;
  align-items: center;
  padding: ${props => props.collapsed ? '12px 0' : '12px 20px'};
  justify-content: ${props => props.collapsed ? 'center' : 'flex-start'};
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.95rem;
  transition: all 0.2s;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
    color: white;
  }
  
  span {
    margin-left: ${props => props.collapsed ? '0' : '10px'};
    opacity: ${props => props.collapsed ? 0 : 1};
    transition: opacity 0.2s ease-in-out;
    display: ${props => props.collapsed ? 'none' : 'inline'};
  }
  
  .icon {
    font-size: 1.2rem;
    min-width: ${props => props.collapsed ? '100%' : '24px'};
    text-align: center;
  }
`;

const ActiveSidebarLink = styled(SidebarLink)`
  color: white;
  background-color: rgba(255, 255, 255, 0.1);
  border-left: 3px solid var(--button-primary);
  padding-left: ${props => props.collapsed ? '0' : '17px'};
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const MainContent = styled.div<SidebarProps>`
  flex: 1;
  margin-left: ${props => props.collapsed ? '60px' : '200px'};
  padding: 0;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: ${props => props.collapsed ? 'calc(100% - 60px)' : 'calc(100% - 200px)'};
  transition: margin-left 0.3s ease-in-out, width 0.3s ease-in-out;
`;

const ContentArea = styled.div`
  padding: 30px 40px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
`;

const PrimaryButton = styled.button`
  padding: 10px 20px;
  background-color: var(--button-primary);
  color: white;
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.9rem;
  transition: background-color 0.2s, transform 0.1s;
  
  &:hover {
    background-color: var(--button-hover);
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const SearchBar = styled.div`
  position: relative;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 20px 12px 45px;
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.2);
    background-color: rgba(255, 255, 255, 0.07);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

const SearchIconWrapper = styled.div`
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.4);
`;

const WalletInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
`;

const HeroSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 60px 20px;
  background: linear-gradient(120deg, #6c56c2, #48a0a0);
  box-shadow: 0 10px 30px rgba(95, 44, 130, 0.3);
  border-radius: 16px;
  margin-bottom: 40px;
  position: relative;
  overflow: hidden;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 20% 150%, rgba(255, 255, 255, 0.15) 0%, transparent 80%);
    pointer-events: none;
  }
`;

const HeroTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 20px;
  background: linear-gradient(to right, #ffffff, #e0e0e0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  position: relative;
  z-index: 2;
`;

const HeroSubtitle = styled.p`
  font-size: 1.3rem;
  color: #f0f0f0;
  max-width: 700px;
  margin-bottom: 40px;
  line-height: 1.6;
  position: relative;
  z-index: 2;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;
`;

const SectionTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 20px;
  color: var(--text-primary);
`;

const FeaturedGamesSection = styled.div`
  margin-bottom: 40px;
`;

const GameGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
`;

const GameCard = styled.div`
  background-color: var(--card-bg);
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }
`;

const GameImage = styled.div`
  height: 160px;
  background-color: var(--primary-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
`;

const GameInfo = styled.div`
  padding: 15px;
`;

const GameTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text-primary);
`;

const GameDescription = styled.p`
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 15px;
`;

const PlayButton = styled.button`
  padding: 8px 16px;
  background-color: var(--button-primary);
  color: white;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.9rem;
  width: 100%;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: var(--button-hover);
  }
`;

const StyledLink = styled(Link)`
  display: block;
  width: 100%;
  text-decoration: none;
`;

const InfoSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-bottom: 40px;
`;

const InfoCard = styled.div`
  background-color: var(--card-bg);
  border-radius: 12px;
  padding: 30px;
`;

const InfoIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 15px;
`;

const InfoTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 10px;
  color: var(--text-primary);
`;

const InfoDescription = styled.p`
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 15px;
`;

const LearnMoreLink = styled.a`
  color: var(--accent-blue);
  text-decoration: underline;
  font-size: 0.9rem;
  
  &:hover {
    color: var(--text-primary);
  }
`;

const HomePage = () => {
  const router = useRouter();
  const { connected } = useWallet();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const navigateToGames = () => {
    router.push('/games');
  };
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
  
  // Redirect game links if needed
  useEffect(() => {
    // Check if there's a redirect in the URL (for handling game links)
    const { redirect, invite, id } = router.query;
    
    if (redirect) {
      if (redirect === 'blackjack' && invite) {
        router.push(`/game/blackjack?invite=${invite}`);
      } else if (redirect === 'minesweeper' && id) {
        router.push(`/game/minesweeper?id=${id}`);
      }
    }
  }, [router.query, router.isReady]);
  
  return (
    <>
      <Head>
        <title>Play Games & Win SOL | Rock Paper Solana</title>
        <meta name="description" content="Play Rock Paper Scissors, Blackjack, and other games on the Solana blockchain. Win SOL tokens while having fun!" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <PageContainer>
        <AppSidebar 
          collapsed={sidebarCollapsed}
          currentPage="home"
          toggleSidebar={toggleSidebar}
        />
        
        <MainContent collapsed={sidebarCollapsed}>
          <ContentArea>
            <HeroSection>
              <HeroTitle>Play & Wager on Solana</HeroTitle>
              <HeroSubtitle>
                Enjoy classic and modern games with blockchain-based wagering on the Solana network. 
                Fast, secure, and low fees.
              </HeroSubtitle>
              
              <ButtonContainer style={{ marginTop: '30px' }}>
                <PrimaryButton onClick={navigateToGames} style={{ background: '#00c853', padding: '12px 30px' }}>
                  Play Now
                </PrimaryButton>
              </ButtonContainer>
            </HeroSection>
            
            <FeaturedGamesSection>
              <SectionTitle>Featured Games</SectionTitle>
              <GameGrid>
                <GameCard>
                  <GameImage>✊</GameImage>
                  <GameInfo>
                    <GameTitle>Rock Paper Scissors</GameTitle>
                    <GameDescription>
                      The classic game of chance with a blockchain twist. Wager SOL and play against friends.
                    </GameDescription>
                    <StyledLink href="/game/rock-paper-scissors">
                      <PlayButton style={{ background: '#00c853' }}>Play Now</PlayButton>
                    </StyledLink>
                  </GameInfo>
                </GameCard>
                
                <GameCard>
                  <GameImage>💣</GameImage>
                  <GameInfo>
                    <GameTitle>Multiplayer Minesweeper</GameTitle>
                    <GameDescription>
                      Take turns revealing tiles in this strategic multiplayer game. Avoid the mines or your opponent wins.
                    </GameDescription>
                    <StyledLink href="/game/minesweeper">
                      <PlayButton style={{ background: '#00c853' }}>Play Now</PlayButton>
                    </StyledLink>
                  </GameInfo>
                </GameCard>
                
                <GameCard>
                  <GameImage>🃏</GameImage>
                  <GameInfo>
                    <GameTitle>Blackjack</GameTitle>
                    <GameDescription>
                      The popular card game where strategy matters. Play against an opponent and win SOL.
                    </GameDescription>
                    <StyledLink href="/game/blackjack">
                      <PlayButton style={{ background: '#00c853' }}>Play Now</PlayButton>
                    </StyledLink>
                  </GameInfo>
                </GameCard>
              </GameGrid>
            </FeaturedGamesSection>
            
            <InfoSection>
              <InfoCard>
                <InfoIcon>🔒</InfoIcon>
                <InfoTitle>Secure & Transparent</InfoTitle>
                <InfoDescription>
                  All games run on Solana's blockchain, ensuring transparency and security 
                  for every transaction and game result.
                </InfoDescription>
                <LearnMoreLink href="https://solana.com/learning/blockchain-security" target="_blank">
                  Learn More
                </LearnMoreLink>
              </InfoCard>
              
              <InfoCard>
                <InfoIcon>⚡</InfoIcon>
                <InfoTitle>Fast & Low Fees</InfoTitle>
                <InfoDescription>
                  Solana's high-performance blockchain allows for near-instant transactions 
                  with fees that are a fraction of a cent.
                </InfoDescription>
                <LearnMoreLink href="https://solana.com/developers" target="_blank">
                  Learn More
                </LearnMoreLink>
              </InfoCard>
              
              <InfoCard>
                <InfoIcon>🏆</InfoIcon>
                <InfoTitle>Fair Gameplay</InfoTitle>
                <InfoDescription>
                  Provably fair algorithms ensure that all game outcomes are random and 
                  cannot be manipulated by anyone.
                </InfoDescription>
                <LearnMoreLink href="https://en.wikipedia.org/wiki/Provably_fair" target="_blank">
                  Learn More
                </LearnMoreLink>
              </InfoCard>
            </InfoSection>
          </ContentArea>
        </MainContent>
      </PageContainer>
    </>
  );
};

export default HomePage; 