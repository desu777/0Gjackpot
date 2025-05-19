import { Address } from 'viem';

// Contract ABIs for interacting with smart contracts
// Contract addresses are loaded from environment variables via envConfig.js

// ABI for the GalileoJackpot contract (essential functions only)
export const JACKPOT_ABI = [
  // Read functions - constants
  {
    "inputs": [],
    "name": "MIN_DEPOSIT",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "ROUND_DURATION",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "OWNER_FEE_PERCENT",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  
  // Read functions - state variables
  {
    "inputs": [],
    "name": "currentRoundId",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "ticketCounter",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "treasury",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "historyContract",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  
  // Read functions - mappings accessor
  {
    "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "name": "rounds",
    "outputs": [
      { "internalType": "uint256", "name": "id", "type": "uint256" },
      { "internalType": "uint256", "name": "startTime", "type": "uint256" },
      { "internalType": "uint256", "name": "endTime", "type": "uint256" },
      { "internalType": "uint256", "name": "totalPool", "type": "uint256" },
      { "internalType": "address", "name": "winner", "type": "address" },
      { "internalType": "uint256", "name": "winningTicketId", "type": "uint256" },
      { "internalType": "bool", "name": "completed", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "name": "tickets",
    "outputs": [
      { "internalType": "uint256", "name": "id", "type": "uint256" },
      { "internalType": "address", "name": "owner", "type": "address" },
      { "internalType": "uint256", "name": "roundId", "type": "uint256" },
      { "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  
  // Read functions - helper methods to get data
  {
    "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
    "name": "getUserTickets",
    "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "roundId", "type": "uint256" }],
    "name": "getRoundTickets",
    "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCurrentRoundInfo",
    "outputs": [
      { "internalType": "uint256", "name": "id", "type": "uint256" },
      { "internalType": "uint256", "name": "startTime", "type": "uint256" },
      { "internalType": "uint256", "name": "endTime", "type": "uint256" },
      { "internalType": "uint256", "name": "totalPool", "type": "uint256" },
      { "internalType": "uint256", "name": "numTickets", "type": "uint256" },
      { "internalType": "bool", "name": "isActive", "type": "bool" },
      { "internalType": "uint256", "name": "timeLeft", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "limit", "type": "uint256" }],
    "name": "getRoundHistory",
    "outputs": [{ 
      "components": [
        { "internalType": "uint256", "name": "id", "type": "uint256" },
        { "internalType": "uint256", "name": "startTime", "type": "uint256" },
        { "internalType": "uint256", "name": "endTime", "type": "uint256" },
        { "internalType": "uint256", "name": "totalPool", "type": "uint256" },
        { "internalType": "address", "name": "winner", "type": "address" },
        { "internalType": "uint256", "name": "winningTicketId", "type": "uint256" },
        { "internalType": "bool", "name": "completed", "type": "bool" }
      ],
      "internalType": "struct GalileoJackpot.Round[]",
      "name": "",
      "type": "tuple[]"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  
  // Write functions
  {
    "inputs": [],
    "name": "buyTickets",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "completeRound",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "_historyContract", "type": "address" }],
    "name": "setHistoryContract",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "_treasury", "type": "address" }],
    "name": "setTreasury",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "startRoundManually",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "emergencyCompleteRound",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// ABI for the GalileoJackpotHistory contract (essential functions only)
export const HISTORY_ABI = [
  // Read functions
  {
    "inputs": [],
    "name": "getTotalWinners",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "offset", "type": "uint256" },
      { "internalType": "uint256", "name": "limit", "type": "uint256" }
    ],
    "name": "getWinners",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "roundId", "type": "uint256" },
          { "internalType": "address", "name": "winner", "type": "address" },
          { "internalType": "uint256", "name": "winningTicketId", "type": "uint256" },
          { "internalType": "uint256", "name": "prizeAmount", "type": "uint256" },
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" }
        ],
        "internalType": "struct GalileoJackpotHistory.WinnerInfo[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "winnerAddress", "type": "address" }],
    "name": "getWinnerRounds",
    "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "winnerAddress", "type": "address" }],
    "name": "isWinner",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "jackpotContract",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  // Write functions
  {
    "inputs": [{ "internalType": "address", "name": "_jackpotContract", "type": "address" }],
    "name": "setJackpotContract",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "roundId", "type": "uint256" },
      { "internalType": "address", "name": "winner", "type": "address" },
      { "internalType": "uint256", "name": "winningTicketId", "type": "uint256" },
      { "internalType": "uint256", "name": "prizeAmount", "type": "uint256" }
    ],
    "name": "recordWinner",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]; 