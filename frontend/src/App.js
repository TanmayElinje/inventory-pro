// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import AppNavbar from './components/AppNavbar';
import ProductList from './components/ProductList';
import LoginPage from './pages/LoginPage';
import { useAuth } from './context/AuthContext';
import DashboardPage from './pages/DashboardPage';
import ProductDetailPage from './pages/ProductDetailPage'; // Import

// A component to protect routes
const PrivateRoute = ({ children }) => {
    const { user } = useAuth();
    return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <AppNavbar />
      <main className="py-3">
        <Container>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/products" element={<PrivateRoute><ProductList /></PrivateRoute>} />
            {/* Add the dashboard route */}
            <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
            {/* Make the root path redirect to the dashboard */}
            <Route 
              path="/" 
              element={<PrivateRoute><Navigate to="/dashboard" /></PrivateRoute>}
            />
            <Route path="/products/:id" element={<PrivateRoute><ProductDetailPage /></PrivateRoute>} />
          </Routes>
        </Container>
      </main>
    </Router>
  );
}
export default App;