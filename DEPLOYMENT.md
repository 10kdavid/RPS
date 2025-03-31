# Deploying Rock Paper Solana to Vercel

This guide will help you deploy the Rock Paper Solana app to Vercel, ensuring the Minesweeper game works correctly with multiplayer and Solana escrow integration.

## Prerequisites

1. A [Vercel account](https://vercel.com/signup)
2. A [Firebase project](https://console.firebase.google.com/) for multiplayer functionality
3. Solana devnet SOL for testing (get from [Solana Faucet](https://faucet.solana.com/))

## Step 1: Prepare Your Environment Variables

1. Create a `.env` file based on the `.env.example` template
2. Fill in your Firebase project details:
   - Get these from your Firebase console under Project Settings
   - Make sure Realtime Database is set up for multiplayer
3. Use the Solana escrow program ID: `cPmtN4KbNDNaVEuWWKczs7Va12KyDgJnYEhU8r2jfeG`

## Step 2: Deploy to Vercel

1. Push your project to GitHub
2. Log in to Vercel and import your repository
3. During setup, add these Environment Variables:

```
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_ESCROW_PROGRAM_ID=cPmtN4KbNDNaVEuWWKczs7Va12KyDgJnYEhU8r2jfeG
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com
```

4. Deploy your project
5. Note your Vercel URL (e.g., `your-project.vercel.app`)

## Step 3: Test Game Sharing

1. Connect your Phantom wallet to Solana devnet
2. Create a game in the Minesweeper section
3. Note the generated game link
4. Share this link with a friend
5. Your friend should be able to join your game

## Step 4: Test Escrow Functionality

1. Ensure you have Solana devnet SOL in your wallet
2. Create a game with a bet amount
3. Fund the escrow when prompted
4. When your friend joins, they should see an option to fund their side
5. Play the game and verify the winner can claim rewards

## Troubleshooting

If you encounter issues:

1. **Friend can't join game**: Check Firebase rules to make sure read/write is allowed
2. **Solana transactions failing**: Make sure you have devnet SOL and check browser console
3. **Environment variables not working**: Check for typos and redeploy

## Firebase Security Rules

Make sure your Firebase Realtime Database has these rules:

```json
{
  "rules": {
    "games": {
      ".read": true,
      ".write": true
    }
  }
}
```

## Note on Solana Escrow Contract

The escrow contract is already deployed at address: `cPmtN4KbNDNaVEuWWKczs7Va12KyDgJnYEhU8r2jfeG`

You don't need to deploy it again, just use this address in your environment variables. 