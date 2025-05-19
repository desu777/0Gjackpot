import React, { useState, useEffect } from 'react';
import Notification from './Notification';

const NotificationContainer = ({ notifications, removeNotification }) => {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column-reverse',
        gap: '10px',
        maxWidth: '400px',
        pointerEvents: 'none'
      }}
    >
      {notifications.map((notification) => (
        <div 
          key={notification.id}
          style={{
            pointerEvents: 'auto',
            animation: 'slide-in-right 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) both'
          }}
        >
          <Notification
            type={notification.type}
            message={notification.message}
            txHash={notification.txHash}
            onClose={() => removeNotification(notification.id)}
            duration={notification.duration || 5000}
          />
        </div>
      ))}

      <style>
        {`
          @keyframes slide-in-right {
            0% {
              transform: translateX(100px);
              opacity: 0;
            }
            100% {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
};

export default NotificationContainer; 