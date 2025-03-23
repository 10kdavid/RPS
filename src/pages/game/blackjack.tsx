import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useWallet } from '../../contexts/WalletContext';
import AppSidebar from '../../components/Sidebar';
import { 
  createGameSession, 
  joinGameSession, 
  listenToGameUpdates, 
  updateGameState,
  checkGameExists
} from '../../utils/firebase';

// Game constants and types
enum GameState {
  IDLE = 'idle',                  // Initial state, game not started
  WAITING = 'waiting',            // Waiting for opponent
  PLAYING = 'playing',            // Game in progress
  RESULT = 'result'               // Game ended, result determined
}

enum GameResult {
  WIN = 'win',
  LOSE = 'lose',
  DRAW = 'draw',
  NOT_DETERMINED = 'not_determined'
}

enum CardSuit {
  HEARTS = 'hearts',
  DIAMONDS = 'diamonds',
  CLUBS = 'clubs',
  SPADES = 'spades'
}

enum PlayerAction {
  HIT = 'hit',
  STAND = 'stand'
}

// Add player turn tracking
enum PlayerTurn {
  PLAYER = 'player',
  OPPONENT = 'opponent'
}

// Add connection state for multiplayer
enum ConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  WAITING_FOR_OPPONENT = 'waiting_for_opponent',
  OPPONENT_CONNECTED = 'opponent_connected'
}

enum InviteState {
  NONE = 'none',
  SENT = 'sent',
  RECEIVED = 'received',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected'
}

interface ChatMessage {
  sender: string;
  message: string;
  timestamp: number;
}

interface Card {
  suit: CardSuit;
  value: string;
  face: string;
}

// Styled Components
interface SidebarProps {
  collapsed: boolean;
}

const PageContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #0f172a;
  color: white;
  position: relative;
`;

const MainContent = styled.div<SidebarProps>`
  margin-left: ${props => props.collapsed ? '60px' : '240px'};
  padding: 20px;
  transition: margin-left 0.3s ease-in-out;
  width: calc(100% - ${props => props.collapsed ? '60px' : '240px'});
  min-height: 100vh;
`;

const GameWrapper = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  padding-top: 20px;
`;

const GameContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 20px;
  width: 100%;
  margin-bottom: 20px;
  
  @media (max-width: 968px) {
    flex-direction: column;
  }
`;

const LeftPanel = styled.div`
  width: 280px;
  background-color: #1e293b;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 968px) {
    width: 100%;
  }
`;

const InputLabel = styled.div`
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 8px;
`;

const AmountContainer = styled.div`
  margin-bottom: 16px;
`;

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  background-color: #0a141e;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 8px 12px;
`;

const AmountInput = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  color: white;
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
  }
`;

const CurrencyIcon = styled.div`
  margin-right: 6px;
  color: #00b4c9;
  font-size: 1rem;
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 6px;
  margin-top: 8px;
`;

const PercentButton = styled.button`
  background-color: #0a141e;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.6);
  padding: 5px 8px;
  cursor: pointer;
  flex: 1;
  transition: all 0.2s ease;
  font-size: 0.8rem;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
    color: white;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.2rem;
  font-weight: 500;
  color: white;
  margin-bottom: 16px;
`;

const ActionButton = styled.button`
  width: 100%;
  padding: 12px;
  background-color: #3b82f6;
  border: none;
  border-radius: 4px;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 10px;
  
  &:hover {
    background-color: #2563eb;
    transform: translateY(-1px);
  }
  
  &:disabled {
    background-color: rgba(59, 130, 246, 0.5);
    cursor: not-allowed;
    transform: none;
  }
`;

const FindOpponentButton = styled(ActionButton)`
  background-color: #334155;
  color: white;
  
  &:hover {
    background-color: #475569;
  }
  
  &:disabled {
    background-color: rgba(51, 65, 85, 0.5);
  }
`;

const BettingSection = styled.div`
  margin-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 16px;
`;

const ActionsSection = styled.div`
  margin-bottom: 16px;
`;

const HitButton = styled(ActionButton)`
  background-color: #22c55e;
  
  &:hover {
    background-color: #16a34a;
  }
  
  &:disabled {
    background-color: rgba(34, 197, 94, 0.5);
  }
`;

const StandButton = styled(ActionButton)`
  background-color: #ef4444;
  
  &:hover {
    background-color: #dc2626;
  }
  
  &:disabled {
    background-color: rgba(239, 68, 68, 0.5);
  }
`;

const GameInfo = styled.div`
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
`;

const GameStat = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  font-size: 0.85rem;
`;

const StatLabel = styled.span`
  color: rgba(255, 255, 255, 0.5);
`;

const StatValue = styled.span`
  color: white;
  font-weight: 500;
`;

const BetAmountDisplay = styled.div`
  background: rgba(0, 180, 201, 0.1);
  border-radius: 4px;
  padding: 10px;
  margin-bottom: 12px;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  
  span {
    font-weight: 600;
    color: #00b4c9;
  }
`;

const GameArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #1e293b;
  border-radius: 8px;
  padding: 20px;
  min-height: 480px;
`;

const GameTitle = styled.h1`
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 20px;
  color: #3b82f6;
  text-align: center;
`;

const PlayerArea = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 25px;
  align-items: center;
`;

const OpponentArea = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 25px;
  align-items: center;
`;

const AreaTitle = styled.h3`
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 12px;
`;

const CardsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
  justify-content: center;
`;

const Score = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
  background: rgba(0, 0, 0, 0.3);
  padding: 4px 12px;
  border-radius: 20px;
`;

const ResultBanner = styled.div<{result: GameResult}>`
  background: ${props => {
    switch(props.result) {
      case GameResult.WIN: return 'linear-gradient(120deg, rgba(46, 204, 113, 0.2), rgba(0, 180, 201, 0.2))';
      case GameResult.LOSE: return 'linear-gradient(120deg, rgba(231, 76, 60, 0.2), rgba(192, 57, 43, 0.2))';
      default: return 'linear-gradient(120deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))';
    }
  }};
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
  text-align: center;
  
  h3 {
    margin: 0 0 8px 0;
    color: ${props => {
      switch(props.result) {
        case GameResult.WIN: return '#2ecc71';
        case GameResult.LOSE: return '#e74c3c';
        default: return 'white';
      }
    }};
    font-size: 1.4rem;
  }
  
  p {
    margin: 0;
    color: rgba(255, 255, 255, 0.7);
  }
`;

const BottomSection = styled.div`
  background-color: #1e293b;
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 16px;
`;

interface TabProps {
  active: boolean;
}

const Tab = styled.button<TabProps>`
  padding: 10px 16px;
  background: transparent;
  border: none;
  color: ${props => props.active ? 'white' : 'rgba(255, 255, 255, 0.5)'};
  font-weight: ${props => props.active ? '600' : '400'};
  border-bottom: 2px solid ${props => props.active ? '#3b82f6' : 'transparent'};
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
  
  &:hover {
    color: white;
  }
`;

const TabContent = styled.div`
  padding: 12px;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  background-color: rgba(15, 23, 42, 0.3);
  border-radius: 6px;
`;

// Card components
interface CardProps {
  suit: string;
  face: string;
  hidden?: boolean;
}

const CardWrapper = styled.div`
  perspective: 800px;
  width: 70px;
  height: 100px;
  margin: 3px;
  
  &.new-card {
    animation: dealCard 0.4s ease-out forwards;
  }
  
  @keyframes dealCard {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const CardContainer = styled.div<{red: boolean}>`
  width: 100%;
  height: 100%;
  border-radius: 6px;
  background-color: white;
  color: ${props => props.red ? '#e74c3c' : '#2c3e50'};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 4px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  font-weight: 600;
  position: relative;
  transition: transform 0.3s;
`;

const CardBack = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 6px;
  background: linear-gradient(135deg, #1e293b 25%, #334155 25%, #334155 50%, #1e293b 50%, #1e293b 75%, #334155 75%);
  background-size: 16px 16px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  
  &::after {
    content: "";
    width: 60%;
    height: 60%;
    border-radius: 6px;
    background: linear-gradient(to bottom right, #3b82f6, #2563eb);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  }
`;

const CardCorner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const CardValue = styled.div`
  font-size: 1rem;
`;

const CardSuitIcon = styled.div`
  font-size: 0.8rem;
`;

const CardCenter = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 2rem;
`;

const CardCornerBottomRight = styled(CardCorner)`
  position: absolute;
  bottom: 4px;
  right: 4px;
  transform: rotate(180deg);
`;

const GameActions = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 20px;
`;

const VSContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 10px 0;
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.7);
  position: relative;
  
  &::before, &::after {
    content: "";
    height: 1px;
    background-color: rgba(255, 255, 255, 0.2);
    flex: 1;
  }
  
  &::before {
    margin-right: 15px;
  }
  
  &::after {
    margin-left: 15px;
  }
`;

const StatusIndicator = styled.div<{status: 'waiting' | 'your-turn' | 'opponent-turn' | 'complete'}>`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  background-color: ${props => {
    switch(props.status) {
      case 'waiting': return 'rgba(234, 179, 8, 0.2)';
      case 'your-turn': return 'rgba(34, 197, 94, 0.2)';
      case 'opponent-turn': return 'rgba(59, 130, 246, 0.2)';
      case 'complete': return 'rgba(139, 92, 246, 0.2)';
    }
  }};
  color: ${props => {
    switch(props.status) {
      case 'waiting': return '#eab308';
      case 'your-turn': return '#22c55e';
      case 'opponent-turn': return '#3b82f6';
      case 'complete': return '#8b5cf6';
    }
  }};
  display: inline-flex;
  align-items: center;
  font-weight: 500;
  
  &::before {
    content: "";
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: ${props => {
      switch(props.status) {
        case 'waiting': return '#eab308';
        case 'your-turn': return '#22c55e';
        case 'opponent-turn': return '#3b82f6';
        case 'complete': return '#8b5cf6';
      }
    }};
    margin-right: 8px;
  }
`;

const Card: React.FC<CardProps> = ({ suit, face, hidden = false }) => {
  const isRed = suit === '♥' || suit === '♦';
  
  if (hidden) {
    return (
      <CardWrapper>
        <CardBack />
      </CardWrapper>
    );
  }
  
  return (
    <CardWrapper className="new-card">
      <CardContainer red={isRed}>
        <CardCorner>
          <CardValue>{face}</CardValue>
          <CardSuitIcon>{suit}</CardSuitIcon>
        </CardCorner>
        
        <CardCenter>{suit}</CardCenter>
        
        <CardCornerBottomRight>
          <CardValue>{face}</CardValue>
          <CardSuitIcon>{suit}</CardSuitIcon>
        </CardCornerBottomRight>
      </CardContainer>
    </CardWrapper>
  );
};

const BlackjackGame: React.FC = () => {
  const router = useRouter();
  const { connected, balance, publicKey, openWalletModal } = useWallet();
  
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [opponentHand, setOpponentHand] = useState<Card[]>([]);
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [betAmount, setBetAmount] = useState(0.05);
  const [result, setResult] = useState<GameResult>(GameResult.NOT_DETERMINED);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('rules');
  const [currentTurn, setCurrentTurn] = useState<PlayerTurn>(PlayerTurn.PLAYER);
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
  const [gameLink, setGameLink] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  
  // Add new state for Firebase
  const [unsubscribeRef, setUnsubscribeRef] = useState<any>(null);
  const [gameSessionId, setGameSessionId] = useState<string | null>(null);
  
  // Update useEffect to properly handle invite links
  useEffect(() => {
    const handleInviteCode = async () => {
      const { invite } = router.query;
      console.log("Router query:", router.query);
      
      if (invite && typeof invite === 'string') {
        console.log(`Detected invite code: ${invite}`);
        setInviteCode(invite);
        
        if (connected && publicKey) {
          console.log(`User connected with wallet ${publicKey}, attempting to join game`);
          try {
            await handleJoinGame(invite);
          } catch (error) {
            console.error("Error joining game with invite code:", error);
            alert(`Failed to join game: ${error.message || "Unknown error"}`);
          }
        } else {
          console.log("Wallet not connected, prompting user to connect");
          alert("Please connect your wallet to join this game");
          openWalletModal();
        }
      }
    };
    
    if (router.isReady) {
      handleInviteCode();
    }
  }, [router.isReady, router.query, connected, publicKey]);
  
  // Cleanup Firebase listeners when component unmounts
  useEffect(() => {
    return () => {
      if (unsubscribeRef) {
        unsubscribeRef();
      }
    };
  }, [unsubscribeRef]);
  
  // Game setup state
  
  // Generate a new deck of cards
  const generateDeck = (): Card[] => {
    const suits = [CardSuit.HEARTS, CardSuit.DIAMONDS, CardSuit.CLUBS, CardSuit.SPADES];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    
    const deck: Card[] = [];
    
    for (const suit of suits) {
      for (const value of values) {
        deck.push({
          suit,
          value,
          face: value
        });
      }
    }
    
    // Shuffle the deck
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    
    return deck;
  };
  
  // Draw a card from the deck
  const drawCard = (deck: Card[]): Card => {
    return deck[Math.floor(Math.random() * deck.length)];
  };
  
  // Calculate score for a set of cards
  const calculateHandValue = (hand: Card[]): number => {
    let value = 0;
    let aceCount = 0;
    
    for (const card of hand) {
      if (card.value === 'A') {
        aceCount++;
        value += 11;
      } else if (['K', 'Q', 'J'].includes(card.value)) {
        value += 10;
      } else {
        value += parseInt(card.value);
      }
    }
    
    // Adjust for aces
    while (value > 21 && aceCount > 0) {
      value -= 10;
      aceCount--;
    }
    
    return value;
  };
  
  // Function to handle creating a game for opponent to join
  const handleCreateGame = async () => {
    if (!connected || !publicKey) {
      alert('Please connect your wallet first.');
      openWalletModal();
      return;
    }
    
    try {
      // Create a game session in Firebase
      const gameId = await createGameSession('blackjack', publicKey.toString());
      
      // Generate a random code for easier sharing
      const randomCode = gameId;
      setInviteCode(randomCode);
      setGameSessionId(gameId);
      
      // Fix: Ensure we use the correct production URL without Vercel preview domains
      const baseUrl = window.location.origin;
      // Remove any Vercel preview URLs if present
      const productionUrl = baseUrl.includes('vercel.app') 
        ? 'https://rockpapersolana.com' // Replace with your actual domain
        : baseUrl;
      
      setGameLink(`${productionUrl}/game/blackjack?invite=${randomCode}`);
      
      // Set game state to waiting for opponent
      setConnectionState(ConnectionState.WAITING_FOR_OPPONENT);
      setGameState(GameState.WAITING);
      
      // Listen for opponent joining
      const unsubscribe = listenToGameUpdates('blackjack', gameId, (gameData) => {
        console.log('Game update:', gameData);
        
        // Check if opponent joined
        if (gameData.status === 'playing' && gameData.opponent) {
          setConnectionState(ConnectionState.OPPONENT_CONNECTED);
          setCurrentTurn(gameData.currentTurn === publicKey.toString() ? PlayerTurn.PLAYER : PlayerTurn.OPPONENT);
          startGame();
        }
        
        // Check for game state updates from opponent
        if (gameData.gameData && gameData.currentTurn !== publicKey.toString()) {
          // Update game state based on opponent's actions
          if (gameData.gameData.opponentHand) {
            setOpponentHand(gameData.gameData.opponentHand);
          }
          if (gameData.gameData.opponentScore) {
            setOpponentScore(gameData.gameData.opponentScore);
          }
          if (gameData.gameData.currentTurn === 'player') {
            setCurrentTurn(PlayerTurn.PLAYER);
          }
          if (gameData.gameData.result !== GameResult.NOT_DETERMINED) {
            setResult(gameData.gameData.result);
            setGameState(GameState.RESULT);
          }
        }
      });
      
      setUnsubscribeRef(() => unsubscribe);
      
      console.log(`Game created with code: ${randomCode}`);
    } catch (error) {
      console.error('Error creating game:', error);
      alert('Failed to create game. Please try again.');
    }
  };
  
  // Function to handle joining a game with invite code
  const handleJoinGame = async (codeToUse?: string) => {
    const finalInviteCode = codeToUse || inviteCode;
    
    if (!finalInviteCode) {
      alert('Please enter an invite code.');
      return;
    }
    
    if (!connected || !publicKey) {
      alert('Please connect your wallet first.');
      openWalletModal();
      return;
    }
    
    console.log(`Attempting to join game with code: ${finalInviteCode}`);
    setConnectionState(ConnectionState.CONNECTING);
    
    try {
      // Check if game exists first
      const exists = await checkGameExists('blackjack', finalInviteCode);
      if (!exists) {
        throw new Error("Game not found or has expired");
      }
      
      // Join the game in Firebase
      await joinGameSession('blackjack', finalInviteCode, publicKey.toString());
      
      setGameSessionId(finalInviteCode);
      
      // Listen for game updates
      const unsubscribe = listenToGameUpdates('blackjack', finalInviteCode, (gameData) => {
        console.log('Game update received:', gameData);
        
        // Update game state based on creator's actions
        if (gameData.status === 'playing') {
          setConnectionState(ConnectionState.OPPONENT_CONNECTED);
          setCurrentTurn(gameData.currentTurn === publicKey.toString() ? PlayerTurn.PLAYER : PlayerTurn.OPPONENT);
          
          if (gameState === GameState.WAITING || gameState === GameState.IDLE) {
            startGame();
          }
          
          // Update local game state from Firebase
          if (gameData.gameData) {
            if (gameData.gameData.playerHand && gameData.currentTurn !== publicKey.toString()) {
              setOpponentHand(gameData.gameData.playerHand);
            }
            if (gameData.gameData.playerScore && gameData.currentTurn !== publicKey.toString()) {
              setOpponentScore(gameData.gameData.playerScore);
            }
            if (gameData.gameData.currentTurn === 'opponent' && publicKey.toString() !== gameData.creator) {
              setCurrentTurn(PlayerTurn.PLAYER);
            }
            if (gameData.gameData.result !== GameResult.NOT_DETERMINED) {
              setResult(gameData.gameData.result);
              setGameState(GameState.RESULT);
            }
          }
        }
      });
      
      setUnsubscribeRef(() => unsubscribe);
      console.log("Successfully joined game and established connection");
      
    } catch (error) {
      console.error("Error joining game:", error);
      alert(error.message || 'Failed to join game. Please try again.');
      setConnectionState(ConnectionState.DISCONNECTED);
      throw error;
    }
  };
  
  // Player actions
  const handleHit = async () => {
    if (gameState !== GameState.PLAYING || currentTurn !== PlayerTurn.PLAYER) return;
    
    const deck = generateDeck();
    const newCard = drawCard(deck);
    const updatedHand = [...playerHand, newCard];
    setPlayerHand(updatedHand);
    
    const newScore = calculateHandValue(updatedHand);
    setPlayerScore(newScore);
    
    // Check if player busts
    if (newScore > 21) {
      setResult(GameResult.LOSE);
      setGameState(GameState.RESULT);
      
      // Update game state in Firebase
      if (gameSessionId) {
        await updateGameState('blackjack', gameSessionId, {
          gameData: {
            playerHand: updatedHand,
            playerScore: newScore,
            result: GameResult.LOSE,
            lastAction: 'hit',
            currentTurn: 'opponent'
          }
        });
      }
    } else {
      // Switch turn to opponent
      setCurrentTurn(PlayerTurn.OPPONENT);
      
      // Update game state in Firebase
      if (gameSessionId) {
        await updateGameState('blackjack', gameSessionId, {
          currentTurn: publicKey ? (publicKey.toString() === gameSessionId ? gameSessionId : publicKey.toString()) : '',
          gameData: {
            playerHand: updatedHand,
            playerScore: newScore,
            lastAction: 'hit',
            currentTurn: 'opponent'
          }
        });
      }
      
      // If playing against computer, simulate opponent's turn
      if (connectionState !== ConnectionState.OPPONENT_CONNECTED) {
        setTimeout(() => {
          handleOpponentTurn();
        }, 1500);
      }
    }
  };
  
  const handleStand = async () => {
    if (gameState !== GameState.PLAYING || currentTurn !== PlayerTurn.PLAYER) return;
    
    // Switch turn to opponent
    setCurrentTurn(PlayerTurn.OPPONENT);
    
    // Update game state in Firebase
    if (gameSessionId) {
      await updateGameState('blackjack', gameSessionId, {
        currentTurn: publicKey ? (publicKey.toString() === gameSessionId ? gameSessionId : publicKey.toString()) : '',
        gameData: {
          lastAction: 'stand',
          currentTurn: 'opponent'
        }
      });
    }
    
    // If playing against computer, simulate opponent's turn
    if (connectionState !== ConnectionState.OPPONENT_CONNECTED) {
      setTimeout(() => {
        handleOpponentTurn();
      }, 1500);
    }
  };
  
  // Simulate opponent's turn
  const handleOpponentTurn = () => {
    const deck = generateDeck();
    let currentOpponentHand = [...opponentHand];
    let currentOpponentScore = calculateHandValue(currentOpponentHand);
    
    // Opponent will hit until they reach at least 17
    while (currentOpponentScore < 17) {
      const newCard = drawCard(deck);
      currentOpponentHand = [...currentOpponentHand, newCard];
      currentOpponentScore = calculateHandValue(currentOpponentHand);
    }
    
    setOpponentHand(currentOpponentHand);
    setOpponentScore(currentOpponentScore);
    
    // Determine game result
    if (currentOpponentScore > 21) {
      // Opponent busts
      setResult(GameResult.WIN);
    } else if (currentOpponentScore > playerScore) {
      // Opponent has higher score
      setResult(GameResult.LOSE);
    } else if (playerScore > currentOpponentScore) {
      // Player has higher score
      setResult(GameResult.WIN);
    } else {
      // Tie
      setResult(GameResult.DRAW);
    }
    
    setGameState(GameState.RESULT);
  };
  
  // Reset game
  const resetGame = () => {
    setPlayerHand([]);
    setOpponentHand([]);
    setPlayerScore(0);
    setOpponentScore(0);
    setResult(GameResult.NOT_DETERMINED);
    setGameState(GameState.IDLE);
    setCurrentTurn(PlayerTurn.PLAYER);
    setConnectionState(ConnectionState.DISCONNECTED);
    setGameLink('');
    setInviteCode('');
  };
  
  const getSuitSymbol = (suit: CardSuit): string => {
    switch (suit) {
      case CardSuit.HEARTS: return '♥';
      case CardSuit.DIAMONDS: return '♦';
      case CardSuit.CLUBS: return '♣';
      case CardSuit.SPADES: return '♠';
      default: return '';
    }
  };
  
  const isRedSuit = (suit: CardSuit): boolean => {
    return suit === CardSuit.HEARTS || suit === CardSuit.DIAMONDS;
  };
  
  const renderGameStatus = () => {
    return null;
  };
  
  const renderGameResult = () => {
    return null;
  };
  
  const renderGameControls = () => {
    if (gameState !== GameState.PLAYING || currentTurn !== PlayerTurn.PLAYER) {
      return null;
    }
    
    return (
      <GameActions>
        <HitButton onClick={handleHit}>
          Hit
        </HitButton>
        <StandButton onClick={handleStand}>
          Stand
        </StandButton>
      </GameActions>
    );
  };
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
  
  const handleConnectWallet = () => {
    openWalletModal();
  };
  
  // Function to render left panel content based on game state
  const renderLeftPanelContent = () => {
    if (gameState === GameState.IDLE) {
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
                onChange={(e) => setBetAmount(parseFloat(e.target.value))}
              />
            </InputContainer>
            
            <ButtonsContainer>
              <PercentButton onClick={() => setBetAmount(0.05)}>0.05</PercentButton>
              <PercentButton onClick={() => setBetAmount(0.1)}>0.1</PercentButton>
              <PercentButton onClick={() => setBetAmount(0.5)}>0.5</PercentButton>
              <PercentButton onClick={() => setBetAmount(1)}>1</PercentButton>
            </ButtonsContainer>
          </BettingSection>
          
          <ActionsSection>
            <ActionButton onClick={handleCreateGame} disabled={!connected}>
              Create Game
            </ActionButton>
            <FindOpponentButton onClick={handleFindOpponent} disabled={!connected}>
              Find Opponent
            </FindOpponentButton>
          </ActionsSection>
          
          <ActionsSection>
            <InputLabel>Join with Invite Code</InputLabel>
            <InputContainer style={{ marginBottom: '8px' }}>
              <AmountInput 
                type="text" 
                placeholder="Enter code"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
              />
            </InputContainer>
            <ActionButton onClick={handleJoinGame} disabled={!connected || !inviteCode}>
              Join Game
            </ActionButton>
          </ActionsSection>
          
          <GameInfo>
            <p>Play Blackjack 1v1 against another player! First player to 21 wins, but go over and you lose.</p>
            <p>• Create a game and invite friends</p>
            <p>• Find an opponent for quick play</p>
            <p>• Join a game with an invite code</p>
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
          
          <InputLabel>Share this code with your opponent</InputLabel>
          <InputContainer style={{ marginBottom: '12px' }}>
            <AmountInput 
              type="text" 
              value={inviteCode}
              readOnly
            />
          </InputContainer>
          
          <ActionButton onClick={copyGameLink}>
            Copy Game Link
          </ActionButton>
          
          <FindOpponentButton onClick={resetGame} style={{ marginTop: '8px' }}>
            Cancel Game
          </FindOpponentButton>
          
          <GameInfo style={{ marginTop: '16px' }}>
            <p>Waiting for opponent to join your game...</p>
            <p>Share the invite code or link with a friend</p>
          </GameInfo>
        </>
      );
    }
    
    if (gameState === GameState.PLAYING) {
      return (
        <>
          <SectionTitle>Game In Progress</SectionTitle>
          
          <BetAmountDisplay>
            Current Bet: <span>{betAmount} SOL</span>
          </BetAmountDisplay>
          
          <div style={{ textAlign: 'center', margin: '10px 0' }}>
            {currentTurn === PlayerTurn.PLAYER ? (
              <StatusIndicator status="your-turn">Your Turn</StatusIndicator>
            ) : (
              <StatusIndicator status="opponent-turn">Opponent's Turn</StatusIndicator>
            )}
          </div>
          
          {currentTurn === PlayerTurn.PLAYER && (
            <ActionsSection>
              <HitButton onClick={handleHit} disabled={currentTurn !== PlayerTurn.PLAYER}>
                Hit Me
              </HitButton>
              <StandButton onClick={handleStand} disabled={currentTurn !== PlayerTurn.PLAYER}>
                Stand
              </StandButton>
            </ActionsSection>
          )}
          
          <GameInfo>
            <GameStat>
              <StatLabel>Your Score:</StatLabel>
              <StatValue>{playerScore}</StatValue>
            </GameStat>
            <GameStat>
              <StatLabel>Opponent Score:</StatLabel>
              <StatValue>{opponentScore}</StatValue>
            </GameStat>
          </GameInfo>
        </>
      );
    }
    
    // Result state
    return (
      <>
        <SectionTitle>Game Result</SectionTitle>
        
        <BetAmountDisplay>
          Bet Amount: <span>{betAmount} SOL</span>
        </BetAmountDisplay>
        
        <ResultBanner result={result}>
          <h3>
            {result === GameResult.WIN && 'You Won!'}
            {result === GameResult.LOSE && 'You Lost!'}
            {result === GameResult.DRAW && "It's a Tie!"}
          </h3>
          <p>
            {result === GameResult.WIN && `You've won ${(betAmount * 2).toFixed(2)} SOL`}
            {result === GameResult.LOSE && 'Better luck next time!'}
            {result === GameResult.DRAW && 'Your bet has been returned.'}
          </p>
        </ResultBanner>
        
        <ActionButton onClick={resetGame}>
          Play Again
        </ActionButton>
      </>
    );
  };
  
  // Function to render active tab content
  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'history':
        return (
          <div>
            <p>Your game history will appear here once you've played some games.</p>
            <p style={{ marginTop: '8px', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.5)' }}>
              Track your wins, losses, and other statistics to improve your gameplay strategy.
            </p>
          </div>
        );
      case 'stats':
        return (
          <div>
            <GameStat>
              <StatLabel>Games Played:</StatLabel>
              <StatValue>0</StatValue>
            </GameStat>
            <GameStat>
              <StatLabel>Games Won:</StatLabel>
              <StatValue>0</StatValue>
            </GameStat>
            <GameStat>
              <StatLabel>Win Rate:</StatLabel>
              <StatValue>0%</StatValue>
            </GameStat>
            <GameStat>
              <StatLabel>Average Bet:</StatLabel>
              <StatValue>0 SOL</StatValue>
            </GameStat>
            <p style={{ marginTop: '12px', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.5)' }}>
              Play more games to see your statistics and track your progress.
            </p>
          </div>
        );
      case 'rules':
      default:
        return (
          <div>
            <h3 style={{ fontSize: '1rem', marginBottom: '8px', color: '#3b82f6' }}>Game Objective</h3>
            <p style={{ marginBottom: '12px' }}>
              Get a hand value closer to 21 than your opponent without going over. If you exceed 21, you "bust" and lose the game.
            </p>
            
            <h3 style={{ fontSize: '1rem', marginBottom: '8px', color: '#3b82f6' }}>Card Values</h3>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
              <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '6px 10px', borderRadius: '4px', flex: '1 0 calc(33% - 10px)' }}>
                <strong>2-10:</strong> Face value
              </div>
              <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '6px 10px', borderRadius: '4px', flex: '1 0 calc(33% - 10px)' }}>
                <strong>J, Q, K:</strong> 10 points
              </div>
              <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '6px 10px', borderRadius: '4px', flex: '1 0 calc(33% - 10px)' }}>
                <strong>Ace:</strong> 1 or 11
              </div>
            </div>
            
            <h3 style={{ fontSize: '1rem', marginBottom: '8px', color: '#3b82f6' }}>Gameplay</h3>
            <ol style={{ paddingLeft: '16px', marginBottom: '0' }}>
              <li>Both players receive two cards to start</li>
              <li>On your turn, choose to "Hit" (draw another card) or "Stand" (end your turn)</li>
              <li>Your opponent will then take their turn</li>
              <li>The player closest to 21 without busting wins</li>
              <li>Equal scores result in a tie</li>
            </ol>
          </div>
        );
    }
  };
  
  // Mock function to simulate card dealing and gameplay
  const startGame = () => {
    if (!connected) {
      alert('Please connect your wallet first.');
      return;
    }
    
    // Reset game state
    setPlayerHand([]);
    setOpponentHand([]);
    setPlayerScore(0);
    setOpponentScore(0);
    setResult(GameResult.NOT_DETERMINED);
    
    // Initialize game
    const deck = generateDeck();
    const playerInitialHand = [drawCard(deck), drawCard(deck)];
    const opponentInitialHand = [drawCard(deck), drawCard(deck)];
    
    setPlayerHand(playerInitialHand);
    setOpponentHand(opponentInitialHand);
    setPlayerScore(calculateHandValue(playerInitialHand));
    setOpponentScore(calculateHandValue(opponentInitialHand));
    setGameState(GameState.PLAYING);
    setCurrentTurn(PlayerTurn.PLAYER);
  };
  
  // Add the handleFindOpponent function
  const handleFindOpponent = () => {
    if (!connected) {
      alert('Please connect your wallet first.');
      openWalletModal();
      return;
    }
    
    // In a real implementation, this would connect to a matchmaking service
    // For now, we'll just simulate finding an opponent after a delay
    setConnectionState(ConnectionState.CONNECTING);
    
    setTimeout(() => {
      setConnectionState(ConnectionState.OPPONENT_CONNECTED);
      startGame();
    }, 2000);
  };
  
  // Function to copy game link to clipboard
  const copyGameLink = () => {
    navigator.clipboard.writeText(gameLink);
    alert('Game link copied to clipboard!');
  };
  
  return (
    <>
      <Head>
        <title>Blackjack 1v1 - Rock Paper Solana</title>
        <meta name="description" content="Play Blackjack 1v1 against other players and win SOL." />
      </Head>
      
      <PageContainer>
        <AppSidebar 
          collapsed={sidebarCollapsed}
          currentPage="blackjack"
          toggleSidebar={toggleSidebar}
        />
        
        <MainContent collapsed={sidebarCollapsed}>
          <GameWrapper>
            <GameContainer>
              <LeftPanel>
                {renderLeftPanelContent()}
              </LeftPanel>
              
              <GameArea>
                <GameTitle>Blackjack 1v1</GameTitle>
                
                {gameState === GameState.IDLE && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', flexDirection: 'column' }}>
                    <p style={{ color: 'rgba(255, 255, 255, 0.6)', marginBottom: '20px', textAlign: 'center' }}>
                      Create a game or find an opponent to start playing
                    </p>
                  </div>
                )}
                
                {gameState === GameState.WAITING && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', flexDirection: 'column' }}>
                    <StatusIndicator status="waiting">Waiting for Opponent</StatusIndicator>
                    <p style={{ color: 'rgba(255, 255, 255, 0.6)', margin: '20px 0', textAlign: 'center' }}>
                      Share your invite code: <strong>{inviteCode}</strong>
                    </p>
                  </div>
                )}
                
                {(gameState === GameState.PLAYING || gameState === GameState.RESULT) && (
                  <>
                    <OpponentArea>
                      <AreaTitle>Opponent: {opponentScore}</AreaTitle>
                      <CardsContainer>
                        {opponentHand.map((card, index) => (
                          <Card 
                            suit={getSuitSymbol(card.suit)} 
                            face={card.face} 
                            key={`opponent-${card.suit}-${card.value}-${index}`} 
                            hidden={gameState === GameState.PLAYING && currentTurn === PlayerTurn.PLAYER && index === opponentHand.length - 1}
                          />
                        ))}
                      </CardsContainer>
                    </OpponentArea>
                    
                    <VSContainer>VS</VSContainer>
                    
                    <PlayerArea>
                      <AreaTitle>You: {playerScore}</AreaTitle>
                      <CardsContainer>
                        {playerHand.map((card, index) => (
                          <Card 
                            suit={getSuitSymbol(card.suit)} 
                            face={card.face} 
                            key={`player-${card.suit}-${card.value}-${index}`} 
                          />
                        ))}
                      </CardsContainer>
                    </PlayerArea>
                    
                    {result !== GameResult.NOT_DETERMINED && gameState === GameState.RESULT && (
                      <ResultBanner result={result}>
                        <h3>
                          {result === GameResult.WIN && 'You Won!'}
                          {result === GameResult.LOSE && 'You Lost!'}
                          {result === GameResult.DRAW && "It's a Tie!"}
                        </h3>
                        <p>
                          {result === GameResult.WIN && `You've won ${(betAmount * 2).toFixed(2)} SOL`}
                          {result === GameResult.LOSE && 'Better luck next time!'}
                          {result === GameResult.DRAW && 'Your bet has been returned.'}
                        </p>
                      </ResultBanner>
                    )}
                  </>
                )}
              </GameArea>
            </GameContainer>
            
            <BottomSection>
              <TabsContainer>
                <Tab 
                  active={activeTab === 'rules'} 
                  onClick={() => setActiveTab('rules')}
                >
                  Rules
                </Tab>
                <Tab 
                  active={activeTab === 'history'} 
                  onClick={() => setActiveTab('history')}
                >
                  Game History
                </Tab>
                <Tab 
                  active={activeTab === 'stats'} 
                  onClick={() => setActiveTab('stats')}
                >
                  Statistics
                </Tab>
              </TabsContainer>
              
              <TabContent>
                {renderActiveTabContent()}
              </TabContent>
            </BottomSection>
          </GameWrapper>
        </MainContent>
      </PageContainer>
    </>
  );
};

export default BlackjackGame; 