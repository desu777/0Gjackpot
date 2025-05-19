import React from 'react';

/**
 * Global styles and animations for the Galileo Jackpot UI
 */
const GlobalStyles = () => {
  return (
    <style>
      {`
        @keyframes pulse {
          0% { opacity: 0.8; }
          50% { opacity: 1; }
          100% { opacity: 0.8; }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes rotate {
          0% { background-position: 0% 0%; }
          100% { background-position: 300% 0%; }
        }
        
        .laser-border {
          position: relative;
          border: none !important;
          z-index: 1;
        }
        
        .laser-border::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(90deg, 
            #00D2E9, #FF5CAA, 
            #00D2E9, #FF5CAA, 
            #00D2E9);
          background-size: 300% 100%;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          animation: rotate 3s linear infinite;
          z-index: -1;
        }
        
        /* Fix for scrollbars */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(15, 20, 30, 0.8);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(60, 75, 95, 0.8);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(60, 75, 95, 1);
        }
        
        @media (max-width: 1024px) {
          .responsive-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}
    </style>
  );
};

export default GlobalStyles; 