import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import api from '../../api/axios';

const CheckBalance = () => {
  const [hasPin, setHasPin] = useState(null); // null = checking, true = has pin, false = needs setup
  const [balance, setBalance] = useState(null);
  
  // Setup PIN state
  const [setupData, setSetupData] = useState({ pin: '', confirm_pin: '' });
  // Verify PIN state
  const [verifyPin, setVerifyPin] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pinVerified, setPinVerified] = useState(false);
  const [showBalance, setShowBalance] = useState(false);

  const checkPinStatus = async () => {
    try {
      const res = await api.get('balance/');
      setHasPin(res.data.has_pin);
      if (!res.data.has_pin && res.data.balance !== null) {
        // If no PIN setup yet, balance might be returned
        setBalance(res.data.balance);
      }
    } catch (err) {
      console.error("Failed to check PIN status", err);
    }
  };

  useEffect(() => {
    checkPinStatus();
  }, []);

  const handleSetupPin = async (e) => {
    e.preventDefault();
    if (!setupData.pin || setupData.pin.length !== 4 || !/^\d{4}$/.test(setupData.pin)) {
      setError("PIN must be a 4-digit numeric code.");
      return;
    }
    if (setupData.pin !== setupData.confirm_pin) {
      setError("PIN confirmation does not match.");
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('setup-pin/', setupData);
      setHasPin(true);
      setError('');
      // Now verify with new PIN automatically
      const verifyRes = await api.post('verify-pin/', { pin: setupData.pin });
      setBalance(verifyRes.data.balance);
      setPinVerified(true);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Failed to setup PIN. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPin = async (e) => {
    e.preventDefault();
    if (!verifyPin || verifyPin.length !== 4 || !/^\d{4}$/.test(verifyPin)) {
      setError("Please enter your 4-digit Security PIN.");
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('verify-pin/', { pin: verifyPin });
      setBalance(res.data.balance);
      setPinVerified(true);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Incorrect Security PIN. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', paddingBottom: '90px' }} className="animate-fade-in">
      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#10b981',
            marginBottom: '12px'
          }}
        >
          <ShieldCheck size={28} />
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>Check Wallet Balance</h1>
        <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>
          Secure 256-bit Encrypted PIN Protection
        </p>
      </div>

      {error && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            padding: '12px',
            color: '#ef4444',
            fontSize: '0.85rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '18px'
          }}
        >
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {hasPin === false ? (
        /* FIRST TIME: Setup Security PIN */
        <div className="glass-card animate-slide-up">
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>Set Up 4-Digit Security PIN</h2>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
              Create a secret PIN to protect balance checks and transfers
            </p>
          </div>

          <form onSubmit={handleSetupPin}>
            <div className="form-group">
              <label className="form-label">Create 4-Digit PIN</label>
              <input
                type="password"
                maxLength={4}
                className="form-input"
                placeholder="• • • •"
                value={setupData.pin}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val && !/^\d*$/.test(val)) return;
                  setSetupData(prev => ({ ...prev, pin: val }));
                }}
                style={{ letterSpacing: '8px', textAlign: 'center', fontSize: '1.2rem', fontWeight: 800 }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm 4-Digit PIN</label>
              <input
                type="password"
                maxLength={4}
                className="form-input"
                placeholder="• • • •"
                value={setupData.confirm_pin}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val && !/^\d*$/.test(val)) return;
                  setSetupData(prev => ({ ...prev, confirm_pin: val }));
                }}
                style={{ letterSpacing: '8px', textAlign: 'center', fontSize: '1.2rem', fontWeight: 800 }}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '12px' }}>
              {loading ? 'Encrypted Saving...' : 'Save & Set PIN'}
            </button>
          </form>
        </div>
      ) : !pinVerified ? (
        /* NEXT TIME: Enter PIN to Reveal */
        <div className="glass-card animate-slide-up">
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>Enter Security PIN</h2>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
              Enter your 4-digit secret PIN to view wallet balance
            </p>
          </div>

          <form onSubmit={handleVerifyPin}>
            <div className="form-group">
              <input
                type="password"
                maxLength={4}
                className="form-input"
                placeholder="• • • •"
                value={verifyPin}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val && !/^\d*$/.test(val)) return;
                  setVerifyPin(val);
                }}
                style={{ letterSpacing: '12px', textAlign: 'center', fontSize: '1.5rem', fontWeight: 800 }}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '12px' }}>
              {loading ? 'Verifying PIN...' : 'Verify & Reveal Balance'}
            </button>
          </form>
        </div>
      ) : (
        /* AFTER CORRECT PIN: Display Current Balance */
        <div
          className="glass-card animate-slide-up"
          style={{
            textAlign: 'center',
            padding: '36px 20px',
            borderColor: 'rgba(16, 185, 129, 0.4)',
            background: 'radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.2) 0%, rgba(22, 28, 46, 0.95) 80%)'
          }}
        >
          <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
            Available Wallet Balance
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', margin: '20px 0' }}>
            <div style={{ fontSize: '2.8rem', fontWeight: 800, color: '#10b981', letterSpacing: '-1px' }}>
              {showBalance
                ? `₹${parseFloat(balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                : '₹ • • • • • •'}
            </div>
            <button
              onClick={() => setShowBalance(!showBalance)}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                color: '#94a3b8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {showBalance ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div style={{ background: 'rgba(15, 20, 32, 0.6)', padding: '12px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#10b981', fontSize: '0.8rem', fontWeight: 700 }}>
            <CheckCircle2 size={16} /> PIN Authenticated Successfully
          </div>

          <div style={{ marginTop: '24px' }}>
            <button
              onClick={() => { setPinVerified(false); setVerifyPin(''); }}
              className="btn-secondary"
            >
              Lock Balance View
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckBalance;
