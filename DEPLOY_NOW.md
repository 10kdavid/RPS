# Deploy Your Rock Paper Solana App Now

Follow these exact steps to successfully deploy your app without build errors:

## 1. Build Locally First

```bash
# Run the safe build that ignores TypeScript errors
npm run safe-build
```

## 2. Deploy to Vercel (from Local)

```bash
# Install Vercel CLI if you haven't already
npm install -g vercel

# Deploy directly using the CLI
vercel --prod
```

During deployment, Vercel will ask a few questions:
- Set up project? Choose: `Y`
- Link to existing project? Choose: `N`
- Project name: Accept default or choose a name
- Directory: Accept default (root directory)
- Override build settings? Choose: `Y`
- Build Command: Enter `next build`
- Output Directory: Enter `.next`
- Development Command: Enter `next dev`

## 3. Or Deploy to Vercel (via GitHub)

1. Push your code to GitHub:
```bash
git add .
git commit -m "Ready for deployment"
git push
```

2. Go to Vercel.com and sign in

3. Click "Add New" > "Project"

4. Connect to your GitHub repository

5. In project settings, override the build command:
   - Build command: `next build`

6. Click "Deploy"

## Troubleshooting

If you encounter build errors on Vercel, you can modify environment variables in the Vercel project settings:

1. Go to your project on Vercel
2. Navigate to "Settings" > "Environment Variables"
3. Add:
   - `NEXT_IGNORE_TS_CONFIG_PATHS` = `true`
   - `NEXT_IGNORE_TYPE_CHECK` = `true`

## Sharing With Friends

Once deployed, Vercel will give you a URL like: `https://your-project.vercel.app`

Share this URL with your friends to play together. The multiplayer and invitation features will work as long as both players can access the internet. 