import React from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { GraphUp, ShieldLock, BoxSeam } from 'react-bootstrap-icons';
import { useUI } from '../context/UIContext';

const LandingPage = () => {
    const { openLoginModal } = useUI();

    return (
        <div>
            <div className="landing-hero">
                <Container className="text-center text-white">
                    <h1 className="display-3 fw-bold">StockLane</h1>
                    <p className="lead fst-italic fw-bold">
                        The complete solution for real-time inventory management, tracking, and forecasting.
                    </p>
                    <Button variant="light" size="lg" className="mt-3" onClick={openLoginModal}>
                        Get Started
                    </Button>
                </Container>
            </div>

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
        </div>
    );
};

export default LandingPage;

