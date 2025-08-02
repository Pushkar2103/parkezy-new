import React, { createContext, useState, useEffect, useContext } from 'react';
import {apiService} from '../api/apiService'; 

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('parkezy_token');
    const userData = localStorage.getItem('parkezy_user');
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        apiService.setToken(token);
        setUser(parsedUser);
      } catch (e) {
        console.error("Failed to parse user data from localStorage", e);
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    apiService.setToken(userData.token);
    const decodedToken = JSON.parse(atob(userData.token.split('.')[1]));
    const fullUser = { ...userData.user, role: decodedToken.role };
    setUser(fullUser);
    localStorage.setItem('parkezy_user', JSON.stringify(fullUser));
  };

  const logout = () => {
    apiService.clearToken();
    setUser(null);
    localStorage.removeItem('parkezy_user');
    localStorage.removeItem('parkezy_token');
  };

  const value = { user, login, logout, isAuthenticated: !!user, loading };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};
