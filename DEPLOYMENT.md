# Deploying to Vercel

This guide will help you deploy your Rock Paper Solana application to Vercel using the GitHub integration method.

## Prerequisites

1. A GitHub account
2. A Vercel account (you can sign up at [vercel.com](https://vercel.com) using your GitHub account)
3. Your Rock Paper Solana code pushed to a GitHub repository

## Step 1: Push Your Code to GitHub

If you haven't already, create a repository on GitHub and push your code:

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit your changes
git commit -m "Ready for deployment"

# Link to your GitHub repository
git remote add origin https://github.com/yourusername/rock-paper-solana.git

# Push to GitHub
git push -u origin main
```

## Step 2: Connect to Vercel

1. Log in to [Vercel](https://vercel.com)
2. Click on the "Add New..." button and select "Project"
3. Connect your GitHub account if you haven't already
4. Select your Rock Paper Solana repository from the list

## Step 3: Configure Deployment Settings

On the configuration page:

1. **Framework Preset**: Select "Next.js"
2. **Root Directory**: Leave as default (should be `/`)
3. **Build Command**: Leave as default (should be `next build`)
4. **Output Directory**: Leave as default (should be `.next`)
5. **Environment Variables**: Add any environment variables your application needs

## Step 4: Deploy

1. Click "Deploy"
2. Wait for the build and deployment to complete
3. Vercel will show you the deployment URL when it's ready

## Step 5: Set Up a Custom Domain (Optional)

1. After deployment, go to the "Domains" section of your project settings
2. Add your custom domain
3. Follow Vercel's instructions to configure your DNS settings

## Troubleshooting

If you encounter build errors:

1. **Styled Components Issues**:
   - Ensure your `next.config.js` has the proper `shouldForwardProp` configuration
   - Check that all components with custom props use `withConfig`

2. **Missing Page Errors**:
   - Make sure all files referenced in your routes exist
   - Check for case sensitivity issues in imports

3. **File Locking Issues**:
   - If you're developing on Windows, ensure all Next.js processes are closed before building
   - Use the Vercel GitHub integration which builds in a clean environment

## Automatic Deployments

Once set up, Vercel will automatically deploy whenever you push changes to your GitHub repository. This means you can focus on development and let Vercel handle the deployment process.

## Using the Deployed Application

After deployment, you can share the Vercel URL with your friends to play together. All the multiplayer functionality will work as long as both players have access to the internet and can connect to the deployed application. 