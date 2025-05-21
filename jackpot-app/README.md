# 0G Jackpot App

A decentralized lottery application built on the 0G Galileo Testnet. Users can purchase tickets for a chance to win the jackpot. When the countdown timer reaches zero, a random winner is automatically selected.

## Features

- Connect your wallet and purchase tickets
- Real-time updates of the pool size and time remaining
- Automatic drawing when the countdown reaches zero
- Visual wheel animation for the drawing process
- Winner notification with confetti celebration
- History of past winners

## Setup Instructions

### Prerequisites

- Node.js (v14.0.0 or later)
- npm or yarn
- MetaMask or another web3 wallet
- Access to the 0G Galileo Testnet

### Installation

1. Clone the repository
```
git clone <repository-url>
cd jackpot-app
```

2. Install dependencies
```
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
# Chain Configuration
REACT_APP_CHAIN=OG-Galileo-Testnet
REACT_APP_CHAIN_ID=16601
REACT_APP_SYMBOL=OG
REACT_APP_RPC=https://evmrpc-testnet.0g.ai
REACT_APP_EXPLORER=https://chainscan-galileo.0g.ai/

# Contract Addresses
REACT_APP_JACKPOT_CONTRACT=0x...  # Your deployed contract address
REACT_APP_HISTORY_CONTRACT=0x...   # Your deployed history contract address

# Admin Wallet (for automatic round completion)
REACT_APP_ADMIN_PRIVATE_KEY=your_private_key_here
```

> **IMPORTANT**: The admin private key should be from a dedicated wallet used only for this purpose. DO NOT use your personal wallet's private key!

4. Start the development server
```
npm start
```

## Admin Wallet Setup

The application uses an admin wallet to automatically complete rounds when the timer reaches zero. This ensures that the game continues smoothly without requiring user intervention to trigger the drawing.

To set up the admin wallet:

1. Create a new wallet specifically for this purpose (do not use your personal wallet)
2. Fund the wallet with enough 0G tokens to cover gas fees for transactions
3. Add the private key to your `.env` file as `REACT_APP_ADMIN_PRIVATE_KEY`
4. Make sure this wallet has permission to call the `completeRound` function on the contract

## Smart Contract Interaction

The app interacts with two main contracts:

1. **GalileoJackpot**: Handles the core lottery functionality including ticket purchases, round management, and winner selection
2. **GalileoJackpotHistory**: Stores the history of previous winners for display in the UI

## Production Deployment

For production deployment:

1. Build the production version
```
npm run build
```

2. Deploy the contents of the `build` directory to your web server

## Security Considerations

- Always use a dedicated wallet for the admin functionality
- Store the private key securely
- Consider using a key management service for production deployments
- Regularly rotate the admin wallet key

## License

[MIT License](LICENSE) 