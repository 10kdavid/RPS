# Rock Paper Solana Deployment Guide

This guide covers the steps to successfully deploy the Rock Paper Solana game on Vercel.

## Pre-Deployment Checklist

1. **Environment Variables**: Make sure all required environment variables are set in Vercel:

   ```
   NEXT_IGNORE_TYPE_CHECK=true
   NODE_ENV=production
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCb0BrVOWh5hV7NJ0dTwijFvNsCCBhYCyk
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=rock-paper-solana.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://rock-paper-solana-default-rtdb.firebaseio.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=rock-paper-solana
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=rock-paper-solana.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1003950152721
   NEXT_PUBLIC_FIREBASE_APP_ID=1:1003950152721:web:a44ac548ab1b662b0be5b0
   NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
   NEXT_PUBLIC_ESCROW_PROGRAM_ID=cPmtN4KbNDNaVEuWWKczs7Va12KyDgJnYEhU8r2jfeG
   ```

2. **Build Configuration**: The `vercel.json` file should specify the correct build command:

   ```json
   {
     "version": 2,
     "buildCommand": "npm run vercel-build",
     // other settings...
   }
   ```

3. **Content Security Policy**: Make sure the CSP headers in `vercel.json` include all required domains:
   - Firebase domains (firebaseio.com, firebase.googleapis.com)
   - Solana domains (solana.com, api.devnet.solana.com)

## Troubleshooting Common Issues

### Wallet Balance Not Displaying

If the wallet balance is not showing:

1. Check the browser console for connection errors with Solana RPC.
2. Verify that `WalletContextProvider` is properly initialized in `_app.tsx`.
3. Make sure you don't have conflicting wallet providers in the component tree.

### Create Game Button Not Working

If clicking "Create Game" doesn't create a new game:

1. Verify Firebase connection in the browser console.
2. Make sure your wallet is connected (the button should be disabled if not connected).
3. Check for any errors in the Escrow service if using bets.

### Firebase Connection Issues

1. Make sure environment variables are properly set in Vercel dashboard.
2. The Firebase project must be initialized with proper database rules.
3. Realtime Database must be enabled in your Firebase project.

## Testing Multiplayer Functionality

To test multiplayer features:

1. **Create a game**:
   - Connect your wallet
   - Click "Create Game" 
   - A game ID/link should appear

2. **Join from another browser**:
   - Open the game link in another browser/incognito window
   - Connect a different wallet
   - You should be able to join and play

## Vercel Analytics Integration

Consider adding Vercel Analytics to track usage:

1. Install the package:
   ```
   npm install @vercel/analytics
   ```

2. Import and add the component in `_app.tsx`:
   ```jsx
   import { Analytics } from '@vercel/analytics/react';

   // Inside your app JSX
   <>
     {/* Your app components */}
     <Analytics />
   </>
   ```

## Final Deployment

Run the following command to deploy to Vercel:

```
npm run deploy-to-vercel
```

Or push to GitHub and let Vercel auto-deploy if you have CI/CD set up. 