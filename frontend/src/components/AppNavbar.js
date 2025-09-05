// frontend/src/components/AppNavbar.js

import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext'; // Import the UI hook

const AppNavbar = () => {
    const { user, logout } = useAuth();
    const { openLoginModal } = useUI(); // Get the function to open the modal
    const navigate = useNavigate();

    const handleLogoutClick = () => {
        logout();
        navigate('/'); // Navigate to landing page on logout
    };

    return (
        <Navbar variant="dark" expand="lg" collapseOnSelect className="custom-navbar">
            <Container>
                <Navbar.Brand as={Link} to={user ? "/dashboard" : "/"}>InventoryPro</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    {user && (
                        <Nav className="me-auto">
                            <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
                            <Nav.Link as={Link} to="/products">Products</Nav.Link>
                            <Nav.Link as={Link} to="/categories">Categories</Nav.Link>
                            <Nav.Link as={Link} to="/suppliers">Suppliers</Nav.Link>
                        </Nav>
                    )}
                    <Nav className="ms-auto">
                        {user ? (
                            <Button variant="outline-light" onClick={handleLogoutClick}>Logout</Button>
                        ) : (
                            // This button now opens the modal
                            <Button variant="outline-light" onClick={openLoginModal}>Login</Button>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default AppNavbar;