// frontend/src/context/AuthContext.js

import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axiosConfig'; // <-- Use our new, configured api instance

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            // The interceptor in axiosConfig.js automatically sets the header
            api.get('/api/user/')
                .then(response => {
                    setUser(response.data);
                })
                .catch(() => {
                    localStorage.clear();
                    setUser(null);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        } else {
            setIsLoading(false);
        }
    }, []);

    const login = async (username, password) => {
        // --- THIS IS THE FIX ---
        // Use 'api.post' which has the correct baseURL (http://127.0.0.1:8000)
        const response = await api.post('/api/token/', { username, password });
        
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);
        
        const userResponse = await api.get('/api/user/');
        setUser(userResponse.data);
    };

    const logout = () => {
        setUser(null);
        localStorage.clear();
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};