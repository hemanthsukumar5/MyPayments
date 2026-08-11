import React from 'react';
import { Wallet } from 'lucide-react';

const Logo = ({ size = 'medium' }) => {
  const isSmall = size === 'small';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: isSmall ? '8px' : '10px' }}>
      <div
        style={{
          width: isSmall ? '32px' : '42px',
          height: isSmall ? '32px' : '42px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
          color: '#ffffff',
          fontWeight: 'bold',
          fontSize: isSmall ? '0.75rem' : '0.9rem'
        }}
      >
        <Wallet size={isSmall ? 18 : 22} color="#ffffff" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span
          style={{
            fontFamily: 'inherit',
            fontWeight: 800,
            fontSize: isSmall ? '1.1rem' : '1.35rem',
            letterSpacing: '-0.5px',
            lineHeight: 1.1,
            color: '#ffffff'
          }}
        >
          My<span style={{ color: '#10b981' }}>Payments</span>
        </span>
        {!isSmall && (
          <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#06b6d4', letterSpacing: '1px', textTransform: 'uppercase' }}>
            Secure Pay
          </span>
        )}
      </div>
    </div>
  );
};

export default Logo;
