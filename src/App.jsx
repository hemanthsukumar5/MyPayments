import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Home from './pages/Home/Home';
import Transactions from './pages/Transactions/Transactions';
import AddBankAccount from './pages/AddBankAccount/AddBankAccount';
import CheckBalance from './pages/CheckBalance/CheckBalance';
import SendMoney from './pages/SendMoney/SendMoney';
import Contacts from './pages/Contacts/Contacts';
import { BalanceProvider } from './context/BalanceContext';

const AppLayout = ({ children, user, onLogout }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>
      <Header user={user} onLogout={onLogout} />
      <main style={{ flex: 1 }}>{children}</main>
      <BottomNav />
    </div>
  );
};

const App = () => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('mypayments_user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogout = () => {
    localStorage.removeItem('mypayments_token');
    localStorage.removeItem('mypayments_user');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <BalanceProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login onLoginSuccess={(u) => setUser(u)} />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout user={user} onLogout={handleLogout}>
                  <Home user={user} />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <AppLayout user={user} onLogout={handleLogout}>
                  <Transactions />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-bank-account"
            element={
              <ProtectedRoute>
                <AppLayout user={user} onLogout={handleLogout}>
                  <AddBankAccount />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/check-balance"
            element={
              <ProtectedRoute>
                <AppLayout user={user} onLogout={handleLogout}>
                  <CheckBalance />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/send-money"
            element={
              <ProtectedRoute>
                <AppLayout user={user} onLogout={handleLogout}>
                  <SendMoney />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/contacts"
            element={
              <ProtectedRoute>
                <AppLayout user={user} onLogout={handleLogout}>
                  <Contacts />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </BalanceProvider>
  );
};

export default App;
