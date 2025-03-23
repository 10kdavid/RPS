/**
 * Pre-deployment script for Rock Paper Solana CSS fix
 * Run with: node deploy_with_css.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('\n============================================');
console.log('🚀 Rock Paper Solana CSS Fix Deployment 🚀');
console.log('============================================\n');

// Check for required files
const requiredFiles = [
  'src/pages/_document.tsx',
  'babel.config.js',
  '.babelrc',
  'vercel.json'
];

let allFilesExist = true;
console.log('Checking required files...');
for (const file of requiredFiles) {
  const exists = fs.existsSync(path.join(process.cwd(), file));
  console.log(`${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allFilesExist = false;
}

if (!allFilesExist) {
  console.log('\n❌ Some required files are missing. Please check the output above.');
  process.exit(1);
}

console.log('\n✅ All required files exist!');

// Check if the babel plugin is installed
try {
  require.resolve('babel-plugin-styled-components');
  console.log('✅ babel-plugin-styled-components is installed');
} catch (e) {
  console.log('❌ babel-plugin-styled-components is not installed');
  console.log('Installing babel-plugin-styled-components...');
  execSync('npm install --save-dev babel-plugin-styled-components', { stdio: 'inherit' });
}

// Do a test build
console.log('\nRunning test build with CSS fix settings...');
try {
  execSync('npm run deploy-css-fix', { stdio: 'inherit' });
  console.log('\n✅ Build successful! You should be good to deploy.');
} catch (e) {
  console.log('\n❌ Build failed. Please check the output above for errors.');
  process.exit(1);
}

// Deployment steps
console.log('\n============================================');
console.log('Ready to deploy! Follow these steps:');
console.log('============================================\n');

console.log('1. Commit all changes:');
console.log('   git add .');
console.log('   git commit -m "Fix CSS styling with proper styled-components SSR"');
console.log('   git push\n');

console.log('2. Deploy to Vercel:');
console.log('   - Vercel should automatically deploy the pushed changes');
console.log('   - Or run: npm run deploy-full\n');

console.log('3. After deployment, clear your browser cache:');
console.log('   - Press Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)');
console.log('   - Or open the site in an incognito/private window\n');

console.log('If you continue to see styling issues, check DEPLOY_CSS_FIX.md for troubleshooting steps.\n'); 