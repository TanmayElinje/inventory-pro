// frontend/src/components/ProductList.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ListGroup } from 'react-bootstrap';

const ProductList = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        // This function is called when the component loads
        const fetchProducts = async () => {
            try {
                // Make a GET request to our Django API
                const response = await axios.get('http://127.0.0.1:8000/api/products/');
                setProducts(response.data); // Store the fetched data in state
            } catch (error) {
                console.error("There was an error fetching the products!", error);
            }
        };

        fetchProducts();
    }, []); // The empty array means this effect runs only once on mount

    return (
        <div>
            <h2>Products</h2>
            <ListGroup>
                {products.length > 0 ? (
                    products.map(product => (
                        <ListGroup.Item key={product.id}>
                            {product.name} ({product.sku}) - Stock: {product.quantity}
                        </ListGroup.Item>
                    ))
                ) : (
                    <ListGroup.Item>No products found.</ListGroup.Item>
                )}
            </ListGroup>
        </div>
    );
};

export default ProductList;