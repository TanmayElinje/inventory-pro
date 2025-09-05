import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { UIProvider } from './context/UIContext'; // Import UIProvider

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // StrictMode can be re-enabled later for debugging
  <React.StrictMode>
    <UIProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </UIProvider>
  </React.StrictMode>
);
