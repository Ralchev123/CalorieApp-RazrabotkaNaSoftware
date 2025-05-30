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
  const [authToken, setAuthToken] = useState(null); 

  const safeAuthOperation = async (operation, ...args) => {
    try {
      if (!auth) throw new Error('Firebase auth not initialized');
      return await operation(auth, ...args);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const saveAuthToken = async (user) => {
    try {
      if (user) {
        const token = await user.getIdToken();
        localStorage.setItem('authToken', token);
        setAuthToken(token);
        console.log('Auth token saved:', token.substring(0, 20) + '...');
      } else {
        localStorage.removeItem('authToken');
        setAuthToken(null);
        console.log('Auth token removed');
      }
    } catch (error) {
      console.error('Error handling auth token:', error);
    }
  };

  const signup = async (email, password) => {
    const result = await safeAuthOperation(createUserWithEmailAndPassword, email, password);
    await saveAuthToken(result.user);
    return result;
  };

  const login = async (email, password) => {
    const result = await safeAuthOperation(signInWithEmailAndPassword, email, password);
    await saveAuthToken(result.user);
    return result;
  };

  const logout = async () => {
    await saveAuthToken(null);
    return await safeAuthOperation(signOut);
  };

  const getAuthToken = async () => {
    try {
      if (currentUser) {
        const token = await currentUser.getIdToken(true);
        localStorage.setItem('authToken', token);
        setAuthToken(token);
        return token;
      }
      return null;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  };

  useEffect(() => {
    if (!auth) {
      setError('Firebase auth not available');
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth, 
      async (user) => {
        setCurrentUser(user);
        await saveAuthToken(user);
        setLoading(false);
        setError(null);
      }, 
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
      console.log('Auth listener cleaned up');
    };
  }, []);

  const value = {
    currentUser,
    authToken,
    signup,
    login,
    logout,
    getAuthToken,
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