import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { signInWithGoogle, firebaseSignOut, onFirebaseAuthStateChanged, getCurrentUserIdToken } from '../lib/firebase';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Set up axios interceptor for auth header
const setupAxiosAuth = (authToken) => {
  if (authToken) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const logout = useCallback(async () => {
    try {
      // Sign out from Firebase
      await firebaseSignOut();
      // Sign out from backend
      await axios.post(`${API}/auth/logout`, {}, { withCredentials: true });
    } catch (e) {
      // Ignore logout errors
    }
    localStorage.removeItem('token');
    setupAxiosAuth(null);
    setToken(null);
    setUser(null);
  }, []);

  const checkAuth = useCallback(async () => {
    // First try session cookie (for Google auth) via /auth/me
    try {
      const response = await axios.get(`${API}/auth/me`, { withCredentials: true });
      setUser(response.data);
      setLoading(false);
      return;
    } catch (e) {
      // Cookie auth failed, try JWT token
    }

    // Try JWT token from localStorage
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setupAxiosAuth(savedToken);
      try {
        const response = await axios.get(`${API}/auth/me`);
        setUser(response.data);
      } catch (error) {
        logout();
      }
    }
    setLoading(false);
  }, [logout]);

  // Initial auth check on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onFirebaseAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser && !user) {
        // User signed in via Firebase, sync with backend if needed
        try {
          const idToken = await getCurrentUserIdToken();
          if (idToken) {
            const response = await axios.post(`${API}/auth/firebase/verify`, { id_token: idToken });
            const { access_token, user: userData } = response.data;
            localStorage.setItem('token', access_token);
            setupAxiosAuth(access_token);
            setToken(access_token);
            setUser(userData);
          }
        } catch (error) {
          console.error('Firebase sync error:', error);
        }
      }
    });
    return () => unsubscribe();
  }, [user]);

  const login = async (email, password) => {
    const response = await axios.post(`${API}/auth/login`, { email, password });
    const { access_token, user: userData } = response.data;
    localStorage.setItem('token', access_token);
    setupAxiosAuth(access_token);
    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const register = async (name, email, password) => {
    const response = await axios.post(`${API}/auth/register`, { name, email, password });
    const { access_token, user: userData } = response.data;
    localStorage.setItem('token', access_token);
    setupAxiosAuth(access_token);
    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const googleLogin = async () => {
    try {
      // Use Firebase Google Auth
      const { user: firebaseUser, idToken } = await signInWithGoogle();
      
      // Verify with backend and get JWT token
      const response = await axios.post(`${API}/auth/firebase/verify`, { id_token: idToken });
      const { access_token, user: userData } = response.data;
      
      localStorage.setItem('token', access_token);
      setupAxiosAuth(access_token);
      setToken(access_token);
      setUser(userData);
      
      return userData;
    } catch (error) {
      console.error('Google login error:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        return { error: 'cancelled', message: 'Sign-in cancelled' };
      }
      throw error;
    }
  };

  const facebookLogin = async () => {
    return { error: 'coming_soon', message: 'Facebook login coming soon!' };
  };

  const linkedinLogin = async () => {
    return { error: 'coming_soon', message: 'LinkedIn login coming soon!' };
  };

  const instagramLogin = async () => {
    return { error: 'coming_soon', message: 'Instagram login coming soon!' };
  };

  const processGoogleCallback = async (sessionId) => {
    // Process the session_id from OAuth callback
    try {
      const response = await axios.post(
        `${API}/auth/google/session`, 
        { session_id: sessionId },
        { withCredentials: true }
      );
      
      const { access_token, user: userData } = response.data;
      
      // Store JWT token
      if (access_token) {
        localStorage.setItem('token', access_token);
        setupAxiosAuth(access_token);
        setToken(access_token);
      }
      
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('OAuth callback error:', error);
      throw error;
    }
  };

  const processSocialCallback = async (provider, code) => {
    // Process the authorization code from social OAuth callback
    try {
      const redirectUrl = window.location.origin + '/auth/callback';
      const response = await axios.post(
        `${API}/auth/${provider}/callback`, 
        { code, redirect_uri: redirectUrl },
        { withCredentials: true }
      );
      
      const { access_token, user: userData } = response.data;
      
      // Store JWT token
      if (access_token) {
        localStorage.setItem('token', access_token);
        setupAxiosAuth(access_token);
        setToken(access_token);
      }
      
      setUser(userData);
      return userData;
    } catch (error) {
      console.error(`${provider} auth callback error:`, error);
      throw error;
    }
  };

  const updateProfile = async (profileData) => {
    // Get token from state or localStorage
    const authToken = token || localStorage.getItem('token');
    
    if (!authToken) {
      throw new Error('Not authenticated');
    }
    
    const response = await axios.put(`${API}/auth/profile`, profileData, { 
      withCredentials: true,
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}` 
      }
    });
    setUser(prev => ({ ...prev, profile: response.data.profile }));
    return response.data;
  };

  const refreshUser = async () => {
    try {
      const response = await axios.get(`${API}/auth/me`, { withCredentials: true });
      setUser(response.data);
      return response.data;
    } catch (e) {
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      loading, 
      login, 
      register, 
      logout, 
      updateProfile,
      googleLogin,
      facebookLogin,
      linkedinLogin,
      instagramLogin,
      processGoogleCallback,
      processSocialCallback,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};
