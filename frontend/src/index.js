import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css'; // Add this line
import axios from 'axios'; 
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';

axios.defaults.baseURL = 'http://127.0.0.1:8000';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);

