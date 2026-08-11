import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Phone, Lock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import Logo from '../../components/Logo';
import api from '../../api/axios';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    mobile_number: '',
    password: '',
    confirm_password: ''
  });

  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // For username, allow only letters and spaces
    if (name === 'username') {
      if (value && !/^[a-zA-Z\s]*$/.test(value)) return;
    }
    // For mobile_number, allow only numbers
    if (name === 'mobile_number') {
      if (value && !/^\d*$/.test(value)) return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (generalError) setGeneralError('');
  };

  const validate = () => {
    const errs = {};
    const trimmedUsername = formData.username.trim();

    if (!trimmedUsername) {
      errs.username = 'Username is required';
    } else if (trimmedUsername.length < 3) {
      errs.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(trimmedUsername)) {
      errs.username = 'Username must contain only letters';
    }

    if (!formData.mobile_number) {
      errs.mobile_number = 'Mobile number is required';
    } else if (formData.mobile_number.length < 10 || formData.mobile_number.length > 15) {
      errs.mobile_number = 'Mobile number must be between 10 and 15 digits';
    }

    if (!formData.password) {
      errs.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirm_password) {
      errs.confirm_password = 'Confirm Password is required';
    } else if (formData.password !== formData.confirm_password) {
      errs.confirm_password = 'Confirm password must match password';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setGeneralError('');

    try {
      const payload = {
        username: formData.username.trim(),
        mobile_number: formData.mobile_number.trim(),
        password: formData.password,
        confirm_password: formData.confirm_password
      };
      const res = await api.post('register/', payload);
      if (res.data.access || res.status === 201) {
        // Navigate to login with registered mobile number pre-filled
        navigate('/login', {
          state: {
            registered: true,
            mobile_number: payload.mobile_number,
            username: payload.username
          }
        });
      }
    } catch (err) {
      if (err.response && err.response.data) {
        const data = err.response.data;
        if (data.detail) {
          setGeneralError(data.detail);
        } else if (data.errors) {
          setErrors(data.errors);
        } else {
          setGeneralError('Registration failed. Please check inputs.');
        }
      } else {
        setGeneralError('Server unreachable. Please check backend connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '32px 20px', display: 'flex', flexDirection: 'column', minHeight: '100vh', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ display: 'inline-block', marginBottom: '12px' }}>
          <Logo size="medium" />
        </div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginTop: '12px' }}>
          Create your Account
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '4px' }}>
          Join MyPayments for instant mobile & bank money transfers
        </p>
      </div>

      <div className="glass-card animate-fade-in" style={{ padding: '24px' }}>
        {generalError && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.12)',
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
            <span>{generalError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Username (Letters Only) */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">Username</label>
              <span style={{ fontSize: '0.7rem', color: '#06b6d4', fontWeight: 600 }}>Letters only</span>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                name="username"
                className="form-input"
                placeholder="e.g. Alex Johnson (Letters only)"
                value={formData.username}
                onChange={handleChange}
                style={{ paddingLeft: '42px' }}
              />
              <User size={18} color="#64748b" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
            {errors.username && (
              <span className="form-error">
                <AlertCircle size={14} /> {Array.isArray(errors.username) ? errors.username[0] : errors.username}
              </span>
            )}
          </div>

          {/* Mobile Number */}
          <div className="form-group">
            <label className="form-label">Mobile Number</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                name="mobile_number"
                className="form-input"
                placeholder="10-digit mobile number"
                value={formData.mobile_number}
                onChange={handleChange}
                maxLength={15}
                style={{ paddingLeft: '42px' }}
              />
              <Phone size={18} color="#64748b" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
            {errors.mobile_number && (
              <span className="form-error">
                <AlertCircle size={14} /> {Array.isArray(errors.mobile_number) ? errors.mobile_number[0] : errors.mobile_number}
              </span>
            )}
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                name="password"
                className="form-input"
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleChange}
                style={{ paddingLeft: '42px' }}
              />
              <Lock size={18} color="#64748b" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
            {errors.password && (
              <span className="form-error">
                <AlertCircle size={14} /> {Array.isArray(errors.password) ? errors.password[0] : errors.password}
              </span>
            )}
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                name="confirm_password"
                className="form-input"
                placeholder="Re-enter password"
                value={formData.confirm_password}
                onChange={handleChange}
                style={{ paddingLeft: '42px' }}
              />
              <Lock size={18} color="#64748b" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
            {errors.confirm_password && (
              <span className="form-error">
                <AlertCircle size={14} /> {Array.isArray(errors.confirm_password) ? errors.confirm_password[0] : errors.confirm_password}
              </span>
            )}
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '8px' }}>
            {loading ? 'Creating Account...' : (
              <>
                Register Now <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </div>

      <p style={{ textAlign: 'center', marginTop: '24px', color: '#94a3b8', fontSize: '0.9rem' }}>
        Already registered?{' '}
        <Link to="/login" style={{ color: '#10b981', fontWeight: 700, textDecoration: 'none' }}>
          Login to MyPayments
        </Link>
      </p>
    </div>
  );
};

export default Register;
