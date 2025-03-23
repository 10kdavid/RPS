# Rock Paper Solana

A Solana-based 1v1 wagering platform where players compete in games that combine both luck and skill elements. The winner claims the wagered funds. The site is styled similar to stake.com.

## Games Available

- **Mines**: Reveal gems and avoid the bomb
- **Rock Paper Scissors**: Classic game of chance and strategy
- **Blackjack**: Card game with decisions that impact your odds

## Features

- Solana wallet integration (Phantom, Solflare, Torus)
- 1v1 multiplayer with game invitations
- Wagering system for Solana tokens
- Real-time game updates
- Modern UI with fluid animations

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

## Deployment Instructions

### Option 1: Deploy to Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy your site:
```bash
npm run deploy
```

4. Or simply push to GitHub and connect your repository to Vercel:
   - Sign up at [Vercel](https://vercel.com)
   - Import your GitHub repository
   - Click "Deploy"

### Option 2: Deploy to Netlify

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Build your project:
```bash
npm run build
```

3. Deploy to Netlify:
```bash
netlify deploy --prod
```

4. Or use the Netlify dashboard:
   - Sign up at [Netlify](https://netlify.com)
   - Import your GitHub repository
   - Set build command to: `npm run build`
   - Set publish directory to: `.next`

### Option 3: Self-host on a VPS

1. Build your project:
```bash
npm run build
```

2. Start the production server:
```bash
npm run start
```

3. Use a process manager like PM2 to keep your app running:
```bash
npm install -g pm2
pm2 start npm --name "rock-paper-solana" -- start
```

4. Set up Nginx as a reverse proxy to forward requests to your Next.js app.

## Adding Real Multiplayer Support

For real-time multiplayer functionality, you'll need:

1. **WebSocket Server**: Implement using Socket.io or similar
2. **Game State Synchronization**: Track and broadcast game state changes
3. **Backend API**: Handle game sessions, matchmaking, and results

## Implementing Blockchain Wagering

For real blockchain wagering:

1. **Smart Contract**: Develop an escrow contract on Solana
2. **Transaction Handling**: Securely send and receive SOL
3. **Verification Logic**: Ensure fair gameplay and payouts

## Obtaining a Domain Name

1. Register a domain through providers like:
   - Namecheap
   - GoDaddy
   - Google Domains

2. Point your domain to your hosting service
3. Configure DNS settings as needed

## License

Private and Confidential 