// Environment variables helper functions
// This file helps with accessing environment variables in a consistent way

// Get chain configuration from .env
export const getChainConfig = () => {
  return {
    chainName: process.env.REACT_APP_CHAIN || 'OG-Galileo-Testnet',
    chainId: parseInt(process.env.REACT_APP_CHAIN_ID || '16601', 10),
    symbol: process.env.REACT_APP_SYMBOL || 'OG',
    rpcUrl: process.env.REACT_APP_RPC || 'https://evmrpc-testnet.0g.ai',
    explorerUrl: process.env.REACT_APP_EXPLORER || 'https://chainscan-galileo.0g.ai/'
  };
};

// Get contract addresses from .env
export const getContractAddresses = () => {
  return {
    jackpotContract: process.env.REACT_APP_JACKPOT_CONTRACT,
    historyContract: process.env.REACT_APP_HISTORY_CONTRACT
  };
};

// Jackpot constants
export const TICKET_PRICE = parseFloat(process.env.REACT_APP_TICKET_PRICE || '0.01');
export const MIN_PAYMENT = parseFloat(process.env.REACT_APP_MIN_PAYMENT || '0.02');

// Format address for display (0x1234...5678)
export const formatAddress = (address) => {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Format currency amount with specified decimal places
export const formatAmount = (amount, decimals = 4) => {
  if (!amount) return '0';
  return parseFloat(amount).toFixed(decimals);
};

// Convert Wei to Ether and format
export const weiToEther = (wei) => {
  if (!wei) return '0';
  // Divide by 10^18 (wei to ether conversion)
  return formatAmount(parseFloat(wei) / 1e18);
};

// Format timestamp to date string
export const formatTimestamp = (timestamp) => {
  if (!timestamp) return '';
  // Convert BigInt to Number if necessary before multiplying
  const timestampNum = typeof timestamp === 'bigint' ? Number(timestamp) : timestamp;
  return new Date(timestampNum * 1000).toLocaleString();
}; 