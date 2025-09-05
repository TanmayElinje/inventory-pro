// frontend/src/App.js

import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import AppNavbar from './components/AppNavbar';
import ProductList from './components/ProductList';
import CategoryPage from './pages/CategoryPage';
import SupplierPage from './pages/SupplierPage';
import ProductDetailPage from './pages/ProductDetailPage';
import DashboardPage from './pages/DashboardPage';
import LandingPage from './pages/LandingPage';
import { useAuth } from './context/AuthContext';

const PrivateRoute = ({ children }) => {
    const { user, isLoading } = useAuth();
    if (isLoading) {
        return <div>Loading...</div>;
    }
    return user ? children : <Navigate to="/" />;
};

function App() {
  return (
    <Router>
      <AppNavbar />
      <main>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/products" element={<PrivateRoute><ProductList /></PrivateRoute>} />
          <Route path="/categories/:categoryId/products" element={<PrivateRoute><ProductList /></PrivateRoute>} />
          <Route path="/categories" element={<PrivateRoute><CategoryPage /></PrivateRoute>} />
          <Route path="/suppliers" element={<PrivateRoute><SupplierPage /></PrivateRoute>} />
          <Route path="/products/:id" element={<PrivateRoute><ProductDetailPage /></PrivateRoute>} />
          <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;