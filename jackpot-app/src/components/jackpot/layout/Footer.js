import React from 'react';
import theme from '../theme/ThemeConfig';

/**
 * Footer component with copyright information
 */
const Footer = () => {
  return (
    <footer style={{
      textAlign: 'center',
      padding: '20px',
      color: theme.text.secondary,
      fontSize: '14px',
      borderTop: '1px solid rgba(60, 75, 95, 0.3)',
      marginTop: '20px',
      backgroundColor: 'rgba(15, 20, 25, 0.6)',
      backdropFilter: 'blur(10px)'
    }}>
      Galileo Jackpot • Galileo Testnet 2025
    </footer>
  );
};

export default Footer; 