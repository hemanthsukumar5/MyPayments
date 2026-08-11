import React, { useState, useEffect } from 'react';
import { Building2, Plus, CheckCircle2, AlertCircle, Shield, CreditCard } from 'lucide-react';
import api from '../../api/axios';

const AddBankAccount = () => {
  const [formData, setFormData] = useState({
    account_holder_name: '',
    bank_name: '',
    account_number: '',
    ifsc_code: ''
  });

  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchBankAccounts = async () => {
    try {
      const res = await api.get('bank-accounts/');
      setBankAccounts(res.data);
    } catch (err) {
      console.error("Failed to load bank accounts", err);
    }
  };

  useEffect(() => {
    fetchBankAccounts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'account_number') {
      if (value && !/^\d*$/.test(value)) return;
    }
    if (name === 'ifsc_code') {
      setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (error) setError('');
    if (successMsg) setSuccessMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.account_holder_name.trim()) {
      setError("Account holder name is required.");
      return;
    }
    if (!formData.bank_name.trim()) {
      setError("Bank name is required.");
      return;
    }
    if (!formData.account_number) {
      setError("Account number is required.");
      return;
    }
    if (!formData.ifsc_code) {
      setError("IFSC Code is required.");
      return;
    }

    // Client IFSC Regex check: 4 letters, 0, 6 alphanumerics
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscRegex.test(formData.ifsc_code)) {
      setError("Invalid IFSC format. Example: SBIN0001234 or HDFC0001234");
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('add-bank-account/', formData);
      setSuccessMsg(`Bank account (${formData.bank_name}) added successfully!`);
      setFormData({
        account_holder_name: '',
        bank_name: '',
        account_number: '',
        ifsc_code: ''
      });
      fetchBankAccounts();
    } catch (err) {
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Failed to add bank account. Ensure account number is unique.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', paddingBottom: '90px' }} className="animate-fade-in">
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>Add Bank Account</h1>
        <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Link your bank details for direct transfers</p>
      </div>

      {successMsg && (
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '12px',
            padding: '12px',
            color: '#415e40ff',
            fontSize: '0.85rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px'
          }}
        >
          <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
          <span>{successMsg}</span>
        </div>
      )}

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
            marginBottom: '16px'
          }}
        >
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* Add Bank Form Card */}
      <div className="glass-card" style={{ marginBottom: '24px' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Account Holder Name</label>
            <input
              type="text"
              name="account_holder_name"
              className="form-input"
              placeholder="Full name as per bank records"
              value={formData.account_holder_name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Bank Name</label>
            <input
              type="text"
              name="bank_name"
              className="form-input"
              placeholder="e.g. State Bank of India, HDFC Bank"
              value={formData.bank_name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Account Number</label>
            <input
              type="text"
              name="account_number"
              className="form-input"
              placeholder="11 to 16 digit account number"
              value={formData.account_number}
              onChange={handleChange}
              maxLength={30}
            />
          </div>

          <div className="form-group">
            <label className="form-label">IFSC Code</label>
            <input
              type="text"
              name="ifsc_code"
              className="form-input"
              placeholder="e.g. SBIN0001234"
              value={formData.ifsc_code}
              onChange={handleChange}
              maxLength={20}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '12px' }}>
            {loading ? 'Saving Bank Account...' : (
              <>
                <Plus size={18} /> Link Bank Account
              </>
            )}
          </button>
        </form>
      </div>

      {/* Existing Linked Bank Accounts List */}
      <div>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#94a3b8', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Linked Bank Accounts ({bankAccounts.length})
        </h2>

        {bankAccounts.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
            No bank accounts linked yet. Use the form above to add your bank details.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {bankAccounts.map((acc) => (
              <div
                key={acc.id}
                className="glass-card"
                style={{
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(22, 28, 46, 0.7) 100%)',
                  borderColor: 'rgba(6, 182, 212, 0.2)'
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Building2 size={24} />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>{acc.bank_name}</div>
                  <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '2px' }}>
                    Acc: •••• {acc.account_number.slice(-4)} | IFSC: {acc.ifsc_code}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                    Holder: {acc.account_holder_name}
                  </div>
                </div>

                <Shield size={18} color="#10b981" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddBankAccount;
