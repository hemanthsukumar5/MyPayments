import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Smartphone, Building2, ShieldCheck, Users, ArrowUpRight, ArrowDownLeft, Plus, ChevronRight, Wallet } from 'lucide-react';
import api from '../../api/axios';
import { useBalance } from '../../context/BalanceContext';
import Header from '../../components/Header';

const Home = ({ user }) => {
  const navigate = useNavigate();
  const { profile, loading, refreshBalance } = useBalance();

  // Simple logout handler – clears auth token and redirects to login
  const handleLogout = async () => {
    try {
      // Assuming JWT is stored in localStorage under 'access'
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      navigate('/login');
    } catch (e) {
      console.error('Logout failed', e);
    }
  };
  const [recentTransactions, setRecentTransactions] = useState([]);
  // PIN verification state for revealing balance
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinVerified, setPinVerified] = useState(false);
  const [showBalance, setShowBalance] = useState(false);


  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const txnRes = await api.get('transactions/');
        setRecentTransactions(txnRes.data.slice(0, 4));
      } catch (err) {
        console.error('Failed to load recent transactions', err);
      }
    };
    fetchTransactions();
  }, []);

  return (
    <>
      {/* <Header user={profile} onLogout={handleLogout} /> */}
      <div style={{ padding: '20px', paddingBottom: '90px' }} className="animate-fade-in">
      {/* Hello, {username} Banner */}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>WELCOME BACK</span>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.5px' }}>
            Hello, <span style={{ color: '#10b981' }}>{profile?.username || 'User'}</span> 👋
          </h1>
        </div>

        <div
          style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            padding: '6px 12px',
            borderRadius: '20px',
            color: '#10b981',
            fontSize: '0.75rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <ShieldCheck size={14} /> Verified Account
        </div>
      </div>

      {/* Main Balance Banner Card */}
      <div
        className="glass-card"
        style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(6, 182, 212, 0.15) 50%, rgba(15, 20, 32, 0.8) 100%)',
          borderColor: 'rgba(16, 185, 129, 0.3)',
          marginBottom: '24px',
          padding: '24px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              MyPayments Wallet Balance
            </div>
            {/* Show Balance Button */}
            <button
              onClick={() => setPinModalOpen(true)}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                padding: '8px 14px',
                color: '#fff',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginTop: '12px'
              }}
            >
              <ShieldCheck size={16} color="#10b981" /> Show Balance
            </button>
            {/* Balance Display (after PIN verification) */}
            {pinVerified && (
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff', marginTop: '8px' }}>
                ₹{profile?.wallet_balance ? parseFloat(profile.wallet_balance).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
              </div>
            )}
          </div>
        </div>
        {/* PIN Modal */}
        {pinModalOpen && (
          <div className="modal-backdrop animate-fade-in" onClick={() => setPinModalOpen(false)}>
            <div className="modal-content animate-slide-up" onClick={e => e.stopPropagation()} style={{ width: '320px' }}>
              <h2 style={{ color: '#fff', marginBottom: '12px', textAlign: 'center' }}>Enter PIN to View Balance</h2>
              <input
                type="password"
                maxLength={4}
                placeholder="4‑digit PIN"
                value={pinInput}
                onChange={e => {
                  const val = e.target.value;
                  if (/^\d*$/.test(val)) setPinInput(val);
                }}
                style={{ width: '100%', padding: '10px', fontSize: '1.2rem', letterSpacing: '8px', textAlign: 'center' }}
              />
              <button
                onClick={async () => {
                  if (pinInput.length !== 4) { alert('Enter 4‑digit PIN'); return; }
                  try {
                    const res = await api.post('verify-pin/', { pin: pinInput });
                    setPinVerified(true);
                    setShowBalance(true);
                    setPinModalOpen(false);
                    setPinInput('');
                  } catch (err) {
                    alert('PIN verification failed');
                  }
                }}
                className="btn-primary"
                style={{ marginTop: '12px', width: '100%' }}
              >
                Verify PIN
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Transfer Section (Large Card) */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#94a3b8', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Main Transfer Section
        </h2>

        <div className="glass-card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Wallet size={20} color="#10b981" />
            Transfer Money
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {/* Option 1: Send Money to Mobile Number */}
            <div
              onClick={() => navigate('/send-money?tab=mobile')}
              className="glass-card-interactive"
              style={{
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: '16px',
                padding: '16px',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)'
                }}
              >
                <Smartphone size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>To Mobile</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>Send to Mobile Number</div>
              </div>
            </div>

            {/* Option 2: Send Money to Bank Account Number */}
            <div
              onClick={() => navigate('/send-money?tab=bank')}
              className="glass-card-interactive"
              style={{
                background: 'rgba(6, 182, 212, 0.08)',
                border: '1px solid rgba(6, 182, 212, 0.2)',
                borderRadius: '16px',
                padding: '16px',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  boxShadow: '0 4px 14px rgba(6, 182, 212, 0.3)'
                }}
              >
                <Building2 size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>To Bank</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>Send to Bank Account</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Services Grid */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#94a3b8', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Banking & Services
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          <div
            onClick={() => navigate('/add-bank-account')}
            className="glass-card-interactive"
            style={{
              padding: '16px 12px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'rgba(139, 92, 246, 0.15)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#8b5cf6'
              }}
            >
              <Plus size={20} />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f8fafc' }}>Add Bank</span>
          </div>

          <div
            onClick={() => navigate('/check-balance')}
            className="glass-card-interactive"
            style={{
              padding: '16px 12px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981'
              }}
            >
              <ShieldCheck size={20} />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f8fafc' }}>Check PIN</span>
          </div>

          <div
            onClick={() => navigate('/contacts')}
            className="glass-card-interactive"
            style={{
              padding: '16px 12px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'rgba(6, 182, 212, 0.15)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#06b6d4'
              }}
            >
              <Users size={20} />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f8fafc' }}>Contacts</span>
          </div>
        </div>
      </div>

      {/* Recent Transactions List */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Recent Activity
          </h2>
          <button
            onClick={() => navigate('/transactions')}
            style={{
              background: 'none',
              border: 'none',
              color: '#10b981',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '2px'
            }}
          >
            View All <ChevronRight size={16} />
          </button>
        </div>

        <div className="glass-card" style={{ padding: '12px' }}>
          {recentTransactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 12px', color: '#64748b', fontSize: '0.88rem' }}>
              No transactions yet. Start by sending money above!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {recentTransactions.map((t) => (
                <div
                  key={t.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    borderRadius: '12px',
                    background: 'rgba(15, 20, 32, 0.6)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: t.is_sender ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                        color: t.is_sender ? '#ef4444' : '#10b981',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {t.is_sender ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>
                        {t.is_sender
                          ? (t.receiver_username || 'External Bank')
                          : (t.sender_username || 'Received Money')}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        {new Date(t.date_time).toLocaleDateString()} • {t.transaction_type.replace('_', ' ')}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: t.is_sender ? '#ef4444' : '#10b981' }}>
                      {t.is_sender ? '-' : '+'}₹{parseFloat(t.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <span style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: 700 }}>{t.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>

    </>
)};

export default Home;
