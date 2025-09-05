// frontend/src/components/AddProductModal.js

import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import api from '../api/axiosConfig';

const AddProductModal = ({ show, handleClose, onProductAdded }) => {
    const [productData, setProductData] = useState({ name: '', sku: '', quantity: 0, sale_price: '', cost_price: '', category_id: '', supplier_id: '' });
    const [productImage, setProductImage] = useState(null); // State for the image file
    const [categories, setCategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]);

    useEffect(() => {
        if (show) {
            // Reset form on open
            setProductData({ name: '', sku: '', quantity: 0, sale_price: '', cost_price: '', category_id: '', supplier_id: '' });
            setProductImage(null);
            
            api.get('/api/categories/').then(res => setCategories(res.data.results || res.data));
            api.get('/api/suppliers/').then(res => setSuppliers(res.data.results || res.data));
        }
    }, [show]);

    const handleChange = (e) => {
        setProductData({ ...productData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        setProductImage(e.target.files[0]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        // Append all text data
        for (const key in productData) {
            formData.append(key, productData[key]);
        }
        // Append the image file if it exists
        if (productImage) {
            formData.append('image', productImage);
        }

        api.post('/api/products/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }).then(res => {
            onProductAdded(res.data);
            handleClose();
        }).catch(err => {
            console.error("Error adding product:", err.response.data);
            alert('Failed to add product.');
        });
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Add New Product</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3"><Form.Label>Product Name</Form.Label><Form.Control type="text" name="name" onChange={handleChange} required /></Form.Group>
                    <Form.Group className="mb-3"><Form.Label>SKU</Form.Label><Form.Control type="text" name="sku" onChange={handleChange} required /></Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Category</Form.Label>
                        <Form.Select name="category_id" onChange={handleChange} required>
                            <option value="">Select Category</option>
                            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Supplier</Form.Label>
                        <Form.Select name="supplier_id" onChange={handleChange} required>
                            <option value="">Select Supplier</option>
                            {suppliers.map(sup => <option key={sup.id} value={sup.id}>{sup.name}</option>)}
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3"><Form.Label>Quantity</Form.Label><Form.Control type="number" name="quantity" onChange={handleChange} required /></Form.Group>
                    <Form.Group className="mb-3"><Form.Label>Cost Price ($)</Form.Label><Form.Control type="text" name="cost_price" onChange={handleChange} required /></Form.Group>
                    <Form.Group className="mb-3"><Form.Label>Sale Price ($)</Form.Label><Form.Control type="text" name="sale_price" onChange={handleChange} required /></Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Product Image</Form.Label>
                        <Form.Control type="file" name="image" onChange={handleImageChange} />
                    </Form.Group>
                    <Button variant="primary" type="submit">Save Product</Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default AddProductModal;