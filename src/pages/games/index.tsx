import React from 'react';
import styled from 'styled-components';
import Head from 'next/head';
import Link from 'next/link';

const PageContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const PageTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 30px;
  color: var(--text-primary);
`;

const GamesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
`;

const GameCard = styled.div`
  background-color: var(--card-bg);
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  }
`;

const GameImageContainer = styled.div`
  height: 180px;
  background-color: var(--primary-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
`;

const GameInfo = styled.div`
  padding: 15px;
`;

const GameName = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 10px;
  color: var(--text-primary);
`;

const GameDescription = styled.p`
  color: var(--text-secondary);
  font-size: 0.875rem;
  line-height: 1.5;
  margin-bottom: 15px;
`;

const GameTagsContainer = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const GameTag = styled.span`
  background-color: var(--primary-bg);
  color: var(--text-secondary);
  font-size: 0.75rem;
  padding: 4px 8px;
  border-radius: 4px;
`;

const PlayButton = styled.button`
  width: 100%;
  padding: 10px;
  background-color: var(--button-primary);
  color: white;
  border-radius: 4px;
  font-weight: 600;
  margin-top: 15px;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--button-hover);
  }
`;

interface Game {
  id: string;
  name: string;
  description: string;
  icon: string;
  path: string;
  tags: string[];
  isNew?: boolean;
  isPopular?: boolean;
}

const GamesPage = () => {
  const games: Game[] = [
    {
      id: 'rock-paper-scissors',
      name: 'Rock Paper Scissors',
      description: 'The classic game reimagined on Solana. Play against other users with SOL wagers.',
      icon: '✊',
      path: '/game/rock-paper-scissors',
      tags: ['Multiplayer', 'P2P', 'Simple'],
      isPopular: true
    },
    {
      id: 'blackjack',
      name: 'Blackjack',
      description: 'Play head-to-head blackjack with your friends. Get closer to 21 than your opponent without going over.',
      icon: '🃏',
      path: '/game/blackjack',
      tags: ['Card', '1v1', 'Skill'],
      isNew: true
    },
    {
      id: 'minesweeper',
      name: 'Mines',
      description: 'Strategic mining game inspired by Minesweeper. Reveal gems and avoid the bomb to increase your wins.',
      icon: '💣',
      path: '/game/minesweeper',
      tags: ['Strategy', 'Multiplayer', 'Classic'],
      isNew: true
    }
    /* Coming soon:
    {
      id: 'coin-flip',
      name: 'Coin Flip',
      description: 'Bet on heads or tails with instant outcome. Provably fair results.',
      icon: '🪙',
      path: '/game/coin-flip',
      tags: ['Single-player', 'Instant', 'Classic'],
      isNew: true
    },
    {
      id: 'dice-roll',
      name: 'Dice Roll',
      description: 'Roll the dice and win based on your chosen number. Up to 10x multiplier!',
      icon: '🎲',
      path: '/game/dice-roll',
      tags: ['Single-player', 'Multiplier', 'Simple'],
      isPopular: true
    },
    {
      id: 'slots',
      name: 'Solana Slots',
      description: 'Spin the reels and match symbols to win SOL. Various paylines and bonus features.',
      icon: '🎰',
      path: '/game/slots',
      tags: ['Single-player', 'Random', 'Fun'],
      isPopular: true
    },
    {
      id: 'roulette',
      name: 'Roulette',
      description: 'Place your bets on numbers, colors, or sections and spin the wheel.',
      icon: '🔴',
      path: '/game/roulette',
      tags: ['Strategy', 'Multiplier', 'Classic'],
      isNew: true
    }
    */
  ];

  return (
    <>
      <Head>
        <title>Games | Rock Paper Solana</title>
        <meta name="description" content="Play blockchain games on Solana with SOL wagers" />
      </Head>
      
      <PageContainer>
        <PageTitle>Games</PageTitle>
        
        <GamesGrid>
          {games.map(game => (
            <Link href={game.path} key={game.id}>
              <GameCard>
                <GameImageContainer>
                  {game.icon}
                </GameImageContainer>
                <GameInfo>
                  <GameName>{game.name}</GameName>
                  <GameDescription>{game.description}</GameDescription>
                  <GameTagsContainer>
                    {game.tags.map(tag => (
                      <GameTag key={tag}>{tag}</GameTag>
                    ))}
                    {game.isNew && <GameTag style={{ backgroundColor: 'var(--accent-blue)', color: 'white' }}>New</GameTag>}
                    {game.isPopular && <GameTag style={{ backgroundColor: 'var(--accent-green)', color: 'white' }}>Popular</GameTag>}
                  </GameTagsContainer>
                  <PlayButton>Play Now</PlayButton>
                </GameInfo>
              </GameCard>
            </Link>
          ))}
        </GamesGrid>
      </PageContainer>
    </>
  );
};

export default GamesPage; 