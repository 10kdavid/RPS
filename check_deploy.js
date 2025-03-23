/**
 * Pre-deployment check script for Rock Paper Solana
 * Run with: node check_deploy.js
 */

const fs = require('fs');
const path = require('path');

console.log('\n============================================');
console.log('🚀 Rock Paper Solana Pre-Deployment Check 🚀');
console.log('============================================\n');

// Check if key files exist
const requiredFiles = [
  'src/utils/firebase.ts',
  'next.config.js',
  'src/contexts/WalletContext.tsx',
  'src/pages/game/blackjack.tsx',
  'src/pages/game/minesweeper.tsx'
];

let allFilesExist = true;
console.log('Checking required files...');

for (const file of requiredFiles) {
  const exists = fs.existsSync(path.join(process.cwd(), file));
  console.log(`${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allFilesExist = false;
}

// Check for Firebase config
let firebaseConfigOk = false;
try {
  const firebaseContent = fs.readFileSync(path.join(process.cwd(), 'src/utils/firebase.ts'), 'utf8');
  firebaseConfigOk = firebaseContent.includes('apiKey') && firebaseContent.includes('databaseURL');
  console.log(`\n${firebaseConfigOk ? '✅' : '❌'} Firebase configuration`);
} catch (error) {
  console.log('\n❌ Could not read Firebase configuration');
}

// Check for Content Security Policy in next.config.js
let cspOk = false;
try {
  const nextConfigContent = fs.readFileSync(path.join(process.cwd(), 'next.config.js'), 'utf8');
  cspOk = nextConfigContent.includes('Content-Security-Policy') && nextConfigContent.includes('firebaseio.com');
  console.log(`${cspOk ? '✅' : '❌'} Content Security Policy for Firebase`);
} catch (error) {
  console.log('❌ Could not read Next.js configuration');
}

// Overall status
console.log('\n============================================');
if (allFilesExist && firebaseConfigOk && cspOk) {
  console.log('✅ All checks passed! Your project is ready for deployment.');
  console.log('   To deploy, run: npm run deploy-full');
} else {
  console.log('❌ Some checks failed. Please fix the issues before deploying.');
}
console.log('============================================\n');

// Add deployment instructions
console.log('Deployment steps:');
console.log('1. Push all changes to GitHub:');
console.log('   git add .');
console.log('   git commit -m "Ready for deployment"');
console.log('   git push');
console.log('');
console.log('2. Deploy to Vercel:');
console.log('   npm run deploy-full');
console.log('   or follow the instructions in DEPLOY_NOW.md\n'); 