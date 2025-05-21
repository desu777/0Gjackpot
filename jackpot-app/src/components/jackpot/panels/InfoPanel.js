import React from 'react';
import theme from '../theme/ThemeConfig';

/**
 * Panel displaying round information and statistics
 */
const InfoPanel = ({ mockData, mockTickets, isRefreshing, ticketOwners, shortenAddress }) => {
  // Log received props for debugging
  console.log('InfoPanel props:', { 
    mockData, 
    mockTickets: mockTickets?.length || 0, 
    isRefreshing,
    ticketOwners: Object.keys(ticketOwners || {}).length 
  });
  
  // Generate a unique list of wallet addresses participating in this round
  const generateUniqueAddresses = () => {
    if (!ticketOwners || Object.keys(ticketOwners).length === 0) {
      return [];
    }
    
    // Get unique wallet addresses
    const uniqueAddresses = [...new Set(Object.values(ticketOwners))];
    return uniqueAddresses.map(address => ({
      address,
      formatted: shortenAddress(address),
      isUser: mockData.account && address.toLowerCase() === mockData.account.toLowerCase(),
      ticketCount: Object.values(ticketOwners).filter(owner => owner === address).length
    }));
  };
  
  const uniqueAddresses = generateUniqueAddresses();
  
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
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px'
      }}>
        <h3 style={{ 
          fontSize: '20px', 
          fontWeight: '600',
          color: theme.text.primary,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          margin: 0
        }}>
          <span role="img" aria-label="trophy">🏆</span> Round #{mockData.roundId}
        </h3>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          {/* Data refresh indicator */}
          {isRefreshing && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: theme.text.secondary,
              fontSize: '14px'
            }}>
              <div 
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  borderTop: `2px solid ${theme.accent.primary}`,
                  borderRight: `2px solid transparent`,
                  animation: 'spin 0.8s linear infinite'
                }}
              />
              <span>Refreshing</span>
            </div>
          )}
          
          <div style={{
            padding: '6px 12px',
            backgroundColor: 'rgba(0, 210, 233, 0.15)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '14px',
            fontWeight: '500',
            color: theme.accent.primary
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: theme.accent.primary,
              animation: 'pulse 1.5s infinite'
            }} />
            Active
          </div>
        </div>
      </div>
      
      {/* Add keyframe animation for the spinner and refresh effects */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes pulse {
            0% { opacity: 0.4; }
            50% { opacity: 1; }
            100% { opacity: 0.4; }
          }
          
          @keyframes refreshPulse {
            0% { opacity: 0.6; }
            50% { opacity: 1; }
            100% { opacity: 0.6; }
          }
        `}
      </style>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '16px',
        marginBottom: '20px'
      }}>
        <div style={{
          backgroundColor: 'rgba(15, 20, 30, 0.5)',
          borderRadius: '12px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Pool refresh indicator */}
          {isRefreshing && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '2px',
              background: `linear-gradient(90deg, ${theme.accent.primary}, ${theme.accent.secondary})`,
              animation: 'refreshPulse 1s infinite'
            }} />
          )}
          
          <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', marginBottom: '8px' }}>
            Current Pool
          </div>
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            background: `linear-gradient(90deg, ${theme.accent.primary}, ${theme.accent.secondary})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            transition: 'all 0.3s ease' // Smooth transition for changing values
          }}>
            {mockData.totalPool} 0G
          </div>
          <div style={{ fontSize: '10px', color: theme.text.secondary, marginTop: '4px' }}>
            Last update: {new Date().toLocaleTimeString()}
          </div>
        </div>
        
        <div style={{
          backgroundColor: 'rgba(15, 20, 30, 0.5)',
          borderRadius: '12px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', marginBottom: '8px' }}>
            All Tickets
          </div>
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            background: `linear-gradient(90deg, ${theme.accent.primary}, ${theme.accent.secondary})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            {mockData.numTickets}
          </div>
        </div>
        
        <div style={{
          backgroundColor: 'rgba(15, 20, 30, 0.5)',
          borderRadius: '12px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', marginBottom: '8px' }}>
            Your Tickets
          </div>
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            background: `linear-gradient(90deg, ${theme.accent.primary}, ${theme.accent.secondary})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            {mockData.userTickets}
          </div>
        </div>
        
        <div style={{
          backgroundColor: 'rgba(15, 20, 30, 0.5)',
          borderRadius: '12px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', marginBottom: '8px' }}>
            Win Chance
          </div>
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#00B897'
          }}>
            {mockData.winChance}%
          </div>
        </div>
      </div>
      
      {/* Win chance progress bar */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{
          width: '100%',
          height: '10px',
          backgroundColor: 'rgba(15, 20, 30, 0.8)',
          borderRadius: '5px',
          overflow: 'hidden',
          marginTop: '10px'
        }}>
          <div style={{
            width: `${mockData.winChance}%`,
            height: '100%',
            backgroundImage: `linear-gradient(90deg, ${theme.accent.primary}, ${theme.accent.secondary})`,
            borderRadius: '5px',
            transition: 'width 1s ease'
          }} />
        </div>
      </div>
      
      {/* Ticket grid - Updated to show wallet addresses */}
      <div style={{ marginTop: '24px' }}>
        <h4 style={{ 
          fontSize: '16px', 
          fontWeight: '600',
          color: theme.text.primary,
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span>Players ({uniqueAddresses.length})</span>
          <span style={{ 
            fontSize: '14px', 
            fontWeight: 'normal',
            color: theme.text.secondary
          }}>
            Total Tickets: {mockData.numTickets}
          </span>
        </h4>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          maxHeight: '250px',
          overflowY: 'auto',
          padding: '4px'
        }}>
          {uniqueAddresses.length > 0 ? (
            // Render wallet addresses when available
            uniqueAddresses.map((player) => (
              <div
                key={player.address}
                style={{
                  backgroundColor: player.isUser 
                    ? `rgba(255, 92, 170, 0.1)` 
                    : 'rgba(15, 20, 30, 0.8)',
                  border: `1px solid ${player.isUser 
                    ? theme.accent.secondary 
                    : 'rgba(60, 75, 95, 0.5)'}`,
                  borderRadius: '8px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  color: theme.text.primary,
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = player.isUser 
                    ? `0 6px 12px rgba(255, 92, 170, 0.1)` 
                    : '0 6px 12px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: player.isUser ? theme.accent.secondary : theme.accent.primary,
                    opacity: 0.2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    color: player.isUser ? theme.accent.secondary : theme.accent.primary,
                    fontWeight: 'bold'
                  }}>
                    {player.formatted.charAt(0)}
                  </div>
                  <span style={{
                    color: player.isUser ? theme.accent.secondary : theme.text.primary,
                    fontWeight: player.isUser ? 'bold' : 'normal',
                  }}>
                    {player.formatted} {player.isUser && '(You)'}
                  </span>
                </div>
                
                <div style={{
                  backgroundColor: 'rgba(15, 20, 30, 0.6)',
                  borderRadius: '12px',
                  padding: '4px 10px',
                  fontSize: '12px',
                  color: player.isUser ? theme.accent.secondary : theme.text.secondary
                }}>
                  {player.ticketCount} {player.ticketCount === 1 ? 'ticket' : 'tickets'}
                </div>
              </div>
            ))
          ) : (
            // Show message when no tickets
            <div style={{
              padding: '20px',
              borderRadius: '8px',
              backgroundColor: 'rgba(15, 20, 30, 0.8)',
              color: theme.text.secondary,
              fontSize: '14px',
              textAlign: 'center'
            }}>
              No players yet. Buy some tickets to join the round!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InfoPanel; 