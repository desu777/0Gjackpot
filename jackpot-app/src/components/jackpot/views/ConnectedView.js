import React from 'react';
import InfoPanel from '../panels/InfoPanel';
import WheelSection from '../panels/WheelSection';
import BuyPanel from '../panels/BuyPanel';
import HistoryPanel from '../panels/HistoryPanel';
import { useChainModal } from '@rainbow-me/rainbowkit';

/**
 * Connected view component showing all panels when wallet is connected
 */
const ConnectedView = ({ 
  mockData, 
  mockTickets, 
  timeLeft, 
  isDrawing, 
  currentTicket, 
  winner, 
  setActiveView, 
  setTimeLeft,
  startDrawing,
  formatTime,
  isCorrectChain,
  buyTickets,
  isPending,
  completeRound,
  isBuyingAllowed,
  minPayment,
  lockPeriod,
  isRefreshing,
  ticketOwners,
  shortenAddress
}) => {
  const { openChainModal } = useChainModal();
  
  // If not on the correct chain, show network warning
  if (!isCorrectChain) {
    return (
      <div className="laser-border" style={{
        backgroundColor: 'rgba(25, 30, 40, 0.7)',
        borderRadius: '24px',
        padding: '40px 24px',
        textAlign: 'center',
        maxWidth: '600px',
        margin: '0 auto',
        border: 'none',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '24px',
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px 2px rgb(235, 87, 87)',
            border: '2px solid rgb(235, 87, 87)',
            backgroundColor: 'rgba(235, 87, 87, 0.1)',
            fontSize: '36px'
          }}>
            ⚠️
          </div>
        </div>
        
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: '600',
          color: 'white',
          marginBottom: '16px'
        }}>
          Wrong Network Detected
        </h2>
        
        <p style={{ 
          color: 'rgba(255, 255, 255, 0.6)', 
          marginBottom: '24px',
          fontSize: '16px',
          lineHeight: '1.5'
        }}>
          Please switch to the 0G Galileo Testnet to use this application.
        </p>
        
        <button 
          onClick={openChainModal}
          style={{
            background: 'rgba(235, 87, 87, 0.2)',
            color: 'white',
            border: '1px solid rgba(235, 87, 87, 0.5)',
            borderRadius: '12px',
            padding: '14px 32px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '16px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(235, 87, 87, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(235, 87, 87, 0.2)';
          }}
        >
          Switch Network
        </button>
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr) 320px',
      gap: '20px'
    }}>
      {/* Left column */}
      <div>
        <InfoPanel 
          mockData={mockData} 
          mockTickets={mockTickets} 
          isRefreshing={isRefreshing} 
          ticketOwners={ticketOwners}
          shortenAddress={shortenAddress}
        />
        <WheelSection 
          showWheel={true}
          timeLeft={timeLeft}
          isDrawing={isDrawing}
          currentTicket={currentTicket}
          winner={winner}
          formatTime={formatTime}
          startDrawing={startDrawing}
          completeRound={completeRound}
        />
      </div>
      
      {/* Right column */}
      <div>
        <BuyPanel 
          mockData={mockData} 
          buyTickets={buyTickets} 
          isPending={isPending}
          isBuyingAllowed={isBuyingAllowed}
          minPayment={minPayment}
          timeLeft={timeLeft}
          lockPeriod={lockPeriod}
        />
        <HistoryPanel mockData={mockData} />
      </div>
    </div>
  );
};

export default ConnectedView; 