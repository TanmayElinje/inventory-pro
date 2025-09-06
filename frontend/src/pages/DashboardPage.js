// frontend/src/pages/DashboardPage.js

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, ButtonGroup, Button, Table, Form } from 'react-bootstrap';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const DashboardPage = () => {
    const { user } = useAuth();
    const [analytics, setAnalytics] = useState(null);
    const [error, setError] = useState('');
    const [timeRange, setTimeRange] = useState('all');
    
    const [topProducts, setTopProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');

    useEffect(() => {
        api.get(`/api/analytics/?range=${timeRange}`)
            .then(res => setAnalytics(res.data))
            .catch(err => setError('Could not load dashboard analytics.'));
    }, [timeRange]);

    useEffect(() => {
        api.get('/api/categories/').then(res => setCategories(res.data.results || res.data));
    }, []);

    useEffect(() => {
        const params = new URLSearchParams({ range: timeRange });
        if (selectedCategory) {
            params.append('category', selectedCategory);
        }
        api.get(`/api/analytics/top-products/?${params.toString()}`)
            .then(res => setTopProducts(res.data))
            .catch(err => setError('Could not load top products.'));
    }, [timeRange, selectedCategory]);

    if (error) return <Alert variant="danger">{error}</Alert>;
    if (!analytics) return <div>Loading...</div>;

    const verticalChartOptions = {
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, grid: { display: false } }, x: { grid: { display: false } } }
    };
    
    const horizontalChartOptions = {
        indexAxis: 'y',
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { grid: { display: false } }, x: { beginAtZero: true, grid: { display: false } } }
    };

    const salesTrendData = {
        labels: analytics.sales_trend.map(item => new Date(item.day).toLocaleDateString()),
        datasets: [{
            label: 'Daily Revenue',
            data: analytics.sales_trend.map(item => item.total_revenue),
            fill: true,
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.1
        }],
    };

    const countCategoryData = analytics.category_distribution || [];
    const countChartData = {
        labels: countCategoryData.map(item => item.product__category__name),
        datasets: [{
            label: '# of Products Sold',
            data: countCategoryData.map(item => item.count),
            backgroundColor: 'rgba(153, 102, 255, 0.6)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 1,
        }],
    };

    const revenueCategoryData = analytics.revenue_by_category || [];
    const revenueChartData = {
        labels: revenueCategoryData.map(item => item.product__category__name),
        datasets: [{
            label: 'Total Revenue ($)',
            data: revenueCategoryData.map(item => item.total_revenue),
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
        }],
    };

    const capitalize = (s) => s && s.charAt(0).toUpperCase() + s.slice(1);
    const timeRangeText = timeRange === 'all' ? 'All Time' : `Last ${timeRange} Days`;

    return (
        <Container className="mt-4">
            <Row className="align-items-center mb-4">
                <Col><h2>Welcome back, {capitalize(user?.username)}!</h2></Col>
                <Col xs="auto">
                    <ButtonGroup>
                        <Button variant={timeRange === '7' ? 'primary' : 'outline-secondary'} onClick={() => setTimeRange('7')}>7 Days</Button>
                        <Button variant={timeRange === '30' ? 'primary' : 'outline-secondary'} onClick={() => setTimeRange('30')}>30 Days</Button>
                        <Button variant={timeRange === '90' ? 'primary' : 'outline-secondary'} onClick={() => setTimeRange('90')}>90 Days</Button>
                        <Button variant={timeRange === 'all' ? 'primary' : 'outline-secondary'} onClick={() => setTimeRange('all')}>All Time</Button>
                    </ButtonGroup>
                </Col>
            </Row>
            
            <Row>
                <Col md={4}><Card text="white" className="mb-3 card-lift card-bg-blue-purple"><Card.Body><Card.Title>Total Inventory Value</Card.Title><Card.Text className="fs-4">${parseFloat(analytics.total_inventory_value).toFixed(2)}</Card.Text></Card.Body></Card></Col>
                <Col md={4}><Card text="white" className="mb-3 card-lift card-bg-green-teal"><Card.Body><Card.Title>Total Products</Card.Title><Card.Text className="fs-4">{analytics.total_products}</Card.Text></Card.Body></Card></Col>
                <Col md={4}><Card text="white" className="mb-3 card-lift card-bg-red-orange"><Card.Body><Card.Title>Low Stock Items</Card.Title><Card.Text className="fs-4">{analytics.low_stock_items}</Card.Text></Card.Body></Card></Col>
            </Row>

            <Card className="mb-4 card-lift">
                <Card.Body>
                    <Card.Title>Sales Trend ({timeRangeText})</Card.Title>
                    <div style={{ height: '300px' }}><Line data={salesTrendData} options={verticalChartOptions} /></div>
                </Card.Body>
            </Card>

            <Row>
                <Col lg={7} className="mb-4">
                    <Card className="h-100 card-lift">
                        <Card.Body>
                            <Card.Title>Total Revenue by Category ({timeRangeText})</Card.Title>
                            <div style={{ height: '350px' }}><Bar data={revenueChartData} options={horizontalChartOptions} /></div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={5} className="mb-4">
                    <Card className="h-100 card-lift">
                        <Card.Body className="d-flex flex-column">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <Card.Title>Top Selling Products (Units)</Card.Title>
                                <Form.Select size="sm" style={{ width: '170px' }} value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                                    <option value="">All Categories</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </Form.Select>
                            </div>
                            <div className="flex-grow-1">
                                <Table hover responsive className="custom-table">
                                    <thead><tr><th>Product</th><th>Units Sold</th></tr></thead>
                                    <tbody>
                                        {topProducts.map((p, index) => (
                                            <tr key={index}><td>{p.product__name}</td><td>{p.units_sold}</td></tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            
            <Row>
                <Col>
                    <Card className="mb-4 card-lift">
                        <Card.Body>
                            <Card.Title>Unique Products Sold by Category ({timeRangeText})</Card.Title>
                            <div style={{ height: '350px' }}>
                                <Bar data={countChartData} options={verticalChartOptions} />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default DashboardPage;
