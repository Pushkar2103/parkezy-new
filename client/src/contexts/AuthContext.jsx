import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { apiService } from '../api/apiService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => localStorage.getItem('parkezy_user'));
    const [token, setToken] = useState(() => localStorage.getItem('parkezy_token'));
    const [loading, setLoading] = useState(true);
    const [requestCount, setRequestCount] = useState(0);

    useEffect(() => {
        const initializeAuth = async () => {
            if (token) {
                try {
                    const response = await apiService.getMyProfile('/me');
                    setUser(response.data);
                } catch (error) {
                    console.error("Session validation failed", error);
                    localStorage.removeItem('parkezy_token');
                    localStorage.removeItem('parkezy_user');
                    setUser(null);
                    setToken(null);
                }
            }
            setLoading(false);
        };

        initializeAuth();
    }, [token]);

    const fetchRequestCount = useCallback(async () => {
        if (!user || user.role !== 'owner') {
            setRequestCount(0);
            return;
        }
        try {
            const [cancellationsResponse, completionsResponse] = await Promise.all([
                apiService.getCancellationRequests(),
                apiService.getCompletionRequests()
            ]);
            const cancellations = cancellationsResponse.data || [];
            const completions = completionsResponse.data || [];
            setRequestCount(cancellations.length + completions.length);
        } catch (error) {
            console.error("Failed to fetch request counts", error);
            setRequestCount(0);
        }
    }, [user]);

    useEffect(() => {
        if (user && user.role === 'owner') {
            fetchRequestCount();
        }
    }, [user, fetchRequestCount]);

    const login = (authData) => {
        const { user: userData, token: userToken } = authData;
        
        setUser(userData);
        setToken(userToken);
        
        localStorage.setItem('parkezy_token', userToken);
        localStorage.setItem('parkezy_user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        setRequestCount(0);
        
        localStorage.removeItem('parkezy_token');
        localStorage.removeItem('parkezy_user');
    };

    const value = { 
        user, 
        token,
        login, 
        logout, 
        isAuthenticated: !!user, 
        loading, 
        requestCount, 
        refreshRequestCount: fetchRequestCount 
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
