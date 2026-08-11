import React from 'react';
import { User, Phone, ShieldCheck, LogOut, X, CreditCard } from 'lucide-react';

const Profile = ({ user, onClose, onLogout }) => {
  if (!user) return null;

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose}>
      <div className="modal-content animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>Account Profile</h2>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* User avatar header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            background: 'rgba(255, 255, 255, 0.04)',
            padding: '16px',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            marginBottom: '20px'
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '1.4rem',
              fontWeight: 800
            }}
          >
            {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>{user.username}</h3>
            <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 600 }}>Active Verified User</span>
          </div>
        </div>

        {/* Account Details list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(15, 20, 32, 0.6)', borderRadius: '12px' }}>
            <Phone size={18} color="#06b6d4" />
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>REGISTERED MOBILE</div>
              <div style={{ fontSize: '0.95rem', color: '#f8fafc', fontWeight: 600 }}>{user.mobile_number}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(15, 20, 32, 0.6)', borderRadius: '12px' }}>
            <CreditCard size={18} color="#10b981" />
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>WALLET ID</div>
              <div style={{ fontSize: '0.95rem', color: '#f8fafc', fontWeight: 600 }}>MYPAY-WLT-{user.id || '1001'}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(15, 20, 32, 0.6)', borderRadius: '12px' }}>
            <ShieldCheck size={18} color="#8b5cf6" />
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>SECURITY PIN STATUS</div>
              <div style={{ fontSize: '0.95rem', color: user.has_pin ? '#10b981' : '#f59e0b', fontWeight: 600 }}>
                {user.has_pin ? '🔒 4-Digit Security PIN Active' : '⚠️ PIN Not Setup Yet'}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="btn-secondary"
          style={{
            borderColor: 'rgba(239, 68, 68, 0.3)',
            color: '#ef4444',
            background: 'rgba(239, 68, 68, 0.1)'
          }}
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;
