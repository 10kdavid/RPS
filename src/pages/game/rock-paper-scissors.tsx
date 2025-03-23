import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useWallet } from '../../contexts/WalletContext';
import AppSidebar from '../../components/Sidebar';

// Game constants
enum Move {
  ROCK = 'rock',
  PAPER = 'paper',
  SCISSORS = 'scissors'
}

enum GameResult {
  WIN = 'win',
  LOSE = 'lose',
  DRAW = 'draw',
  NOT_DETERMINED = 'not_determined'
}

// Styled components
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

const MainContent = styled.div<SidebarProps>`
  flex: 1;
  margin-left: ${props => props.collapsed ? '60px' : '200px'};
  padding: 0;
  display: flex;
  flex-direction: column;
  width: ${props => props.collapsed ? 'calc(100% - 60px)' : 'calc(100% - 200px)'};
  transition: margin-left 0.3s ease-in-out, width 0.3s ease-in-out;
`;

const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  padding: 20px;
`;

const GameContent = styled.div`
  display: flex;
  gap: 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const LeftPanel = styled.div`
  flex: 0 0 320px;
  background-color: #0e1c30;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  flex-direction: column;
`;

const RightPanel = styled.div`
  flex: 1;
  background-color: #0e1c30;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  flex-direction: column;
`;

const ControlTabs = styled.div`
  display: flex;
  gap: 5px;
  margin-bottom: 20px;
`;

const ControlTab = styled.button<{ isActive: boolean }>`
  padding: 8px 16px;
  background-color: ${props => props.isActive ? '#1e293b' : 'rgba(255,255,255,0.05)'};
  border-radius: 4px;
  color: ${props => props.isActive ? 'white' : 'rgba(255,255,255,0.6)'};
  font-size: 0.9rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.isActive ? '#1e293b' : 'rgba(255,255,255,0.1)'};
  }
`;

const BetAmountSection = styled.div`
  margin-bottom: 20px;
`;

const SectionLabel = styled.div`
  font-size: 0.8rem;
  color: rgba(255,255,255,0.6);
  margin-bottom: 8px;
`;

const BetInput = styled.div`
  display: flex;
  align-items: center;
`;

const AmountInput = styled.input`
  width: 100%;
  background-color: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  color: white;
  padding: 10px;
  border-radius: 4px;
  font-size: 1rem;
  outline: none;
  
  &:focus {
    border-color: rgba(255,255,255,0.2);
  }
`;

const CurrencyIndicator = styled.div`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CurrencyIcon = styled.span`
  font-size: 1.2rem;
  color: #FFD700;
  margin-right: 6px;
  font-weight: bold;
`;

const SectionTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 1.2rem;
  color: #FFFFFF;
  font-weight: 600;
`;

const BettingSection = styled.div`
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
`;

const QuickButtonContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
`;

const QuickAmountButton = styled.button`
  background-color: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  color: #FFFFFF;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
`;

const ActionsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
`;

const ActionButton = styled.button`
  background: linear-gradient(135deg, #7C4DFF 0%, #448AFF 100%);
  border: none;
  border-radius: 8px;
  padding: 12px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(124, 77, 255, 0.4);
  }
  
  &:disabled {
    background: #3c3c3c;
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const SecondaryButton = styled.button`
  background: transparent;
  border: 1px solid #7C4DFF;
  border-radius: 8px;
  padding: 12px;
  color: #7C4DFF;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background: rgba(124, 77, 255, 0.1);
  }
  
  &:disabled {
    border-color: #3c3c3c;
    color: #3c3c3c;
    cursor: not-allowed;
  }
`;

const GameInfo = styled.div`
  padding: 16px;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.05);
  margin-top: 20px;
  
  p {
    margin: 8px 0;
    font-size: 0.9rem;
    color: #d0d0d0;
  }
  
  p:first-child {
    margin-top: 0;
  }
  
  p:last-child {
    margin-bottom: 0;
  }
`;

const GameTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin: 20px 0;
  color: white;
`;

const MoveSelectionArea = styled.div`
  display: flex;
  gap: 20px;
  margin: 20px 0;
  justify-content: center;
`;

const MovesDisplayArea = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 40px;
  background-color: rgba(255,255,255,0.02);
  border-radius: 8px;
  padding: 25px 15px;
  margin-bottom: 20px;
`;

const PlayerSide = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const PlayerLabel = styled.div`
  font-size: 0.9rem;
  color: rgba(255,255,255,0.6);
  margin-bottom: 10px;
`;

const MoveDisplay = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 8px;
  background-color: rgba(255,255,255,0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
`;

const VersusText = styled.div`
  font-size: 1.2rem;
  font-weight: 600;
  color: rgba(255,255,255,0.4);
  padding: 0 10px;
`;

const ResultIndicator = styled.div<{ result: GameResult }>`
  margin-top: 15px;
  font-size: 1.1rem;
  font-weight: 600;
  color: ${props => {
    switch(props.result) {
      case GameResult.WIN: return '#37b24d';
      case GameResult.LOSE: return '#f03e3e'; 
      case GameResult.DRAW: return '#fab005';
      default: return 'transparent';
    }
  }};
  visibility: ${props => props.result === GameResult.NOT_DETERMINED ? 'hidden' : 'visible'};
`;

const MoveOption = styled.div<{ isSelected: boolean, color: string }>`
  width: 120px;
  height: 120px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.isSelected ? props.color + '33' : 'rgba(255,255,255,0.05)'};
  border: 2px solid ${props => props.isSelected ? props.color : 'transparent'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.isSelected ? props.color + '33' : 'rgba(255,255,255,0.1)'};
    transform: translateY(-3px);
  }
`;

const MoveIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 8px;
`;

const MoveName = styled.div`
  font-size: 0.9rem;
  font-weight: 500;
`;

const StatsContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-top: auto;
`;

const StatBox = styled.div`
  flex: 1;
  background-color: rgba(255,255,255,0.05);
  border-radius: 4px;
  padding: 10px;
`;

const StatTitle = styled.div`
  font-size: 0.8rem;
  color: rgba(255,255,255,0.6);
  margin-bottom: 5px;
`;

const StatValue = styled.div`
  font-size: 1rem;
  font-weight: 500;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StatRemove = styled.button`
  border: none;
  background: none;
  font-size: 1rem;
  color: rgba(255,255,255,0.6);
  cursor: pointer;
  
  &:hover {
    color: white;
  }
`;

const GameHistory = styled.div`
  margin-top: 20px;
`;

const HistoryTitle = styled.h3`
  font-size: 1rem;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const TabsRow = styled.div`
  display: flex;
  gap: 5px;
  margin-bottom: 15px;
`;

const HistoryTab = styled.button<{ isActive: boolean }>`
  padding: 8px 16px;
  background-color: ${props => props.isActive ? '#1e293b' : 'rgba(255,255,255,0.05)'};
  border-radius: 4px;
  color: ${props => props.isActive ? 'white' : 'rgba(255,255,255,0.6)'};
  font-size: 0.9rem;
  border: none;
  cursor: pointer;
  
  &:hover {
    background-color: ${props => props.isActive ? '#1e293b' : 'rgba(255,255,255,0.1)'};
  }
`;

const HistoryList = styled.div`
  overflow-y: auto;
  max-height: 200px;
`;

const HistoryItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  
  &:last-child {
    border-bottom: none;
  }
`;

const HistoryMoves = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const HistoryMove = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: rgba(255,255,255,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
`;

const HistoryResult = styled.div<{ result: string }>`
  font-size: 0.9rem;
  font-weight: 500;
  color: ${props => {
    switch(props.result) {
      case 'win': return '#37b24d';
      case 'lose': return '#f03e3e';
      case 'draw': return '#fab005';
      default: return 'white';
    }
  }};
`;

const HistoryAmount = styled.div`
  font-size: 0.9rem;
`;

const HistoryTime = styled.div`
  font-size: 0.8rem;
  color: rgba(255,255,255,0.6);
`;

// Game component
const RockPaperScissorsGame = () => {
  const router = useRouter();
  const { connected, openWalletModal } = useWallet();
  
  // Game state
  const [betAmount, setBetAmount] = useState<string>('0.00');
  const [selectedMove, setSelectedMove] = useState<Move | null>(null);
  const [opponentMove, setOpponentMove] = useState<Move | null>(null);
  const [gameResult, setGameResult] = useState<GameResult>(GameResult.NOT_DETERMINED);
  const [isManualMode, setIsManualMode] = useState<boolean>(true);
  const [winChance, setWinChance] = useState<number>(33); // Default to 33% chance (1/3)
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
  
  // Handle bet input change
  const handleBetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and decimals
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setBetAmount(value);
  };
  
  // Quick bet amount functions
  const halfBet = () => {
    const current = parseFloat(betAmount);
    if (!isNaN(current)) {
      setBetAmount((current / 2).toFixed(2));
    }
  };
  
  const doubleBet = () => {
    const current = parseFloat(betAmount);
    if (!isNaN(current)) {
      setBetAmount((current * 2).toFixed(2));
    }
  };
  
  // Handle move selection
  const handleMoveSelect = (move: Move) => {
    setSelectedMove(move);
  };
  
  // Handle play button click
  const handlePlay = () => {
    // Check if wallet is connected and move is selected
    if (!connected) {
      openWalletModal();
      return;
    }
    
      if (!selectedMove) {
        return;
      }
      
        // Randomly select opponent move
        const moves = [Move.ROCK, Move.PAPER, Move.SCISSORS];
        const opponentMoveSelected = moves[Math.floor(Math.random() * moves.length)];
        setOpponentMove(opponentMoveSelected);
        
        // Determine the game result
        determineResult(selectedMove, opponentMoveSelected);
  };
  
  // Determine the game result
  const determineResult = (playerMove: Move, opponentMove: Move) => {
    if (playerMove === opponentMove) {
      setGameResult(GameResult.DRAW);
    } else if (
      (playerMove === Move.ROCK && opponentMove === Move.SCISSORS) ||
      (playerMove === Move.PAPER && opponentMove === Move.ROCK) ||
      (playerMove === Move.SCISSORS && opponentMove === Move.PAPER)
    ) {
      setGameResult(GameResult.WIN);
    } else {
      setGameResult(GameResult.LOSE);
    }
  };
  
  // Calculate potential win amount
  const calculateWinAmount = () => {
    const amount = parseFloat(betAmount);
    if (isNaN(amount)) return 0;
    
    // For rock-paper-scissors, fair odds would be 3 (1/0.33)
    return (amount * 3).toFixed(2);
  };
  
  // Get display icon for move
  const getMoveIcon = (move: Move | null) => {
    switch (move) {
      case Move.ROCK: return '✊';
      case Move.PAPER: return '✋';
      case Move.SCISSORS: return '✌️';
      default: return '❓';
    }
  };
  
  // Get move color
  const getMoveColor = (move: Move | null) => {
    switch (move) {
      case Move.ROCK: return '#f03e3e'; // Red
      case Move.PAPER: return '#4263eb'; // Blue
      case Move.SCISSORS: return '#37b24d'; // Green
      default: return '#adb5bd';
    }
  };
  
  // Mock history data
  const historyData = [
    { playerMove: Move.ROCK, opponentMove: Move.SCISSORS, result: 'win', amount: '+0.50', time: '2 min ago' },
    { playerMove: Move.PAPER, opponentMove: Move.SCISSORS, result: 'lose', amount: '-0.25', time: '5 min ago' },
    { playerMove: Move.SCISSORS, opponentMove: Move.SCISSORS, result: 'draw', amount: '0.00', time: '12 min ago' },
    { playerMove: Move.ROCK, opponentMove: Move.PAPER, result: 'lose', amount: '-0.10', time: '15 min ago' }
  ];
  
  const handleConnectWallet = () => {
    openWalletModal();
  };
  
        return (
    <>
      <Head>
        <title>Rock Paper Scissors | Rock Paper Solana</title>
        <meta name="description" content="Play Rock Paper Scissors on the Solana blockchain" />
      </Head>
      
      <PageContainer>
        <AppSidebar 
          collapsed={sidebarCollapsed}
          currentPage="rock-paper-scissors"
          toggleSidebar={toggleSidebar}
        />
        
        <MainContent collapsed={sidebarCollapsed}>
          <GameContainer>
            <GameTitle>Rock Paper Scissors</GameTitle>
            
            <GameContent>
              <LeftPanel>
                <SectionTitle>Place Your Bet</SectionTitle>
                
                <BettingSection>
                  <SectionLabel>Bet Amount (SOL)</SectionLabel>
                  <BetInput>
                    <CurrencyIcon>Ⓢ</CurrencyIcon>
                    <AmountInput 
                      type="text" 
                      value={betAmount} 
                      onChange={handleBetChange}
                    />
                  </BetInput>
                  
                  <QuickButtonContainer>
                    <QuickAmountButton onClick={() => setBetAmount('0.05')}>0.05</QuickAmountButton>
                    <QuickAmountButton onClick={() => setBetAmount('0.1')}>0.1</QuickAmountButton>
                    <QuickAmountButton onClick={() => setBetAmount('0.5')}>0.5</QuickAmountButton>
                    <QuickAmountButton onClick={() => setBetAmount('1')}>1</QuickAmountButton>
                  </QuickButtonContainer>
                </BettingSection>
                
                <ActionsSection>
                  <SectionTitle>Game Mode</SectionTitle>
                  <ActionButton 
                    onClick={handlePlay}
                    disabled={!connected || !selectedMove || parseFloat(betAmount) <= 0}
                  >
                    Create Game
                  </ActionButton>
                  <ActionButton 
                    onClick={handlePlay}
                    disabled={!connected || !selectedMove || parseFloat(betAmount) <= 0}
                  >
                    Find Opponent
                  </ActionButton>
                  <SecondaryButton 
                    onClick={handlePlay}
                    disabled={!connected || !selectedMove || parseFloat(betAmount) <= 0}
                  >
                    Play Solo
                  </SecondaryButton>
                </ActionsSection>
                
                <GameInfo>
                  <p>Choose rock, paper, or scissors to play against an opponent. Winner takes the pot!</p>
                  <p>• Rock beats scissors</p>
                  <p>• Scissors beats paper</p>
                  <p>• Paper beats rock</p>
                  <p>• Same moves result in a draw</p>
                </GameInfo>
              </LeftPanel>
              
              <RightPanel>
                <MovesDisplayArea>
                  <PlayerSide>
                    <PlayerLabel>Your Move</PlayerLabel>
                    <MoveDisplay>
                      {selectedMove ? getMoveIcon(selectedMove) : '?'}
                    </MoveDisplay>
                    <ResultIndicator result={gameResult}>
                      {gameResult === GameResult.WIN ? 'WIN' : 
                       gameResult === GameResult.LOSE ? 'LOSE' : 
                       gameResult === GameResult.DRAW ? 'DRAW' : ''}
                    </ResultIndicator>
                  </PlayerSide>
                  <VersusText>VS</VersusText>
                  <PlayerSide>
                    <PlayerLabel>Opponent</PlayerLabel>
                    <MoveDisplay>
                      {opponentMove ? getMoveIcon(opponentMove) : '?'}
                    </MoveDisplay>
                  </PlayerSide>
                </MovesDisplayArea>
                
                <MoveSelectionArea>
                  <MoveOption 
            isSelected={selectedMove === Move.ROCK}
            onClick={() => handleMoveSelect(Move.ROCK)}
                    color="#f03e3e"
          >
            <MoveIcon>✊</MoveIcon>
            <MoveName>Rock</MoveName>
                  </MoveOption>
                  <MoveOption 
            isSelected={selectedMove === Move.PAPER}
            onClick={() => handleMoveSelect(Move.PAPER)}
                    color="#4263eb"
          >
            <MoveIcon>✋</MoveIcon>
            <MoveName>Paper</MoveName>
                  </MoveOption>
                  <MoveOption 
            isSelected={selectedMove === Move.SCISSORS}
            onClick={() => handleMoveSelect(Move.SCISSORS)}
                    color="#37b24d"
          >
            <MoveIcon>✌️</MoveIcon>
            <MoveName>Scissors</MoveName>
                  </MoveOption>
                </MoveSelectionArea>
                
                <StatsContainer>
                  <StatBox>
                    <StatTitle>Winnings</StatTitle>
                    <StatValue>
                      2.0000
                      <StatRemove>×</StatRemove>
                    </StatValue>
                  </StatBox>
                  
                  <StatBox>
                    <StatTitle>Roll Over</StatTitle>
                    <StatValue>
                      50/50
                      <StatRemove>×</StatRemove>
                    </StatValue>
                  </StatBox>
                  
                  <StatBox>
                    <StatTitle>Win Chance</StatTitle>
                    <StatValue>
                      33.3333%
                      <StatRemove>×</StatRemove>
                    </StatValue>
                  </StatBox>
                </StatsContainer>
                
                <GameHistory>
                  <HistoryTitle>
                    Game History
                    <span>Fairness</span>
                  </HistoryTitle>
                  
                  <TabsRow>
                    <HistoryTab isActive={true}>Big Wins</HistoryTab>
                    <HistoryTab isActive={false}>Lucky Wins</HistoryTab>
                    <HistoryTab isActive={false}>My Bets</HistoryTab>
                    <HistoryTab isActive={false}>All Bets</HistoryTab>
                  </TabsRow>
                  
                  <HistoryList>
                    {historyData.map((item, index) => (
                      <HistoryItem key={index}>
                        <HistoryMoves>
                          <HistoryMove>{getMoveIcon(item.playerMove)}</HistoryMove>
                          <span>vs</span>
                          <HistoryMove>{getMoveIcon(item.opponentMove)}</HistoryMove>
                        </HistoryMoves>
                        <HistoryResult result={item.result}>
                          {item.result.toUpperCase()}
                        </HistoryResult>
                        <HistoryAmount>{item.amount} ₳</HistoryAmount>
                        <HistoryTime>{item.time}</HistoryTime>
                      </HistoryItem>
                    ))}
                  </HistoryList>
                </GameHistory>
              </RightPanel>
            </GameContent>
          </GameContainer>
        </MainContent>
      </PageContainer>
    </>
  );
};

export default RockPaperScissorsGame; 