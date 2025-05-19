# Galileo Jackpot Contracts

This project contains the smart contracts for the Galileo Jackpot lottery system running on the Galileo Testnet.

## Project Structure

- `contracts/`: Smart contract source files
  - `GalileoJackpot.sol`: Main jackpot contract
  - `GalileoJackpotHistory.sol`: History contract for storing winners
- `scripts/`: Deployment scripts
  - `deploy-history.js`: Deploy history contract
  - `deploy-jackpot.js`: Deploy jackpot contract
  - `setup-contracts.js`: Deploy and link both contracts

## Prerequisites

- Node.js (>= 14.x)
- npm or yarn
- A private key with 0G for gas fees on Galileo Testnet

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file from the template:
   ```bash
   cp env.example .env
   ```
4. Add your private key to the `.env` file

## Deployment

### Deploy All Contracts

To deploy both contracts and link them together:

```bash
npm run deploy:all
```

### Deploy Individual Contracts

To deploy only the history contract:

```bash
npm run deploy:history
```

To deploy only the jackpot contract:

```bash
npm run deploy:jackpot
```

## Contract Verification

After deployment, contracts can be verified on the block explorer:

```bash
npx hardhat verify --network galileo <CONTRACT_ADDRESS>
```

## Contract Addresses

After deployment, the contract addresses will be saved in the `deployments/` folder:

- `deployments/history.json`: History contract address
- `deployments/jackpot.json`: Jackpot contract address
- `deployments/deployment.json`: Combined deployment information

## Contract Interaction

The main jackpot contract has the following key functions:

- `buyTickets()`: Buy lottery tickets with native 0G tokens
- `completeRound()`: Complete a round and select a winner
- `getCurrentRoundInfo()`: Get information about the current round

The history contract provides:

- `getWinners(offset, limit)`: Get paginated list of winners
- `isWinner(address)`: Check if an address has won any rounds
- `getWinnerRounds(address)`: Get all rounds won by an address

## License

MIT 