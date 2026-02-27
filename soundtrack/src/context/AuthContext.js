import React, { createContext, useContext, useState, useEffect } from 'react';
import * as sheetsApi from '../api/sheetsApi';

const AuthContext = createContext(null);

const hashPin = async (pin) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('soundtrack_user');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {
        localStorage.removeItem('soundtrack_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (name, pin) => {
    const pinHash = await hashPin(pin);
    const result = await sheetsApi.verifyPin(name, pinHash);
    if (result && result.success) {
      const userData = { userId: result.userId, name: result.name, birthYear: result.birthYear };
      setUser(userData);
      localStorage.setItem('soundtrack_user', JSON.stringify(userData));
      return { success: true };
    }
    return { success: false, error: result?.error || 'Invalid name or PIN' };
  };

  const signUp = async (name, pin, birthYear) => {
    const pinHash = await hashPin(pin);
    await sheetsApi.createUser(name, pinHash, birthYear);
    // After creation, log them in
    const userData = { userId: name.toLowerCase().replace(/\s+/g, '_'), name, birthYear };
    setUser(userData);
    localStorage.setItem('soundtrack_user', JSON.stringify(userData));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('soundtrack_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signUp, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
