import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useWallet } from '../../contexts/WalletContext';
import { useCrossmintWallet } from '../../contexts/CrossmintWalletContext';
import Link from 'next/link';
import AppSidebar from '../../components/Sidebar';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { 
  createGameSession, 
  joinGameSession, 
  listenToGameUpdates, 
  updateGameState,
  checkGameExists
} from '../../utils/firebase';

// Game States & Types
enum GameStateEnum {
  INIT = 'INIT',
  WAITING = 'WAITING',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
  WIN = 'WIN'
}

interface GameData {
  grid?: Cell[][];
  betAmount?: number; // Store bet amount in game data
  escrowAddress?: string; // Store escrow wallet address
  escrowFunded?: {
    [playerId: string]: boolean; // Track who has funded the escrow
  };
  winner?: string;
}

interface GameState {
  id: string;
  creator: string;
  opponent?: string;
  status: 'waiting' | 'playing' | 'completed';
  currentTurn?: string;
  gameData?: GameData;
  lastUpdated: number;
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
  background-color: #0c1524;
  color: white;
  position: relative;
`;

const GameWrapper = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  padding: 40px 20px;
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
  width: 320px;
  background-color: #142438;
  border-radius: 12px;
  padding: 25px;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 968px) {
    width: 100%;
  }
  
  h2 {
    margin-top: 0;
    margin-bottom: 10px;
    font-size: 1.5rem;
  }
  
  p {
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 20px;
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
  position: relative;
  overflow: hidden;
  
  &:hover {
    background-color: #00d69c;
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    background-color: rgba(0, 236, 170, 0.3);
    cursor: not-allowed;
    transform: none;
  }
  
  /* Ripple effect */
  &:after {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: 5px;
    height: 5px;
    background: rgba(255, 255, 255, 0.5);
    opacity: 0;
    border-radius: 100%;
    transform: scale(1, 1) translate(-50%);
    transform-origin: 50% 50%;
  }

  &:focus:not(:active)::after {
    animation: ripple 1s ease-out;
  }

  @keyframes ripple {
    0% {
      transform: scale(0, 0);
      opacity: 0.5;
    }
    20% {
      transform: scale(25, 25);
      opacity: 0.3;
    }
    100% {
      opacity: 0;
      transform: scale(40, 40);
    }
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
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const GameInfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const GameInfoLabel = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
`;

const GameInfoValue = styled.div`
  font-weight: 500;
`;

const CopyButton = styled.button`
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  margin-left: auto;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
`;

const OrText = styled.div`
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  margin: 15px 0;
  position: relative;
  
  &:before, &:after {
    content: '';
    position: absolute;
    top: 50%;
    width: 40%;
    height: 1px;
    background-color: rgba(255, 255, 255, 0.2);
  }
  
  &:before {
    left: 0;
  }
  
  &:after {
    right: 0;
  }
`;

const EscrowSection = styled.div`
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 12px;
  margin-top: 10px;
  
  h4 {
    margin-top: 0;
    margin-bottom: 10px;
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.8);
  }
`;

const EscrowInfo = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 15px;
  
  > div {
    flex: 1;
  }
`;

const GameActivityContainer = styled.div`
  margin-top: 20px;
  
  h4 {
    margin-top: 0;
    margin-bottom: 10px;
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.8);
  }
`;

const GameMessageList = styled.div`
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 10px;
  max-height: 200px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const GameMessage = styled.div`
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.8);
`;

const GameStatusBar = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  font-size: 1.2rem;
  font-weight: 500;
`;

interface PlayerTurnProps {
  myTurn: boolean;
}

const PlayerTurnIndicator = styled.div<PlayerTurnProps>`
  padding: 8px 16px;
  border-radius: 20px;
  background-color: ${props => props.myTurn ? 'rgba(0, 236, 170, 0.2)' : 'rgba(255, 99, 71, 0.2)'};
  color: ${props => props.myTurn ? '#00ecaa' : '#ff6347'};
  font-weight: 600;
`;

const OpponentSection = styled.div`
  margin-bottom: 20px;
  text-align: center;
  
  h4 {
    margin-bottom: 5px;
    color: rgba(255, 255, 255, 0.7);
  }
`;

const OpponentAddress = styled.div`
  font-family: monospace;
  background-color: rgba(255, 255, 255, 0.05);
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 0.9rem;
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
  font-size: 2rem;
`;

const MineElement = styled.div`
  animation: ${explosionAnimation} 0.5s ease-out;
`;

const GemElement = styled.div`
  animation: ${glowAnimation} 2s infinite;
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
  margin: 20px auto;
  width: 100%;
  max-width: 500px;
  aspect-ratio: 1/1;
`;

interface CellProps {
  revealed: boolean;
  hasMine?: boolean;
  isAnimating?: boolean;
}

const CellButton = styled.button<CellProps>`
  width: 100%;
  height: 0;
  padding-bottom: 100%;
  background-color: ${props => props.revealed 
    ? props.hasMine 
      ? '#ff4757' // Red for mines
      : '#00ecaa' // Green for gems
    : '#1e3251'}; // Blue for unrevealed
  border-radius: 8px;
  border: 2px solid ${props => props.revealed 
    ? props.hasMine 
      ? '#ff2c44' 
      : '#00d69c'
    : '#2a4573'};
  display: flex;
  position: relative;
  cursor: ${props => props.revealed ? 'default' : 'pointer'};
  transition: background-color 0.3s ease, transform 0.2s ease;
  animation: ${props => props.isAnimating 
    ? props.hasMine 
      ? css`${shakeAnimation} 0.5s ease-in-out` 
      : css`${flipAnimation} 0.5s ease-in-out`
    : 'none'};
  
  &:hover {
    transform: ${props => props.revealed ? 'none' : 'scale(1.05)'};
    background-color: ${props => props.revealed 
      ? props.hasMine 
        ? '#ff4757'
        : '#00ecaa'
      : '#253e66'};
  }
  
  &:disabled {
    cursor: default;
    opacity: ${props => props.revealed ? 1 : 0.7};
  }
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

const Sidebar = styled.div<{ collapsed: boolean }>`
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

const MainContent = styled.div`
  padding: 20px;
  color: rgba(255, 255, 255, 0.8);
  
  h3 {
    margin-top: 0;
    color: white;
  }
  
  ul {
    padding-left: 20px;
  }
  
  li {
    margin-bottom: 8px;
  }
`;

const GameLink = styled.div`
  background-color: rgba(0, 0, 0, 0.2);
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 15px;
  font-size: 0.8rem;
  word-break: break-all;
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  transition: all 0.3s ease;
  
  &.copied {
    background-color: rgba(34, 197, 94, 0.2);
    border-color: rgba(34, 197, 94, 0.5);
  }
  
  &:after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(34, 197, 94, 0.2);
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
    border-radius: 4px;
  }
  
  &.copied:after {
    opacity: 1;
  }
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

const EscrowStatusContainer = styled.div`
  background-color: rgba(0, 236, 170, 0.1);
  border: 1px solid rgba(0, 236, 170, 0.3);
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
`;

const EscrowTitle = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: #00ecaa;
  margin-bottom: 10px;
`;

const EscrowBalance = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 15px;
`;

const EscrowPlayers = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 15px;
`;

interface PlayerStatusProps {
  funded: boolean;
}

const EscrowPlayerStatus = styled.div<PlayerStatusProps>`
  padding: 8px 12px;
  background-color: ${props => props.funded ? 'rgba(0, 236, 170, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
  border-radius: 6px;
  font-size: 0.9rem;
  color: ${props => props.funded ? '#00ecaa' : 'white'};
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 20px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  
  &::-webkit-scrollbar {
    height: 5px;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 5px;
  }
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
  white-space: nowrap;
  
  &:hover {
    color: white;
  }
`;

const BottomSection = styled.div`
  background-color: #142438;
  border-radius: 12px;
  padding: 20px;
  margin-top: 20px;
`;

// Minesweeper Game Component
const MinesweeperGame: React.FC = () => {
  const router = useRouter();
  const { publicKey, connected } = useWallet();
  const { 
    connected: crossmintConnected, 
    walletAddress: crossmintAddress,
    createEscrowWallet,
    sendToEscrow
  } = useCrossmintWallet();
  
  // Game state
  const [activeTab, setActiveTab] = useState<'create' | 'join' | 'matchmaking' | 'game' | 'bigWins' | 'luckyWins' | 'challenges' | 'description'>('create');
  const [gameState, setGameState] = useState<GameStateEnum>(GameStateEnum.INIT);
  const [currentTurn, setCurrentTurn] = useState<PlayerTurn>(PlayerTurn.PLAYER_ONE);
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [betAmount, setBetAmount] = useState<number>(0.1);
  const [gameId, setGameId] = useState<string>('');
  const [joinGameId, setJoinGameId] = useState<string>('');
  const [gameMessages, setGameMessages] = useState<string[]>([]);
  const [escrowAddress, setEscrowAddress] = useState<string>('');
  const [escrowFunded, setEscrowFunded] = useState<{[key: string]: boolean}>({});
  const [activeScreen, setActiveScreen] = useState<string>('start');
  const [hasOpponent, setHasOpponent] = useState<boolean>(false);
  const [opponentAddress, setOpponentAddress] = useState<string>('');
  const [isMultiplayer, setIsMultiplayer] = useState<boolean>(true);
  const [gameLink, setGameLink] = useState<string>('');
  
  // Constants
  const GRID_SIZE = 5;
  const MINE_COUNT = 5;

  // Methods
  const handleCellClick = (row: number, col: number) => {
    // Placeholder implementation
    console.log(`Clicked cell at row ${row}, col ${col}`);
    
    // Create a copy of the grid
    const newGrid = [...grid];
    
    // Mark the cell as revealed
    newGrid[row][col].revealed = true;
    
    // Check if the cell contains a mine
    if (newGrid[row][col].hasMine) {
      newGrid[row][col].isAnimating = true;
      setGameState(GameStateEnum.GAME_OVER);
      addGameMessage("Game over! You hit a mine.");
    } else {
      addGameMessage(`Revealed cell at (${row + 1}, ${col + 1})`);
      
      // Check if all non-mine cells are revealed
      const flatGrid = newGrid.flat();
      const allNonMinesRevealed = flatGrid
        .filter(cell => !cell.hasMine)
        .every(cell => cell.revealed);
      
      if (allNonMinesRevealed) {
        setGameState(GameStateEnum.WIN);
        addGameMessage("Congratulations! You've found all the gems!");
      }
    }
    
    // Update the grid
    setGrid(newGrid);
  };

  const initializeGrid = () => {
    // Create a 5x5 grid with no mines initially
    let newGrid: Cell[][] = Array(GRID_SIZE).fill(null).map(() => 
      Array(GRID_SIZE).fill(null).map(() => ({
        hasMine: false,
        revealed: false,
        isAnimating: false
      }))
    );
    
    // Place 5 mines randomly
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

  const generateGameLink = (id: string) => {
    // Use hardcoded domain to ensure proper share links across environments
    const baseUrl = "https://rockpapersolana.com";
    return `${baseUrl}/game/minesweeper?id=${id}`;
  };

  const copyGameLink = async () => {
    if (gameId) {
      const link = generateGameLink(gameId);
      await navigator.clipboard.writeText(link);
      addGameMessage("Game link copied to clipboard");
    }
  };

  const handleCreateGame = async () => {
    try {
      console.log("Create game button clicked");
      setGameMessages([]);
      
      if (!connected && !crossmintConnected) {
        console.log("No wallet connected - connected:", connected, "crossmintConnected:", crossmintConnected);
        addGameMessage("⚠️ Please connect your wallet to create a game.");
        return;
      }
      
      // Test Firebase connection directly
      try {
        // Get a reference to the database
        const database = await import('firebase/database').then(db => db.getDatabase());
        console.log("Firebase database accessed:", database ? "success" : "null");
        
        // Test if we can read/write
        const testRef = await import('firebase/database').then(db => db.ref(database, 'test_connection'));
        await import('firebase/database').then(db => db.set(testRef, { timestamp: Date.now() }));
        console.log("Firebase write test successful");
      } catch (fbError) {
        console.error("Firebase test failed:", fbError);
        addGameMessage("⚠️ Error connecting to Firebase. Check console for details.");
        // Continue anyway to see if the main functionality works
      }
      
      console.log("Creating game with wallet", publicKey?.toString() || crossmintAddress || 'anonymous');
      
      // Create a new game session in Firebase
      const playerId = publicKey?.toString() || crossmintAddress || 'anonymous';
      console.log("Calling createGameSession with player", playerId);
      
      try {
        const newGameId = await createGameSession('minesweeper', playerId);
        console.log("Game session created with ID:", newGameId);
        
        // Rest of the function...
        setGameId(newGameId);
        setGameLink(generateGameLink(newGameId));
        
        // Initialize the grid
        console.log("Initializing grid");
        const newGrid = initializeGrid();
        setGrid(newGrid);
        
        // Update game data with grid and bet amount
        console.log("Updating game state with grid and bet amount:", betAmount);
        await updateGameState('minesweeper', newGameId, {
          gameData: {
            grid: newGrid,
            betAmount: betAmount
          }
        });
        
        // Create an escrow wallet for this game if using Crossmint
        if (crossmintConnected && createEscrowWallet) {
          try {
            console.log("Creating escrow wallet");
            const escrowAddr = await createEscrowWallet(newGameId);
            console.log("Escrow wallet created:", escrowAddr);
            setEscrowAddress(escrowAddr);
            
            // Update game with escrow address
            console.log("Updating game with escrow address");
            await updateGameState('minesweeper', newGameId, {
              gameData: {
                escrowAddress: escrowAddr,
                escrowFunded: {}
              }
            });
            
            addGameMessage("✅ Secure escrow wallet created for game.");
          } catch (escrowError) {
            console.error("Error creating escrow:", escrowError);
            addGameMessage("⚠️ Could not create escrow wallet. Game will continue without secure betting.");
          }
        } else {
          console.log("Skipping escrow wallet creation - crossmintConnected:", crossmintConnected, "createEscrowWallet:", !!createEscrowWallet);
        }
        
        // Set game state
        console.log("Setting game state to WAITING");
        setHasOpponent(false);
        setGameState(GameStateEnum.WAITING);
        setActiveScreen('game');
        
        // Start listening for game updates
        console.log("Setting up game update listener");
        listenToGameUpdates('minesweeper', newGameId, (data) => {
          console.log("Game update received:", data);
          
          // Update opponent info if someone joined
          if (data.opponent && !hasOpponent) {
            setHasOpponent(true);
            setOpponentAddress(data.opponent);
            setGameState(GameStateEnum.PLAYING);
            addGameMessage("Opponent joined! Game starting.");
          }
          
          // Update escrow funding status if available
          if (data.gameData?.escrowFunded) {
            setEscrowFunded(data.gameData.escrowFunded);
            
            // Check if both players funded
            const bothFunded = 
              data.gameData.escrowFunded[playerId] && 
              data.opponent && 
              data.gameData.escrowFunded[data.opponent];
            
            if (bothFunded && !data.gameData.bothFundedNotified) {
              addGameMessage("✅ Both players have funded the escrow. Game is ready!");
              
              // Mark as notified
              updateGameState('minesweeper', newGameId, {
                gameData: {
                  bothFundedNotified: true
                }
              });
            }
          }
        });
        
        console.log("Game creation complete");
        addGameMessage("Game created! Waiting for opponent. Share the link to invite someone.");
      } catch (createError) {
        console.error("Error in createGameSession:", createError);
        addGameMessage(`⚠️ Error creating game session: ${createError.message}`);
        alert("Failed to create game: " + createError.message);
      }
    } catch (error) {
      console.error("Error creating game:", error);
      // Display more detailed error information
      if (error instanceof Error) {
        addGameMessage(`⚠️ Error creating game: ${error.message}`);
        console.error("Error stack:", error.stack);
        alert("Error creating game: " + error.message);
      } else {
        addGameMessage(`⚠️ Error creating game: Unknown error`);
        alert("Unknown error creating game");
      }
    }
  };

  const joinGame = async (id: string) => {
    try {
      if (!id) {
        alert("Please enter a game ID");
        return;
      }
      
      setGameMessages([]);
      addGameMessage(`Joining game ${id}...`);
      
      // Check if game exists
      const gameExists = await checkGameExists('minesweeper', id);
      if (!gameExists) {
        addGameMessage("⚠️ Game not found. Please check the ID and try again.");
        return;
      }
      
      // Join the game session using Firebase
      await joinGameSession('minesweeper', id, publicKey?.toString() || crossmintAddress || 'anonymous');
      
      // Set game info
      setGameId(id);
      setGameState(GameStateEnum.WAITING);
      setActiveScreen('game');
      
      // Start listening for game updates
      const unsubscribe = listenToGameUpdates('minesweeper', id, (data) => {
        console.log("Game update received:", data);
        
        // Update game state based on data
        if (data.status === 'waiting') {
          setGameState(GameStateEnum.WAITING);
        } else if (data.status === 'playing') {
          setGameState(GameStateEnum.PLAYING);
          addGameMessage("Game started! Your turn.");
        }
        
        // Update opponent info if available
        if (data.opponent) {
          setHasOpponent(true);
          setOpponentAddress(data.opponent);
        }
        
        // Update grid if available
        if (data.gameData?.grid) {
          setGrid(data.gameData.grid);
        }
        
        // Update escrow info if available
        if (data.gameData?.escrowAddress) {
          setEscrowAddress(data.gameData.escrowAddress);
        }
        
        // Update escrow funding status if available
        if (data.gameData?.escrowFunded) {
          setEscrowFunded(data.gameData.escrowFunded);
        }
      });
      
      addGameMessage("Successfully joined the game!");
    } catch (error) {
      console.error("Error joining game:", error);
      addGameMessage(`⚠️ Error joining game: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const fundEscrow = async (gameId: string, address: string, amount: number) => {
    try {
      console.log(`Funding escrow ${address} with ${amount} SOL for game ${gameId}`);
      
      if (!gameId || !address) {
        addGameMessage("⚠️ Missing game ID or escrow address.");
        return false;
      }
      
      if (crossmintConnected && crossmintAddress && sendToEscrow) {
        // Use Crossmint wallet's dedicated escrow function
        
        // Attempt to send funds to escrow
        addGameMessage(`Sending ${amount} SOL to escrow...`);
        const result = await sendToEscrow(gameId, address, amount);
        
        if (result && result.signature) {
          console.log("Transaction successful:", result);
          
          // Update local state
          const newEscrowFunded = { ...escrowFunded };
          newEscrowFunded[crossmintAddress] = true;
          setEscrowFunded(newEscrowFunded);
          
          // Update game data in Firebase
          await updateGameState('minesweeper', gameId, {
            gameData: {
              escrowFunded: {
                [crossmintAddress]: true
              }
            }
          });
          
          addGameMessage(`✅ Escrow funded with ${amount} SOL successfully! Transaction: ${result.signature.slice(0, 8)}...`);
          return true;
        } else {
          throw new Error("Transaction failed - no signature returned");
        }
      } else if (connected && publicKey) {
        addGameMessage("⚠️ For secure escrow, please use the Crossmint wallet. Support for native Solana wallets coming soon.");
        return false;
      } else {
        addGameMessage("⚠️ No wallet connected. Please connect a wallet to play.");
        return false;
      }
    } catch (error) {
      console.error("Error funding escrow:", error);
      addGameMessage(`⚠️ Transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  };

  const addGameMessage = (message: string) => {
    setGameMessages(prev => [...prev, message]);
  };

  // Add a simple test function to verify the button is working
  const testButtonClick = () => {
    console.log("TEST BUTTON CLICKED");
    alert("Button clicked - check console for logs");
  };

  // Add a manual game creation function that bypasses the normal flow
  const createGameManually = async () => {
    try {
      console.log("Creating game manually...");
      
      // Generate a game ID manually
      const gameId = Math.random().toString(36).substring(2, 10).toUpperCase();
      console.log("Manual game ID generated:", gameId);
      
      // Set up the game state directly
      setGameId(gameId);
      setGameLink(generateGameLink(gameId));
      setGameState(GameStateEnum.WAITING);
      setActiveScreen('game');
      setGrid(initializeGrid());
      
      // Add a message
      setGameMessages(["Game created manually! ID: " + gameId]);
      addGameMessage("Share this link with a friend to play: " + generateGameLink(gameId));
      
      console.log("Manual game creation complete");
      
      return gameId;
    } catch (error) {
      console.error("Error in manual game creation:", error);
      alert("Error creating game manually: " + error);
      return null;
    }
  };

  // Add a super simple direct Firebase test function
  const testFirebaseConnection = async () => {
    try {
      console.log("Testing Firebase connection...");
      
      // Try to import Firebase dependencies
      const firebase = await import('firebase/app');
      const database = await import('firebase/database');
      
      console.log("Firebase imports successful:", !!firebase, !!database);
      
      // Try to get a reference to the database
      const db = database.getDatabase();
      console.log("Got database reference:", !!db);
      
      // Try to write to a test location
      const testRef = database.ref(db, 'test_connection');
      await database.set(testRef, { timestamp: Date.now() });
      
      console.log("Firebase write successful!");
      alert("Firebase connection test successful! Check console for details.");
    } catch (error) {
      console.error("Firebase test failed:", error);
      alert("Firebase test failed: " + (error instanceof Error ? error.message : String(error)));
    }
  };

  // Effect to handle game ID from URL on page load
  useEffect(() => {
    const { id } = router.query;
    if (id && typeof id === 'string') {
      setJoinGameId(id);
      // Auto-join if ID is provided
      joinGame(id);
    } else {
      // Initialize the grid for a new game
      setGrid(initializeGrid());
    }
  }, [router.query]);

  // Start the app
  return (
    <PageContainer>
      <Head>
        <title>Minesweeper | Rock Paper Solana</title>
        <meta name="description" content="Play Minesweeper on Solana blockchain and win SOL tokens. Strategic multiplayer mining game with secure betting." />
      </Head>
      <AppSidebar 
        collapsed={false}
        currentPage="mines"
        toggleSidebar={() => {}}
      />
      <GameWrapper>
        <GameContainer>
          <LeftPanel>
            {gameState === GameStateEnum.INIT && (
              <>
                <h2>Minesweeper</h2>
                <p>Find all the gems without hitting any mines! Each game has 5 mines hidden on the board.</p>
                
                <AmountContainer>
                  <InputLabel>Bet Amount (SOL)</InputLabel>
                  <InputContainer>
                    <CurrencyIcon>◎</CurrencyIcon>
                    <AmountInput 
                      type="number" 
                      value={betAmount}
                      onChange={(e) => setBetAmount(parseFloat(e.target.value))}
                      step={0.01}
                      min={0.01}
                      max={10}
                    />
                  </InputContainer>
                  <ButtonsContainer>
                    <PercentButton onClick={() => setBetAmount(0.1)}>0.1</PercentButton>
                    <PercentButton onClick={() => setBetAmount(0.5)}>0.5</PercentButton>
                    <PercentButton onClick={() => setBetAmount(1)}>1.0</PercentButton>
                    <PercentButton onClick={() => setBetAmount(2)}>2.0</PercentButton>
                  </ButtonsContainer>
                </AmountContainer>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <ActionButton onClick={testButtonClick}>
                    Test Button Click
                  </ActionButton>
                  
                  <ActionButton onClick={handleCreateGame}>
                    Create Game (Original)
                  </ActionButton>
                  
                  <ActionButton onClick={createGameManually} style={{ backgroundColor: '#ff6b6b' }}>
                    Create Game (Manual Bypass)
                  </ActionButton>
                  
                  <ActionButton onClick={testFirebaseConnection} style={{ backgroundColor: '#4834d4' }}>
                    Test Firebase Connection
                  </ActionButton>
                </div>
                
                <OrText>OR</OrText>
                
                <InputLabel>Join Existing Game</InputLabel>
                <InputContainer>
                  <AmountInput 
                    type="text" 
                    placeholder="Enter game ID" 
                    value={joinGameId}
                    onChange={(e) => setJoinGameId(e.target.value)}
                  />
                </InputContainer>
                <ActionButton 
                  onClick={() => joinGame(joinGameId)} 
                  style={{ marginTop: '10px', backgroundColor: '#2a4365' }}
                >
                  Join Game
                </ActionButton>
              </>
            )}
            
            {gameState !== GameStateEnum.INIT && (
              <>
                <GameInfo>
                  <h3>Game Info</h3>
                  {gameId && (
                    <GameInfoRow>
                      <GameInfoLabel>Game ID:</GameInfoLabel>
                      <GameInfoValue>{gameId}</GameInfoValue>
                      <CopyButton onClick={copyGameLink}>
                        Copy Link
                      </CopyButton>
                    </GameInfoRow>
                  )}
                  
                  <GameInfoRow>
                    <GameInfoLabel>Bet Amount:</GameInfoLabel>
                    <GameInfoValue>◎ {betAmount}</GameInfoValue>
                  </GameInfoRow>
                  
                  {isMultiplayer && escrowAddress && (
                    <EscrowSection>
                      <h4>Escrow Status</h4>
                      <EscrowInfo>
                        <div>
                          <div>You:</div>
                          <EscrowPlayerStatus funded={escrowFunded[publicKey || crossmintAddress] || false}>
                            {escrowFunded[publicKey || crossmintAddress] ? 'Funded ✓' : 'Not Funded'}
                          </EscrowPlayerStatus>
                        </div>
                        
                        {hasOpponent && (
                          <div>
                            <div>Opponent:</div>
                            <EscrowPlayerStatus funded={escrowFunded[opponentAddress] || false}>
                              {escrowFunded[opponentAddress] ? 'Funded ✓' : 'Not Funded'}
                            </EscrowPlayerStatus>
                          </div>
                        )}
                      </EscrowInfo>
                      
                      {!escrowFunded[publicKey || crossmintAddress] && (
                        <ActionButton 
                          onClick={() => escrowAddress && fundEscrow(gameId, escrowAddress, betAmount)}
                          style={{ marginTop: '10px' }}
                        >
                          Fund Escrow
                        </ActionButton>
                      )}
                    </EscrowSection>
                  )}
                  
                  {gameMessages.length > 0 && (
                    <GameActivityContainer>
                      <h4>Game Activity</h4>
                      <GameMessageList>
                        {gameMessages.map((message, index) => (
                          <GameMessage key={index}>{message}</GameMessage>
                        ))}
                      </GameMessageList>
                    </GameActivityContainer>
                  )}
                </GameInfo>
              </>
            )}
          </LeftPanel>
            
          <RightPanel>
            {gameState === GameStateEnum.INIT ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <h3>Create or join a game to get started</h3>
              </div>
            ) : gameState === GameStateEnum.WAITING ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <h2>Waiting for opponent to join...</h2>
                <p>Share your game ID with a friend to play together!</p>
                <div style={{ margin: '30px 0' }}>
                  <div className="loader"></div>
                </div>
              </div>
            ) : (
              <>
                <GameStatusBar>
                  {gameState === GameStateEnum.PLAYING && (
                    <PlayerTurnIndicator myTurn={currentTurn === PlayerTurn.PLAYER_ONE}>
                      {currentTurn === PlayerTurn.PLAYER_ONE ? 'Your turn' : 'Opponent\'s turn'}
                    </PlayerTurnIndicator>
                  )}
                  
                  {gameState === GameStateEnum.GAME_OVER && (
                    <div style={{ color: '#ff4757' }}>Game Over! You hit a mine.</div>
                  )}
                  
                  {gameState === GameStateEnum.WIN && (
                    <div style={{ color: '#00ecaa' }}>Congratulations! You won!</div>
                  )}
                </GameStatusBar>
                
                {hasOpponent && (
                  <OpponentSection>
                    <h4>Playing against:</h4>
                    <OpponentAddress>{opponentAddress.substring(0, 8)}...{opponentAddress.substring(opponentAddress.length - 8)}</OpponentAddress>
                  </OpponentSection>
                )}

                <GridContainer>
                  {grid.map((row, rowIndex) => (
                    row.map((cell, colIndex) => (
                      <CellButton
                        key={`${rowIndex}-${colIndex}`}
                        revealed={cell.revealed}
                        hasMine={cell.hasMine}
                        isAnimating={cell.isAnimating}
                        onClick={() => handleCellClick(rowIndex, colIndex)}
                        disabled={gameState !== GameStateEnum.PLAYING || cell.revealed}
                      >
                        <CellContent>
                          {cell.revealed && cell.hasMine && (
                            <MineElement>💣</MineElement>
                          )}
                          {cell.revealed && !cell.hasMine && (
                            <GemElement>💎</GemElement>
                          )}
                        </CellContent>
                      </CellButton>
                    ))
                  ))}
                </GridContainer>
              </>
            )}
          </RightPanel>
        </GameContainer>
        
        <BottomSection>
          <TabsContainer>
            <Tab active={activeTab === 'create'} onClick={() => setActiveTab('create')}>Create Game</Tab>
            <Tab active={activeTab === 'join'} onClick={() => setActiveTab('join')}>Join Game</Tab>
            <Tab active={activeTab === 'matchmaking'} onClick={() => setActiveTab('matchmaking')}>Matchmaking</Tab>
            <Tab active={activeTab === 'game'} onClick={() => setActiveTab('game')}>Game</Tab>
            <Tab active={activeTab === 'bigWins'} onClick={() => setActiveTab('bigWins')}>Big Wins</Tab>
            <Tab active={activeTab === 'luckyWins'} onClick={() => setActiveTab('luckyWins')}>Lucky Wins</Tab>
            <Tab active={activeTab === 'challenges'} onClick={() => setActiveTab('challenges')}>Challenges</Tab>
            <Tab active={activeTab === 'description'} onClick={() => setActiveTab('description')}>Description</Tab>
          </TabsContainer>
          
          <MainContent>
            {activeTab === 'bigWins' && (
              <div>
                <h3>Biggest Wins</h3>
                <p>Top players with the biggest wins will be displayed here.</p>
              </div>
            )}
            
            {activeTab === 'luckyWins' && (
              <div>
                <h3>Luckiest Wins</h3>
                <p>Most unlikely wins will be displayed here.</p>
              </div>
            )}
            
            {activeTab === 'challenges' && (
              <div>
                <h3>Challenges</h3>
                <p>Complete challenges to earn rewards:</p>
                <ul>
                  <li>Win 5 games in a row</li>
                  <li>Find all gems with only 1 reveal left</li>
                  <li>Win against a player with 100+ wins</li>
                </ul>
              </div>
            )}
            
            {activeTab === 'description' && (
              <div>
                <h3>How to Play Minesweeper</h3>
                <p>The goal is to reveal all cells without mines. Click on cells to reveal what's underneath. If you reveal a mine, you lose!</p>
                <p>In multiplayer mode, players take turns revealing cells. The first player to hit a mine loses, and the opponent wins the bet amount.</p>
              </div>
            )}
          </MainContent>
        </BottomSection>
      </GameWrapper>
    </PageContainer>
  );
};

export default MinesweeperGame; 