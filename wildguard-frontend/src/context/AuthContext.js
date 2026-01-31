import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

// Create Authentication Context
const AuthContext = createContext(null);

/**
 * Authentication Provider Component
 * Manages user authentication state and provides login/logout functions
 * Integrates with backend API for real authentication
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('access_token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  /**
   * Login function - authenticates user with backend API
   * @param {string} username 
   * @param {string} password 
   * @returns {object} { success: boolean, message: string }
   */
  const login = async (username, password) => {
    try {
      const response = await api.login(username, password);
      
      if (response.success) {
        const userData = {
          id: response.user.id,
          username: response.user.username,
          role: response.user.role,
          name: response.user.name,
          email: response.user.email,
        };
        
        setUser(userData);
        return { success: true, message: 'Login successful' };
      }

      return { success: false, message: response.error || 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: error.message || 'Connection error. Please try again.' };
    }
  };

  /**
   * Logout function - clears user session
   */
  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  /**
   * Check if user has specific role
   * @param {string} role 
   * @returns {boolean}
   */
  const hasRole = (role) => {
    return user?.role === role;
  };

  const value = {
    user,
    login,
    logout,
    hasRole,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isUser: user?.role === 'user',
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to use authentication context
 * @returns {object} Authentication context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
