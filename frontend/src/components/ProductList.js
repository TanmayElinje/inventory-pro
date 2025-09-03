// frontend/src/components/ProductList.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Alert, Button } from 'react-bootstrap';
import { PencilSquare, Trash, ArrowClockwise } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AddProductModal from './AddProductModal';
import EditProductModal from './EditProductModal';
import AdjustStockModal from './AdjustStockModal';

const ProductList = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [error, setError] = useState('');
    
    // State for Add Modal
    const [showModal, setShowModal] = useState(false);
    
    // State for Edit Modal
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    // State for Adjust Stock Modal
    const [showAdjustModal, setShowAdjustModal] = useState(false);
    const [productToAdjust, setProductToAdjust] = useState(null);

    // Helper to check if user has permission to modify products
    const canModify = user && (user.groups.includes('Admin') || user.groups.includes('Manager'));

    // --- Add Modal Handlers ---
    const handleShowModal = () => setShowModal(true);
    const handleCloseModal = () => setShowModal(false);
    const handleProductAdded = (newProduct) => {
        setProducts(currentProducts => [newProduct, ...currentProducts]);
    };

    // --- Edit & Adjust Modal Handlers ---
    const handleShowEditModal = (product) => {
        setSelectedProduct(product);
        setShowEditModal(true);
    };
    const handleCloseEditModal = () => {
        setSelectedProduct(null);
        setShowEditModal(false);
    };
    const handleProductUpdated = (updatedProduct) => {
        setProducts(currentProducts =>
            currentProducts.map(p => (p.id === updatedProduct.id ? updatedProduct : p))
        );
    };
    const handleShowAdjustModal = (product) => {
        setProductToAdjust(product);
        setShowAdjustModal(true);
    };
    const handleCloseAdjustModal = () => {
        setProductToAdjust(null);
        setShowAdjustModal(false);
    };

    // --- Delete Handler ---
    const handleDelete = async (productId) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await axios.delete(`/api/products/${productId}/`);
                setProducts(currentProducts => 
                    currentProducts.filter(p => p.id !== productId)
                );
            } catch (error) {
                console.error("There was an error deleting the product!", error);
                setError('Could not delete the product.');
            }
        }
    };

    // --- Initial Data Fetch ---
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get('/api/products/');
                setProducts(response.data);
            } catch (error) {
                console.error("There was an error fetching the products!", error);
                setError('Could not fetch products. Please try again later.');
            }
        };
        fetchProducts();
    }, []);

    // --- WebSocket for Real-Time Updates (FINAL VERSION) ---
    useEffect(() => {
        const token = localStorage.getItem('access_token');

        if (!token) {
            return; // Don't connect if there's no token
        }

        const socket = new WebSocket(`ws://localhost:8000/ws/products/?token=${token}`);

        socket.onopen = () => {
            console.log('WebSocket connected');
        };

        socket.onmessage = (e) => {
            const data = JSON.parse(e.data);
            
            if (data.type === 'product_update') {
                const updatedProduct = data.product;
                console.log('Received product update:', updatedProduct);

                setProducts(currentProducts =>
                    currentProducts.map(p =>
                        p.id === updatedProduct.id ? updatedProduct : p
                    )
                );
            }
        };

        socket.onclose = () => {
            console.error('WebSocket closed.');
        };

        socket.onerror = (error) => {
            console.error('WebSocket Error:', error);
        };

        return () => {
            if (socket.readyState === 1) { // 1 means OPEN
                socket.close();
            }
        };
    }, []);
    
    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Products</h2>
                {canModify && (
                    <Button variant="primary" onClick={handleShowModal}>
                        Add Product
                    </Button>
                )}
            </div>

            <AddProductModal 
                show={showModal} 
                handleClose={handleCloseModal} 
                onProductAdded={handleProductAdded}
            />

            {selectedProduct && (
                <EditProductModal
                    show={showEditModal}
                    handleClose={handleCloseEditModal}
                    product={selectedProduct}
                    onProductUpdated={handleProductUpdated}
                />
            )}

            {productToAdjust && (
                <AdjustStockModal
                    show={showAdjustModal}
                    handleClose={handleCloseAdjustModal}
                    product={productToAdjust}
                    onStockUpdated={handleProductUpdated}
                />
            )}

            {error && <Alert variant="danger">{error}</Alert>}
            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>Product Name</th>
                        <th>SKU</th>
                        <th>Category</th>
                        <th>Stock</th>
                        <th>Price</th>
                        {canModify && <th>Actions</th>}
                    </tr>
                </thead>
                <tbody>
                    {products.length > 0 ? (
                        products.map(product => (
                            <tr key={product.id}>
                                <td>
                                    <Link to={`/products/${product.id}`}>{product.name}</Link>
                                </td>
                                <td>{product.sku}</td>
                                <td>{product.category.name}</td>
                                <td>{product.quantity}</td>
                                <td>${parseFloat(product.sale_price).toFixed(2)}</td>
                                {canModify && (
                                    <td>
                                        <Button variant="info" size="sm" className="me-2" title="Adjust Stock" onClick={() => handleShowAdjustModal(product)}>
                                            <ArrowClockwise />
                                        </Button>
                                        <Button variant="warning" size="sm" className="me-2" title="Edit Product" onClick={() => handleShowEditModal(product)}>
                                            <PencilSquare />
                                        </Button>
                                        <Button variant="danger" size="sm" title="Delete Product" onClick={() => handleDelete(product.id)}>
                                            <Trash />
                                        </Button>
                                    </td>
                                )}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={canModify ? "6" : "5"} className="text-center">No products found.</td>
                        </tr>
                    )}
                </tbody>
            </Table>
        </div>
    );
};

export default ProductList;