import React, { useState, useEffect } from 'react';
import { History, ArrowUpRight, ArrowDownLeft, Search, Filter, RefreshCw } from 'lucide-react';
import api from '../../api/axios';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('ALL'); // ALL, SENT, RECEIVED
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await api.get('transactions/');
      setTransactions(res.data);
    } catch (err) {
      console.error("Error loading transactions", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const filteredTransactions = transactions.filter(t => {
    const matchesFilter =
      filter === 'ALL' ? true :
      filter === 'SENT' ? t.is_sender :
      !t.is_sender;

    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !term ||
      (t.reference_id && t.reference_id.toLowerCase().includes(term)) ||
      (t.sender_username && t.sender_username.toLowerCase().includes(term)) ||
      (t.receiver_username && t.receiver_username.toLowerCase().includes(term)) ||
      (t.recipient_account_number && t.recipient_account_number.includes(term));

    return matchesFilter && matchesSearch;
  });

  return (
    <div style={{ padding: '20px', paddingBottom: '90px' }} className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>Transaction History</h1>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>View all sent and received payments</p>
        </div>

        <button
          onClick={fetchTransactions}
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            color: '#10b981',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Refresh"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {['ALL', 'SENT', 'RECEIVED'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '12px',
              border: 'none',
              background: filter === f ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              color: filter === f ? '#10b981' : '#94a3b8',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
              border: filter === f ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid transparent'
            }}
          >
            {f === 'ALL' ? 'All Transactions' : f === 'SENT' ? 'Sent Money' : 'Received Money'}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <input
          type="text"
          className="form-input"
          placeholder="Search by name, ref ID, or account..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ paddingLeft: '40px' }}
        />
        <Search size={18} color="#64748b" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
      </div>

      {/* Transactions List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 10px', color: '#94a3b8' }}>
          Loading transaction records...
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
          <History size={40} color="#64748b" style={{ marginBottom: '12px', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#94a3b8' }}>No Transactions Found</h3>
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
            {searchTerm ? 'Try adjusting your search criteria.' : 'Transactions will appear here once you send or receive money.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredTransactions.map((t) => {
            const dateObj = new Date(t.date_time);
            const dateStr = dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
            const timeStr = dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

            return (
              <div
                key={t.id}
                className="glass-card"
                style={{
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '12px',
                        background: t.is_sender ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                        border: t.is_sender ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
                        color: t.is_sender ? '#ef4444' : '#10b981',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {t.is_sender ? <ArrowUpRight size={22} /> : <ArrowDownLeft size={22} />}
                    </div>

                    <div>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>
                        {t.is_sender
                          ? `To: ${t.receiver_username || t.recipient_account_number || 'External Bank'}`
                          : `From: ${t.sender_username || 'Sender'}`}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                        {t.transaction_type === 'MOBILE_TRANSFER' ? '📱 Mobile Transfer' : '🏦 Bank Transfer'}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: t.is_sender ? '#ef4444' : '#10b981' }}>
                      {t.is_sender ? '-' : '+'}₹{parseFloat(t.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <span
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '10px',
                        background: t.is_sender ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                        color: t.is_sender ? '#ef4444' : '#10b981',
                        display: 'inline-block',
                        marginTop: '4px',
                        marginRight: '4px',
                      }}
                    >
                      {t.is_sender ? 'SENT' : 'RECEIVED'}
                    </span>
                    <span
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '10px',
                        background: t.status === 'SUCCESS' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        color: t.status === 'SUCCESS' ? '#10b981' : '#ef4444',
                        display: 'inline-block',
                        marginTop: '4px'
                      }}
                    >
                      {t.status}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justify: 'space-between',
                    paddingTop: '10px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                    fontSize: '0.72rem',
                    color: '#64748b'
                  }}
                >
                  <span>REF: <span style={{ color: '#06b6d4' }}>{t.reference_id}</span></span>
                  <span>{dateStr} • {timeStr}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Transactions;
