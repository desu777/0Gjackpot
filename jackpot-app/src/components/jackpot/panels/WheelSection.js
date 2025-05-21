import React, { useState, useEffect, useMemo } from 'react';
import theme from '../theme/ThemeConfig';

/**
 * Wheel section component for the drawing animation
 */
const WheelSection = ({ 
  showWheel, 
  timeLeft,
  isDrawing,
  currentTicket,
  winner,
  formatTime,
  startDrawing,
  completeRound,
  participatingWallets = [], // Replace mockTickets with participatingWallets
  isLoadingWallets = false // Add loading state for wallets
}) => {
  // Add confetti state
  const [showConfetti, setShowConfetti] = useState(false);
  const [confetti, setConfetti] = useState(null);
  const [windowSize, setWindowSize] = useState({ 
    width: typeof window !== 'undefined' ? window.innerWidth : 1000, 
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  });
  
  // Add animation speed state
  const [rotationSpeed, setRotationSpeed] = useState(2);
  const [wheelRotation, setWheelRotation] = useState(0);
  
  // Create wheel segments from participating wallets
  const [wheelSegments, setWheelSegments] = useState([]);
  
  // Create wheel segments when wallets change
  useEffect(() => {
    if (!participatingWallets?.length) return;

    const segments = participatingWallets.map((wallet, i) => ({
      address: wallet.address,
      shortAddress: wallet.shortAddress,
      ticketCount: wallet.ticketCount,
      winChance: wallet.winChance,
      isCurrentUser: wallet.isCurrentUser,
      color: wallet.isCurrentUser ? theme.accent.secondary : (i % 2 === 0 ? theme.accent.primary : '#00B897')
    }));
    setWheelSegments(segments);
  }, [participatingWallets]);
  
  // Update window size when component mounts
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ 
        width: window.innerWidth, 
        height: window.innerHeight 
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Show confetti when winner is determined
  useEffect(() => {
    if (winner) {
      setShowConfetti(true);
      
      // Hide confetti after 8 seconds
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 8000);
      
      return () => clearTimeout(timer);
    } else {
      setShowConfetti(false);
    }
  }, [winner]);

  // Help animation to stop on the winner wallet
  useEffect(() => {
    if (!winner || !wheelSegments.length) return;

    // Find the winning wallet segment
    const idx = wheelSegments.findIndex(s => s.address.toLowerCase() === winner.wallet.address.toLowerCase());
    if (idx === -1) return;

    const rotations = 5;            // full rotations
    const degPerSegment = 360 / wheelSegments.length;
    const targetDeg = rotations * 360 + idx * degPerSegment;

    // Apply CSS transition
    const wheel = document.getElementById('wheel-spinning');
    if (wheel) {
      wheel.style.transition = 'transform 4s cubic-bezier(0.25,0.1,0.25,1)';
      wheel.style.transform = `rotate(${targetDeg}deg)`;
    }
  }, [winner, wheelSegments]);

  // Import confetti dynamically to avoid SSR issues
  useEffect(() => {
    if (showConfetti) {
      const loadConfetti = async () => {
        try {
          const ReactConfetti = (await import('react-confetti')).default;
          setConfetti(<ReactConfetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={false}
            numberOfPieces={500}
            gravity={0.1}
            colors={['#00D2E9', '#FF5CAA', '#00B897', '#FFAB44', '#FFFFFF']}
          />);
        } catch (error) {
          console.error('Failed to load confetti:', error);
        }
      };
      
      loadConfetti();
    } else {
      setConfetti(null);
    }
  }, [showConfetti, windowSize]);

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
      {/* Render confetti as a React component */}
      {confetti}
      
      {/* Glow effect for winner state */}
      {winner && (
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(circle at 50% 50%, rgba(255, 92, 170, 0.2), transparent 70%)`,
            zIndex: 0,
            animation: 'pulse-glow 2s infinite ease-in-out'
          }}
        />
      )}
      
      <h3 style={{ 
        fontSize: '20px', 
        fontWeight: '600',
        color: theme.text.primary,
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        position: 'relative',
        zIndex: 1
      }}>
        <span role="img" aria-label="wheel">🎡</span> Live Drawing
      </h3>
      
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '20px',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          position: 'relative',
          boxShadow: `0 0 30px rgba(${parseInt(theme.accent.primary.slice(1,3), 16)}, ${parseInt(theme.accent.primary.slice(3,5), 16)}, ${parseInt(theme.accent.primary.slice(5,7), 16)}, 0.15)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          background: 'rgba(15, 20, 30, 0.8)',
          border: isDrawing 
            ? `2px solid ${theme.accent.primary}` 
            : winner 
              ? `2px solid ${theme.accent.secondary}` 
              : `1px solid rgba(60, 75, 95, 0.5)`,
          transition: 'box-shadow 0.3s ease, border 0.3s ease',
          boxShadow: isDrawing 
            ? `0 0 30px rgba(${parseInt(theme.accent.primary.slice(1,3), 16)}, ${parseInt(theme.accent.primary.slice(3,5), 16)}, ${parseInt(theme.accent.primary.slice(5,7), 16)}, 0.4)` 
            : winner 
              ? `0 0 30px rgba(${parseInt(theme.accent.secondary.slice(1,3), 16)}, ${parseInt(theme.accent.secondary.slice(3,5), 16)}, ${parseInt(theme.accent.secondary.slice(5,7), 16)}, 0.4)` 
              : `0 0 30px rgba(${parseInt(theme.accent.primary.slice(1,3), 16)}, ${parseInt(theme.accent.primary.slice(3,5), 16)}, ${parseInt(theme.accent.primary.slice(5,7), 16)}, 0.15)`
        }}>
          {/* Drawing wheel animation */}
          {isDrawing ? (
            <div 
              id="wheel-spinning"
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%'
              }}
            >
              {/* Wallet-based wheel segments */}
              {wheelSegments.map((segment, i) => (
                <div key={i} style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  transform: `rotate(${i * (360 / wheelSegments.length)}deg)`,
                  transformOrigin: 'center',
                  zIndex: 1
                }}>
                  <div style={{
                    position: 'absolute',
                    width: '50%',
                    height: '2px',
                    right: '0',
                    top: '50%',
                    backgroundColor: segment.color,
                    boxShadow: `0 0 8px ${segment.color}`
                  }} />
                  <div style={{
                    position: 'absolute',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    top: '20px',
                    right: '28%',
                    color: 'white',
                    transform: 'rotate(-90deg)',
                    textShadow: `0 0 5px ${segment.color}`
                  }}>
                    <div>{segment.shortAddress}</div>
                    <div style={{ fontSize: '10px', opacity: 0.8 }}>
                      {segment.ticketCount} ticket{segment.ticketCount !== 1 ? 's' : ''}
                    </div>
                    <div style={{ fontSize: '9px' }}>
                      {segment.winChance}% chance
                    </div>
                    {segment.isCurrentUser && (
                      <div style={{ fontSize: '9px', color: '#FF5CAA', fontWeight: 'bold' }}>
                        YOU
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : winner ? (
            // Winner display - updated for wallet display
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'fade-in 0.5s ease-in'
            }}>
              <div style={{
                background: `linear-gradient(135deg, ${theme.accent.primary}, ${theme.accent.secondary})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '24px',
                fontWeight: 'bold',
                marginBottom: '15px',
                textShadow: '0 0 10px rgba(255, 255, 255, 0.3)'
              }}>
                Winner!
              </div>
              <div style={{
                backgroundColor: winner?.wallet?.isCurrentUser ? theme.accent.secondary : 'rgba(60, 75, 95, 0.5)',
                color: 'white',
                padding: '15px 25px',
                borderRadius: '12px',
                fontSize: '20px',
                fontWeight: 'bold',
                boxShadow: `0 0 20px ${winner?.wallet?.isCurrentUser ? theme.accent.secondary : 'rgba(60, 75, 95, 0.3)'}`,
                animation: 'scale-in 0.5s ease-out',
                textAlign: 'center'
              }}>
                {winner?.wallet?.shortAddress}
                <div style={{ fontSize: '14px', marginTop: '5px' }}>
                  Ticket #{winner?.ticket?.id}
                </div>
              </div>
              <div style={{
                color: theme.text.primary,
                marginTop: '15px',
                fontSize: '18px'
              }}>
                Prize: <span style={{ fontWeight: 'bold', color: '#00B897' }}>{winner?.prize} 0G</span>
              </div>
              {winner?.wallet?.isCurrentUser && (
                <div style={{
                  marginTop: '15px',
                  color: theme.accent.secondary,
                  fontWeight: 'bold',
                  fontSize: '20px',
                  animation: 'pulse 1.5s infinite'
                }}>
                  🎉 Congratulations! You won! 🎉
                </div>
              )}
            </div>
          ) : (
            // Countdown display - updated to show loading state for wallets
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{
                color: theme.text.secondary,
                fontSize: '18px',
                marginBottom: '10px'
              }}>
                Drawing in
              </div>
              <div style={{
                fontSize: '36px',
                fontWeight: 'bold',
                background: `linear-gradient(135deg, ${theme.accent.primary}, ${theme.accent.secondary})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '20px',
                animation: timeLeft <= 10 ? 'pulse 1s infinite' : 'none'
              }}>
                {formatTime(timeLeft)}
              </div>
              {timeLeft === 0 && !isDrawing && !winner ? (
                <div style={{
                  background: `linear-gradient(90deg, ${theme.accent.primary}, ${theme.accent.secondary})`,
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 20px',
                  textAlign: 'center',
                  fontWeight: '600',
                  fontSize: '16px',
                  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
                  animation: 'pulse 1.5s infinite',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  {isLoadingWallets ? (
                    <>
                      <div>Preparing drawing...</div>
                      <div style={{
                        display: 'flex',
                        gap: '5px',
                        justifyContent: 'center'
                      }}>
                        <span style={{ animation: 'loading-dot 1.4s infinite ease-in-out' }}>●</span>
                        <span style={{ animation: 'loading-dot 1.4s infinite ease-in-out .2s' }}>●</span>
                        <span style={{ animation: 'loading-dot 1.4s infinite ease-in-out .4s' }}>●</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>Drawing winner...</div>
                      <div style={{
                        display: 'flex',
                        gap: '5px',
                        justifyContent: 'center'
                      }}>
                        <span style={{ animation: 'loading-dot 1.4s infinite ease-in-out' }}>●</span>
                        <span style={{ animation: 'loading-dot 1.4s infinite ease-in-out .2s' }}>●</span>
                        <span style={{ animation: 'loading-dot 1.4s infinite ease-in-out .4s' }}>●</span>
                      </div>
                    </>
                  )}
                </div>
              ) : timeLeft > 0 ? (
                <div style={{
                  color: theme.text.secondary,
                  fontSize: '14px'
                }}>
                  Winner will be drawn automatically
                </div>
              ) : null}
            </div>
          )}
          
          {/* Marker */}
          <div style={{
            position: 'absolute',
            top: '0',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '0',
            height: '0',
            borderLeft: '15px solid transparent',
            borderRight: '15px solid transparent',
            borderTop: '25px solid red',
            zIndex: 10
          }} />
        </div>
      </div>
      
      {/* Current selected wallet display */}
      {isDrawing && currentTicket && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: '15px'
        }}>
          <div style={{
            backgroundColor: 'rgba(15, 20, 30, 0.8)',
            padding: '10px 20px',
            borderRadius: '12px',
            border: `1px solid ${currentTicket.isUser ? theme.accent.secondary : 'rgba(60, 75, 95, 0.5)'}`,
            color: 'white',
            fontSize: '18px',
            fontWeight: 'bold',
            animation: 'pulse 0.5s infinite'
          }}>
            {currentTicket.shortAddress || currentTicket.owner}
            {currentTicket.isUser && <span style={{ marginLeft: '5px', color: '#FF5CAA' }}>(YOU)</span>}
            {currentTicket.ticketCount && (
              <span style={{ marginLeft: '10px', fontSize: '14px', opacity: 0.8 }}>
                {currentTicket.ticketCount} ticket{currentTicket.ticketCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      )}
      
      {/* Add CSS animation for confetti */}
      <style jsx="true">{`
        @keyframes pulse {
          0% { opacity: 0.7; }
          50% { opacity: 1; }
          100% { opacity: 0.7; }
        }
        
        @keyframes loading-dot {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1.2); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes scale-in {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default WheelSection; 