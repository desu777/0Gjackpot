// Script to link jackpot and history contracts together
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");
const deployJackpot = require("./deploy-jackpot");
const deployHistory = require("./deploy-history");
const updateFrontendEnv = require("./update-frontend-env");

async function main() {
  console.log("Starting contract deployment and linking process...");
  
  let jackpotAddress, historyAddress;
  
  // Check if contracts are already deployed
  const deploymentsDir = path.join(__dirname, '../deployments');
  const jackpotPath = path.join(deploymentsDir, 'jackpot.json');
  const historyPath = path.join(deploymentsDir, 'history.json');
  
  // If deployments directory doesn't exist, create it
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }
  
  // Deploy history contract if not already deployed
  if (fs.existsSync(historyPath)) {
    console.log("History contract already deployed, loading address...");
    const historyData = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
    historyAddress = historyData.address;
  } else {
    console.log("Deploying history contract...");
    historyAddress = await deployHistory();
  }
  
  // Deploy jackpot contract if not already deployed
  if (fs.existsSync(jackpotPath)) {
    console.log("Jackpot contract already deployed, loading address...");
    const jackpotData = JSON.parse(fs.readFileSync(jackpotPath, 'utf8'));
    jackpotAddress = jackpotData.address;
  } else {
    console.log("Deploying jackpot contract...");
    jackpotAddress = await deployJackpot();
  }
  
  console.log(`Jackpot Contract: ${jackpotAddress}`);
  console.log(`History Contract: ${historyAddress}`);
  
  // Get contract instances
  const GalileoJackpot = await hre.ethers.getContractFactory("GalileoJackpot");
  const GalileoJackpotHistory = await hre.ethers.getContractFactory("GalileoJackpotHistory");
  
  const jackpot = GalileoJackpot.attach(jackpotAddress);
  const history = GalileoJackpotHistory.attach(historyAddress);
  
  // Link contracts
  console.log("Linking contracts...");
  
  // Set history contract in jackpot
  console.log("Setting history contract in jackpot...");
  const setHistoryTx = await jackpot.setHistoryContract(historyAddress);
  await setHistoryTx.wait();
  console.log("History contract set in jackpot");
  
  // Set jackpot contract in history
  console.log("Setting jackpot contract in history...");
  const setJackpotTx = await history.setJackpotContract(jackpotAddress);
  await setJackpotTx.wait();
  console.log("Jackpot contract set in history");
  
  console.log("Contracts successfully linked!");
  
  // Create a combined deployment file with both addresses
  fs.writeFileSync(
    path.join(deploymentsDir, 'deployment.json'),
    JSON.stringify({
      jackpot: jackpotAddress,
      history: historyAddress,
      network: hre.network.name,
      chainId: hre.network.config.chainId,
      timestamp: new Date().toISOString()
    }, null, 2)
  );
  
  console.log("Deployment information saved to deployments/deployment.json");
  
  // Update frontend .env file with contract addresses
  console.log("Updating frontend environment configuration...");
  try {
    await updateFrontendEnv();
    console.log("Frontend environment updated successfully!");
  } catch (error) {
    console.error("Error updating frontend environment:", error.message);
  }
  
  return {
    jackpot: jackpotAddress,
    history: historyAddress
  };
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

module.exports = main; 