// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, onValue, update } from "firebase/database";

// Your web app's Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase - with fallback for testing
let app;
let database;

try {
  app = initializeApp(firebaseConfig);
  database = getDatabase(app);
  console.log("Firebase initialized successfully");
} catch (error) {
  console.error("Error initializing Firebase:", error);
}

// Game session functions
export const createGameSession = async (gameType, creatorId) => {
  try {
    // Generate a random 6-character game ID
    const gameId = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Create the game session in Firebase
    const gameRef = ref(database, `games/${gameType}/${gameId}`);
    const timestamp = Date.now();
    
    await set(gameRef, {
      creator: creatorId,
      created: timestamp,
      lastUpdated: timestamp,
      status: 'waiting'
    });
    
    console.log(`Created ${gameType} game with ID: ${gameId}`);
    return gameId;
  } catch (error) {
    console.error("Error creating game session:", error);
    throw error;
  }
};

export const checkGameExists = async (gameType, gameId) => {
  try {
    const gameRef = ref(database, `games/${gameType}/${gameId}`);
    const snapshot = await get(gameRef);
    return snapshot.exists();
  } catch (error) {
    console.error("Error checking game existence:", error);
    return false;
  }
};

export const joinGameSession = async (gameType, gameId, playerId) => {
  try {
    const gameRef = ref(database, `games/${gameType}/${gameId}`);
    
    // Check if game exists
    const snapshot = await get(gameRef);
    if (!snapshot.exists()) {
      throw new Error("Game not found");
    }
    
    // Update the game session with the opponent
    await update(gameRef, {
      opponent: playerId,
      lastUpdated: Date.now()
    });
    
    console.log(`Player ${playerId} joined game ${gameId}`);
    return true;
  } catch (error) {
    console.error("Error joining game session:", error);
    throw error;
  }
};

export const updateGameState = async (gameType, gameId, updates) => {
  try {
    const gameRef = ref(database, `games/${gameType}/${gameId}`);
    
    // Add lastUpdated timestamp to the updates
    const updatesWithTimestamp = {
      ...updates,
      lastUpdated: Date.now()
    };
    
    await update(gameRef, updatesWithTimestamp);
    console.log(`Updated game state for ${gameId}:`, updates);
    return true;
  } catch (error) {
    console.error("Error updating game state:", error);
    throw error;
  }
};

export const listenToGameUpdates = (gameType, gameId, callback) => {
  try {
    const gameRef = ref(database, `games/${gameType}/${gameId}`);
    
    const unsubscribe = onValue(gameRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        callback(data);
      }
    });
    
    // Return the unsubscribe function
    return unsubscribe;
  } catch (error) {
    console.error("Error setting up game updates listener:", error);
    return () => {}; // Return a no-op function in case of error
  }
};

export default { createGameSession, checkGameExists, joinGameSession, updateGameState, listenToGameUpdates }; 