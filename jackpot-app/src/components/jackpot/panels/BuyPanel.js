import React, { useState } from 'react';
import theme from '../theme/ThemeConfig';

/**
 * Panel for buying lottery tickets
 */
const BuyPanel = ({ mockData, buyTickets, isPending, isBuyingAllowed, minPayment, timeLeft, lockPeriod }) => {
  const [amount, setAmount] = useState(mockData.betAmount);
  
  const handleBuyTickets = () => {
    if (amount >= minPayment) {
      buyTickets(amount);
    }
  };
  
  const ticketsCount = Math.floor(amount / 0.01);
  const isLockPeriod = timeLeft > 0 && timeLeft <= lockPeriod;

  // Generate buying disabled message
  const getBuyingDisabledMessage = () => {
    if (isPending) return 'Transaction in progress...';
    if (amount < minPayment) return `Minimum amount is ${minPayment} 0G`;
    if (isLockPeriod) return `Buying disabled in last ${lockPeriod} seconds`;
    return '';
  };
  
  return (
    <div className="laser-border" style={{
      backgroundColor: 'rgba(25, 30, 40, 0.7)',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '24px',
      position: 'relative',
      border: 'none',
      overflow: 'hidden'
    }}>
      <h3 style={{ 
        fontSize: '20px', 
        fontWeight: '600',
        color: theme.text.primary,
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <span role="img" aria-label="ticket">🎟️</span> Buy Tickets
      </h3>
      
      <div>
        <label style={{
          display: 'block',
          marginBottom: '8px',
          color: theme.text.secondary,
          fontSize: '14px',
          fontWeight: '500'
        }}>
          Amount (0G)
        </label>
        
        <div style={{
          position: 'relative',
          marginBottom: '20px'
        }}>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value))}
            min={minPayment}
            step="0.01"
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: 'rgba(15, 20, 30, 0.8)',
              border: `1px solid rgba(60, 75, 95, 0.5)`,
              borderRadius: '12px',
              color: theme.text.primary,
              fontSize: '16px',
              outline: 'none',
              transition: 'all 0.2s ease'
            }}
          />
          <div style={{
            position: 'absolute',
            right: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: theme.text.secondary,
            fontSize: '14px'
          }}>
            0G
          </div>
        </div>
        
        <div style={{
          backgroundColor: 'rgba(15, 20, 30, 0.5)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', marginBottom: '8px' }}>
            You'll receive
          </div>
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            background: `linear-gradient(90deg, ${theme.accent.primary}, ${theme.accent.secondary})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            {ticketsCount} tickets
          </div>
        </div>

        {/* Minimum payment notice */}
        <div style={{
          backgroundColor: 'rgba(15, 20, 30, 0.5)',
          borderRadius: '12px',
          padding: '12px',
          marginBottom: '20px',
          fontSize: '14px',
          color: theme.text.secondary,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span role="img" aria-label="info">ℹ️</span>
          Minimum payment to start round: <span style={{ color: theme.accent.primary, fontWeight: 'bold' }}>{minPayment} 0G</span>
        </div>
        
        {/* Lock period warning if applicable */}
        {isLockPeriod && (
          <div style={{
            backgroundColor: 'rgba(255, 171, 68, 0.15)',
            borderRadius: '12px',
            padding: '12px',
            marginBottom: '20px',
            fontSize: '14px',
            color: '#FFAB44',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span role="img" aria-label="warning">⚠️</span>
            Buying tickets disabled in final {lockPeriod} seconds of round
          </div>
        )}
        
        <button
          onClick={handleBuyTickets}
          disabled={isPending || amount < minPayment || !isBuyingAllowed}
          style={{
            width: '100%',
            padding: '14px',
            background: isPending || !isBuyingAllowed
              ? 'rgba(100, 100, 100, 0.5)' 
              : `linear-gradient(90deg, ${theme.accent.primary}, ${theme.accent.secondary})`,
            border: 'none',
            borderRadius: '12px',
            color: 'white',
            fontSize: '16px',
            fontWeight: '600',
            cursor: isPending || !isBuyingAllowed ? 'not-allowed' : 'pointer',
            boxShadow: '0 6px 12px rgba(0, 0, 0, 0.2)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
          onMouseEnter={(e) => {
            if (!isPending && isBuyingAllowed) {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.3)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isPending && isBuyingAllowed) {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.2)';
            }
          }}
        >
          <span role="img" aria-label="buy">💰</span> 
          {isPending ? 'Processing...' : (!isBuyingAllowed ? 'Buying Disabled' : 'Buy Tickets')}
        </button>
        
        {/* Display reason why buying is disabled */}
        {(isPending || amount < minPayment || !isBuyingAllowed) && (
          <div style={{
            marginTop: '8px',
            textAlign: 'center',
            fontSize: '12px',
            color: theme.text.secondary
          }}>
            {getBuyingDisabledMessage()}
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyPanel; 