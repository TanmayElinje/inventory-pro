// frontend/src/pages/CategoryPage.js

import React, { useState, useEffect, useCallback } from 'react';
import { Button, Alert, Pagination, InputGroup, Form, Container, Card, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';

// A simple card component for displaying a category
const CategoryCard = ({ category }) => (
    <Card as={Link} to={`/categories/${category.id}/products`} className="h-100 card-lift text-decoration-none text-dark">
        <Card.Img 
            variant="top" 
            src={category.image_url || 'https://via.placeholder.com/150.png?text=No+Image'}
            style={{ height: '120px', objectFit: 'contain', paddingTop: '10px' }}
        />
        <Card.Body className="d-flex align-items-center justify-content-center">
            <Card.Title className="text-center">{category.name}</Card.Title>
        </Card.Body>
    </Card>
);

const CategoryPage = () => {
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [pagination, setPagination] = useState({ next: null, previous: null, count: 0, currentPage: 1 });
    const [activePageUrl, setActivePageUrl] = useState('/api/categories/');
    const itemsPerPage = 50;

    const fetchCategories = useCallback((url) => {
        api.get(url)
            .then(res => {
                const results = res.data.results || res.data;
                const count = res.data.count === undefined ? results.length : res.data.count;
                setCategories(results);
                setPagination({
                    next: res.data.next || null, previous: res.data.previous || null,
                    count: count, currentPage: new URLSearchParams(url.split('?')[1]).get('page') || 1
                });
            })
            .catch(err => setError('Could not fetch categories.'));
    }, []);

    useEffect(() => {
        const timerId = setTimeout(() => { setDebouncedSearchTerm(searchTerm); }, 500);
        return () => clearTimeout(timerId);
    }, [searchTerm]);

    useEffect(() => {
        const params = new URLSearchParams();
        if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
        const url = `/api/categories/?${params.toString()}`;
        setActivePageUrl(url);
    }, [debouncedSearchTerm]);
    
    useEffect(() => {
        fetchCategories(activePageUrl);
    }, [activePageUrl, fetchCategories]);
    
    const handlePageChange = (url) => { if (url) setActivePageUrl(url); };
    const totalPages = Math.ceil(pagination.count / itemsPerPage);

    return (
        <Container className="mt-4">
            <h2>Categories</h2>
            <Form.Group className="my-3">
                <InputGroup>
                    <InputGroup.Text>Search</InputGroup.Text>
                    <Form.Control type="text" placeholder="Search by category name..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </InputGroup>
            </Form.Group>

            {error && <Alert variant="danger">{error}</Alert>}

            <Row xs={2} md={3} lg={5} xl={6} className="g-4">
                {categories.map(cat => (
                    <Col key={cat.id}>
                        <CategoryCard category={cat} />
                    </Col>
                ))}
            </Row>
            
            {totalPages > 1 && (<div className="d-flex justify-content-center mt-4"><Pagination><Pagination.Prev onClick={() => handlePageChange(pagination.previous)} disabled={!pagination.previous} /><Pagination.Item disabled>Page {pagination.currentPage} of {totalPages}</Pagination.Item><Pagination.Next onClick={() => handlePageChange(pagination.next)} disabled={!pagination.next} /></Pagination></div>)}
        </Container>
    );
};

export default CategoryPage;