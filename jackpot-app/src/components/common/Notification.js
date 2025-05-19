import React, { useState, useEffect } from 'react';
import { getChainConfig } from '../../config/envConfig';

const Notification = ({ type, message, txHash, onClose, duration = 5000 }) => {
  const [visible, setVisible] = useState(true);
  const { explorerUrl } = getChainConfig();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        onClose();
      }, 300); // Give time for exit animation
    }, duration);
    
    return () => clearTimeout(timer);
  }, [onClose, duration]);
  
  // Icon based on notification type
  const getIcon = () => {
    switch(type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'info':
        return 'ℹ️';
      case 'warning':
        return '⚠️';
      default:
        return '📣';
    }
  };
  
  // Notification color based on type
  const getBgColor = () => {
    switch(type) {
      case 'success':
        return 'rgba(0, 184, 151, 0.2)';
      case 'error':
        return 'rgba(235, 87, 87, 0.2)';
      case 'info':
        return 'rgba(0, 210, 233, 0.2)';
      case 'warning':
        return 'rgba(255, 171, 68, 0.2)';
      default:
        return 'rgba(0, 210, 233, 0.2)';
    }
  };
  
  const getBorderColor = () => {
    switch(type) {
      case 'success':
        return '#00B897';
      case 'error':
        return '#EB5757';
      case 'info':
        return '#00D2E9';
      case 'warning':
        return '#FFAB44';
      default:
        return '#00D2E9';
    }
  };

  const getIconBgColor = () => {
    switch(type) {
      case 'success':
        return 'rgba(0, 184, 151, 0.3)';
      case 'error':
        return 'rgba(235, 87, 87, 0.3)';
      case 'info':
        return 'rgba(0, 210, 233, 0.3)';
      case 'warning':
        return 'rgba(255, 171, 68, 0.3)';
      default:
        return 'rgba(0, 210, 233, 0.3)';
    }
  };
  
  return (
    <div 
      style={{
        position: 'relative',
        backgroundColor: 'rgba(20, 25, 35, 0.85)',
        backdropFilter: 'blur(10px)',
        padding: '16px',
        borderRadius: '14px',
        marginBottom: '10px',
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.25)',
        opacity: visible ? 1 : 0,
        transform: `translateX(${visible ? 0 : '20px'})`,
        transition: 'opacity 0.3s, transform 0.3s',
        display: 'flex',
        alignItems: 'center',
        maxWidth: '400px',
        border: `1px solid rgba(${getBorderColor().slice(1).match(/.{2}/g).map(hex => parseInt(hex, 16)).join(', ')}, 0.2)`,
        overflow: 'hidden'
      }}
    >
      {/* Colored accent bar */}
      <div 
        style={{ 
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '4px',
          background: getBorderColor(),
          boxShadow: `0 0 10px ${getBorderColor()}`
        }}
      />
      
      <div 
        style={{ 
          marginRight: '14px',
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          backgroundColor: getIconBgColor(),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px'
        }}
      >
        {getIcon()}
      </div>
      
      <div style={{ flex: 1 }}>
        <div style={{ 
          fontSize: '14px', 
          color: 'white',
          fontWeight: '500',
          marginBottom: '6px'
        }}>
          {message}
        </div>
        
        {txHash && (
          <a 
            href={`${explorerUrl}/tx/${txHash}`} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              fontSize: '12px',
              color: getBorderColor(),
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              opacity: 0.85,
              transition: 'opacity 0.2s',
              fontWeight: '500'
            }}
            onMouseEnter={(e) => {
              e.target.style.opacity = '1';
            }}
            onMouseLeave={(e) => {
              e.target.style.opacity = '0.85';
            }}
          >
            View on Explorer
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 17L17 7M17 7H8M17 7V16" stroke={getBorderColor()} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        )}
      </div>
      
      <button
        onClick={() => {
          setVisible(false);
          setTimeout(() => onClose(), 300);
        }}
        style={{
          background: 'none',
          border: 'none',
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '18px',
          cursor: 'pointer',
          padding: '4px',
          marginLeft: '8px',
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          transition: 'background-color 0.2s, color 0.2s'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
          e.target.style.color = 'rgba(255, 255, 255, 0.9)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'transparent';
          e.target.style.color = 'rgba(255, 255, 255, 0.6)';
        }}
      >
        ×
      </button>
    </div>
  );
};

export default Notification; 