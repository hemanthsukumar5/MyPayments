import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Smartphone, Building2, Send, CheckCircle2, AlertCircle, ArrowLeft, Users } from 'lucide-react';
import api from '../../api/axios';

const SendMoney = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') === 'bank' ? 'bank' : 'mobile');
  // PIN verification state for transfer
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinVerified, setPinVerified] = useState(false);
  const [pendingTransfer, setPendingTransfer] = useState(null); // store mobileData before PIN


  // Mobile Transfer State
  const [mobileData, setMobileData] = useState({
    receiver_mobile: searchParams.get('to') || '',
    amount: ''
  });

  // Bank Transfer State
  const [bankData, setBankData] = useState({
    account_number: '',
    ifsc_code: '',
    amount: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successResult, setSuccessResult] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [recipientInfo, setRecipientInfo] = useState(null);

  useEffect(() => {
    // Load contacts for quick picker
    api.get('contacts/')
      .then(res => setContacts(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleMobileSubmit = async (e) => {
    e.preventDefault();
    if (!mobileData.receiver_mobile || !mobileData.amount) {
      setError("Please enter receiver mobile number and transfer amount.");
      return;
    }
    // If PIN not verified yet, open PIN modal and store pending data with type
    if (!pinVerified) {
      setPendingTransfer({ ...mobileData, type: 'mobile' });
      setPinModalOpen(true);
      return;
    }
    // PIN already verified, proceed with transfer
    setLoading(true);
    setError('');
    try {
      await transferMobile(mobileData);
      // Reset PIN verification for next transfer
      setPinVerified(false);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Failed to complete mobile transfer. Please check details.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBankSubmit = async (e) => {
    e.preventDefault();
    if (!bankData.account_number || !bankData.ifsc_code || !bankData.amount) {
      setError("Please fill in all bank details and transfer amount.");
      return;
    }
    // Bank transfers also require PIN verification
    if (!pinVerified) {
      setPendingTransfer({ ...bankData, type: 'bank' });
      setPinModalOpen(true);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('send-bank-money/', bankData);
      setSuccessResult({
        type: 'BANK',
        title: 'Bank Transfer Completed Successfully!',
        amount: res.data.amount,
        recipient: `Bank Account ${res.data.account_number} (IFSC: ${bankData.ifsc_code.toUpperCase()})`,
        reference_id: res.data.reference_id,
        new_balance: res.data.sender_balance
      });
      setPinVerified(false);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Failed to complete bank transfer. Check account & IFSC format.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Verify PIN and proceed with pending transfer
  const verifyPinAndProceed = async () => {
    if (pinInput.length !== 4) {
      setError('Enter a valid 4‑digit PIN');
      return;
    }
    try {
      await api.post('verify-pin/', { pin: pinInput });
      setPinVerified(true);
      setPinModalOpen(false);
      setPinInput('');
      
      if (pendingTransfer) {
        setLoading(true);
        try {
          if (pendingTransfer.type === 'bank') {
            await handleBankSubmit({ preventDefault: () => {} });
          } else {
            await transferMobile({
              receiver_mobile: pendingTransfer.receiver_mobile,
              amount: pendingTransfer.amount
            });
          }
        } finally {
          setLoading(false);
          setPendingTransfer(null);
        }
      }
    } catch (err) {
      setError('PIN verification failed');
    }
  };

  // Perform mobile transfer after PIN verification
  const transferMobile = async (transfer) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('send-mobile-money/', {
          receiver_mobile: transfer.receiver_mobile,
          amount: transfer.amount,
        });
        // Show receipt and navigate to history
        setSuccessResult({
          type: 'MOBILE',
          title: 'Money Transferred Successfully!',
          amount: res.data.amount,
          recipient: `${res.data.receiver} (${transfer.receiver_mobile})`,
          reference_id: res.data.reference_id,
          new_balance: res.data.sender_balance,
        });
        // Navigate to Home to see updated balance
        navigate('/');
        // After showing receipt, optionally redirect to transactions page
        // navigate('/transactions'); // uncomment to auto-redirect
        setPinVerified(false);    
    } catch (err) {
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Failed to complete mobile transfer. Please check details.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', paddingBottom: '90px' }} className="animate-fade-in">
      {/* Top Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>Transfer Money</h1>
      </div>
      {/* PIN Modal */}
      {pinModalOpen && (
        <div className="modal-backdrop animate-fade-in" onClick={() => setPinModalOpen(false)}>
          <div className="modal-content animate-slide-up" onClick={e => e.stopPropagation()} style={{ width: '320px' }}>
            <h2 style={{ color: '#fff', marginBottom: '12px', textAlign: 'center' }}>Enter PIN to Transfer</h2>
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
              onClick={verifyPinAndProceed}
              className="btn-primary"
              style={{ marginTop: '12px', width: '100%' }}
            >
              Verify PIN
            </button>
          </div>
        </div>
      )}


      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          background: 'rgba(15, 20, 32, 0.8)',
          padding: '4px',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          marginBottom: '24px'
        }}
      >
        <button
          onClick={() => { setActiveTab('mobile'); setError(''); setSuccessResult(null); }}
          style={{
            flex: 1,
            padding: '12px',
            borderRadius: '12px',
            border: 'none',
            background: activeTab === 'mobile' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'transparent',
            color: activeTab === 'mobile' ? '#fff' : '#94a3b8',
            fontWeight: 700,
            fontSize: '0.88rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.25s ease'
          }}
        >
          <Smartphone size={18} />
          To Mobile
        </button>

        <button
          onClick={() => { setActiveTab('bank'); setError(''); setSuccessResult(null); }}
          style={{
            flex: 1,
            padding: '12px',
            borderRadius: '12px',
            border: 'none',
            background: activeTab === 'bank' ? 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)' : 'transparent',
            color: activeTab === 'bank' ? '#fff' : '#94a3b8',
            fontWeight: 700,
            fontSize: '0.88rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.25s ease'
          }}
        >
          <Building2 size={18} />
          To Bank Account
        </button>
      </div>

      {/* Success Receipt Card */}
      {successResult ? (
        <div
          className="glass-card animate-slide-up"
          style={{
            textAlign: 'center',
            padding: '30px 20px',
            borderColor: 'rgba(16, 185, 129, 0.4)',
            background: 'radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.15) 0%, rgba(22, 28, 46, 0.9) 80%)'
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.2)',
              border: '2px solid #10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              color: '#10b981'
            }}
          >
            <CheckCircle2 size={36} />
          </div>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
            {successResult.title}
          </h2>

          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#10b981', margin: '16px 0' }}>
            ₹{parseFloat(successResult.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>

          <div style={{ background: 'rgba(15, 20, 32, 0.6)', padding: '16px', borderRadius: '14px', textAlign: 'left', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>RECIPIENT</span>
              <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 600 }}>{successResult.recipient}</span>
            </div>
            {recipientInfo && recipientInfo.registered && (
              <div style={{ fontSize: '0.85rem', color: '#10b981', marginTop: '4px' }}>
                {recipientInfo.username} ({recipientInfo.mobile_number})
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>REF TRANSACTION ID</span>
              <span style={{ fontSize: '0.8rem', color: '#06b6d4', fontWeight: 700 }}>{successResult.reference_id}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>UPDATED WALLET BALANCE</span>
              <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 700 }}>
                ₹{parseFloat(successResult.new_balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => { setSuccessResult(null); setMobileData({ receiver_mobile: '', amount: '' }); setBankData({ account_number: '', ifsc_code: '', amount: '' }); }}
              className="btn-secondary"
            >
              Another Transfer
            </button>
            <button onClick={() => navigate('/transactions')} className="btn-primary">
              View History
            </button>
          </div>
        </div>
      ) : (
        /* Transfer Form */
        <div className="glass-card">
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

          {activeTab === 'mobile' ? (
            <form onSubmit={handleMobileSubmit}>
              {/* Receiver Mobile Number */}
              <div className="form-group">
                <label className="form-label">Receiver Mobile Number</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter receiver's 10-digit number"
                  value={mobileData.receiver_mobile}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val && !/^\d*$/.test(val)) return;
                    setMobileData(prev => ({ ...prev, receiver_mobile: val }));
                    // Reset recipient info on change
                    setRecipientInfo(null);
                    // If number length plausible, lookup name
                    if (val.length >= 10) {
                      api.get('lookup-user/', { params: { mobile_number: val } })
                        .then(res => setRecipientInfo(res.data))
                        .catch(() => setRecipientInfo(null));
                    }
                  }}
                  maxLength={15}
                />
              </div>

              {/* Quick Contact Chips */}
              {contacts.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Users size={14} /> Quick Select Saved Contact:
                  </div>
                  <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                    {contacts.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setMobileData(prev => ({ ...prev, receiver_mobile: c.mobile_number }))}
                        style={{
                          background: 'rgba(255, 255, 255, 0.06)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          padding: '6px 12px',
                          borderRadius: '20px',
                          color: '#10b981',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                          cursor: 'pointer'
                        }}
                      >
                        {c.contact_name} ({c.mobile_number.slice(-4)})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Amount */}
              <div className="form-group">
                <label className="form-label">Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  className="form-input"
                  placeholder="e.g. 1000"
                  value={mobileData.amount}
                  onChange={(e) => setMobileData(prev => ({ ...prev, amount: e.target.value }))}
                />
              </div>

              <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '12px' }}>
                {loading ? 'Processing Transfer...' : (
                  <>
                    <Send size={18} /> Send Money to Mobile
                  </>
                )}
              </button>
              {recipientInfo && recipientInfo.registered && (
                <div style={{ marginTop: '8px', fontSize: '0.85rem', color: '#10b981', textAlign: 'center' }}>
                  {recipientInfo.username}
                </div>
              )}
            </form>
          ) : (
            <form onSubmit={handleBankSubmit}>
              {/* Account Number */}
              <div className="form-group">
                <label className="form-label">Bank Account Number</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter Bank Account Number"
                  value={bankData.account_number}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val && !/^\d*$/.test(val)) return;
                    setBankData(prev => ({ ...prev, account_number: val }));
                  }}
                  maxLength={30}
                />
              </div>

              {/* IFSC Code */}
              <div className="form-group">
                <label className="form-label">IFSC Code</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. SBIN0001234"
                  value={bankData.ifsc_code}
                  onChange={(e) => setBankData(prev => ({ ...prev, ifsc_code: e.target.value.toUpperCase() }))}
                  maxLength={20}
                />
              </div>

              {/* Amount */}
              <div className="form-group">
                <label className="form-label">Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  className="form-input"
                  placeholder="e.g. 500"
                  value={bankData.amount}
                  onChange={(e) => setBankData(prev => ({ ...prev, amount: e.target.value }))}
                />
              </div>

              <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '12px' }}>
                {loading ? 'Transferring to Bank...' : (
                  <>
                    <Building2 size={18} /> Send Money to Bank Account
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default SendMoney;
