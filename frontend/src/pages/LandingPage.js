// frontend/src/pages/LandingPage.js

import React from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { GraphUp, ShieldLock, BoxSeam } from 'react-bootstrap-icons';
import { useUI } from '../context/UIContext'; // Import the UI hook
import LoginModal from '../components/LoginModal'; // Import the modal

const LandingPage = () => {
    const { openLoginModal } = useUI(); // Get the function to open the modal

    return (
        <div>
            {/* Hero Section */}
            <div className="landing-hero">
                <Container className="text-center text-white">
                    <h1 className="display-3">InventoryPro</h1>
                    <p className="lead">The complete solution for real-time inventory management, tracking, and forecasting.</p>
                    {/* This button now opens the modal */}
                    <Button variant="light" size="lg" className="mt-3" onClick={openLoginModal}>
                        Get Started
                    </Button>
                </Container>
            </div>

            {/* Features Section */}
            <Container className="py-5">
                <h2 className="text-center mb-4">Key Features</h2>
                <Row>
                    <Col md={4} className="mb-3">
                        <Card className="text-center feature-card h-100">
                            <Card.Body>
                                <BoxSeam className="feature-icon" />
                                <Card.Title>Real-Time Tracking</Card.Title>
                                <Card.Text>
                                    Instantly see stock level changes across all users with WebSocket technology.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4} className="mb-3">
                        <Card className="text-center feature-card h-100">
                            <Card.Body>
                                <GraphUp className="feature-icon" />
                                <Card.Title>Intelligent Forecasting</Card.Title>
                                <Card.Text>
                                    Leverage historical data with time-series models to predict future sales demand.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4} className="mb-3">
                        <Card className="text-center feature-card h-100">
                            <Card.Body>
                                <ShieldLock className="feature-icon" />
                                <Card.Title>Role-Based Access</Card.Title>
                                <Card.Text>
                                    Secure your data with distinct permissions for Admins, Managers, and Staff.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        {/* Render the LoginModal component */}
            <LoginModal />
        </div>
    );
};

export default LandingPage;