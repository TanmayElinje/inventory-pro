// frontend/src/pages/DashboardPage.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Row, Col, Card } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DashboardPage = () => {
    const [analytics, setAnalytics] = useState(null);

    useEffect(() => {
        axios.get('http://127.0.0.1:8000/api/analytics/')
            .then(res => setAnalytics(res.data))
            .catch(err => console.error(err));
    }, []);

    const chartData = {
        labels: analytics?.category_distribution.map(item => item.category__name) || [],
        datasets: [
            {
                label: '# of Products',
                data: analytics?.category_distribution.map(item => item.count) || [],
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
        ],
    };

    if (!analytics) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h2>Dashboard</h2>
            <Row className="my-4">
                <Col md={4}>
                    <Card bg="primary" text="white" className="mb-2">
                        <Card.Body>
                            <Card.Title>Total Inventory Value</Card.Title>
                            <Card.Text className="fs-4">
                                ${parseFloat(analytics.total_inventory_value).toFixed(2)}
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card bg="success" text="white" className="mb-2">
                        <Card.Body>
                            <Card.Title>Total Products</Card.Title>
                            <Card.Text className="fs-4">
                                {analytics.total_products}
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card bg="danger" text="white" className="mb-2">
                        <Card.Body>
                            <Card.Title>Low Stock Items</Card.Title>
                            <Card.Text className="fs-4">
                                {analytics.low_stock_items}
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <h4>Products by Category</h4>
            <Bar data={chartData} />
        </div>
    );
};

export default DashboardPage;