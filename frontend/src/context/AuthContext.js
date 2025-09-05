// frontend/src/context/AuthContext.js

import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true); // <-- ADD THIS

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            axios.get('/api/user/')
                .then(response => {
                    setUser(response.data);
                })
                .catch(() => {
                    localStorage.clear();
                    delete axios.defaults.headers.common['Authorization'];
                })
                .finally(() => {
                    setIsLoading(false); // <-- SET LOADING TO FALSE HERE
                });
        } else {
            setIsLoading(false); // <-- AND ALSO HERE
        }
    }, []);

    const login = async (username, password) => {
        const response = await axios.post('/api/token/', { username, password });
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
        
        const userResponse = await axios.get('/api/user/');
        setUser(userResponse.data);
    };

    const logout = () => {
        setUser(null);
        localStorage.clear();
        delete axios.defaults.headers.common['Authorization'];
    };

    const value = { user, isLoading, login, logout }; // <-- PROVIDE isLoading

    // Don't render children until the loading check is complete
    return (
        <AuthContext.Provider value={value}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
};

// Custom hook to use the auth context
export const useAuth = () => {
    return useContext(AuthContext);
};