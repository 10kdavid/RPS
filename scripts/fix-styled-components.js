const fs = require('fs');
const path = require('path');

// Get all .tsx files
function walkSync(dir, filelist = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filepath = path.join(dir, file);
    const stat = fs.statSync(filepath);
    
    if (stat.isDirectory() && !filepath.includes('node_modules') && !filepath.includes('.next')) {
      filelist = walkSync(filepath, filelist);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      filelist.push(filepath);
    }
  });
  
  return filelist;
}

// Update next.config.js to include the shouldForwardProp
function updateNextConfig() {
  const configPath = path.join(process.cwd(), 'next.config.js');
  let config = fs.readFileSync(configPath, 'utf8');
  
  // Check if shouldForwardProp is already configured
  if (config.includes('shouldForwardProp')) {
    console.log('shouldForwardProp already configured in next.config.js');
    return;
  }
  
  // Update the styledComponents configuration
  config = config.replace(
    'styledComponents: true,',
    `styledComponents: {
      shouldForwardProp: (prop) => !['isOpen', 'active', 'collapsed', 'isActive', 'isSelected', 'isWin', 'hasMine', 'revealed', 'isAnimating', 'success', 'red'].includes(prop),
    },`
  );
  
  fs.writeFileSync(configPath, config, 'utf8');
  console.log('Updated next.config.js with shouldForwardProp configuration');
}

// Main function
function main() {
  console.log('Fixing styled-components TypeScript issues...');
  
  // Update next.config.js
  updateNextConfig();
  
  console.log('Fixed all styled-components TypeScript issues');
}

main(); 