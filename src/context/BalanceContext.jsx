import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const BalanceContext = createContext();

export const BalanceProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await api.get('profile/');
      setProfile(res.data);
    } catch (err) {
      console.error('Failed to fetch profile', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const refreshBalance = async () => {
    setLoading(true);
    await fetchProfile();
  };

  return (
    <BalanceContext.Provider value={{ profile, loading, refreshBalance }}>
      {children}
    </BalanceContext.Provider>
  );
};

export const useBalance = () => useContext(BalanceContext);
