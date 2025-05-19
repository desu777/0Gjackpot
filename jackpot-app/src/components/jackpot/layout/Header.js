import React from 'react';
import theme from '../theme/ThemeConfig';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useDisconnect } from 'wagmi';
import { useEffect } from 'react';

/**
 * Header component with wallet connection button
 */
const Header = ({ activeView, setActiveView, mockData }) => {
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();

  // If wallet gets disconnected, return to landing page
  useEffect(() => {
    if (!isConnected && activeView !== 'landing') {
      setActiveView('landing');
    }
  }, [isConnected, activeView, setActiveView]);

  return (
    <header style={{
      backgroundColor: 'rgba(15, 20, 25, 0.6)',
      backdropFilter: 'blur(10px)',
      padding: '16px 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
      borderBottom: '1px solid rgba(60, 75, 95, 0.3)'
    }}>
      <div style={{
        fontSize: '24px',
        fontWeight: 'bold',
        background: `linear-gradient(90deg, ${theme.accent.primary}, ${theme.accent.secondary})`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <span role="img" aria-label="logo" style={{ fontSize: '28px' }}>🎰</span>
        Galileo Jackpot
      </div>
      
      {activeView !== 'landing' && isConnected && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
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
                  style={{
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center'
                  }}
                >
                  {(() => {
                    if (mounted && account && chain) {
                      const isCorrectChain = chain.id === 16601;

                      return (
                        <>
                          <div
                            onClick={openChainModal}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '8px 12px',
                              borderRadius: '12px',
                              backgroundColor: isCorrectChain 
                                ? 'rgba(46, 204, 113, 0.1)' 
                                : 'rgba(235, 87, 87, 0.1)',
                              border: isCorrectChain 
                                ? '1px solid rgba(46, 204, 113, 0.5)' 
                                : '1px solid rgba(235, 87, 87, 0.5)',
                              color: isCorrectChain 
                                ? 'rgb(46, 204, 113)' 
                                : 'rgb(235, 87, 87)',
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontWeight: '500',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            {isCorrectChain ? (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ fontSize: '10px', marginRight: '2px' }}>●</span>
                                {chain.name}
                              </span>
                            ) : (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ fontSize: '10px', marginRight: '2px' }}>●</span>
                                Switch to 0G Network
                              </span>
                            )}
                          </div>
                        
                          <div
                            onClick={openAccountModal}
                            className="laser-border"
                            style={{
                              padding: '8px 12px',
                              borderRadius: '12px',
                              backgroundColor: 'rgba(15, 20, 30, 0.8)',
                              color: theme.text.primary,
                              fontSize: '14px',
                              fontWeight: '500',
                              border: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            {account.displayName}
                          </div>
                          
                          <button
                            onClick={() => {
                              disconnect();
                              setActiveView('landing');
                            }}
                            style={{
                              padding: '8px 12px',
                              backgroundColor: 'rgba(229, 62, 62, 0.1)',
                              border: '1px solid rgba(229, 62, 62, 0.5)',
                              borderRadius: '12px',
                              color: 'rgb(229, 62, 62)',
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontWeight: '500',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = 'rgba(229, 62, 62, 0.2)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = 'rgba(229, 62, 62, 0.1)';
                            }}
                          >
                            Disconnect
                          </button>
                        </>
                      );
                    }
                    return null;
                  })()}
                </div>
              );
            }}
          </ConnectButton.Custom>
        </div>
      )}
    </header>
  );
};

export default Header; 