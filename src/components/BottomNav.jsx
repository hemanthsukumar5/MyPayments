import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, History, Building2, ShieldCheck, Users } from 'lucide-react';

const BottomNav = () => {
  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/transactions', label: 'History', icon: History },
    { path: '/add-bank-account', label: 'Add Bank', icon: Building2 },
    { path: '/check-balance', label: 'Balance', icon: ShieldCheck },
    { path: '/contacts', label: 'Contacts', icon: Users },
  ];

  return (
    <nav
      style={{
        position: 'sticky',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'rgba(15, 20, 32, 0.92)',
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        justify: 'space-around',
        alignItems: 'center',
        padding: '10px 8px 12px 8px',
        zIndex: 90
      }}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              color: isActive ? '#10b981' : '#64748b',
              fontSize: '0.72rem',
              fontWeight: isActive ? 700 : 500,
              gap: '4px',
              transition: 'all 0.2s ease',
              flex: 1
            })}
          >
            {({ isActive }) => (
              <>
                <div
                  style={{
                    padding: '4px 12px',
                    borderRadius: '16px',
                    background: isActive ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Icon size={20} color={isActive ? '#10b981' : '#64748b'} />
                </div>
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
};

export default BottomNav;
