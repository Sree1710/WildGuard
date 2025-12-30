import React, { createContext, useState, useContext, useEffect } from 'react';

// Create Authentication Context
const AuthContext = createContext(null);

/**
 * Authentication Provider Component
 * Manages user authentication state and provides login/logout functions
 * In a real application, this would integrate with a backend API
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const storedUser = localStorage.getItem('wildguard_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  /**
   * Login function - authenticates user
   * @param {string} username 
   * @param {string} password 
   * @returns {object} { success: boolean, message: string }
   */
  const login = (username, password) => {
    // Mock authentication - in production, this would call an API
    const mockUsers = {
      admin: { username: 'admin', password: 'admin123', role: 'admin', name: 'Admin User' },
      user: { username: 'user', password: 'user123', role: 'user', name: 'Field Ranger' },
    };

    const foundUser = Object.values(mockUsers).find(
      u => u.username === username && u.password === password
    );

    if (foundUser) {
      const userData = {
        username: foundUser.username,
        role: foundUser.role,
        name: foundUser.name,
      };
      
      setUser(userData);
      localStorage.setItem('wildguard_user', JSON.stringify(userData));
      
      return { success: true, message: 'Login successful' };
    }

    return { success: false, message: 'Invalid username or password' };
  };

  /**
   * Logout function - clears user session
   */
  const logout = () => {
    setUser(null);
    localStorage.removeItem('wildguard_user');
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
