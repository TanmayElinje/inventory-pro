// frontend/src/pages/ProductDetailPage.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Table, Card, ListGroup } from 'react-bootstrap';

const ProductDetailPage = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [history, setHistory] = useState([]);

    useEffect(() => {
        axios.get(`/api/products/${id}/`)
            .then(res => setProduct(res.data))
            .catch(err => console.error(err));

        axios.get(`/api/stock-movements/?product=${id}`)
            .then(res => setHistory(res.data))
            .catch(err => console.error(err));
    }, [id]);

    if (!product) return <div>Loading...</div>;

    return (
        <div>
            <h2>{product.name} Details</h2>
            <Card className="mb-4">
                <Card.Body>
                    <Card.Title>{product.name}</Card.Title>
                    <ListGroup variant="flush">
                        <ListGroup.Item><strong>SKU:</strong> {product.sku}</ListGroup.Item>
                        <ListGroup.Item><strong>Category:</strong> {product.category.name}</ListGroup.Item>
                        <ListGroup.Item><strong>Current Stock:</strong> {product.quantity}</ListGroup.Item>
                    </ListGroup>
                </Card.Body>
            </Card>

            <h3>Stock Movement History</h3>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Change</th>
                        <th>Reason</th>
                        <th>User</th>
                    </tr>
                </thead>
                <tbody>
                    {history.map(item => (
                        <tr key={item.id}>
                            <td>{new Date(item.timestamp).toLocaleString()}</td>
                            <td className={item.quantity_change > 0 ? 'text-success' : 'text-danger'}>
                                {item.quantity_change > 0 ? `+${item.quantity_change}` : item.quantity_change}
                            </td>
                            <td>{item.reason}</td>
                            <td>{item.user}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
};

export default ProductDetailPage;