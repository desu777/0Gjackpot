import React, { useState, useEffect } from 'react';
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
  completeRound
}) => {
  // Add confetti state
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ 
    width: typeof window !== 'undefined' ? window.innerWidth : 1000, 
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  });
  
  // Add animation speed state
  const [rotationSpeed, setRotationSpeed] = useState(2);
  const [wheelSegments, setWheelSegments] = useState([]);
  
  // Generate random ticket numbers for the wheel
  useEffect(() => {
    const segments = Array.from({ length: 12 }).map((_, i) => ({
      id: Math.floor(Math.random() * 100) + 1,
      color: i % 2 === 0 ? theme.accent.primary : theme.accent.secondary
    }));
    setWheelSegments(segments);
  }, []);
  
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

  // Control wheel animation speed during drawing
  useEffect(() => {
    if (isDrawing) {
      // Start fast and gradually slow down
      setRotationSpeed(5);
      
      const speedInterval = setInterval(() => {
        setRotationSpeed(prev => {
          const newSpeed = prev - 0.1;
          return newSpeed > 0.5 ? newSpeed : 0.5;
        });
      }, 300);
      
      return () => clearInterval(speedInterval);
    } else {
      setRotationSpeed(2);
    }
  }, [isDrawing]);

  // Import confetti dynamically to avoid SSR issues
  useEffect(() => {
    if (showConfetti) {
      import('react-confetti').then(({ default: ReactConfetti }) => {
        const confettiElement = document.getElementById('confetti-container');
        if (confettiElement && ReactConfetti) {
          const confetti = ReactConfetti({
            width: windowSize.width,
            height: windowSize.height,
            recycle: false,
            numberOfPieces: 500,
            gravity: 0.1,
            colors: ['#00D2E9', '#FF5CAA', '#00B897', '#FFAB44', '#FFFFFF']
          });
          confettiElement.appendChild(confetti);
          
          // Clean up
          return () => {
            if (confettiElement.contains(confetti)) {
              confettiElement.removeChild(confetti);
            }
          };
        }
      });
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
      {/* Confetti container */}
      <div id="confetti-container" style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1000
      }} />
      
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
          boxShadow: `0 0 30px rgba(${theme.accent.primary.slice(1,3)},${theme.accent.primary.slice(3,5)},${theme.accent.primary.slice(5,7)}, 0.15)`,
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
            ? `0 0 30px rgba(${theme.accent.primary.slice(1,3)},${theme.accent.primary.slice(3,5)},${theme.accent.primary.slice(5,7)}, 0.4)` 
            : winner 
              ? `0 0 30px rgba(${theme.accent.secondary.slice(1,3)},${theme.accent.secondary.slice(3,5)},${theme.accent.secondary.slice(5,7)}, 0.4)` 
              : `0 0 30px rgba(${theme.accent.primary.slice(1,3)},${theme.accent.primary.slice(3,5)},${theme.accent.primary.slice(5,7)}, 0.15)`
        }}>
          {/* Drawing wheel animation */}
          {isDrawing ? (
            <div style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              animation: `spin ${rotationSpeed}s infinite linear`
            }}>
              {/* Wheel segments */}
              {wheelSegments.map((segment, i) => (
                <div key={i} style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  transform: `rotate(${i * 30}deg)`,
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
                    fontSize: '14px',
                    fontWeight: 'bold',
                    top: '20px',
                    right: '35%',
                    color: 'white',
                    transform: 'rotate(-90deg)',
                    textShadow: `0 0 5px ${segment.color}`
                  }}>
                    #{segment.id}
                  </div>
                </div>
              ))}
            </div>
          ) : winner ? (
            // Winner display
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
                backgroundColor: winner?.ticket?.isUser ? theme.accent.secondary : 'rgba(60, 75, 95, 0.5)',
                color: 'white',
                padding: '15px 25px',
                borderRadius: '12px',
                fontSize: '24px',
                fontWeight: 'bold',
                boxShadow: `0 0 20px ${winner?.ticket?.isUser ? theme.accent.secondary : 'rgba(60, 75, 95, 0.3)'}`,
                animation: 'scale-in 0.5s ease-out'
              }}>
                #{winner?.ticket?.id}
              </div>
              <div style={{
                color: theme.text.primary,
                marginTop: '15px',
                fontSize: '18px'
              }}>
                Prize: <span style={{ fontWeight: 'bold', color: '#00B897' }}>{winner?.prize} 0G</span>
              </div>
              {winner?.ticket?.isUser && (
                <div style={{
                  marginTop: '15px',
                  color: theme.accent.secondary,
                  fontWeight: 'bold',
                  fontSize: '20px',
                  animation: 'pulse 1.5s infinite'
                }}>
                  🎉 Congratulations! Your ticket won! 🎉
                </div>
              )}
            </div>
          ) : (
            // Countdown display
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
                  <div>Drawing winner automatically...</div>
                  <div style={{
                    display: 'flex',
                    gap: '5px',
                    justifyContent: 'center'
                  }}>
                    <span style={{ animation: 'loading-dot 1.4s infinite ease-in-out' }}>●</span>
                    <span style={{ animation: 'loading-dot 1.4s infinite ease-in-out .2s' }}>●</span>
                    <span style={{ animation: 'loading-dot 1.4s infinite ease-in-out .4s' }}>●</span>
                  </div>
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
      
      {/* Current selected ticket display */}
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
            Ticket #{currentTicket.id}
          </div>
        </div>
      )}
      
      {/* Add CSS animation for confetti */}
      <style jsx="true">{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0% { opacity: 0.7; }
          50% { opacity: 1; }
          100% { opacity: 0.7; }
        }
        
        @keyframes loading-dot {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
};

export default WheelSection; 