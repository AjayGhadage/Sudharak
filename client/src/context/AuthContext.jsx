import React, { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../services/api';

export const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('sudharak_token');
            if (token) {
                try {
                    const response = await api.get('/auth/me');
                    if (response.success) {
                        setUser(response.data);
                        setIsAuthenticated(true);
                    } else {
                        localStorage.removeItem('sudharak_token');
                    }
                } catch (err) {
                    console.error('Session expired or invalid token');
                    localStorage.removeItem('sudharak_token');
                }
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const login = async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.post('/auth/login', { email, password });
            if (response.success) {
                localStorage.setItem('sudharak_token', response.data.token);
                setUser(response.data.user);
                setIsAuthenticated(true);
                return true;
            }
            return false;
        } catch (err) {
            setError(err.message || 'Login failed');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const loginWithGoogle = async (googleData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.post('/auth/google', googleData);
            if (response.success) {
                localStorage.setItem('sudharak_token', response.data.token);
                setUser(response.data.user);
                setIsAuthenticated(true);
                return true;
            }
            return false;
        } catch (err) {
            setError(err.message || 'Google Auth failed');
            return false;
        } finally {
            setLoading(false);
        }
    }

    const logout = () => {
        localStorage.removeItem('sudharak_token');
        setUser(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, loading, error, login, loginWithGoogle, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
