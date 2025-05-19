import React from 'react';
import Header from './Header';
import Footer from './Footer';
import GlobalStyles from '../animations/GlobalStyles';

/**
 * Main layout component that wraps all content
 */
const MainLayout = ({ activeView, setActiveView, mockData, children }) => {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: 'radial-gradient(circle at 50% 50%, rgb(20, 27, 38) 0%, rgb(10, 15, 25) 100%)',
      backgroundAttachment: 'fixed',
      color: 'white',
      fontFamily: "'Inter', -apple-system, system-ui, sans-serif"
    }}>
      {/* Global styles */}
      <GlobalStyles />
      
      {/* Header */}
      <Header 
        activeView={activeView} 
        setActiveView={setActiveView} 
        mockData={mockData} 
      />
      
      {/* Main content */}
      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px'
      }}>
        {children}
      </main>
      
      {/* Particles background */}
      <ParticlesBackground />
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

/**
 * Particles background effect
 */
const ParticlesBackground = () => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: -1,
      overflow: 'hidden',
      opacity: 0.5
    }}>
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: '2px',
            height: '2px',
            backgroundColor: i % 2 === 0 ? '#00D2E9' : '#FF5CAA',
            borderRadius: '50%',
            boxShadow: `0 0 10px ${i % 2 === 0 ? '#00D2E9' : '#FF5CAA'}`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            opacity: Math.random() * 0.5 + 0.3,
            animation: `pulse ${Math.random() * 4 + 2}s infinite`
          }}
        />
      ))}
    </div>
  );
};

export default MainLayout; 