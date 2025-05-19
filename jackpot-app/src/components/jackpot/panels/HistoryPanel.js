import React from 'react';
import theme from '../theme/ThemeConfig';

/**
 * Panel to display round history and past winners
 */
const HistoryPanel = ({ mockData }) => {
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
        <span role="img" aria-label="history">📜</span> Round History
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {mockData.roundHistory.map((round, index) => (
          <div
            key={index}
            style={{
              backgroundColor: 'rgba(15, 20, 30, 0.8)',
              borderRadius: '12px',
              padding: '16px',
              border: round.winner.includes(mockData.account.substring(0, 8)) 
                ? `1px solid ${theme.accent.secondary}` 
                : '1px solid rgba(60, 75, 95, 0.5)',
              boxShadow: round.winner.includes(mockData.account.substring(0, 8)) 
                ? `0 0 15px rgba(255, 92, 170, 0.2)` 
                : 'none'
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px',
              alignItems: 'center'
            }}>
              <div style={{ fontWeight: '600', color: theme.text.primary }}>
                Round #{round.id}
              </div>
              <div style={{ fontSize: '14px', color: theme.text.secondary }}>
                {round.date}
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '14px', color: theme.text.secondary, marginBottom: '4px' }}>
                  Ticket #{round.winningTicket} • {round.winner}
                </div>
                {round.winner.includes(mockData.account.substring(0, 8)) && (
                  <div style={{
                    fontSize: '12px',
                    color: theme.accent.secondary,
                    fontWeight: '500'
                  }}>
                    🎉 Your win!
                  </div>
                )}
              </div>
              
              <div style={{
                fontWeight: 'bold',
                color: '#00B897',
                fontSize: '16px'
              }}>
                {round.prize} 0G
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryPanel; 