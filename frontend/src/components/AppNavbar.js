import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';

const AppNavbar = () => {
    const { user, logout } = useAuth();
    const { openLoginModal } = useUI();
    const navigate = useNavigate();

    const handleLogoutClick = () => {
        logout();
        navigate('/');
    };

    return (
        <Navbar variant="dark" expand="lg" collapseOnSelect className="custom-navbar">
            <Container>
                <Navbar.Brand as={Link} to={user ? "/dashboard" : "/"} className="fw-bold">StockLane</Navbar.Brand>
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
                            <>
                                <Navbar.Text className="me-3">
                                    Signed in as: <strong className="text-white">{user.username} ({user.groups[0] || 'User'})</strong>
                                </Navbar.Text>
                                <Button variant="outline-light" onClick={handleLogoutClick}>Logout</Button>
                            </>
                        ) : (
                            <Button variant="outline-light" onClick={openLoginModal}>Login</Button>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default AppNavbar;
