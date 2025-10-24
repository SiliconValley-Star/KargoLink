import React from 'react';

// Tamamen web-native basit App
const AppWebSimple: React.FC = () => {
  return (
    <div style={{
      fontFamily: 'system-ui, -apple-system, sans-serif',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f5f7fa',
      color: '#2d3748',
      padding: '20px',
      textAlign: 'center' as const
    }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: 'bold', 
          color: '#1a202c',
          marginBottom: '10px' 
        }}>
          🚛 CargoLink Mobile
        </h1>
        <p style={{ 
          fontSize: '1.25rem', 
          color: '#718096',
          marginBottom: '30px' 
        }}>
          React Native Web Platform
        </p>
      </div>
      
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        maxWidth: '500px',
        width: '100%'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ color: '#2b6cb0', marginBottom: '15px' }}>
            ✅ Mobile Web App Çalışıyor!
          </h2>
        </div>
        
        <div style={{ textAlign: 'left' as const }}>
          <div style={{ marginBottom: '8px', color: '#38a169' }}>
            ✓ React Native Web Setup
          </div>
          <div style={{ marginBottom: '8px', color: '#38a169' }}>
            ✓ Vite Hot Module Reload
          </div>
          <div style={{ marginBottom: '8px', color: '#38a169' }}>
            ✓ TypeScript Support
          </div>
          <div style={{ marginBottom: '8px', color: '#38a169' }}>
            ✓ Web Platform Compatible
          </div>
        </div>
      </div>
      
      <div style={{ 
        marginTop: '40px',
        fontSize: '0.875rem',
        color: '#a0aec0'
      }}>
        Port 3003 - Development Mode - Hot Reload Active
      </div>
    </div>
  );
};

export default AppWebSimple;