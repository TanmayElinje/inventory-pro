// frontend/src/pages/ProductDetailPage.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Table, Card, ListGroup, Alert, Row, Col, Button, Carousel, Container} from 'react-bootstrap';
import { ArrowLeft } from 'react-bootstrap-icons';
import api from '../api/axiosConfig';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [history, setHistory] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get(`/api/products/${id}/`)
            .then(res => {
                console.log("PRODUCT DATA FROM API:", res.data); // Let's see what the API is sending
                setProduct(res.data);
            })
            .catch(err => {
                console.error("Error fetching product details:", err);
                setError('Could not load product details.');
            });

        api.get(`/api/stock-movements/?product=${id}`)
            .then(res => {
                setHistory(res.data.results || []); 
            })
            .catch(err => {
                console.error("Error fetching stock history:", err);
                setError('Could not load stock history.');
            });
    }, [id]);

    if (error) {
        return <Alert variant="danger">{error}</Alert>;
    }

    if (!product) {
        return <div>Loading...</div>;
    }

    const forecastData = product?.forecast;

    const chartData = {
        // --- UPDATED LABELS ---
        labels: [
            ...(forecastData?.historical?.labels || []), 
            'Month +1', 'Month +2', 'Month +3', 'Month +4'
        ],
        datasets: [
            {
                label: 'Historical Monthly Sales',
                data: forecastData?.historical?.data || [],
                borderColor: 'rgb(54, 162, 235)',
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                tension: 0.1
            },
            {
                label: 'Forecasted Sales',
                data: [
                    ...(new Array(forecastData?.historical?.data?.length || 0).fill(null)), 
                    ...(forecastData?.forecast || [])
                ],
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                borderDash: [5, 5],
                tension: 0.1
            }
        ]
    };

    return (
        <Container className="mt-4">
            <Button variant="outline-secondary" className="mb-3" onClick={() => navigate(-1)}>
                <ArrowLeft /> Go Back to Products
            </Button>

            <h2>{product.name} Details</h2>
            <Card className="mb-4">
                <Card.Body>
                    <Row>
                        <Col md={8}>
                            <Card.Title>{product.name}</Card.Title>
                            <ListGroup variant="flush">
                                <ListGroup.Item><strong>SKU:</strong> {product.sku}</ListGroup.Item>
                                <ListGroup.Item><strong>Category:</strong> {product.category.name}</ListGroup.Item>
                                <ListGroup.Item><strong>Supplier:</strong> {product.supplier.name}</ListGroup.Item>
                                <ListGroup.Item><strong>Current Stock:</strong> {product.quantity}</ListGroup.Item>
                                <ListGroup.Item><strong>Sale Price:</strong> ${parseFloat(product.sale_price).toFixed(2)}</ListGroup.Item>
                            </ListGroup>
                        </Col>
                        <Col md={4} className="d-flex flex-column align-items-center justify-content-center">
                            {product.images && product.images.length > 0 ? (
                                <Carousel interval={null} className="product-detail-carousel mb-3">
                                    {product.images.map(img => (
                                        <Carousel.Item key={img.id}>
                                            <img className="d-block w-100" src={img.image} alt={product.name} />
                                        </Carousel.Item>
                                    ))}
                                </Carousel>
                            ) : (
                                <img src={'https://via.placeholder.com/400x400.png?text=No+Image'} alt="Placeholder" className="img-fluid rounded mb-3" />
                            )}
                            <img src={`http://127.0.0.1:8000/api/products/${id}/qrcode/`} alt={`QR Code for ${product.name}`} style={{ width: '120px', height: '120px' }} />
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {forecastData && (
                <Card className="mb-4">
                    <Card.Body>
                        <Card.Title>Sales History & Forecast (Monthly)</Card.Title>
                        <div style={{ height: '250px' }}>
                            <Line data={chartData} options={{ maintainAspectRatio: false }} />
                        </div>
                    </Card.Body>
                </Card>
            )}

            <h3>Stock Movement History</h3>
            <div className="table-container">
                <Table responsive className="custom-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Change</th>
                            <th>Reason</th>
                            <th>User</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.length > 0 ? (
                            history.map(item => (
                                <tr key={item.id}>
                                    <td>{new Date(item.timestamp).toLocaleString()}</td>
                                    <td className={item.quantity_change > 0 ? 'text-success' : 'text-danger'}>{item.quantity_change > 0 ? `+${item.quantity_change}` : item.quantity_change}</td>
                                    <td>{item.reason}</td>
                                    <td>{item.user}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="text-center">No stock movement history for this product.</td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </div>
        </Container>
    );
};

export default ProductDetailPage;