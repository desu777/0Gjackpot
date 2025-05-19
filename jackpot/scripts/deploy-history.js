// Script to deploy the GalileoJackpotHistory contract
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying GalileoJackpotHistory contract...");

  // Get the contract factory
  const GalileoJackpotHistory = await hre.ethers.getContractFactory("GalileoJackpotHistory");
  
  // Deploy the contract
  const history = await GalileoJackpotHistory.deploy();
  
  // Wait for the contract to be deployed
  await history.waitForDeployment();
  
  // Get the contract address
  const historyAddress = await history.getAddress();
  
  console.log(`GalileoJackpotHistory deployed to: ${historyAddress}`);
  
  // Save the contract address to a file for later use
  const deploymentsDir = path.join(__dirname, '../deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }
  
  fs.writeFileSync(
    path.join(deploymentsDir, 'history.json'),
    JSON.stringify({ address: historyAddress }, null, 2)
  );
  
  console.log("Deployment information saved to deployments/history.json");
  
  // Verify the contract on the block explorer if not on a local network
  if (hre.network.name !== "localhost" && hre.network.name !== "hardhat") {
    console.log("Waiting for block confirmations...");
    
    // Wait for 5 block confirmations
    await history.deploymentTransaction().wait(5);
    
    console.log("Verifying contract on block explorer...");
    
    try {
      await hre.run("verify:verify", {
        address: historyAddress,
        constructorArguments: [],
      });
      console.log("Contract verified successfully");
    } catch (error) {
      console.error("Error verifying contract:", error);
    }
  }
  
  return historyAddress;
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