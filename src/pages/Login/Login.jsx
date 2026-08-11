import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Phone, Lock, User, AlertCircle, ArrowRight, CheckCircle2, KeyRound, X } from 'lucide-react';
import Logo from '../../components/Logo';
import api from '../../api/axios';

const Login = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const registeredSuccess = location.state?.registered;

  const [formData, setFormData] = useState({
    mobile_number: location.state?.mobile_number || '',
    password: ''
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot Password State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Verify identity, 2: Reset password
  const [forgotData, setForgotData] = useState({
    mobile_number: '',
    username: '',
    new_password: '',
    confirm_password: ''
  });
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'mobile_number') {
      if (value && !/^\d*$/.test(value)) return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.mobile_number || !formData.password) {
      setErrorMsg("Invalid mobile number or password");
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await api.post('login/', formData);
      if (res.data.access) {
        localStorage.setItem('mypayments_token', res.data.access);
        localStorage.setItem('mypayments_user', JSON.stringify(res.data.user));
        if (onLoginSuccess) onLoginSuccess(res.data.user);
        navigate('/');
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.detail) {
        setErrorMsg(err.response.data.detail);
      } else {
        setErrorMsg("Invalid mobile number or password");
      }
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password Handlers
  const handleForgotChange = (e) => {
    const { name, value } = e.target;
    if (name === 'mobile_number') {
      if (value && !/^\d*$/.test(value)) return;
    }
    setForgotData(prev => ({ ...prev, [name]: value }));
    if (forgotError) setForgotError('');
  };

  const handleVerifyIdentity = async (e) => {
    e.preventDefault();
    if (!forgotData.mobile_number || !forgotData.username) {
      setForgotError("Please enter both registered mobile number and username.");
      return;
    }

    setForgotLoading(true);
    setForgotError('');

    try {
      const res = await api.post('forgot-password/verify/', {
        mobile_number: forgotData.mobile_number,
        username: forgotData.username
      });
      if (res.data.valid) {
        setForgotStep(2);
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.detail) {
        setForgotError(err.response.data.detail);
      } else {
        setForgotError("Mobile number and username do not match our records.");
      }
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!forgotData.new_password || !forgotData.confirm_password) {
      setForgotError("Please enter new password and confirm password.");
      return;
    }
    if (forgotData.new_password !== forgotData.confirm_password) {
      setForgotError("New password and confirm password do not match.");
      return;
    }
    if (forgotData.new_password.length < 6) {
      setForgotError("Password must be at least 6 characters.");
      return;
    }

    setForgotLoading(true);
    setForgotError('');

    try {
      const res = await api.post('forgot-password/reset/', forgotData);
      setForgotSuccess(res.data.message || "Password changed successfully! You can now login.");
      setTimeout(() => {
        setShowForgotModal(false);
        setForgotStep(1);
        setFormData(prev => ({ ...prev, mobile_number: forgotData.mobile_number }));
        setForgotSuccess('');
      }, 2000);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.detail) {
        setForgotError(err.response.data.detail);
      } else {
        setForgotError("Password reset failed. Please check inputs.");
      }
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div style={{ padding: '32px 20px', display: 'flex', flexDirection: 'column', minHeight: '100vh', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ display: 'inline-block', marginBottom: '12px' }}>
          <Logo size="medium" />
        </div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginTop: '12px' }}>
          Welcome Back
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '4px' }}>
          Log in with your mobile number to access your wallet
        </p>
      </div>

      {registeredSuccess && (
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '12px',
            padding: '14px',
            color: '#10b981',
            fontSize: '0.9rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '20px'
          }}
        >
          <CheckCircle2 size={20} style={{ flexShrink: 0 }} />
          <span>Registration successful! Please sign in below.</span>
        </div>
      )}

      <div className="glass-card animate-fade-in" style={{ padding: '24px' }}>
        {errorMsg && (
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
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Mobile Number */}
          <div className="form-group">
            <label className="form-label">Mobile Number</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                name="mobile_number"
                className="form-input"
                placeholder="Enter mobile number"
                value={formData.mobile_number}
                onChange={handleChange}
                maxLength={15}
                style={{ paddingLeft: '42px' }}
              />
              <Phone size={18} color="#64748b" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">Password</label>
              <button
                type="button"
                onClick={() => { setShowForgotModal(true); setForgotStep(1); setForgotError(''); setForgotSuccess(''); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#06b6d4',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Forgot Password?
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                name="password"
                className="form-input"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                style={{ paddingLeft: '42px' }}
              />
              <Lock size={18} color="#64748b" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '12px' }}>
            {loading ? 'Authenticating...' : (
              <>
                Sign In <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </div>

      <p style={{ textAlign: 'center', marginTop: '24px', color: '#94a3b8', fontSize: '0.9rem' }}>
        Don't have an account?{' '}
        <Link to="/register" style={{ color: '#10b981', fontWeight: 700, textDecoration: 'none' }}>
          Create New Account
        </Link>
      </p>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="modal-backdrop animate-fade-in" onClick={() => setShowForgotModal(false)}>
          <div className="modal-content animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <KeyRound size={22} color="#06b6d4" />
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
                  {forgotStep === 1 ? 'Verify Identity' : 'Reset Password'}
                </h2>
              </div>
              <button
                onClick={() => setShowForgotModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {forgotSuccess ? (
              <div style={{ textAlign: 'center', padding: '24px 12px', color: '#10b981' }}>
                <CheckCircle2 size={48} style={{ marginBottom: '12px' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Password Changed!</h3>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>{forgotSuccess}</p>
              </div>
            ) : (
              <>
                {forgotError && (
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
                      marginBottom: '16px'
                    }}
                  >
                    <AlertCircle size={18} style={{ flexShrink: 0 }} />
                    <span>{forgotError}</span>
                  </div>
                )}

                {forgotStep === 1 ? (
                  /* Step 1: Verify Mobile + Username */
                  <form onSubmit={handleVerifyIdentity}>
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '16px' }}>
                      Enter your registered Mobile Number and Username to verify your account identity.
                    </p>

                    <div className="form-group">
                      <label className="form-label">Registered Mobile Number</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="text"
                          name="mobile_number"
                          className="form-input"
                          placeholder="e.g. 9876543210"
                          value={forgotData.mobile_number}
                          onChange={handleForgotChange}
                          maxLength={15}
                          style={{ paddingLeft: '42px' }}
                        />
                        <Phone size={18} color="#64748b" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Username</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="text"
                          name="username"
                          className="form-input"
                          placeholder="e.g. Alex"
                          value={forgotData.username}
                          onChange={handleForgotChange}
                          style={{ paddingLeft: '42px' }}
                        />
                        <User size={18} color="#64748b" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                      </div>
                    </div>

                    <button type="submit" className="btn-primary" disabled={forgotLoading} style={{ marginTop: '12px' }}>
                      {forgotLoading ? 'Verifying...' : 'Verify Details'}
                    </button>
                  </form>
                ) : (
                  /* Step 2: Change Password & Confirm Password */
                  <form onSubmit={handleResetPassword}>
                    <p style={{ fontSize: '0.85rem', color: '#10b981', marginBottom: '16px', fontWeight: 600 }}>
                      ✓ Identity verified for account {forgotData.username} ({forgotData.mobile_number})
                    </p>

                    <div className="form-group">
                      <label className="form-label">New Password</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="password"
                          name="new_password"
                          className="form-input"
                          placeholder="At least 6 characters"
                          value={forgotData.new_password}
                          onChange={handleForgotChange}
                          style={{ paddingLeft: '42px' }}
                        />
                        <Lock size={18} color="#64748b" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Confirm New Password</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="password"
                          name="confirm_password"
                          className="form-input"
                          placeholder="Re-enter new password"
                          value={forgotData.confirm_password}
                          onChange={handleForgotChange}
                          style={{ paddingLeft: '42px' }}
                        />
                        <Lock size={18} color="#64748b" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                      </div>
                    </div>

                    <button type="submit" className="btn-primary" disabled={forgotLoading} style={{ marginTop: '12px' }}>
                      {forgotLoading ? 'Updating Password...' : 'Change Password'}
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
