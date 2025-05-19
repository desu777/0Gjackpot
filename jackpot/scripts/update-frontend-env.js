const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Path to deployment files
const jackpotDeploymentPath = path.join(__dirname, '../deployments/jackpot.json');
const historyDeploymentPath = path.join(__dirname, '../deployments/history.json');

// Path to frontend .env file
const frontendEnvPath = path.join(__dirname, '../../jackpot-app/.env');

// Main function
async function main() {
  console.log('Updating frontend .env with contract addresses...');
  
  // Check if deployment files exist
  if (!fs.existsSync(jackpotDeploymentPath)) {
    console.error('Jackpot deployment file not found. Please deploy the jackpot contract first.');
    return;
  }
  
  if (!fs.existsSync(historyDeploymentPath)) {
    console.error('History deployment file not found. Please deploy the history contract first.');
    return;
  }
  
  // Read deployment files
  const jackpotDeployment = JSON.parse(fs.readFileSync(jackpotDeploymentPath, 'utf8'));
  const historyDeployment = JSON.parse(fs.readFileSync(historyDeploymentPath, 'utf8'));
  
  // Get contract addresses
  const jackpotAddress = jackpotDeployment.address;
  const historyAddress = historyDeployment.address;
  
  if (!jackpotAddress || !historyAddress) {
    console.error('Invalid deployment files. Contract addresses not found.');
    return;
  }
  
  console.log(`Jackpot contract: ${jackpotAddress}`);
  console.log(`History contract: ${historyAddress}`);
  
  // Check if frontend .env exists
  let envContent = '';
  if (fs.existsSync(frontendEnvPath)) {
    // Read existing .env file
    envContent = fs.readFileSync(frontendEnvPath, 'utf8');
    
    // Parse existing env variables
    const envConfig = dotenv.parse(envContent);
    
    // Update contract addresses
    envConfig.REACT_APP_JACKPOT_CONTRACT = jackpotAddress;
    envConfig.REACT_APP_HISTORY_CONTRACT = historyAddress;
    
    // Convert back to .env format
    envContent = Object.entries(envConfig)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
  } else {
    // Create new .env file with network config and contract addresses
    envContent = `# Network configuration
REACT_APP_CHAIN=OG-Galileo-Testnet
REACT_APP_CHAIN_ID=16601
REACT_APP_SYMBOL=OG
REACT_APP_RPC=https://evmrpc-testnet.0g.ai
REACT_APP_EXPLORER=https://chainscan-galileo.0g.ai/

# Contract addresses
REACT_APP_JACKPOT_CONTRACT=${jackpotAddress}
REACT_APP_HISTORY_CONTRACT=${historyAddress}`;
  }
  
  // Write updated .env file
  fs.writeFileSync(frontendEnvPath, envContent);
  
  console.log('Frontend .env file updated successfully!');
}

// Execute the script
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

// Export the function for use in other scripts
module.exports = main; 