import React from 'react';
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
        <span role="img" aria-label="wheel">🎡</span> Live Drawing
      </h3>
      
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '20px'
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
          border: `1px solid rgba(60, 75, 95, 0.5)`
        }}>
          {/* Drawing wheel animation */}
          {isDrawing ? (
            <div style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              animation: 'spin 2s infinite linear'
            }}>
              {/* Wheel segments */}
              {Array.from({ length: 12 }).map((_, i) => (
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
                    backgroundColor: i % 2 === 0 ? theme.accent.primary : theme.accent.secondary,
                    boxShadow: `0 0 8px ${i % 2 === 0 ? theme.accent.primary : theme.accent.secondary}`
                  }} />
                  <div style={{
                    position: 'absolute',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    top: '20px',
                    right: '35%',
                    color: 'white',
                    transform: 'rotate(-90deg)'
                  }}>
                    #{Math.floor(Math.random() * 100) + 1}
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
              justifyContent: 'center'
            }}>
              <div style={{
                background: `linear-gradient(135deg, ${theme.accent.primary}, ${theme.accent.secondary})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '24px',
                fontWeight: 'bold',
                marginBottom: '15px'
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
                boxShadow: `0 0 20px ${winner?.ticket?.isUser ? theme.accent.secondary : 'rgba(60, 75, 95, 0.3)'}`
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
                marginBottom: '20px'
              }}>
                {formatTime(timeLeft)}
              </div>
              <button 
                onClick={() => {
                  // Najpierw wywołujemy funkcję completeRound
                  completeRound();
                  // Po wywołaniu funkcji completeRound, możemy pokazać animację
                  // Animacja zostanie uruchomiona z opóźnieniem, aby dać czas na zakończenie transakcji
                  setTimeout(() => {
                    startDrawing();
                  }, 2000);
                }}
                style={{
                  background: `linear-gradient(90deg, ${theme.accent.primary}, ${theme.accent.secondary})`,
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 20px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '16px',
                  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
                  opacity: timeLeft > 0 ? 0.7 : 1,
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease'
                }}
                disabled={timeLeft > 0}
                onMouseEnter={(e) => {
                  if (timeLeft === 0) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 12px 20px rgba(0, 0, 0, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.2)';
                }}
              >
                {timeLeft > 0 ? "Wait..." : "Start Drawing"}
              </button>
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
    </div>
  );
};

export default WheelSection; 