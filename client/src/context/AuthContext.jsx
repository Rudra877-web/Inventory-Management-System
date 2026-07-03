import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: 'success', visible: false });

  // Load user profile on app start
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
          }
        } catch (err) {
          console.error('Failed to initialize auth:', err.message);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Toast helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 4000);
  };

  // Login handler
  const login = async (email, password, code2fa) => {
    try {
      const res = await api.post('/auth/login', { email, password, code2fa });
      if (res.data.require2FA) {
        return { require2FA: true, userId: res.data.userId };
      }
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        showToast('Welcome back to Investly!', 'success');
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check credentials.';
      showToast(msg, 'danger');
      throw err;
    }
  };

  // Google Login handler
  const googleLogin = async (googleData) => {
    try {
      const res = await api.post('/auth/google-login', googleData);
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        showToast('Logged in via Google successfully!', 'success');
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Google sign-in failed.';
      showToast(msg, 'danger');
      throw err;
    }
  };

  // Register handler
  const register = async (name, email, password) => {
    try {
      const res = await api.post('/auth/register', { name, email, password });
      if (res.data.success) {
        showToast(res.data.message || 'Registration successful! Verification email sent.', 'success');
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      showToast(msg, 'danger');
      throw err;
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    showToast('Logged out successfully.', 'success');
  };

  // Verify email handler
  const verifyEmail = async (token) => {
    try {
      const res = await api.post('/auth/verify-email', { token });
      if (res.data.success) {
        showToast('Email verified successfully! You can now log in.', 'success');
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Email verification failed.';
      showToast(msg, 'danger');
      throw err;
    }
  };

  // Forgot password
  const forgotPassword = async (email) => {
    try {
      const res = await api.post('/auth/forgot-password', { email });
      showToast(res.data.message, 'success');
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Forgot password request failed.';
      showToast(msg, 'danger');
      throw err;
    }
  };

  // Reset password
  const resetPassword = async (token, newPassword) => {
    try {
      const res = await api.post('/auth/reset-password', { token, newPassword });
      if (res.data.success) {
        showToast('Password reset successful. Please login.', 'success');
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to reset password.';
      showToast(msg, 'danger');
      throw err;
    }
  };

  // Update profile handler (name, bank info, avatar, 2fa, etc)
  const updateProfile = async (profileData) => {
    try {
      const res = await api.put('/auth/profile', profileData);
      if (res.data.success) {
        setUser(res.data.user);
        showToast(res.data.message || 'Profile updated successfully!', 'success');
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile.';
      showToast(msg, 'danger');
      throw err;
    }
  };

  // Refresh user data (for updating balance or KYC statuses)
  const refreshMe = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
      }
    } catch (err) {
      console.error('Error refreshing profile info:', err.message);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      googleLogin,
      register,
      logout,
      verifyEmail,
      forgotPassword,
      resetPassword,
      updateProfile,
      refreshMe,
      toast,
      showToast
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
