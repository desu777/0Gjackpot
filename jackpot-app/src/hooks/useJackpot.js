import { useState, useEffect } from 'react';
import { useAccount, useChainId, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { formatAddress, weiToEther, formatTimestamp, getContractAddresses } from '../config/envConfig';
import { JACKPOT_ABI } from '../config/contractConfig';
import { readContract } from 'wagmi/actions';
import { useAdminWallet } from './useAdminWallet';

/**
 * Hook for interacting with the Jackpot contract
 */
export const useJackpot = () => {
  // Get contract addresses
  const { jackpotContract: jackpotAddress } = getContractAddresses();
  
  // State
  const [currentRound, setCurrentRound] = useState(null);
  const [userTickets, setUserTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTicket, setCurrentTicket] = useState(null);
  const [winner, setWinner] = useState(null);
  const [pendingTx, setPendingTx] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [ticketOwners, setTicketOwners] = useState({});
  const [isCompletingRound, setIsCompletingRound] = useState(false);

  // Constants
  const MIN_PAYMENT = 0.02; // Minimum payment to start the countdown
  const LOCK_PERIOD = 5; // Seconds before end when buying is disabled
  
  // Admin wallet integration
  const { completeRoundWithAdmin } = useAdminWallet();
  
  // Wallet connection
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  
  // Check if on correct chain (OG-Galileo-Testnet: 16601)
  const isCorrectChain = chainId === 16601;
  
  // Read contract state
  const { data: roundId, error: roundIdError, refetch: refetchRoundId } = useReadContract({
    address: jackpotAddress,
    abi: JACKPOT_ABI,
    functionName: 'currentRoundId',
    enabled: isConnected && isCorrectChain && !!jackpotAddress,
  });
  
  // Log contract address and round id for debugging
  useEffect(() => {
    console.log('Contract details:', { 
      jackpotAddress, 
      roundId, 
      isConnected, 
      isCorrectChain, 
      chainId,
      roundIdError: roundIdError?.message
    });
  }, [jackpotAddress, roundId, isConnected, isCorrectChain, chainId, roundIdError]);
  
  // Pobierz dane rundy z mappingu (można zamienić na getCurrentRoundInfo)
  const { data: roundData, error: roundDataError, refetch: refetchRoundData } = useReadContract({
    address: jackpotAddress,
    abi: JACKPOT_ABI,
    functionName: 'rounds',
    args: [roundId || 0],
    enabled: isConnected && isCorrectChain && !!jackpotAddress,
  });
  
  // Pobierz szczegółowe informacje o aktualnej rundzie używając dedykowanej funkcji
  const { data: currentRoundInfo, error: currentRoundInfoError, refetch: refetchRoundInfo } = useReadContract({
    address: jackpotAddress,
    abi: JACKPOT_ABI,
    functionName: 'getCurrentRoundInfo',
    enabled: isConnected && isCorrectChain && !!jackpotAddress,
  });
  
  const { data: userTicketIds, error: userTicketsError, refetch: refetchUserTickets } = useReadContract({
    address: jackpotAddress,
    abi: JACKPOT_ABI,
    functionName: 'getUserTickets',
    args: [address],
    enabled: isConnected && isCorrectChain && !!address && !!jackpotAddress,
  });
  
  const { data: roundTicketIds, error: roundTicketsError, refetch: refetchRoundTickets } = useReadContract({
    address: jackpotAddress,
    abi: JACKPOT_ABI,
    functionName: 'getRoundTickets',
    args: [roundId || 0],
    enabled: isConnected && isCorrectChain && !!jackpotAddress,
  });
  
  // Refresh count for diagnostic purposes
  const [refreshCount, setRefreshCount] = useState(0);

  // Function to refresh all data with optimization
  const refreshAllData = async () => {
    console.log('Refreshing all contract data');
    setIsRefreshing(true);
    setRefreshCount(prev => prev + 1);
    
    try {
      // Prioritize fetching pool data first
      const currentRoundInfoPromise = refetchRoundInfo();
      
      // Then fetch the rest of the data in parallel
      await Promise.all([
        currentRoundInfoPromise,
        refetchRoundId(),
        refetchRoundData(),
        refetchUserTickets(),
        refetchRoundTickets()
      ]);
      
      console.log(`Refresh #${refreshCount + 1} completed at ${new Date().toISOString()}`);
    } catch (err) {
      console.error('Error refreshing data:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Function to refresh only pool data (faster update)
  const refreshPoolData = async () => {
    if (!isConnected || !isCorrectChain || !jackpotAddress) return;
    
    try {
      const result = await readContract({
        address: jackpotAddress,
        abi: JACKPOT_ABI,
        functionName: 'getCurrentRoundInfo',
      });
      
      if (result && result.length > 3) {
        // Update only pool data
        setCurrentRound(prev => prev ? ({
          ...prev,
          totalPool: result[3].toString()
        }) : null);
        
        console.log(`Pool value updated: ${result[3].toString()}`);
      }
    } catch (err) {
      console.error('Error refreshing pool data:', err);
    }
  };

  // Write contract functions
  const { writeContract, isPending: isTransactionPending, data: txHash } = useWriteContract();

  // Watch for transaction receipt
  const { isLoading: isWaitingForTx, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Track transaction status
  useEffect(() => {
    if (txHash) {
      setPendingTx(txHash);
      addNotification({
        type: 'info',
        message: 'Transaction sent. Waiting for confirmation...',
        txHash: txHash
      });
    }
  }, [txHash]);

  // Track transaction completion
  useEffect(() => {
    if (isTxSuccess && pendingTx) {
      // Add success notification when transaction is confirmed
      addNotification({
        type: 'success',
        message: 'Transaction confirmed!',
        txHash: pendingTx
      });
      
      // Refresh data when transaction is confirmed
      refreshAllData();
      
      setPendingTx(null);
    }
  }, [isTxSuccess, pendingTx]);

  // Schedule optimized periodic data refreshes
  useEffect(() => {
    let refreshInterval;
    let cycleCount = 0;
    
    // Function to perform a smart refresh
    const doSmartRefresh = () => {
      if (isRefreshing) return; // Prevent parallel refreshes
      
      cycleCount++;
      
      // Do a full refresh every 5 cycles and on first run
      if (cycleCount === 1 || cycleCount % 5 === 0) {
        refreshAllData();
      } else {
        // Otherwise just refresh the pool data (faster)
        refreshPoolData();
      }
    };
    
    // Refresh immediately on component mount
    doSmartRefresh();
    
    // Set interval for continuous refreshing
    refreshInterval = setInterval(doSmartRefresh, 1000); // Refresh every 1 second
    
    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, []);

  // Add notification
  const addNotification = (notification) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, ...notification }]);
  };

  // Remove notification
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };
  
  // Buy tickets
  const buyTickets = (amountEth) => {
    if (!isConnected || !isCorrectChain) {
      setError('Please connect your wallet to the correct network');
      addNotification({
        type: 'error',
        message: 'Please connect your wallet to the correct network'
      });
      return;
    }

    // Check if the timer is in the lock period
    if (timeLeft > 0 && timeLeft <= LOCK_PERIOD) {
      addNotification({
        type: 'warning',
        message: `Can't buy tickets in the last ${LOCK_PERIOD} seconds of the round!`
      });
      return;
    }
    
    try {
      // Check if amount meets the minimum requirement
      const amount = parseFloat(amountEth);
      
      if (amount < MIN_PAYMENT) {
        addNotification({
          type: 'warning',
          message: `Minimum payment is ${MIN_PAYMENT} 0G to start the round!`
        });
      }
      
      writeContract({
        address: jackpotAddress,
        abi: JACKPOT_ABI,
        functionName: 'buyTickets',
        value: parseEther(amountEth),
      });
      
    } catch (err) {
      setError(err.message || 'Failed to buy tickets');
      addNotification({
        type: 'error',
        message: err.message || 'Failed to buy tickets'
      });
    }
  };
  
  // Complete round
  const completeRound = () => {
    if (!isConnected || !isCorrectChain) {
      setError('Please connect your wallet to the correct network');
      addNotification({
        type: 'error',
        message: 'Please connect your wallet to the correct network'
      });
      return;
    }
    
    try {
      writeContract({
        address: jackpotAddress,
        abi: JACKPOT_ABI,
        functionName: 'completeRound',
      });
      
      addNotification({
        type: 'info',
        message: 'Drawing winner, please wait for the transaction to complete'
      });
    } catch (err) {
      setError(err.message || 'Failed to complete round');
      addNotification({
        type: 'error',
        message: err.message || 'Failed to complete round'
      });
    }
  };
  
  // Process round data
  useEffect(() => {
    console.log('Round data update:', { roundData, roundId, currentRoundInfo });
    
    // Preferuj użycie currentRoundInfo jako bardziej kompletnego źródła danych
    if (currentRoundInfo) {
      const round = {
        id: Number(currentRoundInfo[0]),            // id
        startTime: Number(currentRoundInfo[1]),     // startTime
        endTime: Number(currentRoundInfo[2]),       // endTime
        totalPool: weiToEther(currentRoundInfo[3]), // totalPool
        numTickets: Number(currentRoundInfo[4]),    // numTickets
        isActive: Boolean(currentRoundInfo[5]),     // isActive
        timeLeft: Number(currentRoundInfo[6]),      // timeLeft
        completed: !Boolean(currentRoundInfo[5]),   // !isActive means completed
        winner: roundData ? roundData[4] : '0x0000000000000000000000000000000000000000',
        winningTicketId: roundData ? Number(roundData[5]) : 0,
        formattedWinner: roundData ? formatAddress(roundData[4]) : '0x0000...0000'
      };
      
      console.log('Processed round from getCurrentRoundInfo:', round);
      setCurrentRound(round);
      
      // Ustaw timeLeft z danych kontraktu
      if (round.timeLeft > 0) {
        setTimeLeft(round.timeLeft);
      }
    } 
    // Fallback do starszego sposobu jeśli getCurrentRoundInfo nie jest dostępne
    else if (roundData && roundId) {
      const round = {
        id: parseInt(roundId),
        startTime: Number(roundData[1]),
        endTime: Number(roundData[2]),
        totalPool: weiToEther(roundData[3]),
        winner: roundData[4],
        winningTicketId: Number(roundData[5]),
        completed: roundData[6],
        formattedWinner: formatAddress(roundData[4])
      };
      
      console.log('Processed round from rounds mapping:', round);
      setCurrentRound(round);
      
      // Calculate time left
      if (round.endTime > 0 && !round.completed) {
        const currentTime = Math.floor(Date.now() / 1000);
        const timeRemaining = Math.max(0, round.endTime - currentTime);
        setTimeLeft(timeRemaining);
      }
    }
  }, [roundData, roundId, currentRoundInfo]);
  
  // Process user tickets
  useEffect(() => {
    console.log('Tickets data update:', { 
      userTicketIds: userTicketIds ? Array.from(userTicketIds) : [], 
      roundTicketIds: roundTicketIds ? Array.from(roundTicketIds) : [] 
    });
    
    if (userTicketIds && roundTicketIds) {
      // Convert to arrays
      const userTicketsArray = Array.isArray(userTicketIds) ? userTicketIds : Array.from(userTicketIds);
      const roundTicketsArray = Array.isArray(roundTicketIds) ? roundTicketIds : Array.from(roundTicketIds);
      
      // Filter user tickets to only include tickets in the current round
      const currentRoundUserTickets = userTicketsArray.filter(ticketId => 
        roundTicketsArray.includes(ticketId)
      );
      
      // Set the filtered user tickets for the current round
      setUserTickets(currentRoundUserTickets);
      setLoading(false);
    }
  }, [userTicketIds, roundTicketIds]);
  
  // Countdown timer effect
  useEffect(() => {
    let interval;
    if (timeLeft > 0 && currentRound && !currentRound.completed) {
      // Zapisujemy czas początkowy i początkową wartość timeLeft
      const startTime = Date.now();
      const initialTimeLeft = timeLeft;
      
      interval = setInterval(() => {
        // Obliczamy, ile czasu upłynęło
        const elapsedSeconds = (Date.now() - startTime) / 1000;
        // Obliczamy nowy czas pozostały
        const newTimeLeft = Math.max(0, Math.floor(initialTimeLeft - elapsedSeconds));
        
        // Aktualizujemy tylko jeśli się zmienił
        if (newTimeLeft !== timeLeft) {
          setTimeLeft(newTimeLeft);
        }
        
        // Dodany warunek !isCompletingRound, aby zapobiec wielokrotnemu wywołaniu
        if (newTimeLeft === 0 && currentRound && !currentRound.completed && !isCompletingRound) {
          console.log('Countdown reached zero - automatically completing round with admin wallet');
          setIsCompletingRound(true); // Oznaczamy, że proces kończenia rundy jest w toku
          
          addNotification({
            type: 'info',
            message: 'Countdown ended! Drawing winner automatically...'
          });
          
          // Use admin wallet to complete the round
          completeRoundWithAdmin()
            .then(result => {
              if (result.success) {
                addNotification({
                  type: 'success',
                  message: 'Round completed successfully!',
                  txHash: result.txHash
                });
                
                // Start the drawing animation after a delay
                setTimeout(() => {
                  startDrawing();
                }, 2000);
              } else {
                addNotification({
                  type: 'error',
                  message: `Failed to complete round: ${result.error}`
                });
              }
              // Reset flagi bez względu na wynik
              setIsCompletingRound(false);
            })
            .catch(err => {
              console.error('Error completing round:', err);
              addNotification({
                type: 'error',
                message: `Error completing round: ${err.message || 'Unknown error'}`
              });
              setIsCompletingRound(false);
            });
        }
      }, 100); // Częstsze odświeżanie dla płynniejszego wyglądu
    }
    
    return () => clearInterval(interval);
  }, [timeLeft, currentRound, completeRoundWithAdmin, isCompletingRound]); // Dodajemy isCompletingRound do zależności
  
  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' + secs : secs}`;
  };
  
  // Calculate win chance
  const calculateWinChance = () => {
    console.log('Calculating win chance:', {
      roundTicketIds: roundTicketIds ? Array.from(roundTicketIds) : [],
      userTickets: userTickets
    });
    
    if (!roundTicketIds || !Array.from(roundTicketIds).length) return '0';
    if (!userTickets || !userTickets.length) return '0';
    
    const roundTicketsArray = Array.from(roundTicketIds);
    
    return ((userTickets.length / roundTicketsArray.length) * 100).toFixed(2);
  };

  // Check if buying tickets is allowed (not in lock period)
  const isBuyingAllowed = () => {
    // If no countdown is active or time left is more than LOCK_PERIOD seconds, buying is allowed
    return timeLeft === 0 || timeLeft > LOCK_PERIOD;
  };
  
  // Log errors
  useEffect(() => {
    const errors = {
      roundIdError,
      roundDataError,
      currentRoundInfoError,
      userTicketsError,
      roundTicketsError
    };
    
    // Filtruj tylko faktyczne błędy
    const actualErrors = Object.entries(errors)
      .filter(([_, error]) => error)
      .reduce((acc, [key, error]) => {
        acc[key] = error.message || String(error);
        return acc;
      }, {});
    
    if (Object.keys(actualErrors).length > 0) {
      console.error('Contract errors:', actualErrors);
      setError('Error loading contract data');
    }
  }, [roundIdError, roundDataError, currentRoundInfoError, userTicketsError, roundTicketsError]);
  
  const startDrawing = () => {
    if (isDrawing) return;
    
    setIsDrawing(true);
    setWinner(null);
    
    // Simulate ticket selection animation
    let counter = 0;
    const drawInterval = setInterval(() => {
      counter++;
      
      if (roundTicketIds && Array.from(roundTicketIds).length > 0) {
        const roundTicketsArray = Array.from(roundTicketIds);
        const randomIndex = Math.floor(Math.random() * roundTicketsArray.length);
        const randomTicketId = roundTicketsArray[randomIndex];
        
        // Create ticket object
        const ticketData = {
          id: randomTicketId,
          isUser: userTickets.includes(randomTicketId),
          owner: ticketOwners[randomTicketId] ? shortenAddress(ticketOwners[randomTicketId]) : ''
        };
        
        setCurrentTicket(ticketData);
      }
      
      // Slow down and stop at a winning ticket after a few seconds
      if (counter > 30) {
        clearInterval(drawInterval);
        
        // Set winner from contract data
        setTimeout(() => {
          if (currentRound && currentRound.completed && currentRound.winningTicketId) {
            // Create winner ticket object
            const winnerTicket = {
              id: currentRound.winningTicketId,
              isUser: userTickets.includes(currentRound.winningTicketId),
              owner: ticketOwners[currentRound.winningTicketId] ? 
                shortenAddress(ticketOwners[currentRound.winningTicketId]) : ''
            };
            
            setCurrentTicket(winnerTicket);
            setWinner({
              ticket: winnerTicket,
              prize: weiToEther(currentRound.totalPool)
            });
          }
          setIsDrawing(false);
        }, 500);
      }
    }, 100);
  };
  
  const resetDrawingState = () => {
    setIsDrawing(false);
    setCurrentTicket(null);
    setWinner(null);
  };
  
  // Function to get ticket owner addresses
  const getTicketOwners = async (ticketIds) => {
    if (!isConnected || !isCorrectChain || !ticketIds || ticketIds.length === 0) {
      return {};
    }

    try {
      // Create a mapping of ticket ID to owner address
      const ownerData = {};
      
      for (const ticketId of ticketIds) {
        const ticketData = await readContract({
          address: jackpotAddress,
          abi: JACKPOT_ABI,
          functionName: 'tickets',
          args: [ticketId],
        });
        
        if (ticketData && ticketData.length > 1) {
          ownerData[ticketId] = ticketData[1]; // owner is at index 1
        }
      }
      
      setTicketOwners(ownerData);
      return ownerData;
    } catch (err) {
      console.error('Error getting ticket owners:', err);
      return {};
    }
  };

  // Get ticket owners when round tickets change
  useEffect(() => {
    if (roundTicketIds && Array.from(roundTicketIds).length > 0) {
      getTicketOwners(Array.from(roundTicketIds));
    }
  }, [roundTicketIds]);
  
  // Get shortened wallet address
  const shortenAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  
  return {
    // State
    currentRound,
    timeLeft,
    isDrawing,
    currentTicket,
    winner,
    error,
    loading,
    isRefreshing,
    refreshCount,
    
    // Data from contracts converted to appropriate format
    roundId: roundId ? Number(roundId) : 0,
    roundData,
    userTickets,
    roundTickets: roundTicketIds ? Array.from(roundTicketIds) : [],
    
    // Win chance
    winChance: calculateWinChance(),
    
    // Actions
    buyTickets,
    completeRound,
    formatTime,
    startDrawing,
    setTimeLeft,
    resetDrawingState,
    
    // Status
    isConnected,
    isCorrectChain,
    address,
    isPending: isTransactionPending,
    
    // New additions
    notifications,
    removeNotification,
    isBuyingAllowed: isBuyingAllowed(),
    minPayment: MIN_PAYMENT,
    lockPeriod: LOCK_PERIOD,
    
    // Add refresh functions to expose to components
    refreshAllData,
    refreshPoolData,
    
    // Add ticket owners data
    ticketOwners,
    getTicketOwners,
    shortenAddress
  };
}; 