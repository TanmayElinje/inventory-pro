import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import AppNavbar from './components/AppNavbar';
import ProductList from './components/ProductList';
import CategoryPage from './pages/CategoryPage';
import SupplierPage from './pages/SupplierPage';
import ProductDetailPage from './pages/ProductDetailPage';
import DashboardPage from './pages/DashboardPage';
import LandingPage from './pages/LandingPage';
import { useAuth } from './context/AuthContext';
import LoginModal from './components/LoginModal';
import SignUpModal from './components/SignUpModal';

const PrivateRoute = ({ children }) => {
    const { user, isLoading } = useAuth();
    if (isLoading) {
        // You can add a spinner or a loading component here
        return <div>Loading...</div>;
    }
    // If not loading and no user, redirect to the public landing page
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
        
        {/* Render the modals here so they are globally available */}
        <LoginModal />
        <SignUpModal />
      </main>
    </Router>
  );
}

export default App;

