import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useWallet } from '../../contexts/WalletContext';
import Link from 'next/link';
import AppSidebar from '../../components/Sidebar';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

// Game States & Types
enum GameState {
  INIT = 'INIT',
  WAITING = 'WAITING',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
  WIN = 'WIN'
}

enum PlayerTurn {
  PLAYER_ONE = 'PLAYER_ONE',
  PLAYER_TWO = 'PLAYER_TWO'
}

interface Cell {
  hasMine: boolean;
  revealed: boolean;
  isAnimating: boolean;
}

// Animations
const flipAnimation = keyframes`
  0% {
    transform: rotateY(0deg);
  }
  50% {
    transform: rotateY(90deg);
  }
  100% {
    transform: rotateY(180deg);
  }
`;

const glowAnimation = keyframes`
  0% {
    box-shadow: 0 0 5px rgba(0, 236, 170, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(0, 236, 170, 0.8);
  }
  100% {
    box-shadow: 0 0 5px rgba(0, 236, 170, 0.5);
  }
`;

const explosionAnimation = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  20% {
    transform: scale(1.2);
    opacity: 1;
  }
  40% {
    transform: scale(1.1);
    opacity: 0.9;
  }
  100% {
    transform: scale(3);
    opacity: 0;
  }
`;

const shakeAnimation = keyframes`
  0% { transform: translate(0, 0) rotate(0deg); }
  10% { transform: translate(-1px, -2px) rotate(-1deg); }
  20% { transform: translate(2px, 0px) rotate(1deg); }
  30% { transform: translate(-2px, 2px) rotate(0deg); }
  40% { transform: translate(1px, -1px) rotate(1deg); }
  50% { transform: translate(-1px, 2px) rotate(-1deg); }
  60% { transform: translate(-2px, 1px) rotate(0deg); }
  70% { transform: translate(2px, 1px) rotate(-1deg); }
  80% { transform: translate(-1px, -1px) rotate(1deg); }
  90% { transform: translate(1px, 2px) rotate(0deg); }
  100% { transform: translate(0, 0) rotate(0deg); }
`;

// Styled Components
const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #101d2f;
  color: white;
  position: relative;
  padding: 0 20px;
`;

const GameWrapper = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  padding-top: 40px;
`;

const GameContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 30px;
  width: 100%;
  margin-bottom: 30px;
  
  @media (max-width: 968px) {
    flex-direction: column;
  }
`;

const LeftPanel = styled.div`
  width: 300px;
  background-color: #142438;
  border-radius: 12px;
  padding: 25px;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 968px) {
    width: 100%;
  }
`;

const InputLabel = styled.div`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 8px;
`;

const AmountContainer = styled.div`
  margin-bottom: 20px;
`;

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  background-color: #0e1923;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 10px;
`;

const AmountInput = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  color: white;
  font-size: 1rem;
  
  &:focus {
    outline: none;
  }
`;

const CurrencyIcon = styled.div`
  margin-right: 8px;
  color: #ffb800;
  font-size: 1.2rem;
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
`;

const PercentButton = styled.button`
  background-color: #0e1923;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.7);
  padding: 6px 12px;
  cursor: pointer;
  flex: 1;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
    color: white;
  }
`;

const MinesContainer = styled.div`
  margin-bottom: 20px;
`;

const SelectContainer = styled.div`
  position: relative;
`;

const SelectButton = styled.button`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #0e1923;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  padding: 12px 15px;
  cursor: pointer;
  
  &:hover {
    background-color: #192a3a;
  }
`;

const ActionButton = styled.button`
  width: 100%;
  padding: 14px;
  background-color: #00ecaa;
  border: none;
  border-radius: 8px;
  color: #0e1923;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 12px;
  
  &:hover {
    background-color: #00d69c;
    transform: translateY(-2px);
  }
  
  &:disabled {
    background-color: rgba(0, 236, 170, 0.3);
    cursor: not-allowed;
    transform: none;
  }
`;

const SecondaryButton = styled(ActionButton)`
  background-color: #1e2c3a;
  color: rgba(255, 255, 255, 0.8);
  
  &:hover {
    background-color: #263544;
  }
  
  &:disabled {
    background-color: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.3);
  }
`;

const BettingSection = styled.div`
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 20px;
`;

const ActionsSection = styled.div`
  margin-bottom: 20px;
`;

const GameInfo = styled.div`
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
`;

const GameStat = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 0.9rem;
`;

const StatLabel = styled.span`
  color: rgba(255, 255, 255, 0.6);
`;

const StatValue = styled.span`
  color: white;
  font-weight: 500;
`;

const BetAmountDisplay = styled.div`
  background: rgba(0, 236, 170, 0.1);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 15px;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  
  span {
    font-weight: 600;
    color: #00ecaa;
  }
`;

const RightPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #142438;
  border-radius: 12px;
  padding: 25px;
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(5, 1fr);
  gap: 10px;
  margin: 0 auto;
  width: 100%;
  max-width: 600px;
  aspect-ratio: 1/1;
`;

interface CellProps {
  revealed: boolean;
  hasMine?: boolean;
  isAnimating: boolean;
}

const CellButton = styled.button<CellProps>`
  width: 100%;
  height: 0;
  padding-bottom: 100%; /* Makes it square */
  background-color: ${props => props.revealed 
    ? (props.hasMine ? '#ff394f' : '#1e3245')
    : '#213043'};
  border-radius: 8px;
  border: 2px solid ${props => props.revealed 
    ? (props.hasMine ? 'rgba(255, 57, 79, 0.5)' : 'rgba(0, 236, 170, 0.3)')
    : 'rgba(255, 255, 255, 0.05)'};
  display: flex;
  position: relative;
  cursor: pointer;
  transition: all 0.15s ease;
  perspective: 1000px;
  transform-style: preserve-3d;
  
  ${props => props.isAnimating && css`
    animation: ${flipAnimation} 0.4s ease-out forwards;
  `}
  
  ${props => props.revealed && props.hasMine && css`
    animation: ${shakeAnimation} 0.4s ease-in-out;
  `}
  
  ${props => props.revealed && !props.hasMine && css`
    animation: ${glowAnimation} 2s ease-in-out infinite;
  `}
  
  &:hover {
    transform: ${props => !props.revealed && 'translateY(-2px)'};
    box-shadow: ${props => !props.revealed && '0 6px 12px rgba(0, 0, 0, 0.2)'};
    border-color: rgba(255, 255, 255, 0.2);
  }
  
  &:disabled {
    cursor: default;
    opacity: ${props => props.revealed ? 1 : 0.7};
    transform: none;
    box-shadow: none;
  }
`;

const CellContent = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
`;

const MineElement = styled.div`
  font-size: 32px;
  animation: ${explosionAnimation} 0.4s ease-in-out forwards;
`;

const GemElement = styled.div`
  font-size: 32px;
  color: #00ecaa;
`;

const PlayerTurnIndicator = styled.div`
  padding: 12px;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
  font-weight: 500;
  border-left: 3px solid #00ecaa;
`;

const OpponentSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding: 15px;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #0e1923;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
`;

const PlayerInfo = styled.div`
  flex: 1;
`;

const PlayerName = styled.div`
  font-weight: 500;
  margin-bottom: 3px;
`;

const PlayerStatus = styled.div`
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
`;

const GameOverBanner = styled.div<{isWin: boolean}>`
  background: ${props => props.isWin ? 
    'linear-gradient(120deg, rgba(0, 236, 170, 0.2), rgba(0, 163, 255, 0.2))' : 
    'linear-gradient(120deg, rgba(255, 57, 79, 0.2), rgba(255, 119, 57, 0.2))'};
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  text-align: center;
  
  h3 {
    margin: 0 0 10px 0;
    color: ${props => props.isWin ? '#00ecaa' : '#ff394f'};
    font-size: 1.5rem;
  }
  
  p {
    margin: 0;
    color: rgba(255, 255, 255, 0.7);
  }
`;

const BottomSection = styled.div`
  background-color: #142438;
  border-radius: 12px;
  padding: 20px;
  margin-top: 20px;
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 20px;
`;

interface TabProps {
  active: boolean;
}

const Tab = styled.button<TabProps>`
  padding: 12px 20px;
  background: transparent;
  border: none;
  color: ${props => props.active ? 'white' : 'rgba(255, 255, 255, 0.6)'};
  font-weight: ${props => props.active ? '600' : '400'};
  border-bottom: 2px solid ${props => props.active ? '#00ecaa' : 'transparent'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    color: white;
  }
`;

const TabContent = styled.div`
  padding: 10px 0;
`;

const GameInfoCard = styled.div`
  display: flex;
  background-color: #1a2631;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 20px;
`;

const GameInfoImage = styled.div`
  width: 120px;
  height: 120px;
  background-color: #0099ff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  color: white;
  position: relative;
`;

const GameInfoContent = styled.div`
  flex: 1;
  padding: 20px;
`;

const GameInfoTitle = styled.div`
  font-weight: 600;
  margin-bottom: 10px;
  color: rgba(255, 255, 255, 0.9);
`;

const GameInfoDescription = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  line-height: 1.5;
`;

const SectionTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: white;
  margin-bottom: 15px;
`;

const Sidebar = styled.div`
  width: 250px;
  background-color: #142438;
  border-radius: 12px;
  padding: 20px;
  position: fixed;
  top: 0;
  left: ${props => props.collapsed ? '-250px' : '0'};
  height: 100vh;
  transition: left 0.3s ease;
`;

const SidebarLogo = styled.div`
  text-align: center;
  margin-bottom: 20px;
`;

const RPSLogo = styled.div`
  font-size: 24px;
  font-weight: bold;
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  font-size: 16px;
  color: white;
  cursor: pointer;
  position: absolute;
  top: 10px;
  right: 10px;
`;

const SidebarSection = styled.div`
  margin-bottom: 20px;
`;

const SidebarHeader = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: white;
  margin-bottom: 10px;
`;

const SidebarLink = styled.a<{collapsed: boolean, active: boolean}>`
  display: block;
  padding: 10px;
  color: ${props => props.active ? '#00ecaa' : 'rgba(255, 255, 255, 0.6)'};
  text-align: ${props => props.collapsed ? 'center' : 'left'};
  text-decoration: none;
  transition: all 0.2s;
  
  &:hover {
    color: white;
  }
`;

interface SidebarProps {
  collapsed: boolean;
}

const MainContent = styled.div<SidebarProps>`
  margin-left: ${props => props.collapsed ? '60px' : '200px'};
  padding: 20px;
  transition: margin-left 0.3s ease-in-out;
  width: calc(100% - ${props => props.collapsed ? '60px' : '200px'});
  min-height: 100vh;
`;

const GameLink = styled.div`
  background-color: rgba(0, 0, 0, 0.2);
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 15px;
  font-size: 0.8rem;
  word-break: break-all;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const StatusMessage = styled.p`
  color: #00eca4;
  font-weight: bold;
  margin-top: 10px;
`;

const ErrorMessage = styled.div`
  color: #ff5252;
  font-size: 0.85rem;
  margin: 10px 0;
  padding: 8px;
  background-color: rgba(255, 82, 82, 0.1);
  border-radius: 4px;
  border-left: 3px solid #ff5252;
`;

const GameActivityPanel = styled.div`
  margin-top: 20px;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 15px;
  max-height: 200px;
  overflow-y: auto;
`;

const ActivityHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const ActivityTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
`;

const LastUpdated = styled.span`
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
`;

const ActivityMessages = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const EmptyActivity = styled.div`
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
  padding: 20px 0;
  font-style: italic;
`;

const ActivityMessage = styled.div`
  display: flex;
  gap: 8px;
  font-size: 0.85rem;
  padding: 5px 0;
`;

const ActivityTime = styled.span`
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.75rem;
`;

const ActivityText = styled.span`
  color: white;
`;

const MinesweeperGame: React.FC = () => {
  const router = useRouter();
  const { connected, balance, publicKey, openWalletModal } = useWallet();
  
  // Game state
  const [gameState, setGameState] = useState<GameState>(GameState.INIT);
  const [playerTurn, setPlayerTurn] = useState<PlayerTurn>(PlayerTurn.PLAYER_ONE);
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [minesCount, setMinesCount] = useState(0);
  const [revealedCount, setRevealedCount] = useState(0);
  const [movesCount, setMovesCount] = useState(0);
  const [revealedThisTurn, setRevealedThisTurn] = useState(0);
  const [betAmount, setBetAmount] = useState(0.1);
  const [activeTab, setActiveTab] = useState('bet');
  const [isMultiplayer, setIsMultiplayer] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [hasOpponent, setHasOpponent] = useState<boolean>(false);
  const [opponentName, setOpponentName] = useState<string>("Waiting for opponent...");
  const [gameLink, setGameLink] = useState<string>("");
  const [gameId, setGameId] = useState<string | null>(null);
  const [isCreator, setIsCreator] = useState<boolean>(false);
  const [isOpponentReady, setIsOpponentReady] = useState<boolean>(false);
  
  // Add these new state variables for wagering
  const [isWagerPending, setIsWagerPending] = useState<boolean>(false);
  const [wagerSuccess, setWagerSuccess] = useState<boolean>(false);
  const [wagerError, setWagerError] = useState<string | null>(null);
  const [gameWinner, setGameWinner] = useState<string | null>(null);
  
  // Add these new state variables for real-time updates
  const [gameMessages, setGameMessages] = useState<string[]>([]);
  const [isOpponentOnline, setIsOpponentOnline] = useState<boolean>(false);
  const [lastActionTime, setLastActionTime] = useState<string | null>(null);
  
  // Constants
  const GRID_SIZE = 5;
  const MINE_COUNT = 1; // Just one mine as requested
  const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;
  const SAFE_CELLS = TOTAL_CELLS - MINE_COUNT;
  
  // Initialize grid
  const initializeGrid = (): Cell[][] => {
    const newGrid: Cell[][] = Array(GRID_SIZE).fill(null).map(() => 
      Array(GRID_SIZE).fill(null).map(() => ({ 
        hasMine: false, 
        revealed: false,
        isAnimating: false
      }))
    );
    
    // Place exactly 1 mine
    let minesPlaced = 0;
    while (minesPlaced < MINE_COUNT) {
      const row = Math.floor(Math.random() * GRID_SIZE);
      const col = Math.floor(Math.random() * GRID_SIZE);
      
      if (!newGrid[row][col].hasMine) {
        newGrid[row][col].hasMine = true;
        minesPlaced++;
      }
    }
    
    return newGrid;
  };
  
  // Generate a unique game link for inviting opponents
  const generateGameLink = () => {
    if (!gameId) return "";
    return `${window.location.origin}/game/minesweeper?id=${gameId}`;
  };

  // Copy game link to clipboard
  const copyGameLink = () => {
    if (gameLink) {
      navigator.clipboard.writeText(gameLink);
      alert("Game link copied to clipboard!");
    }
  };
  
  // Add useEffect to check for game ID in URL
  useEffect(() => {
    // Check if there's a game ID in the URL
    const { id } = router.query;
    if (id && typeof id === 'string') {
      setGameId(id);
      setIsCreator(false);
      // When joining a game
      if (connected) {
        joinGame(id);
      }
    }
  }, [router.query, connected]);

  // Joining a game
  const joinGame = (id: string) => {
    if (!connected) {
      openWalletModal();
      return;
    }
    
    setHasOpponent(true);
    setOpponentName("Game Creator");
    setIsOpponentReady(true);
    
    // In a real implementation, you would:
    // 1. Connect to a WebSocket or use an SDK like Pusher, Socket.io, or Firebase
    // 2. Notify the game creator that a player has joined
    // 3. Set up real-time communication between players
    
    // For now, simulate joining
    setTimeout(() => {
      setGrid(initializeGrid());
      setGameState(GameState.PLAYING);
    }, 1000);
  };
  
  // Start game with a friend
  const handleCreateGame = () => {
    if (!connected) {
      openWalletModal();
      return;
    }
    
    const randomId = Math.random().toString(36).substring(2, 10);
    setGameId(randomId);
    setIsCreator(true);
    
    const link = `${window.location.origin}/game/minesweeper?id=${randomId}`;
    setGameLink(link);
    setGameState(GameState.WAITING);
    
    // In a real implementation, you would:
    // 1. Create a game session on your backend
    // 2. Set up a listener for when a player joins
  };
  
  // Start matchmaking
  const handleMatchmaking = () => {
    if (!connected) {
      openWalletModal();
      return;
    }
    
    // Simulate finding a random opponent
    setGameState(GameState.WAITING);
    
    setTimeout(() => {
      setHasOpponent(true);
      setOpponentName("Random Player");
      setGameState(GameState.PLAYING);
      setGrid(initializeGrid());
    }, 2000);
  };
  
  // Start a local game
  const handleStartGame = () => {
    if (!connected) {
      openWalletModal();
      return;
    }
    
    setGrid(initializeGrid());
    setGameState(GameState.PLAYING);
    setPlayerTurn(PlayerTurn.PLAYER_ONE);
    setRevealedCount(0);
    setRevealedThisTurn(0);
  };
  
  // Add wagering functionality
  const placeBet = async () => {
    if (!connected || !publicKey) {
      openWalletModal();
      return;
    }
    
    setIsWagerPending(true);
    setWagerError(null);
    
    try {
      // In a real implementation, you'd use an escrow contract
      // For now, we'll just simulate the bet being placed
      
      // Check if the user has enough balance
      if (balance < betAmount) {
        throw new Error(`Insufficient balance. You need at least ${betAmount} SOL.`);
      }
      
      // Simulate successful bet placement
      setTimeout(() => {
        setIsWagerPending(false);
        setWagerSuccess(true);
        // After successful bet, you can proceed with game creation
        handleCreateGame();
      }, 1500);
      
      // In a real implementation:
      // 1. Create a transaction to send SOL to an escrow account
      // 2. Sign and send the transaction
      // 3. Store the escrow information
    } catch (error) {
      console.error('Error placing bet:', error);
      setIsWagerPending(false);
      setWagerError(error.message || 'Failed to place bet. Please try again.');
    }
  };
  
  // End game and pay the winner
  const settleWager = (winner: string) => {
    setGameWinner(winner);
    
    // In a real implementation:
    // 1. Call your backend to release funds from escrow to the winner
    // 2. Update game state
    
    // For now, just simulate the payout
    setTimeout(() => {
      alert(`Game over! ${winner} has won ${betAmount * 2} SOL!`);
    }, 1000);
  };
  
  // Override handleEndTurn to check win/lose conditions
  const handleEndTurn = () => {
    // Check if the player revealed enough cells to win
    const safeRevealedCount = revealedCount;
    
    if (safeRevealedCount === SAFE_CELLS) {
      // Player has revealed all safe cells and won
      setGameState(GameState.WIN);
      if (isMultiplayer) {
        settleWager(playerTurn === PlayerTurn.PLAYER_ONE ? 'Player 1' : 'Player 2');
      }
      return;
    }
    
    // Switch turns
    setPlayerTurn(playerTurn === PlayerTurn.PLAYER_ONE ? PlayerTurn.PLAYER_TWO : PlayerTurn.PLAYER_ONE);
    setRevealedThisTurn(0);
  };
  
  // Override handleCellClick to handle game end conditions with wagering
  const handleCellClick = (row: number, col: number) => {
    if (gameState !== GameState.PLAYING || grid[row][col].revealed) return;
    
    const newGrid = [...grid];
    
    // Start animation
    newGrid[row][col].isAnimating = true;
    setGrid([...newGrid]);

    // Use setTimeout to allow animation to complete before showing result
    setTimeout(() => {
      newGrid[row][col].revealed = true;
      
      // Check if mine was hit
      if (newGrid[row][col].hasMine) {
        setGrid([...newGrid]);
        setGameState(GameState.GAME_OVER);
        
        // If multiplayer, settle the wager
        if (isMultiplayer) {
          // Current player lost, so the other player wins
          const winner = playerTurn === PlayerTurn.PLAYER_ONE ? 'Player 2' : 'Player 1';
          settleWager(winner);
        }
        return;
      }
      
      // No mine, just reveal cell
      setGrid([...newGrid]);
      setRevealedThisTurn(revealedThisTurn + 1);
      setMovesCount(movesCount + 1);
      
      // Count revealed cells
      let revealedCount = 0;
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          if (newGrid[r][c].revealed) revealedCount++;
        }
      }
      setRevealedCount(revealedCount);
      
      // Check win condition
      if (revealedCount === TOTAL_CELLS - MINE_COUNT) {
        setGameState(GameState.WIN);
        if (isMultiplayer) {
          settleWager(playerTurn === PlayerTurn.PLAYER_ONE ? 'Player 1' : 'Player 2');
        }
      }
    }, 300); // Half the animation duration
  };
  
  // Reset game
  const resetGame = () => {
    setGameState(GameState.INIT);
    setPlayerTurn(PlayerTurn.PLAYER_ONE);
    setGrid([]);
    setRevealedCount(0);
    setRevealedThisTurn(0);
    setHasOpponent(false);
    setOpponentName("Waiting for opponent...");
    setGameLink("");
  };
  
  // Render grid cell
  const renderCell = (cell: Cell, row: number, col: number) => {
    return (
      <CellButton 
        key={`${row}-${col}`} 
        revealed={cell.revealed} 
        hasMine={cell.hasMine} 
        isAnimating={cell.isAnimating}
        onClick={() => handleCellClick(row, col)}
        disabled={gameState !== GameState.PLAYING || cell.revealed}
      >
        <CellContent>
          {cell.revealed && (
            cell.hasMine ? (
              <MineElement>💣</MineElement>
            ) : (
              <GemElement>💎</GemElement>
            )
          )}
        </CellContent>
      </CellButton>
    );
  };
  
  // Render game status
  const renderGameStatus = () => {
    if (gameState === GameState.INIT) {
      return null;
    }
    
    if (gameState === GameState.WAITING) {
      return (
        <PlayerTurnIndicator>
          Waiting for an opponent to join...
        </PlayerTurnIndicator>
      );
    }
    
    if (gameState === GameState.GAME_OVER) {
      return (
        <GameOverBanner isWin={false}>
          <h3>Game Over!</h3>
          <p>{playerTurn === PlayerTurn.PLAYER_ONE ? 'Player 1' : 'Player 2'} hit a mine and lost!</p>
        </GameOverBanner>
      );
    }
    
    if (gameState === GameState.WIN) {
      return (
        <GameOverBanner isWin={true}>
          <h3>Victory!</h3>
          <p>{playerTurn === PlayerTurn.PLAYER_ONE ? 'Player 1' : 'Player 2'} cleared all tiles and won!</p>
        </GameOverBanner>
      );
    }
    
    return (
      <PlayerTurnIndicator>
        {playerTurn === PlayerTurn.PLAYER_ONE ? 'Player 1' : 'Player 2'}'s Turn
      </PlayerTurnIndicator>
    );
  };
  
  // Render opponent information
  const renderOpponentInfo = () => {
    if (gameState === GameState.PLAYING && hasOpponent) {
      return (
        <OpponentSection>
          <Avatar>
            {opponentName.charAt(0).toUpperCase()}
          </Avatar>
          <PlayerInfo>
            <PlayerName>{opponentName}</PlayerName>
            <PlayerStatus>Online</PlayerStatus>
          </PlayerInfo>
        </OpponentSection>
      );
    }
    return null;
  };
  
  // Render left panel content
  const renderLeftPanelContent = () => {
    if (gameState === GameState.INIT) {
      return (
        <>
          <SectionTitle>Place Your Bet</SectionTitle>
          
          <BettingSection>
            <InputLabel>Bet Amount (SOL)</InputLabel>
            <InputContainer>
              <CurrencyIcon>Ⓢ</CurrencyIcon>
              <AmountInput 
                type="number" 
                step="0.01" 
                min="0.01" 
                value={betAmount}
                onChange={(e) => setBetAmount(Number(e.target.value))}
              />
            </InputContainer>
            
            <ButtonsContainer>
              <PercentButton onClick={() => setBetAmount(0.05)}>0.05</PercentButton>
              <PercentButton onClick={() => setBetAmount(0.1)}>0.1</PercentButton>
              <PercentButton onClick={() => setBetAmount(0.5)}>0.5</PercentButton>
              <PercentButton onClick={() => setBetAmount(1)}>1</PercentButton>
            </ButtonsContainer>
            
            {wagerError && <ErrorMessage>{wagerError}</ErrorMessage>}
            
            <ActionButton 
              onClick={placeBet} 
              disabled={!connected || isWagerPending}
            >
              {isWagerPending ? 'Processing...' : 'Place Bet'}
            </ActionButton>
          </BettingSection>
          
          <ActionsSection>
            <SectionTitle>Game Mode</SectionTitle>
            <ActionButton onClick={handleCreateGame} disabled={!connected || !wagerSuccess}>
              Create Game
            </ActionButton>
            <ActionButton onClick={handleMatchmaking} disabled={!connected || !wagerSuccess}>
              Find Opponent
            </ActionButton>
            <SecondaryButton onClick={handleStartGame} disabled={!connected}>
              Play Solo
            </SecondaryButton>
          </ActionsSection>
          
          <GameInfo>
            <p>Mine has one hidden bomb. Take turns revealing tiles, but don't hit the bomb or you lose!</p>
            <p>• Strategically choose which tiles to reveal</p>
            <p>• Pass the turn to your opponent when you want</p>
            <p>• Win by avoiding the mine and revealing all safe tiles</p>
          </GameInfo>
        </>
      );
    }
    
    if (gameState === GameState.WAITING) {
      return (
        <>
          <SectionTitle>Game Created</SectionTitle>
          
          <BetAmountDisplay>
            Current Bet: <span>{betAmount} SOL</span>
          </BetAmountDisplay>
          
          <GameLink>{gameLink}</GameLink>
          
          <ActionButton onClick={copyGameLink}>
            Copy Game Link
          </ActionButton>
          
          <SecondaryButton onClick={resetGame}>
            Cancel Game
          </SecondaryButton>
          
          <GameInfo>
            <p>Waiting for an opponent to join...</p>
            <p>Share the game link with a friend to play together.</p>
            {isOpponentReady && (
              <StatusMessage>Opponent has joined! Game will start soon.</StatusMessage>
            )}
          </GameInfo>
        </>
      );
    }
    
    return (
      <>
        <SectionTitle>Game Info</SectionTitle>
        
        <BetAmountDisplay>
          Current Bet: <span>{betAmount} SOL</span>
        </BetAmountDisplay>
        
        {gameState === GameState.PLAYING && (
          <ActionButton onClick={handleEndTurn} disabled={revealedThisTurn === 0}>
            End Turn
          </ActionButton>
        )}
        
        {(gameState === GameState.GAME_OVER || gameState === GameState.WIN) && (
          <ActionButton onClick={resetGame}>
            Play Again
          </ActionButton>
        )}
        
        <GameInfo>
          <GameStat>
            <StatLabel>Game State:</StatLabel>
            <StatValue>{gameState}</StatValue>
          </GameStat>
          <GameStat>
            <StatLabel>Current Turn:</StatLabel>
            <StatValue>{playerTurn === PlayerTurn.PLAYER_ONE ? 'Player 1' : 'Player 2'}</StatValue>
          </GameStat>
          <GameStat>
            <StatLabel>Moves Made:</StatLabel>
            <StatValue>{movesCount}</StatValue>
          </GameStat>
          <GameStat>
            <StatLabel>Tiles Revealed:</StatLabel>
            <StatValue>{revealedCount} / {TOTAL_CELLS}</StatValue>
          </GameStat>
          <GameStat>
            <StatLabel>Safe Tiles:</StatLabel>
            <StatValue>{SAFE_CELLS}</StatValue>
          </GameStat>
        </GameInfo>
      </>
    );
  };
  
  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'bigWins':
        return (
          <TabContent>
            <p>No big wins recorded yet.</p>
          </TabContent>
        );
      case 'luckyWins':
        return (
          <TabContent>
            <p>No lucky wins recorded yet.</p>
          </TabContent>
        );
      case 'challenges':
        return (
          <TabContent>
            <p>No challenges available at the moment.</p>
          </TabContent>
        );
      case 'description':
      default:
        return (
          <TabContent>
            <GameInfoCard>
              <GameInfoImage>
                💎
              </GameInfoImage>
              <GameInfoContent>
                <GameInfoTitle>Mines | Rock Paper Solana Originals</GameInfoTitle>
                <GameInfoDescription>
                  Join in on the Mines fever with one of our most popular and beloved games! Inspired by the classic Minesweeper, Mines will simply reveal the gems and avoid the bombs to increase your wins!
                </GameInfoDescription>
              </GameInfoContent>
            </GameInfoCard>
          </TabContent>
        );
    }
  };
  
  // Add function to update game messages
  const addGameMessage = (message: string) => {
    setGameMessages(prev => [...prev, message]);
    setLastActionTime(new Date().toLocaleTimeString());
  };
  
  // Simulate opponent joining
  useEffect(() => {
    if (gameState === GameState.WAITING && !hasOpponent) {
      // Simulate random opponent joining after some time
      const joinTimeout = setTimeout(() => {
        if (gameState === GameState.WAITING) {
          setHasOpponent(true);
          setIsOpponentOnline(true);
          setOpponentName("Random Opponent");
          addGameMessage("Opponent has joined the game!");
          
          // Start the game after a small delay
          setTimeout(() => {
            setGrid(initializeGrid());
            setGameState(GameState.PLAYING);
            setIsMultiplayer(true);
            addGameMessage("Game has started!");
          }, 1500);
        }
      }, Math.random() * 10000 + 5000); // Random time between 5-15 seconds
      
      return () => clearTimeout(joinTimeout);
    }
  }, [gameState, hasOpponent]);
  
  // Simulate opponent moves when it's their turn
  useEffect(() => {
    if (gameState === GameState.PLAYING && 
        isMultiplayer && 
        hasOpponent && 
        playerTurn === PlayerTurn.PLAYER_TWO) {
      
      addGameMessage("Opponent is thinking...");
      
      // Simulate opponent making moves
      const moveTimeout = setTimeout(() => {
        // Find all unrevealed cells
        const unrevealedCells: {row: number, col: number}[] = [];
        grid.forEach((row, rowIndex) => {
          row.forEach((cell, colIndex) => {
            if (!cell.revealed) {
              unrevealedCells.push({row: rowIndex, col: colIndex});
            }
          });
        });
        
        if (unrevealedCells.length > 0) {
          // Pick a random unrevealed cell
          const randomIndex = Math.floor(Math.random() * unrevealedCells.length);
          const {row, col} = unrevealedCells[randomIndex];
          
          // Opponent clicks the cell
          handleCellClick(row, col);
          addGameMessage(`Opponent revealed tile (${row+1}, ${col+1})`);
          
          // If game isn't over and opponent hasn't hit a mine, possibly end turn
          setTimeout(() => {
            if (gameState === GameState.PLAYING && Math.random() > 0.3) {
              handleEndTurn();
              addGameMessage("Opponent ended their turn");
            }
          }, 1000);
        }
      }, Math.random() * 3000 + 2000); // Random time between 2-5 seconds
      
      return () => clearTimeout(moveTimeout);
    }
  }, [gameState, playerTurn, isMultiplayer, hasOpponent]);
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
  
  // Add a component to display game messages/activity
  const renderGameActivity = () => {
    if (!isMultiplayer || gameState === GameState.INIT) {
      return null;
    }
    
    return (
      <GameActivityPanel>
        <ActivityHeader>
          <ActivityTitle>Game Activity</ActivityTitle>
          {lastActionTime && <LastUpdated>Last update: {lastActionTime}</LastUpdated>}
        </ActivityHeader>
        
        <ActivityMessages>
          {gameMessages.length === 0 ? (
            <EmptyActivity>Waiting for game actions...</EmptyActivity>
          ) : (
            gameMessages.map((message, index) => (
              <ActivityMessage key={index}>
                <ActivityTime>{new Date().toLocaleTimeString()}</ActivityTime>
                <ActivityText>{message}</ActivityText>
              </ActivityMessage>
            ))
          )}
        </ActivityMessages>
      </GameActivityPanel>
    );
  };
  
  return (
    <PageContainer>
      <Head>
        <title>Mines | Rock Paper Solana</title>
        <meta name="description" content="Play Mines on Solana blockchain and win SOL tokens. Strategic mining game with fluid animations." />
      </Head>
      
      <AppSidebar 
        collapsed={sidebarCollapsed}
        currentPage="minesweeper"
        toggleSidebar={toggleSidebar}
      />
      
      <MainContent collapsed={sidebarCollapsed}>
        <GameWrapper>
          <GameContainer>
            <LeftPanel>
              {renderLeftPanelContent()}
            </LeftPanel>
            
            <RightPanel>
              {renderGameStatus()}
              {renderOpponentInfo()}
              
              <GridContainer>
                {grid.length > 0 ? (
                  grid.flat().map((cell, index) => {
                    const row = Math.floor(index / GRID_SIZE);
                    const col = index % GRID_SIZE;
                    return renderCell(cell, row, col);
                  })
                ) : (
                  Array(GRID_SIZE * GRID_SIZE).fill(null).map((_, index) => (
                    <CellButton 
                      key={index}
                      revealed={false}
                      isAnimating={false}
                      disabled={true}
                    >
                      <CellContent />
                    </CellButton>
                  ))
                )}
              </GridContainer>
              
              {renderGameActivity()}
            </RightPanel>
          </GameContainer>
          
          <BottomSection>
            <TabsContainer>
              <Tab 
                active={activeTab === 'bigWins'} 
                onClick={() => setActiveTab('bigWins')}
              >
                Big Wins
              </Tab>
              <Tab 
                active={activeTab === 'luckyWins'} 
                onClick={() => setActiveTab('luckyWins')}
              >
                Lucky Wins
              </Tab>
              <Tab 
                active={activeTab === 'challenges'} 
                onClick={() => setActiveTab('challenges')}
              >
                Challenges
              </Tab>
              <Tab 
                active={activeTab === 'description'} 
                onClick={() => setActiveTab('description')}
              >
                Description
              </Tab>
            </TabsContainer>
            
            {renderTabContent()}
          </BottomSection>
        </GameWrapper>
      </MainContent>
    </PageContainer>
  );
};

export default MinesweeperGame; 