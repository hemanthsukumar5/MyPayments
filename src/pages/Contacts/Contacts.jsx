import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, PhoneCall, Send, AlertCircle, CheckCircle2, User } from 'lucide-react';
import api from '../../api/axios';

const Contacts = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ contact_name: '', mobile_number: '' });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchContacts = async () => {
    try {
      const res = await api.get('contacts/');
      setContacts(res.data);
    } catch (err) {
      console.error("Failed to load contacts", err);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'mobile_number') {
      if (value && !/^\d*$/.test(value)) return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
    if (successMsg) setSuccessMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.contact_name.trim()) {
      setError("Contact name is required.");
      return;
    }
    if (!formData.mobile_number || formData.mobile_number.length < 10) {
      setError("Enter a valid 10-15 digit mobile number.");
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('add-contact/', formData);
      setSuccessMsg(`Contact (${formData.contact_name}) saved!`);
      setFormData({ contact_name: '', mobile_number: '' });
      setShowAddForm(false);
      fetchContacts();
    } catch (err) {
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Failed to save contact.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', paddingBottom: '90px' }} className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>Saved Contacts</h1>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Quick transfers to frequent receivers</p>
        </div>

        <button
          onClick={() => { setShowAddForm(!showAddForm); setError(''); setSuccessMsg(''); }}
          style={{
            background: showAddForm ? 'rgba(239, 68, 68, 0.2)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            border: 'none',
            borderRadius: '12px',
            padding: '8px 14px',
            color: '#fff',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Plus size={16} /> {showAddForm ? 'Cancel' : 'New Contact'}
        </button>
      </div>

      {successMsg && (
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '12px',
            padding: '12px',
            color: '#10b981',
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

      {/* Add New Contact Form */}
      {showAddForm && (
        <div className="glass-card animate-slide-up" style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginBottom: '16px' }}>Save Frequent Contact</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Contact Name</label>
              <input
                type="text"
                name="contact_name"
                className="form-input"
                placeholder="e.g. Rahul Sharma"
                value={formData.contact_name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mobile Number</label>
              <input
                type="text"
                name="mobile_number"
                className="form-input"
                placeholder="10-digit mobile number"
                value={formData.mobile_number}
                onChange={handleChange}
                maxLength={15}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '8px' }}>
              {loading ? 'Saving Contact...' : 'Save Contact'}
            </button>
          </form>
        </div>
      )}

      {/* Contacts List */}
      <div>
        {contacts.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '36px 20px', color: '#64748b' }}>
            <Users size={40} color="#64748b" style={{ marginBottom: '12px', opacity: 0.5 }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#94a3b8' }}>No Contacts Saved Yet</h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
              Save your friends' mobile numbers for quick 1-tap money transfers.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {contacts.map((c) => (
              <div
                key={c.id}
                className="glass-card"
                style={{
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                      color: '#fff',
                      fontSize: '1.2rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    {c.contact_name ? c.contact_name.charAt(0).toUpperCase() : 'C'}
                  </div>

                  <div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>{c.contact_name}</div>
                    <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <PhoneCall size={12} color="#06b6d4" /> {c.mobile_number}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/send-money?tab=mobile&to=${c.mobile_number}`)}
                  style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '12px',
                    padding: '8px 14px',
                    color: '#10b981',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Send size={14} /> Send
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Contacts;
