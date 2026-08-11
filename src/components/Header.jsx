import React, { useState, useEffect } from 'react';
import { User, Bell, CheckCircle2, X } from 'lucide-react';
import Logo from './Logo';
import Profile from './Profile';
import api from '../api/axios';

const Header = ({ user, onLogout }) => {
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('notifications/');
      setNotifications(res.data);
      setUnreadCount(res.data.filter(n => !n.is_read).length);
    } catch (err) {
      console.error("Failed to load notifications", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleOpenNotifications = async () => {
    setShowNotifications(true);
    if (unreadCount > 0) {
      try {
        await api.post('notifications/mark-read/');
        setUnreadCount(0);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          background: 'rgba(15, 20, 32, 0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}
      >
        {/* Left Side: Profile Icon */}
        <button
          onClick={() => setShowProfile(true)}
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#10b981',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          title="Open Profile"
        >
          <User size={20} />
        </button>

        {/* Center: Logo */}
        <Logo size="small" />

        {/* Right Side: Notification Bell */}
        <button
          onClick={handleOpenNotifications}
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#f8fafc',
            cursor: 'pointer',
            position: 'relative'
          }}
          title="Notifications"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                background: '#ef4444',
                color: '#fff',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                fontSize: '0.65rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 10px rgba(239, 68, 68, 0.8)'
              }}
            >
              {unreadCount}
            </span>
          )}
        </button>
      </header>

      {/* Profile Modal */}
      {showProfile && (
        <Profile
          user={user}
          onClose={() => setShowProfile(false)}
          onLogout={onLogout}
        />
      )}

      {/* Notification Drawer Modal */}
      {showNotifications && (
        <div className="modal-backdrop animate-fade-in" onClick={() => setShowNotifications(false)}>
          <div className="modal-content animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>Notifications</h3>
              <button
                onClick={() => setShowNotifications(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {notifications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: '#64748b' }}>
                No notifications yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '350px', overflowY: 'auto' }}>
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '12px',
                      borderRadius: '12px',
                      background: n.is_read ? 'rgba(15, 20, 32, 0.5)' : 'rgba(16, 185, 129, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.06)'
                    }}
                  >
                    <CheckCircle2 size={18} color="#10b981" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '0.85rem', color: '#f8fafc', lineHeight: 1.4 }}>{n.message}</p>
                      <span style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                        {new Date(n.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
