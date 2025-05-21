import { useState, useEffect, useRef } from 'react';
import { useAccount, useChainId, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { formatAddress, weiToEther, formatTimestamp, getContractAddresses, MIN_PAYMENT } from '../config/envConfig';
import { JACKPOT_ABI } from '../config/contractConfig';
import { readContract } from 'wagmi/actions';
import { useAdminWallet } from './useAdminWallet';

// Debugging helper
const DEBUG = true; // Set to false in production
const debugLog = (...args) => {
  if (DEBUG) {
    console.log('🔄 [JACKPOT DEBUG]', ...args);
  }
};

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
  const [drawnRounds, setDrawnRounds] = useState(new Set());
  
  // Flag to prevent multiple round completion attempts
  const hasAttemptedAutoComplete = useRef(false);
  // Store drawn rounds in useRef to prevent animation reruns
  const drawnRoundsRef = useRef(new Set());

  // Constants
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
      // Ensure chainId is explicitly passed to prevent the "Cannot destructure property 'chainId'" error
      if (!chainId) {
        console.warn('ChainId is undefined, using default Galileo Testnet ID (16601)');
        // Use fallback chainId for Galileo Testnet
        const defaultChainId = 16601;
        
        const result = await readContract({
          address: jackpotAddress,
          abi: JACKPOT_ABI,
          functionName: 'getCurrentRoundInfo',
          chainId: defaultChainId
        });
        
        if (result && result.length > 3) {
          // Update only pool data and numTickets, but not timeLeft (handled by blockchain timer)
          setCurrentRound(prev => prev ? ({
            ...prev,
            totalPool: result[3].toString(),
            numTickets: Number(result[4])
          }) : null);
          
          console.log(`Pool value updated: ${result[3].toString()}, Tickets: ${result[4]}`);
        }
      } else {
        const result = await readContract({
          address: jackpotAddress,
          abi: JACKPOT_ABI,
          functionName: 'getCurrentRoundInfo',
          chainId: chainId // Explicitly pass chainId to prevent errors
        });
        
        if (result && result.length > 3) {
          // Update only pool data and numTickets, but not timeLeft (handled by blockchain timer)
          setCurrentRound(prev => prev ? ({
            ...prev,
            totalPool: result[3].toString(),
            numTickets: Number(result[4])
          }) : null);
          
          console.log(`Pool value updated: ${result[3].toString()}, Tickets: ${result[4]}`);
        }
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
    
    // Set interval for continuous refreshing - decreased frequency to reduce unnecessary updates
    refreshInterval = setInterval(doSmartRefresh, 5000); // Refresh every 5 seconds to further reduce interference with timer
    
    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, []);
  
  // Blockchain-based timer - calculate timeLeft based on endTime from blockchain
  useEffect(() => {
    let timerInterval;
    
    // Only start if we have a valid endTime from the contract
    if (currentRound && currentRound.endTime > 0 && !currentRound.completed) {
      debugLog(`Starting blockchain-based timer, endTime: ${currentRound.endTime}`);
      
      timerInterval = setInterval(() => {
        // Calculate remaining time based on blockchain endTime and current client time
        const currentTime = Math.floor(Date.now() / 1000);
        const newTimeLeft = Math.max(0, currentRound.endTime - currentTime);
        
        setTimeLeft(prevTimeLeft => {
          // Tylko dla logowania, gdy wartość się zmienia
          if (prevTimeLeft !== newTimeLeft && newTimeLeft <= 10) {
            debugLog(`Zbliża się koniec odliczania: ${newTimeLeft} sekund`);
          }
          return newTimeLeft;
        });
        
        // Handle timer reaching zero
        if (newTimeLeft === 0 && !isCompletingRound && currentRound.isActive && !hasAttemptedAutoComplete.current) {
          debugLog("============ AUTOMATION DEBUGGING ============");
          debugLog("Odliczanie zakończone, przystępuję do losowania zwycięzcy");
          debugLog("Current round:", currentRound);
          debugLog("Current round completed:", currentRound?.completed);
          debugLog("Is completing round flag:", isCompletingRound);
          debugLog("Has attempted auto complete:", hasAttemptedAutoComplete.current);
          debugLog("==============================================");
          
          // Zaznacz, że już próbowaliśmy zakończyć rundę, aby zapobiec ponownemu wywołaniu
          hasAttemptedAutoComplete.current = true;
          debugLog('Rozpoczynam proces zakończenia rundy');
          setIsCompletingRound(true);
          
          // Usunięto powiadomienie o rozpoczęciu losowania, aby uniknąć spamu
          
          // Trigger round completion logic when timer reaches zero
          setTimeout(() => {
            attemptCompleteRound()
              .finally(() => {
                // isCompletingRound będzie resetowane dopiero po potwierdzeniu zakończenia rundy
                // lub po timeout w attemptCompleteRound
              });
          }, 100);
        }
        
        // fallback: koło nie ruszyło w ciągu 3 s → start!
        if (newTimeLeft === 0 && !isDrawing && !winner) {
          const fallback = setTimeout(() => {
            if (!isDrawing && !winner) {
              debugLog('Fallback – uruchamiam animację po 3 s ciszy');
              startDrawing();
            }
          }, 3000);
          return () => clearTimeout(fallback);
        }
      }, 1000); // Update timer every second is sufficient
    }
    
    return () => {
      if (timerInterval) {
        debugLog('Cleaning up blockchain timer');
        clearInterval(timerInterval);
      }
    };
  }, [currentRound?.id, currentRound?.endTime, currentRound?.completed, currentRound?.isActive]);

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
        timeLeft: Number(currentRoundInfo[6]),      // timeLeft (tylko dla referencji, nie używamy bezpośrednio)
        completed: !Boolean(currentRoundInfo[5]),   // !isActive means completed
        winner: roundData ? roundData[4] : '0x0000000000000000000000000000000000000000',
        winningTicketId: roundData ? Number(roundData[5]) : 0,
        formattedWinner: roundData ? formatAddress(roundData[4]) : '0x0000...0000'
      };
      
      console.log('Processed round from getCurrentRoundInfo:', round);
      setCurrentRound(round);
      
      // Resetuj flagę próby automatycznego zakończenia rundy przy nowej rundzie
      if (round.timeLeft > 0) {
        hasAttemptedAutoComplete.current = false;
        debugLog("Nowa aktywna runda, resetuję flagę hasAttemptedAutoComplete");
      }
      
      // Resetuj flagę isCompletingRound, gdy runda została zakończona w łańcuchu
      if (round.completed && isCompletingRound) {
        debugLog("Runda została zakończona w łańcuchu, resetuję isCompletingRound");
        setIsCompletingRound(false);
      }
      
      // NIE ustawiamy timeLeft z danych kontraktu, jest to obliczane w oddzielnym efekcie
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
      
      // NIE ustawiamy timeLeft z danych kontraktu, jest to obliczane w oddzielnym efekcie
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
  
  // Monitor contract state to detect completed rounds
  useEffect(() => {
    // This effect monitors if the round is completed in the contract but animation hasn't started
    if (currentRound && currentRound.completed && !isDrawing && !winner && !isCompletingRound) {
      debugLog("Runda zakończona w kontrakcie, ale animacja nie została uruchomiona - uruchamiam automatycznie");
      // Start drawing animation when we detect a completed round without animation
      
      // Add notification for automatic drawing start
      addNotification({
        type: 'info',
        message: 'Countdown ended! Drawing winner automatically...'
      });
      
      startDrawing();
    }
  }, [currentRound, isDrawing, winner, isCompletingRound]);

  // Usunięto stary mechanizm odliczania czasu, którego zależność od timeLeft 
  // powodowała restartowanie odliczania przy każdej zmianie timeLeft

  // Dodanie mechanizmu fallback bezpieczeństwa
  useEffect(() => {
    // Jeśli timer doszedł do zera, ale nic się nie dzieje przez 10 sekund, resetujemy flagi i próbujemy odświeżyć dane
    if (timeLeft === 0 && !winner && !isDrawing && !isCompletingRound && hasAttemptedAutoComplete.current) {
      debugLog("Uruchamiam mechanizm bezpieczeństwa - oczekiwanie na zakończenie rundy");
      
      const fallbackTimer = setTimeout(() => {
        debugLog("Resetowanie stanu po 15 sekundach bezczynności i odświeżanie danych");
        // Tylko odśwież dane, nie uruchamiaj animacji - niech efekt monitorujący zakończone rundy się tym zajmie
        refreshAllData();
        
        // Po 15s bezczynności, resetuj flagę by umożliwić nowe próby
        setIsCompletingRound(false);
      }, 15000);
      
      return () => clearTimeout(fallbackTimer);
    }
  }, [timeLeft, winner, isDrawing, isCompletingRound, hasAttemptedAutoComplete.current]);

  // Retry mechanism for round completion
  const attemptCompleteRound = async (maxRetries = 3, delay = 5000) => {
    let success = false;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        debugLog(`Próba ${attempt + 1} zakończenia rundy przez portfel administratora`);
        const result = await completeRoundWithAdmin();
        
        if (result.success) {
          addNotification({
            type: 'success',
            message: 'Round completed successfully!',
            txHash: result.txHash
          });
          
          debugLog(`Runda zakończona pomyślnie, txHash: ${result.txHash}`);
          
          // Wait for blockchain confirmation and refresh data
          await new Promise(resolve => setTimeout(resolve, 2000));
          await refreshAllData();
          success = true;
          break;
        }
        
        debugLog(`Próba ${attempt + 1} nie powiodła się: ${result.error}, retrying in ${delay/1000} seconds...`);
        
        if (attempt < maxRetries - 1) {
          // Jeśli nie udało się, czekaj i spróbuj ponownie
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } catch (err) {
        debugLog(`Błąd podczas próby ${attempt + 1}:`, err);
        
        // If it's the last attempt and all failed
        if (attempt === maxRetries - 1) {
          addNotification({
            type: 'error',
            message: `Failed to complete round after ${maxRetries} attempts`
          });
        }
      }
    }
    
    // Bez względu na wynik, odśwież dane i zresetuj flagę isCompletingRound
    await refreshAllData();
    
    // Nawet jeśli transakcja nie powiodła się, dodaj notyfikację
    if (!success) {
      debugLog("Nie udało się zakończyć rundy na blockchain");
      // Usunięto powiadomienie o niepowodzeniu, aby uniknąć spamu
      
      // Pozwól na ponowne próby po pewnym czasie
      setTimeout(() => {
        // NIE resetujemy flagi automatycznie - będzie zresetowana w efekcie,
        // który śledzi currentRound.completed
        // setIsCompletingRound(false);
      }, 10000);
    }
    
    // NIE uruchamiamy tu animacji - zostanie ona uruchomiona przez efekt monitorujący currentRound.completed
    return success;
  };

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
    // Sprawdź na podstawie endTime z kontraktu zamiast polegać na zmiennym timeLeft
    if (!currentRound || currentRound.completed) return true;
    
    const now = Math.floor(Date.now() / 1000);
    const timeToEnd = Math.max(0, currentRound.endTime - now);
    
    // If no countdown is active or time left is more than LOCK_PERIOD seconds, buying is allowed
    return timeToEnd === 0 || timeToEnd > LOCK_PERIOD;
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
  
  // Enhanced startDrawing function to ensure it has the latest data
  const startDrawing = async () => {
    if (isDrawing || !currentRound || !currentRound.id) {
      debugLog('Cannot start drawing - drawing already in progress or no current round');
      return;
    }
    
    // Check if we already drew this round to prevent duplicate animations
    if (drawnRoundsRef.current.has(currentRound.id)) {
      debugLog(`Round ${currentRound.id} already drawn, skipping animation`);
      return;
    }
    
    debugLog('Starting drawing animation sequence');
    setIsDrawing(true);
    setWinner(null);
    
    // Add this round to the set of drawn rounds
    drawnRoundsRef.current.add(currentRound.id);
    
    // Make direct contract calls for the latest round data
    let directRoundData = null;
    let directTicketIds = [];
    
    try {
      // Try to get round data directly
      const effectiveChainId = chainId || 16601; // Use fallback if needed
      
      debugLog(`Making direct contract calls with chainId: ${effectiveChainId}`);
      
      directRoundData = await readContract({
        address: jackpotAddress,
        abi: JACKPOT_ABI,
        functionName: 'rounds',
        args: [currentRound.id],
        chainId: effectiveChainId
      });
      
      // Try to get ticket IDs directly
      directTicketIds = await readContract({
        address: jackpotAddress,
        abi: JACKPOT_ABI,
        functionName: 'getRoundTickets',
        args: [currentRound.id],
        chainId: effectiveChainId
      });
      
      // Log the results of direct contract calls
      debugLog(`Direct contract call results - Round ID: ${currentRound.id}, Completed: ${directRoundData[6]}, Winning ticket: ${directRoundData[5]}`);
      debugLog(`Direct tickets retrieved: ${directTicketIds.length}`);
    } catch (err) {
      debugLog('Error making direct contract calls:', err);
      // Continue with the existing data
    }
    
    // Use multi-level fallback strategy for tickets
    let ticketsToUse = [];
    
    if (directTicketIds && directTicketIds.length > 0) {
      // First priority: Use directly retrieved tickets
      ticketsToUse = Array.from(directTicketIds);
      debugLog(`Using ${ticketsToUse.length} tickets from direct contract call`);
    } else if (roundTicketIds && Array.from(roundTicketIds).length > 0) {
      // Second priority: Use tickets from state
      ticketsToUse = Array.from(roundTicketIds);
      debugLog(`Using ${ticketsToUse.length} tickets from state`);
    } else {
      // Last resort: Use fallback tickets
      ticketsToUse = [1, 2, 3, 4];
      debugLog(`WARNING: Using ${ticketsToUse.length} FALLBACK tickets - NO ACTUAL BLOCKCHAIN DATA AVAILABLE`);
    }
    
    // Simulate ticket selection animation
    let counter = 0;
    const drawInterval = setInterval(() => {
      counter++;
      
      // Pick a random ticket for animation
      const randomIndex = Math.floor(Math.random() * ticketsToUse.length);
      const randomTicketId = ticketsToUse[randomIndex];
      
      // Create ticket object
      const ticketData = {
        id: randomTicketId,
        isUser: userTickets.includes(randomTicketId),
        owner: ticketOwners[randomTicketId] ? shortenAddress(ticketOwners[randomTicketId]) : ''
      };
      
      setCurrentTicket(ticketData);
      
      // Slow down and stop at a winning ticket after a few seconds
      if (counter > 30) {
        clearInterval(drawInterval);
        
        // Set winner from contract data or use a fallback
        setTimeout(() => {
          try {
            let winnerTicket;
            
            // Try multiple sources for winner data, in order of reliability
            if (directRoundData && directRoundData[6] && directRoundData[5]) {
              // 1. Use directly retrieved round data (most reliable)
              const winningId = Number(directRoundData[5]);
              debugLog(`Setting winner from direct contract data: ticket #${winningId}`);
              
              winnerTicket = {
                id: winningId,
                isUser: userTickets.includes(winningId),
                owner: ticketOwners[winningId] ? shortenAddress(ticketOwners[winningId]) : ''
              };
            } else if (currentRound && currentRound.completed && currentRound.winningTicketId) {
              // 2. Use state data if available
              debugLog(`Setting winner from state data: ticket #${currentRound.winningTicketId}, prize: ${weiToEther(currentRound.totalPool)}`);
              
              // Create winner ticket object from contract data
              winnerTicket = {
                id: currentRound.winningTicketId,
                isUser: userTickets.includes(currentRound.winningTicketId),
                owner: ticketOwners[currentRound.winningTicketId] ? 
                  shortenAddress(ticketOwners[currentRound.winningTicketId]) : ''
              };
            } else if (ticketsToUse.length > 0) {
              // 3. If no winner data available, select from actual tickets (better fallback)
              debugLog('No contract winner data available, selecting from available tickets');
              
              const randomWinningIndex = Math.floor(Math.random() * ticketsToUse.length);
              const randomWinningId = ticketsToUse[randomWinningIndex];
              
              winnerTicket = {
                id: randomWinningId,
                isUser: userTickets.includes(randomWinningId),
                owner: ticketOwners[randomWinningId] ? 
                  shortenAddress(ticketOwners[randomWinningId]) : ''
              };
            } else {
              // 4. Absolute last resort fallback
              debugLog('CRITICAL: No tickets available, using last resort fallback winner');
              
              const fallbackTicket = { id: 1, isUser: false, owner: '' };
              winnerTicket = fallbackTicket;
            }
            
            setCurrentTicket(winnerTicket);
            setWinner({
              ticket: winnerTicket,
              prize: currentRound ? weiToEther(currentRound.totalPool) : '0.1'
            });
          } catch (err) {
            debugLog('Error setting winner in animation:', err);
            
            // Absolute fallback if everything fails
            const fallbackTicket = { id: 1, isUser: false, owner: '' };
            setCurrentTicket(fallbackTicket);
            setWinner({
              ticket: fallbackTicket,
              prize: '0.1'
            });
          } finally {
            setIsDrawing(false);
          }
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
          chainId: chainId
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