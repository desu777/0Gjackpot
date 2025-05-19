require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const privateKey = process.env.private_key || "";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    galileo: {
      url: process.env.rpc || "https://evmrpc-testnet.0g.ai",
      accounts: privateKey ? [privateKey] : [],
      chainId: parseInt(process.env.chain_id || "16601"),
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
}; 