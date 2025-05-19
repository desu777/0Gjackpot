import React from 'react';
import theme from '../theme/ThemeConfig';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useEffect } from 'react';

/**
 * Landing page view for when the wallet is not connected
 */
const LandingView = ({ setActiveView }) => {
  const { isConnected } = useAccount();
  
  // If wallet is connected, change view to connected
  useEffect(() => {
    if (isConnected) {
      setActiveView('connected');
    }
  }, [isConnected, setActiveView]);

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
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 0 20px 2px ${theme.accent.primary}`,
          border: `2px solid ${theme.accent.primary}`,
          animation: 'pulse 2s infinite'
        }}>
          <div style={{
            width: '100%',
            height: '100%',
            backgroundImage: 'linear-gradient(135deg, #00D2E9, #FF5CAA)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '42px'
          }}>
            🎰
          </div>
        </div>
      </div>
      
      <h2 style={{ 
        fontSize: '24px', 
        fontWeight: '600',
        color: theme.text.primary,
        marginBottom: '16px',
        background: `linear-gradient(90deg, ${theme.accent.primary}, ${theme.accent.secondary})`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}>
        Welcome to Galileo Jackpot!
      </h2>
      
      <p style={{ 
        color: theme.text.secondary, 
        marginBottom: '24px',
        fontSize: '16px',
        lineHeight: '1.5'
      }}>
        Connect your wallet to start playing. Buy tickets for just 0.01 0G each
        and participate in the draw for the entire prize pool!
      </p>
      
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <ConnectButton.Custom>
          {({
            account,
            chain,
            openAccountModal,
            openChainModal,
            openConnectModal,
            mounted,
          }) => {
            return (
              <div
                {...(!mounted && {
                  'aria-hidden': true,
                  'style': {
                    opacity: 0,
                    pointerEvents: 'none',
                    userSelect: 'none',
                  },
                })}
              >
                {(() => {
                  if (!mounted || !account || !chain) {
                    return (
                      <button 
                        onClick={openConnectModal}
                        style={{
                          background: `linear-gradient(90deg, ${theme.accent.primary}, ${theme.accent.secondary})`,
                          color: 'white',
                          border: 'none',
                          borderRadius: '12px',
                          padding: '14px 32px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '16px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
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
                        Connect Wallet
                      </button>
                    );
                  }
                  return null;
                })()}
              </div>
            );
          }}
        </ConnectButton.Custom>
      </div>
    </div>
  );
};

export default LandingView; 