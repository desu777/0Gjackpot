// Script to deploy the GalileoJackpot contract
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying GalileoJackpot contract...");

  // Get the contract factory
  const GalileoJackpot = await hre.ethers.getContractFactory("GalileoJackpot");
  
  // Deploy the contract
  const jackpot = await GalileoJackpot.deploy();
  
  // Wait for the contract to be deployed
  await jackpot.waitForDeployment();
  
  // Get the contract address
  const jackpotAddress = await jackpot.getAddress();
  
  console.log(`GalileoJackpot deployed to: ${jackpotAddress}`);
  
  // Save the contract address to a file for later use
  const deploymentsDir = path.join(__dirname, '../deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }
  
  fs.writeFileSync(
    path.join(deploymentsDir, 'jackpot.json'),
    JSON.stringify({ address: jackpotAddress }, null, 2)
  );
  
  console.log("Deployment information saved to deployments/jackpot.json");
  
  // Verify the contract on the block explorer if not on a local network
  if (hre.network.name !== "localhost" && hre.network.name !== "hardhat") {
    console.log("Waiting for block confirmations...");
    
    // Wait for 5 block confirmations
    await jackpot.deploymentTransaction().wait(5);
    
    console.log("Verifying contract on block explorer...");
    
    try {
      await hre.run("verify:verify", {
        address: jackpotAddress,
        constructorArguments: [],
      });
      console.log("Contract verified successfully");
    } catch (error) {
      console.error("Error verifying contract:", error);
    }
  }
  
  return jackpotAddress;
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