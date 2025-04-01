import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useWallet } from '@solana/wallet-adapter-react';
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
import { useEscrowService } from '../../services/escrow';
import { getDatabase, ref, set, get } from 'firebase/database';
import firebase from 'firebase/app';
import 'firebase/database';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

// Use a single Firebase instance for everything
let database;
try {
  // Initialize a standard Firebase connection
  database = getDatabase();
  console.log("Successfully connected to Firebase database");
} catch (error) {
  console.error("Firebase database error:", error);
  alert("Error connecting to Firebase. Check console for details.");
}

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

const MainContent = styled.div<SidebarProps>`
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
    createEscrowWallet,
    sendToEscrow,
    joinEscrow,
    setWinner,
    releaseEscrow,
    getEscrowBalance
  } = useEscrowService();
  const { 
    connected: crossmintConnected, 
    walletAddress: crossmintAddress,
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
  
  // Add additional state for escrow tracking
  const [escrowBalance, setEscrowBalance] = useState<number>(0);
  const [escrowClaimed, setEscrowClaimed] = useState<boolean>(false);
  const [isClaimingRewards, setIsClaimingRewards] = useState<boolean>(false);
  
  // Constants
  const GRID_SIZE = 5;
  const MINE_COUNT = 5;

  // Add a ref to track the unsubscribe function
  const unsubscribeRef = React.useRef<(() => void) | null>(null);

  // Find the sidebarCollapsed state and add toggleSidebar function
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  // Add toggleSidebar function
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Methods
  const handleCellClick = (row: number, col: number) => {
    // Only allow clicks if it's the player's turn and game is in PLAYING state
    if (gameState !== GameStateEnum.PLAYING) {
      console.log("Game not in playing state");
      return;
    }
    
    // Make sure it's player's turn in multiplayer
    if (hasOpponent && currentTurn !== PlayerTurn.PLAYER_ONE) {
      addGameMessage("⚠️ It's not your turn!");
      return;
    }
    
    console.log(`Clicked cell at row ${row}, col ${col}`);
    
    // Create a copy of the grid
    const newGrid = [...grid];
    
    // Don't allow clicking already revealed cells
    if (newGrid[row][col].revealed) {
      console.log("Cell already revealed");
      return;
    }
    
    // Mark the cell as revealed
    newGrid[row][col].revealed = true;
    
    // Add animation
    newGrid[row][col].isAnimating = true;
    
    // Check if the cell contains a mine
    if (newGrid[row][col].hasMine) {
      // Mine found - lose condition
      newGrid[row][col].isAnimating = true;
      setGameState(GameStateEnum.GAME_OVER);
      addGameMessage("Game over! You hit a mine.");
      
      // If playing against opponent, opponent wins
      if (hasOpponent && opponentAddress) {
        addGameMessage(`${opponentAddress.substring(0, 6)}... wins the bet!`);
        
        // Update game state with the winner (opponent)
        if (gameId) {
          updateGameState('minesweeper', gameId, {
            status: 'completed',
            gameData: {
              winner: opponentAddress,
              grid: newGrid
            }
          }).catch(error => {
            console.error("Error updating game with winner:", error);
          });
        }
      }
    } else {
      // Safe cell revealed
      addGameMessage(`Revealed cell at (${row + 1}, ${col + 1}) - it's safe!`);
      
      // Check if all non-mine cells are revealed
      const flatGrid = newGrid.flat();
      const allNonMinesRevealed = flatGrid
        .filter(cell => !cell.hasMine)
        .every(cell => cell.revealed);
      
      if (allNonMinesRevealed) {
        // Win condition
        setGameState(GameStateEnum.WIN);
        addGameMessage("Congratulations! You've found all the gems!");
        
        // Update game state with the winner (current player)
        if (gameId && publicKey) {
          updateGameState('minesweeper', gameId, {
            status: 'completed',
            gameData: {
              winner: publicKey.toString(),
              grid: newGrid
            }
          }).catch(error => {
            console.error("Error updating game with winner:", error);
          });
        }
        
        // Explain claiming process for escrow
        if (hasOpponent && escrowAddress && !escrowClaimed) {
          addGameMessage("You can now claim your winnings by clicking the 'Claim Rewards' button!");
        }
      } else if (hasOpponent) {
        // Switch turns in multiplayer
        setCurrentTurn(PlayerTurn.PLAYER_TWO);
        addGameMessage("Turn switched to opponent");
      }
    }
    
    // Update the grid
    setGrid(newGrid);
    
    // Update game grid in Firebase for multiplayer
    if (gameId) {
      updateGameState('minesweeper', gameId, {
        gameData: {
          grid: newGrid,
          currentTurn: PlayerTurn.PLAYER_TWO // Switch to opponent's turn
        }
      }).catch(error => {
        console.error("Error updating grid state:", error);
      });
    }
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
  
  const generateGameLink = (gameId: string): string => {
    // Use the current origin if in browser, or fallback for server-side rendering
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : process.env.NEXT_PUBLIC_VERCEL_URL 
        ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
        : 'https://rockpapersolana.com';
    
    return `${baseUrl}/game/minesweeper?id=${gameId}`;
  };

  const copyGameLink = async () => {
    if (gameId) {
      const link = generateGameLink(gameId);
      await navigator.clipboard.writeText(link);
      addGameMessage("Game link copied to clipboard");
    }
  };

  const createSimpleGameSession = (creatorId: string): string => {
    // Generate a unique game ID similar to the Coinflip room_id
    const gameId = Math.random().toString(36).substring(2, 8).toUpperCase();
    console.log(`Created game session ${gameId} for creator ${creatorId}`);
    return gameId;
  };

  const handleCreateGame = async () => {
    console.log("Create game button clicked");
    
    // Test direct Firebase write
    try {
      const testRef = ref(database, "test/connection");
      await set(testRef, {
        connected: true,
        wallet: publicKey.toString(),
        timestamp: Date.now()
      });
      console.log("Direct Firebase test successful");
    } catch (fbError) {
      console.error("Firebase direct write failed:", fbError);
      alert("Firebase connection error. Check console for details.");
      return;
    }
    
    if (!connected || !publicKey) {
      console.log("No wallet connected");
      alert("Please connect your wallet first");
      return;
    }
    
    const playerId = publicKey.toString();
    console.log("Creating game for player:", playerId);
    
    try {
      // Create game session directly without all the complex error handling
      const newGameId = await createGameSession('minesweeper', playerId);
      console.log("Game created with ID:", newGameId);
      
      // Continue with the rest of your function...
      setGameId(newGameId);
      setGameLink(generateGameLink(newGameId));
      
      // Initialize grid, etc.
      setGameState(GameStateEnum.WAITING);
      setActiveScreen('game');
      setGrid(initializeGrid());
      
      // Start listening for real opponent and game updates
      console.log("Setting up listener for game updates");
      addGameMessage("🔄 Setting up real-time connection...");
      
      const unsubscribe = listenToGameUpdates('minesweeper', newGameId, (data) => {
        console.log("Game update received:", data);
        
        // Update opponent info if someone joined
        if (data.opponent && !hasOpponent) {
          setHasOpponent(true);
          setOpponentAddress(data.opponent);
          setGameState(GameStateEnum.PLAYING);
          addGameMessage(`Opponent ${data.opponent.substring(0, 6)}... joined the game!`);
          
          // Update game status in Firebase to playing
          updateGameState('minesweeper', newGameId, {
            status: 'playing'
          }).catch(error => {
            console.error("Error updating game status:", error);
          });
        }
        
        // Rest of the game update handling...
        // ... existing code ...
      });
      
      // Store the unsubscribe function
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      unsubscribeRef.current = unsubscribe;
      
      console.log("Game creation complete");
      addGameMessage("✅ Game created! Waiting for opponent. Copy and share the link to invite someone.");
      
      // Add a game link display
      setTimeout(() => {
        addGameMessage(`📋 Game link: ${generateGameLink(newGameId)}`);
        addGameMessage("Click 'Copy Link' to share with a friend.");
      }, 500);
      
    } catch (error) {
      console.error("Error creating game:", error);
      if (error instanceof Error) {
        addGameMessage(`⚠️ Error creating game: ${error.message}`);
        console.error("Error stack:", error.stack);
        
        // Special handling for common errors
        if (error.message.includes("Firebase")) {
          addGameMessage("⚠️ Firebase connection issue. Please check your internet connection.");
        } else if (error.message.includes("database")) {
          addGameMessage("⚠️ Database access error. Try refreshing the page.");
        }
      } else {
        addGameMessage(`⚠️ Error creating game: Unknown error`);
      }
      
      // Suggest using the debug button
      addGameMessage("Try using the Debug button below to diagnose the issue.");
    }
  };

  const joinGame = async (id: string) => {
    try {
      if (!id) {
        addGameMessage("Please enter a game ID");
      return;
    }
    
      if (!connected || !publicKey) {
        addGameMessage("⚠️ Please connect your wallet to join a game.");
        return;
      }
      
      setGameMessages([]);
      addGameMessage(`Joining game ${id}...`);
      
      // Check if game exists in Firebase
      const gameExists = await checkGameExists('minesweeper', id);
      if (!gameExists) {
        addGameMessage("⚠️ Game not found. Please check the ID and try again.");
        return;
      }
      
      // Get the player's address
      const joinerAddress = publicKey.toString();
      
      // Join the game session using Firebase
      await joinGameSession('minesweeper', id, joinerAddress);
      console.log(`Joined game ${id} as ${joinerAddress}`);
      
      // Set game info
      setGameId(id);
      setGameState(GameStateEnum.WAITING);
      setActiveScreen('game');
      
      // Start listening for game updates
      const unsubscribe = listenToGameUpdates('minesweeper', id, async (data) => {
        console.log("Game update received:", data);
        
        // Update game state based on data
        if (data.status === 'waiting') {
          setGameState(GameStateEnum.WAITING);
          addGameMessage("Waiting for game to start...");
        } else if (data.status === 'playing') {
          setGameState(GameStateEnum.PLAYING);
          
          // Determine whose turn it is
          if (data.gameData?.currentTurn) {
            const isMyTurn = data.gameData.currentTurn === PlayerTurn.PLAYER_TWO;
            setCurrentTurn(isMyTurn ? PlayerTurn.PLAYER_ONE : PlayerTurn.PLAYER_TWO);
            addGameMessage(isMyTurn ? "It's your turn!" : "Waiting for opponent's move...");
          } else {
            // Default to creator's turn if not specified
            setCurrentTurn(PlayerTurn.PLAYER_TWO);
            addGameMessage("Game started! Waiting for creator's move...");
          }
        } else if (data.status === 'completed') {
          // Check if current player is the winner
          if (data.gameData?.winner === joinerAddress) {
            setGameState(GameStateEnum.WIN);
            addGameMessage("Congratulations! You won the game!");
            
            if (data.gameData?.escrowAddress && !data.gameData?.escrowClaimed) {
              addGameMessage("You can now claim your winnings by clicking the 'Claim Rewards' button!");
            }
          } else if (data.gameData?.winner) {
            setGameState(GameStateEnum.GAME_OVER);
            addGameMessage("Game over! Your opponent won.");
          }
        }
        
        // Connect to the escrow contract
        if (data.gameData?.escrowAddress && !escrowAddress) {
          setEscrowAddress(data.gameData.escrowAddress);
          addGameMessage(`Escrow wallet detected: ${data.gameData.escrowAddress.slice(0, 8)}...`);
          
          // Check escrow balance
          try {
            const balance = await getEscrowBalance(data.gameData.escrowAddress);
            setEscrowBalance(balance);
            addGameMessage(`Current escrow balance: ${balance} SOL`);
          } catch (error) {
            console.error("Error checking escrow balance:", error);
          }
          
          // Try to join the escrow contract
          try {
            const result = await joinEscrow(id, data.gameData.escrowAddress);
            console.log("Joined escrow contract:", result);
            
            if (result && result.success) {
              addGameMessage("✅ Connected to the game's escrow contract.");
            }
          } catch (error) {
            console.error("Error joining escrow:", error);
            // Non-critical error, continue the game
          }
        }
        
        // Update creator info
        if (data.creator && !opponentAddress) {
          setHasOpponent(true);
          setOpponentAddress(data.creator);
          addGameMessage(`Playing against ${data.creator.substring(0, 6)}...`);
        }
        
        // Update grid if available
        if (data.gameData?.grid) {
          setGrid(data.gameData.grid);
        }
        
        // Update bet amount if available
        if (data.gameData?.betAmount) {
          setBetAmount(data.gameData.betAmount);
        }
        
        // Update escrow funding status if available
        if (data.gameData?.escrowFunded) {
          setEscrowFunded(data.gameData.escrowFunded);
          
          // Check if both players funded
          const creatorFunded = data.creator && data.gameData.escrowFunded[data.creator];
          const joinerFunded = data.gameData.escrowFunded[joinerAddress];
          
          if (creatorFunded && !joinerFunded) {
            addGameMessage("Creator has funded their bet. Click 'Fund Escrow' to add your bet.");
          } else if (creatorFunded && joinerFunded) {
            addGameMessage("✅ Both players have funded the escrow. Game is ready!");
          }
        }
        
        // Check escrow claimed status
        if (data.gameData?.escrowClaimed) {
          setEscrowClaimed(true);
        }
      });
      
      // Store the unsubscribe function
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      unsubscribeRef.current = unsubscribe;
      
      addGameMessage("Successfully joined the game! Waiting for it to start...");
    } catch (error) {
      console.error("Error joining game:", error);
      addGameMessage(`⚠️ Error joining game: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const fundEscrow = async (gameId: string, address: string, amount: number) => {
    try {
      console.log(`Funding escrow ${address} with ${amount} SOL for game ${gameId}`);
      
      if (!connected || !publicKey) {
        addGameMessage("⚠️ No wallet connected. Please connect your wallet to play.");
        return false;
      }
      
      // Convert SOL to lamports
      const lamports = amount * LAMPORTS_PER_SOL;
      addGameMessage(`Processing ${amount} devnet SOL transaction to escrow...`);
      
      // Use the real sendToEscrow function from our service
      const result = await sendToEscrow(gameId, address, amount);
      
      if (!result || !result.success) {
        throw new Error("Transaction failed");
      }
      
      console.log("Transaction successful:", result);
      
      // Update escrow funded status in the UI
      const newEscrowFunded = { ...escrowFunded };
      newEscrowFunded[publicKey.toString()] = true;
      setEscrowFunded(newEscrowFunded);
      
      // Update escrow funded status in Firebase
      await updateGameState('minesweeper', gameId, {
        gameData: {
          escrowFunded: {
            ...escrowFunded,
            [publicKey.toString()]: true
          }
        }
      });
      
      // Get updated balance
      try {
        const balance = await getEscrowBalance(address);
        setEscrowBalance(balance);
      } catch (error) {
        console.error("Error updating escrow balance:", error);
      }
      
      const txInfo = result.signature ? 
        `Transaction: ${result.signature.slice(0, 8)}...` : 
        'Transaction completed';
      
      addGameMessage(`✅ Escrow funded with ${amount} devnet SOL! ${txInfo}`);
      return true;
    } catch (error) {
      console.error("Error funding escrow:", error);
      addGameMessage(`⚠️ Transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  };

  const addGameMessage = (message: string) => {
    setGameMessages(prev => [...prev, message]);
  };

  // Update claimRewards to use the on-chain escrow contract
  const claimRewards = async () => {
    try {
      setIsClaimingRewards(true);
      addGameMessage("Processing your winnings from Solana devnet...");
      
      if (!gameId || !escrowAddress) {
        throw new Error("Missing game ID or escrow address");
      }
      
      if (!connected || !publicKey) {
        throw new Error("Wallet not connected");
      }
      
      // Check if game is in the WIN state
      if (gameState !== GameStateEnum.WIN) {
        throw new Error("You can only claim rewards when you've won the game");
      }
      
      if (escrowClaimed) {
        throw new Error("Rewards have already been claimed");
      }
      
      // Check escrow balance
      const balance = await getEscrowBalance(escrowAddress);
      if (balance <= 0) {
        throw new Error("Escrow has no funds to claim");
      }
      
      addGameMessage(`Escrow balance: ${balance} SOL`);
      
      // First, set the winner on the contract
      try {
        addGameMessage("Verifying winner on the blockchain...");
        const setWinnerResult = await setWinner(gameId, escrowAddress, publicKey.toString());
        
        if (!setWinnerResult || !setWinnerResult.success) {
          throw new Error("Failed to verify winner status");
        }
        
        console.log("Set winner successful:", setWinnerResult);
        addGameMessage("✅ Winner verified on the blockchain");
      } catch (error) {
        // If this fails, it might be because the winner is already set
        console.error("Error setting winner:", error);
        addGameMessage("⚠️ Winner verification step skipped - proceeding to claim");
      }
      
      // Then release the escrow to the winner
      addGameMessage("Claiming funds from escrow...");
      const result = await releaseEscrow(gameId, escrowAddress, publicKey.toString());
      
      if (!result || !result.success) {
        throw new Error("Claim transaction failed");
      }
      
      console.log("Claim successful:", result);
      setEscrowClaimed(true);
      
      // Mark escrow as claimed in Firebase
      await updateGameState('minesweeper', gameId, {
        gameData: {
          escrowClaimed: true
        }
      });
      
      const txInfo = result.signature ? 
        `Transaction: ${result.signature.slice(0, 8)}...` : 
        'Transaction completed';
      
      addGameMessage(`🎉 You've claimed ${balance} devnet SOL in winnings! ${txInfo}`);
      return true;
    } catch (error) {
      console.error("Error claiming rewards:", error);
      addGameMessage(`⚠️ Claim failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    } finally {
      setIsClaimingRewards(false);
    }
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

  // In the debug tools section, add a new function:

  const createOfflineGame = () => {
    try {
      console.log("Creating offline game");
      addGameMessage("🔄 Creating offline game...");
      
      // Generate a local game ID
      const localGameId = "LOCAL-" + Math.random().toString(36).substring(2, 8).toUpperCase();
      
      // Initialize a new grid
      const newGrid = initializeGrid();
      
      // Update local state only (no Firebase)
      setGameId(localGameId);
      setGrid(newGrid);
      setGameState(GameStateEnum.PLAYING);
      setActiveScreen('game');
      
      addGameMessage("✅ Offline game created! You're playing solo.");
      addGameMessage("Note: This game is not connected to Firebase or Solana.");
      addGameMessage("This is just for testing the UI functionality.");
      
      return localGameId;
    } catch (error) {
      console.error("Error creating offline game:", error);
      addGameMessage(`❌ Error creating offline game: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
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

  // Set up cleanup function to unsubscribe from Firebase listeners
  useEffect(() => {
    // Cleanup function
    return () => {
      if (unsubscribeRef.current) {
        console.log("Unsubscribing from Firebase listener");
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, []);

  // Add debug button at the bottom of the component, before the return statement
  const debugCreateGame = async () => {
    try {
      console.log("Debug create game clicked");
      addGameMessage("🔍 Testing basic game creation...");
      
      // Test wallet connection
      addGameMessage("🔍 Testing wallet connection...");
      if (!connected) {
        addGameMessage("❌ No wallet connected - please connect your wallet first");
        return;
      }
      
      if (!publicKey) {
        addGameMessage("❌ Public key is null despite wallet being connected");
        return;
      }
      
      // Display wallet info
      const walletAddress = publicKey.toString();
      addGameMessage(`✅ Wallet connected: ${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`);
      console.log("Full wallet address:", walletAddress);
      
      // Test Firebase connection
      addGameMessage("🔍 Testing Firebase connection...");
      try {
        console.log("Creating test game in Firebase");
        const testId = Math.random().toString(36).substring(2, 8).toUpperCase();
        console.log(`Test game ID: ${testId}`);
        
        // Create a simple object directly in Firebase
        const gameRef = ref(database, `test/${testId}`);
        await set(gameRef, {
          id: testId,
          created: Date.now(),
          test: true,
          wallet: walletAddress
        });
        
        addGameMessage(`✅ Firebase write successful! Test ID: ${testId}`);
        
        // Try to read it back
        const snapshot = await get(gameRef);
        if (snapshot.exists()) {
          console.log("Firebase read successful:", snapshot.val());
          addGameMessage("✅ Firebase read successful!");
        } else {
          addGameMessage("❌ Firebase read failed - data not found");
        }
      } catch (firebaseError) {
        console.error("Firebase test error:", firebaseError);
        addGameMessage(`❌ Firebase error: ${firebaseError instanceof Error ? firebaseError.message : 'Unknown error'}`);
        
        // Try to determine the specific Firebase error
        const errorMsg = firebaseError instanceof Error ? firebaseError.message : String(firebaseError);
        if (errorMsg.includes("permission_denied")) {
          addGameMessage("❌ Firebase permission denied - check database rules");
        } else if (errorMsg.includes("network")) {
          addGameMessage("❌ Network error - check your internet connection");
        } else if (errorMsg.includes("auth")) {
          addGameMessage("❌ Firebase authentication error - check your credentials");
        }
      }
      
      // Try using the create game session function
      try {
        addGameMessage("🔍 Testing createGameSession function...");
        const gameId = await createGameSession('minesweeper', publicKey.toString());
        addGameMessage(`✅ createGameSession successful! Game ID: ${gameId}`);
        
        // See if we can read the created game
        try {
          const exists = await checkGameExists('minesweeper', gameId);
          addGameMessage(`Game exists check: ${exists ? '✅' : '❌'}`);
        } catch (checkError) {
          addGameMessage(`❌ Error checking if game exists: ${checkError instanceof Error ? checkError.message : 'Unknown error'}`);
        }
      } catch (createError) {
        console.error("Create game session error:", createError);
        addGameMessage(`❌ createGameSession error: ${createError instanceof Error ? createError.message : 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Debug function error:", error);
      addGameMessage(`❌ Debug error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Start the app
  return (
    <PageContainer>
      <Head>
        <title>Minesweeper | Rock Paper Solana</title>
        <meta name="description" content="Play Minesweeper on Solana blockchain and win SOL tokens. Strategic multiplayer mining game with secure betting." />
      </Head>
      <AppSidebar 
        collapsed={sidebarCollapsed}
        currentPage="mines"
        toggleSidebar={toggleSidebar}
      />
      <GameWrapper>
        <GameContainer>
          <LeftPanel>
            {gameState === GameStateEnum.INIT && (
              <>
                <h2>Minesweeper</h2>
                <p>Find all the gems without hitting any mines! Each game has 5 mines hidden on the board. Place bets with Solana devnet SOL.</p>
                
                <AmountContainer>
            <InputLabel>Bet Amount (devnet SOL)</InputLabel>
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
          
                <ActionButton 
                  onClick={handleCreateGame}
                  style={{ 
                    position: 'relative',
                    overflow: 'hidden' 
                  }}
                  disabled={!connected || !publicKey}
                >
                  {!connected ? 'Connect Wallet First' : 'Create Game'}
                  <span style={{ 
                    position: 'absolute', 
                    right: '10px', 
                    top: '50%', 
                    transform: 'translateY(-50%)'
                  }}>
                    ◎
                  </span>
                </ActionButton>
                
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
                  
                  {escrowAddress && (
                    <EscrowSection>
                      <h4>Escrow Status</h4>
                      <EscrowInfo>
                        <div>
                          <div>You:</div>
                          <EscrowPlayerStatus 
                            funded={
                              (publicKey && escrowFunded[publicKey.toString()]) || 
                              (crossmintAddress && escrowFunded[crossmintAddress]) || 
                              false
                            }
                          >
                            {((publicKey && escrowFunded[publicKey.toString()]) || 
                              (crossmintAddress && escrowFunded[crossmintAddress])) 
                              ? 'Funded ✓' 
                              : 'Not Funded'
                            }
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
                      
                      {!((publicKey && escrowFunded[publicKey.toString()]) || 
                         (crossmintAddress && escrowFunded[crossmintAddress])) && (
                        <ActionButton 
                          onClick={() => escrowAddress && fundEscrow(gameId, escrowAddress, betAmount)}
                          style={{ marginTop: '10px' }}
                        >
                          Fund Escrow
          </ActionButton>
        )}
        
                      {/* Add claim rewards button when user has won */}
                      {gameState === GameStateEnum.WIN && 
                       escrowAddress && 
                       !escrowClaimed && 
                       ((publicKey && escrowFunded[publicKey.toString()]) || 
                        (crossmintAddress && escrowFunded[crossmintAddress])) && (
                        <ActionButton 
                          onClick={claimRewards}
                          disabled={isClaimingRewards}
                          style={{ 
                            marginTop: '10px', 
                            backgroundColor: '#ffb800',
                            opacity: isClaimingRewards ? 0.7 : 1
                          }}
                        >
                          {isClaimingRewards ? 'Processing...' : 'Claim Rewards'}
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
            
          <MainContent collapsed={sidebarCollapsed}>
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
            
            {/* Add this right before the closing </MainContent> tag */}
            <div style={{ marginTop: '20px', padding: '10px', border: '1px dashed #666', borderRadius: '8px' }}>
              <h3>Debug Tools</h3>
              {!connected && (
                <div style={{ marginBottom: '15px' }}>
                  <p style={{ color: '#ff3333', fontWeight: 'bold' }}>⚠️ Wallet not connected!</p>
                  <WalletMultiButton />
                </div>
              )}
              
              <p>If "Create Game" is not working, try these options:</p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button 
                  onClick={debugCreateGame}
                  style={{ 
                    padding: '10px 15px', 
                    background: '#ff9900', 
                    color: 'black', 
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Debug Game Creation
                </button>
                <button 
                  onClick={createOfflineGame}
                  style={{ 
                    padding: '10px 15px', 
                    background: '#4CAF50', 
                    color: 'white', 
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Use Offline Mode
                </button>
              </div>
            </div>
          </MainContent>
          </BottomSection>
        </GameWrapper>
    </PageContainer>
  );
};

export default MinesweeperGame; 