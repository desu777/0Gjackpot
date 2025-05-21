import React, { useState, useEffect } from 'react';
import MainLayout from '../components/jackpot/layout/MainLayout';
import LandingView from '../components/jackpot/views/LandingView';
import ConnectedView from '../components/jackpot/views/ConnectedView';
import NotificationContainer from '../components/common/NotificationContainer';
import { useAccount, useChainId } from 'wagmi';
import { useJackpot } from '../hooks/useJackpot';
import { useJackpotHistory } from '../hooks/useJackpotHistory';
import { formatAddress } from '../config/envConfig';

/**
 * Main jackpot page component that holds the state and logic
 * Now integrated with real contracts instead of mock data
 */
const JackpotPage = () => {
  // Get wallet data from wagmi
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  
  // State for managing different views
  const [activeView, setActiveView] = useState('landing'); // landing, connected, drawing
  const [showWheel, setShowWheel] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTicket, setCurrentTicket] = useState(null);
  const [winner, setWinner] = useState(null);
  
  // Get jackpot contract data
  const {
    currentRound,
    userTickets,
    roundTickets,
    loading: jackpotLoading,
    error: jackpotError,
    timeLeft,
    isTransactionPending,
    winChance,
    isCorrectChain,
    buyTickets,
    completeRound,
    formatTime,
    
    // New additions
    notifications,
    removeNotification,
    isBuyingAllowed,
    minPayment,
    lockPeriod,
    refreshAllData,
    refreshPoolData,
    isRefreshing,
    refreshCount,
    ticketOwners,
    shortenAddress
  } = useJackpot();
  
  // Get history contract data
  const {
    winners,
    totalWinners,
    loading: historyLoading,
    error: historyError,
    refetchHistory
  } = useJackpotHistory();
  
  // Update active view based on wallet connection
  useEffect(() => {
    if (isConnected) {
      setActiveView('connected');
    } else {
      setActiveView('landing');
    }
  }, [isConnected]);
  
  // Create data object from contract data
  // This maintains compatibility with the existing UI components
  const jackpotData = currentRound ? {
    roundId: currentRound.id,
    totalPool: currentRound.totalPool,
    numTickets: roundTickets.length,
    userTickets: userTickets.length,
    isActive: !currentRound.completed,
    betAmount: minPayment, // Use the minimum payment value
    account: address ? formatAddress(address) : "",
    winChance: winChance,
    roundHistory: winners.map(w => ({
      id: w.roundId,
      winner: w.formattedWinner,
      winningTicket: w.winningTicket,
      prize: w.prize,
      date: w.date
    }))
  } : {
    roundId: 0,
    totalPool: "0",
    numTickets: 0,
    userTickets: 0,
    isActive: false,
    betAmount: minPayment,
    account: address ? formatAddress(address) : "",
    winChance: "0",
    roundHistory: []
  };
  
  // Log data for debugging
  console.log("JackpotPage data:", { 
    currentRound, 
    userTickets, 
    roundTickets, 
    jackpotData,
    isCorrectChain,
    address,
    isBuyingAllowed
  });
  
  // Generate ticket objects
  const ticketsData = roundTickets ? roundTickets.map((ticketId, index) => ({
    id: ticketId,
    isUser: userTickets.includes(ticketId)
  })) : [];
  
  // Start drawing animation (simulated - in real implementation this would be triggered by contract events)
  const startDrawing = () => {
    if (isDrawing || !currentRound || !currentRound.completed) return;
    
    setIsDrawing(true);
    setWinner(null);
    
    // Simulate ticket selection animation
    let counter = 0;
    const drawInterval = setInterval(() => {
      counter++;
      const randomIndex = Math.floor(Math.random() * ticketsData.length);
      setCurrentTicket(ticketsData[randomIndex]);
      
      // Slow down and stop at a random ticket after a few seconds
      if (counter > 30) {
        clearInterval(drawInterval);
        
        // Set winner from contract data
        setTimeout(() => {
          if (currentRound && currentRound.completed) {
            const winningTicket = ticketsData.find(t => t.id === currentRound.winningTicketId);
            setCurrentTicket(winningTicket || ticketsData[0]);
            setWinner({
              ticket: winningTicket || ticketsData[0],
              prize: currentRound.totalPool
            });
          }
          setIsDrawing(false);
        }, 500);
      }
    }, 100);
  };

  // Handler for buying tickets
  const handleBuyTickets = (amount) => {
    buyTickets(amount.toString());
  };
  
  // Handler for completing round
  const handleCompleteRound = () => {
    completeRound();
  };
  
  // Stub function for setTimeLeft (now managed in useJackpot hook)
  // This is needed because ConnectedView expects this prop
  const handleSetTimeLeft = () => {
    // Time is now managed by the useJackpot hook
    // This is just a stub to satisfy the interface
  };

  return (
    <>
      <MainLayout 
        activeView={activeView}
        setActiveView={setActiveView}
        mockData={jackpotData}
      >
        {activeView === 'landing' ? (
          <LandingView setActiveView={setActiveView} />
        ) : (
          <ConnectedView 
            mockData={jackpotData}
            mockTickets={ticketsData}
            timeLeft={timeLeft}
            isDrawing={isDrawing}
            currentTicket={currentTicket}
            winner={winner}
            setActiveView={setActiveView}
            setTimeLeft={handleSetTimeLeft}
            startDrawing={startDrawing}
            formatTime={formatTime}
            isCorrectChain={isCorrectChain}
            buyTickets={handleBuyTickets}
            completeRound={handleCompleteRound}
            isPending={isTransactionPending}
            isBuyingAllowed={isBuyingAllowed}
            minPayment={minPayment}
            timeLeft={timeLeft}
            lockPeriod={lockPeriod}
            isRefreshing={isRefreshing}
            refreshCount={refreshCount}
            refreshPoolData={refreshPoolData}
            ticketOwners={ticketOwners}
            shortenAddress={shortenAddress}
          />
        )}
      </MainLayout>
      
      {/* Notification container */}
      <NotificationContainer 
        notifications={notifications}
        removeNotification={removeNotification}
      />
    </>
  );
};

export default JackpotPage; 