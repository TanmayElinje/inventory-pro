import axios from 'axios';

const api = axios.create({
    baseURL: 'https://inventory-pro-49re.onrender.com',
});

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
