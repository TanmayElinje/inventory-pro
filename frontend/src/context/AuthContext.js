// frontend/src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            axios.get('http://127.0.0.1:8000/api/user/')
                .then(response => {
                    setUser(response.data);
                })
                .catch(() => {
                    // Token might be invalid/expired
                    localStorage.clear();
                    delete axios.defaults.headers.common['Authorization'];
                });
        }
    }, []);

    const login = async (username, password) => {
        const response = await axios.post('http://127.0.0.1:8000/api/token/', { username, password });
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;

        // Fetch user details after setting token
        const userResponse = await axios.get('http://127.0.0.1:8000/api/user/');
        setUser(userResponse.data);
    };

    const logout = () => {
        setUser(null);
        localStorage.clear();
        delete axios.defaults.headers.common['Authorization'];
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use the auth context
export const useAuth = () => {
    return useContext(AuthContext);
};