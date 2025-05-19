import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet } from 'wagmi/chains';
import { http, createConfig } from 'wagmi';

// Define the 0G Galileo Testnet chain
const galileoTestnet = {
  id: 16601,
  name: '0G-Galileo-Testnet',
  nativeCurrency: {
    name: '0G',
    symbol: '0G',
    decimals: 18,
  },
  rpcUrls: {
    default: { 
      http: ['https://evmrpc-testnet.0g.ai']
    },
    public: {
      http: ['https://evmrpc-testnet.0g.ai']
    },
  },
  blockExplorers: {
    default: {
      name: 'Galileo Explorer',
      url: 'https://chainscan-galileo.0g.ai/',
    },
  },
  testnet: true,
};

// Configure supported chains
const chains = [galileoTestnet, mainnet];

// Configure wallet connection
export const config = getDefaultConfig({
  appName: 'Galileo Jackpot',
  projectId: '34121ad34d9bc22e1afc6f45f72b3fdd', // Demo project ID, replace with a real one in production
  chains,
  transports: {
    [galileoTestnet.id]: http(),
    [mainnet.id]: http(),
  },
}); 