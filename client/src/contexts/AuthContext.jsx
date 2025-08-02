import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { apiService } from '../api/apiService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requestCount, setRequestCount] = useState(0);

  const fetchRequestCount = useCallback(async () => {
    if (user?.role !== 'owner') {
        setRequestCount(0);
        return;
    }
    try {
        const [cancellations, completions] = await Promise.all([
            apiService.getCancellationRequests(),
            apiService.getCompletionRequests()
        ]);
        setRequestCount(cancellations.length + completions.length);
    } catch (error) {
        console.error("Failed to fetch request counts", error);
        setRequestCount(0);
    }
  }, [user]);

  useEffect(() => {
    const token = localStorage.getItem('parkezy_token');
    const userData = localStorage.getItem('parkezy_user');
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        apiService.setToken(token);
        setUser(parsedUser);
      } catch (e) {
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user?.role === 'owner') {
        fetchRequestCount();
    }
  }, [user, fetchRequestCount]);

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
    setRequestCount(0);
    localStorage.removeItem('parkezy_user');
    localStorage.removeItem('parkezy_token');
  };

  const value = { user, login, logout, isAuthenticated: !!user, loading, requestCount, refreshRequestCount: fetchRequestCount };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
