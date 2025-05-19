import { useState, useEffect } from 'react';
import { useAccount, useChainId, useReadContract } from 'wagmi';
import { formatAddress, weiToEther, formatTimestamp, getContractAddresses } from '../config/envConfig';
import { HISTORY_ABI } from '../config/contractConfig';

/**
 * Hook for interacting with the Jackpot History contract
 */
export const useJackpotHistory = () => {
  // Get contract addresses
  const { historyContract: historyAddress } = getContractAddresses();
  
  // State
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Wallet connection
  const { isConnected } = useAccount();
  const chainId = useChainId();
  
  // Check if on correct chain (OG-Galileo-Testnet: 16601)
  const isCorrectChain = chainId === 16601;
  
  // Read total winners
  const { data: totalWinners } = useReadContract({
    address: historyAddress,
    abi: HISTORY_ABI,
    functionName: 'getTotalWinners',
    enabled: isConnected && isCorrectChain && !!historyAddress,
  });
  
  // Read recent winners (last 10)
  const { data: recentWinners, refetch } = useReadContract({
    address: historyAddress,
    abi: HISTORY_ABI,
    functionName: 'getWinners',
    args: [0, 10], // Offset 0, limit 10 (most recent 10 winners)
    enabled: isConnected && isCorrectChain && !!historyAddress && totalWinners > 0,
  });
  
  // Process winners data
  useEffect(() => {
    if (recentWinners) {
      const formattedWinners = recentWinners.map(winner => ({
        roundId: Number(winner.roundId),
        winner: winner.winner,
        formattedWinner: formatAddress(winner.winner),
        winningTicket: Number(winner.winningTicketId),
        prize: weiToEther(winner.prizeAmount),
        timestamp: Number(winner.timestamp),
        date: formatTimestamp(winner.timestamp)
      }));
      
      setWinners(formattedWinners);
      setLoading(false);
    }
  }, [recentWinners]);
  
  return {
    winners,
    totalWinners: totalWinners ? Number(totalWinners) : 0,
    loading,
    error,
    refetchHistory: refetch
  };
}; 