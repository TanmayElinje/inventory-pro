// frontend/src/components/AppNavbar.js

import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AppNavbar = () => {
    const { user, logout } = useAuth(); // Get user and logout from context
    const navigate = useNavigate();

    const handleLogoutClick = () => {
        logout();
        navigate('/login');
    };

    return (
        <Navbar bg="dark" variant="dark" expand="lg" collapseOnSelect>
            <Container>
                <Navbar.Brand as={Link} to="/">InventoryPro</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    {/* Only show main nav links if the user is logged in */}
                    {user && (
                        <Nav className="me-auto">
                             <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
                            <Nav.Link as={Link} to="/products">Products</Nav.Link>
                        </Nav>
                    )}
                    <Nav className="ms-auto">
                        {/* ✅ This is the key change: check for `user` not `isAuthenticated` */}
                        {user ? (
                            <Button variant="outline-light" onClick={handleLogoutClick}>Logout</Button>
                        ) : (
                            <Nav.Link as={Link} to="/login">Login</Nav.Link>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default AppNavbar;