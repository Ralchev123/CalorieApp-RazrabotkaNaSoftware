import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const safeAuthOperation = async (operation, ...args) => {
    try {
      if (!auth) throw new Error('Firebase auth not initialized');
      return await operation(auth, ...args);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const signup = (email, password) => 
    safeAuthOperation(createUserWithEmailAndPassword, email, password);

  const login = (email, password) => 
    safeAuthOperation(signInWithEmailAndPassword, email, password);

  const logout = () => safeAuthOperation(signOut);

  useEffect(() => {
    if (!auth) {
      setError('Firebase auth not available');
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
      setError(null);
    }, (err) => {
      setError(err.message);
      setLoading(false);
    });

    return () => {
      unsubscribe();
      console.log('Auth listener cleaned up');
    };
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    loading,
    error
  };

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h2>Auth Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Reload App</button>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
