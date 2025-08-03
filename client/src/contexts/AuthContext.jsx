import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { apiService } from '../api/apiService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [requestCount, setRequestCount] = useState(0);

    useEffect(() => {
        const initializeAuth = async () => {
            const token = localStorage.getItem('parkezy_token');
            if (token) {
                try {
                    const response = await apiService.get('/me');
                    setUser(response.data);
                } catch (error) {
                    console.error("Session validation failed", error);
                    localStorage.removeItem('parkezy_token');
                    localStorage.removeItem('parkezy_user');
                }
            }
            setLoading(false);
        };

        initializeAuth();
    }, []);

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
        const { user, token } = authData;
        
        setUser(user);
        
        localStorage.setItem('parkezy_token', token);
        localStorage.setItem('parkezy_user', JSON.stringify(user));
    };

    const logout = () => {
        setUser(null);
        setRequestCount(0);
        
        localStorage.removeItem('parkezy_token');
        localStorage.removeItem('parkezy_user');
    };

    const value = { 
        user, 
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
