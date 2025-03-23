import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, off, get, connectDatabaseEmulator } from 'firebase/database';

console.log("Initializing Firebase...");

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

let app;
let database;

try {
  // Initialize Firebase
  app = initializeApp(firebaseConfig);
  database = getDatabase(app);
  console.log("Firebase initialized successfully");
} catch (error) {
  console.error("Error initializing Firebase:", error);
}

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
  try {
    // Generate a unique game ID
    const gameId = Math.random().toString(36).substring(2, 10).toUpperCase();
    console.log(`Creating game session ${gameId} of type ${gameType} for creator ${creatorId}`);
    
    // Create game state in Firebase
    const gameRef = ref(database, `games/${gameType}/${gameId}`);
    await set(gameRef, {
      id: gameId,
      creator: creatorId,
      status: 'waiting',
      lastUpdated: Date.now()
    });
    
    console.log(`Game session ${gameId} created successfully`);
    return gameId;
  } catch (error) {
    console.error("Error creating game session:", error);
    throw error;
  }
};

// Join a game session
export const joinGameSession = async (gameType: string, gameId: string, playerId: string): Promise<boolean> => {
  try {
    console.log(`Joining game session ${gameId} of type ${gameType} for player ${playerId}`);
    
    // Check if game exists
    const gameRef = ref(database, `games/${gameType}/${gameId}`);
    const snapshot = await get(gameRef);
    
    if (!snapshot.exists()) {
      console.error(`Game not found: ${gameType}/${gameId}`);
      throw new Error('Game not found');
    }
    
    const gameData = snapshot.val();
    console.log("Game data found:", gameData);
    
    // Check if game is waiting and not already joined
    if (gameData.status !== 'waiting' || gameData.opponent) {
      console.error(`Game already full or not in waiting state: ${gameType}/${gameId}`);
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
    
    console.log(`Successfully joined game ${gameId}`);
    return true;
  } catch (error) {
    console.error("Error joining game session:", error);
    throw error;
  }
};

// Listen for game updates
export const listenToGameUpdates = (gameType: string, gameId: string, callback: (data: GameState) => void) => {
  try {
    console.log(`Setting up listener for game ${gameId} of type ${gameType}`);
    const gameRef = ref(database, `games/${gameType}/${gameId}`);
    
    onValue(gameRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        console.log(`Received game update for ${gameId}:`, data);
        callback(data);
      } else {
        console.warn(`No data found for game ${gameId}`);
      }
    }, (error) => {
      console.error(`Error in Firebase listener for game ${gameId}:`, error);
    });
    
    // Return a function to unsubscribe
    return () => {
      console.log(`Removing listener for game ${gameId}`);
      off(gameRef);
    };
  } catch (error) {
    console.error(`Error setting up listener for game ${gameId}:`, error);
    // Return a dummy function to prevent errors
    return () => {};
  }
};

// Update game state
export const updateGameState = async (gameType: string, gameId: string, updates: Partial<GameState>) => {
  try {
    console.log(`Updating game state for ${gameId} of type ${gameType}:`, updates);
    
    const gameRef = ref(database, `games/${gameType}/${gameId}`);
    const snapshot = await get(gameRef);
    
    if (!snapshot.exists()) {
      console.error(`Game not found for update: ${gameType}/${gameId}`);
      throw new Error('Game not found');
    }
    
    const currentState = snapshot.val();
    
    // Update the game state
    await set(gameRef, {
      ...currentState,
      ...updates,
      lastUpdated: Date.now()
    });
    
    console.log(`Game state updated successfully for ${gameId}`);
    return true;
  } catch (error) {
    console.error(`Error updating game state for ${gameId}:`, error);
    throw error;
  }
};

// Check if a game exists
export const checkGameExists = async (gameType: string, gameId: string): Promise<boolean> => {
  try {
    console.log(`Checking if game exists: ${gameType}/${gameId}`);
    const gameRef = ref(database, `games/${gameType}/${gameId}`);
    const snapshot = await get(gameRef);
    
    const exists = snapshot.exists();
    console.log(`Game ${gameId} exists: ${exists}`);
    return exists;
  } catch (error) {
    console.error(`Error checking if game exists: ${gameType}/${gameId}`, error);
    return false;
  }
};

export default {
  createGameSession,
  joinGameSession,
  listenToGameUpdates,
  updateGameState,
  checkGameExists
}; 