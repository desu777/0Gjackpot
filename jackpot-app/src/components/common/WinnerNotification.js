import React, { useState, useEffect } from 'react';

const WinnerNotification = ({ winner, onClose, duration = 10000 }) => {
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        onClose();
      }, 300); // Give time for exit animation
    }, duration);
    
    return () => clearTimeout(timer);
  }, [onClose, duration]);
  
  return (
    <div 
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: `translate(-50%, -50%) scale(${visible ? 1 : 0})`,
        backgroundColor: 'rgba(15, 20, 30, 0.9)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '30px',
        boxShadow: '0 0 50px rgba(255, 92, 170, 0.5)',
        zIndex: 2000,
        textAlign: 'center',
        border: '2px solid rgba(255, 92, 170, 0.5)',
        maxWidth: '90%',
        width: '500px',
        transition: 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s ease',
        opacity: visible ? 1 : 0,
      }}
    >
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: '18px',
        overflow: 'hidden',
        zIndex: -1,
        opacity: 0.3
      }}>
        {/* Animated background */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(45deg, #00D2E9, #FF5CAA, #00B897, #00D2E9)',
          backgroundSize: '400% 400%',
          animation: 'gradient-animation 3s ease infinite'
        }} />
      </div>
      
      <h2 style={{
        fontSize: '28px',
        fontWeight: 'bold',
        marginBottom: '20px',
        color: '#FFFFFF',
        textShadow: '0 0 10px rgba(255, 92, 170, 0.7)'
      }}>
        🎉 Winner Announcement! 🎉
      </h2>
      
      {/* Winning Wallet Display */}
      <div style={{
        marginBottom: '20px',
        padding: '15px',
        backgroundColor: 'rgba(0, 210, 233, 0.1)',
        borderRadius: '15px',
        border: '1px solid rgba(0, 210, 233, 0.5)'
      }}>
        <div style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '10px' }}>
          Winning Wallet
        </div>
        <div style={{
          fontSize: '22px',
          fontWeight: 'bold',
          color: '#00D2E9',
          wordBreak: 'break-all'
        }}>
          {winner.wallet ? winner.wallet.address : winner.ticket.owner}
          {winner.wallet && winner.wallet.isCurrentUser && (
            <div style={{ fontSize: '16px', marginTop: '5px', color: '#FF5CAA' }}>
              🎉 This is your wallet! 🎉
            </div>
          )}
        </div>
      </div>
      
      {/* Winning Ticket Display */}
      <div style={{
        marginBottom: '20px',
        padding: '15px',
        backgroundColor: 'rgba(255, 92, 170, 0.1)',
        borderRadius: '15px',
        border: '1px solid rgba(255, 92, 170, 0.5)'
      }}>
        <div style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '10px' }}>
          Winning Ticket
        </div>
        <div style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#FF5CAA'
        }}>
          #{winner.ticket.id}
        </div>
      </div>
      
      {/* Prize Amount Display */}
      <div style={{
        marginBottom: '25px',
        padding: '15px',
        backgroundColor: 'rgba(0, 184, 151, 0.1)',
        borderRadius: '15px',
        border: '1px solid rgba(0, 184, 151, 0.5)'
      }}>
        <div style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '10px' }}>
          Prize Amount
        </div>
        <div style={{
          fontSize: '36px',
          fontWeight: 'bold',
          color: '#00B897'
        }}>
          {winner.prize} 0G
        </div>
      </div>
      
      <button
        onClick={() => {
          setVisible(false);
          setTimeout(() => onClose(), 300);
        }}
        style={{
          padding: '12px 24px',
          background: 'linear-gradient(90deg, #00D2E9, #FF5CAA)',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 12px 20px rgba(0, 0, 0, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.2)';
        }}
      >
        Awesome!
      </button>
      
      <style jsx="true">{`
        @keyframes gradient-animation {
          0% { background-position: 0% 50% }
          50% { background-position: 100% 50% }
          100% { background-position: 0% 50% }
        }
      `}</style>
    </div>
  );
};

export default WinnerNotification; 