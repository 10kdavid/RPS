import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, off, get } from 'firebase/database';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA83tD8WrNWJYdQUycrmKXOG5HxhBl-VZA",
  authDomain: "rock-paper-solana.firebaseapp.com",
  databaseURL: "https://rock-paper-solana-default-rtdb.firebaseio.com",
  projectId: "rock-paper-solana",
  storageBucket: "rock-paper-solana.appspot.com",
  messagingSenderId: "532741709354",
  appId: "1:532741709354:web:07db0bf60e6f7c77bcf78e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Game multiplayer functions
export interface GameState {
  id: string;
  creator: string;
  opponent?: string;
  status: 'waiting' | 'playing' | 'completed';
  currentTurn?: string;
  gameData?: any;
  lastUpdated: number;
}

// Create a new game session
export const createGameSession = async (gameType: string, creatorId: string): Promise<string> => {
  // Generate a unique game ID
  const gameId = Math.random().toString(36).substring(2, 10).toUpperCase();
  
  // Create game state in Firebase
  const gameRef = ref(database, `games/${gameType}/${gameId}`);
  await set(gameRef, {
    id: gameId,
    creator: creatorId,
    status: 'waiting',
    lastUpdated: Date.now()
  });
  
  return gameId;
};

// Join a game session
export const joinGameSession = async (gameType: string, gameId: string, playerId: string): Promise<boolean> => {
  try {
    // Check if game exists
    const gameRef = ref(database, `games/${gameType}/${gameId}`);
    const snapshot = await get(gameRef);
    
    if (!snapshot.exists()) {
      throw new Error('Game not found');
    }
    
    const gameData = snapshot.val();
    
    // Check if game is waiting and not already joined
    if (gameData.status !== 'waiting' || gameData.opponent) {
      throw new Error('Game already full or not in waiting state');
    }
    
    // Join the game
    await set(gameRef, {
      ...gameData,
      opponent: playerId,
      status: 'playing',
      currentTurn: gameData.creator, // Creator goes first
      lastUpdated: Date.now()
    });
    
    return true;
  } catch (error) {
    console.error('Error joining game:', error);
    return false;
  }
};

// Listen for game updates
export const listenToGameUpdates = (gameType: string, gameId: string, callback: (data: GameState) => void) => {
  const gameRef = ref(database, `games/${gameType}/${gameId}`);
  onValue(gameRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    }
  });
  
  // Return a function to unsubscribe
  return () => off(gameRef);
};

// Update game state
export const updateGameState = async (gameType: string, gameId: string, updates: Partial<GameState>) => {
  try {
    const gameRef = ref(database, `games/${gameType}/${gameId}`);
    const snapshot = await get(gameRef);
    
    if (!snapshot.exists()) {
      throw new Error('Game not found');
    }
    
    const currentState = snapshot.val();
    
    // Update the game state
    await set(gameRef, {
      ...currentState,
      ...updates,
      lastUpdated: Date.now()
    });
    
    return true;
  } catch (error) {
    console.error('Error updating game state:', error);
    return false;
  }
};

export default {
  createGameSession,
  joinGameSession,
  listenToGameUpdates,
  updateGameState
}; 