import { createContext, useState, useEffect, useCallback } from 'react';
import userService from '../services/userService.js';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const login = useCallback((userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', authToken);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }, []);

  useEffect(() => {
    const verifySession = async () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser && token) {
        try {
          // Set local user data immediately to enable fast initial rendering
          setUser(JSON.parse(storedUser));
          
          // Verify with backend to ensure token is valid and sync details
          const freshUser = await userService.getMe();
          setUser(freshUser);
          localStorage.setItem('user', JSON.stringify(freshUser));
        } catch (error) {
          console.error('Session verification failed, logging out:', error);
          logout();
        }
      } else {
        logout();
      }
      setLoading(false);
    };

    verifySession();
  }, [token, logout]);

  const updateUser = useCallback((updatedFields) => {
    setUser((prev) => {
      const updated = { ...prev, ...updatedFields };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

