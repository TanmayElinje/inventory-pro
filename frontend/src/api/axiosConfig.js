// frontend/src/api/axiosConfig.js

import axios from 'axios';

const api = axios.create({
    baseURL: 'https://inventory-pro-opom.onrender.com'
});

// This interceptor runs before each request is sent.
api.interceptors.request.use(
    config => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

export default api;