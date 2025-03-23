# Rock Paper Solana - Multiplayer Guide

We've completely fixed the multiplayer functionality and game links in the Rock Paper Solana app! This guide explains how to use these features.

## How Multiplayer Works

Our multiplayer system uses Firebase Realtime Database to enable:
- Real-time game state synchronization
- Game creation with shareable links
- Player turn management
- Game completion and payouts

## Playing Multiplayer Games

### 1. Creating a Game

To create a new multiplayer game:

1. Connect your wallet by clicking "Connect Wallet" in the header
2. Navigate to the game you want to play (Blackjack or Minesweeper)
3. Click "Create Game" in the sidebar
4. A unique game link will be generated - copy this link to share with your friend
5. Wait for your opponent to join (you'll see "Waiting for opponent...")

### 2. Joining a Game

To join a game someone has shared with you:

1. Click the game link you received (it will open the game page with the game ID in the URL)
2. Connect your wallet when prompted
3. You'll automatically join the game
4. The game will start once both players are connected

### 3. Taking Turns

- In multiplayer games, players take turns making moves
- The active player will see a message indicating it's their turn
- After making a move, the turn switches to the other player
- The game state is synchronized in real-time between both players

### 4. Game Completion

- When the game ends, both players will see the result
- If wagers were placed, payouts are handled automatically
- You can start a new game by clicking "New Game"

## Multiplayer Game Links

### How Game Links Work

- Each game has a unique ID that's generated when the game is created
- The game link includes this ID in the URL (e.g., `/game/blackjack?invite=ABC123`)
- When someone opens the link, the app reads the ID from the URL and connects to the same game session

### Troubleshooting Game Links

If a game link isn't working:

1. Make sure both players have wallets connected
2. Ensure the creator's game is still active (they haven't navigated away)
3. Try copying and pasting the link again
4. If all else fails, create a new game

## Technical Implementation

For developers interested in the underlying technology:

- We use Firebase Realtime Database for game state synchronization
- Game state updates are pushed in real-time to all connected players
- Each game has a unique ID that serves as its database reference
- Game state includes:
  - Current turn
  - Game board/cards state
  - Player information
  - Game result

## Deployment

This multiplayer functionality works when deployed on Vercel. The Firebase configuration is included in the codebase, so no additional setup is required for basic deployment.

To deploy your own version with custom Firebase:

1. Create a Firebase project at [firebase.google.com](https://firebase.google.com)
2. Enable the Realtime Database feature
3. Update the Firebase configuration in `src/utils/firebase.ts`
4. Deploy to Vercel following the instructions in `DEPLOY_NOW.md`

## Limitations

- The current implementation doesn't include advanced features like matchmaking or player profiles
- For simplicity, we don't verify wallet signatures for game moves (this would be needed for a production app)
- The demo uses a shared Firebase project - for production use, you'd want to create your own

## Future Improvements

Potential enhancements for the future:
- User accounts and persistent game history
- Matchmaking with random opponents
- Advanced game statistics
- In-game chat with the opponent

Enjoy playing multiplayer games on Rock Paper Solana! 