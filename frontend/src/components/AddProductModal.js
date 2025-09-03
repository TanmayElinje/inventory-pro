// frontend/src/components/AddProductModal.js

import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';

const AddProductModal = ({ show, handleClose, onProductAdded }) => {
    const [productData, setProductData] = useState({
        name: '', sku: '', quantity: 0, sale_price: '', cost_price: '',
        category_id: '', supplier_id: ''
    });
    const [categories, setCategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]);

    useEffect(() => {
        // Fetch categories and suppliers when the modal is shown
        if (show) {
            axios.get('http://127.0.0.1:8000/api/categories/')
                .then(res => setCategories(res.data))
                .catch(err => console.log(err));

            axios.get('http://127.0.0.1:8000/api/suppliers/')
                .then(res => setSuppliers(res.data))
                .catch(err => console.log(err));
        }
    }, [show]);

    const handleChange = (e) => {
        setProductData({ ...productData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post('http://127.0.0.1:8000/api/products/', productData)
            .then(res => {
                onProductAdded(res.data); // Pass the new product to the parent
                handleClose(); // Close the modal
            })
            .catch(err => console.log(err.response.data));
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Add New Product</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Product Name</Form.Label>
                        <Form.Control type="text" name="name" onChange={handleChange} required />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>SKU</Form.Label>
                        <Form.Control type="text" name="sku" onChange={handleChange} required />
                    </Form.Group>
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
                    <Form.Group className="mb-3">
                        <Form.Label>Quantity</Form.Label>
                        <Form.Control type="number" name="quantity" onChange={handleChange} required />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Cost Price ($)</Form.Label>
                        <Form.Control type="text" name="cost_price" onChange={handleChange} required />
                    </Form.Group>
                     <Form.Group className="mb-3">
                        <Form.Label>Sale Price ($)</Form.Label>
                        <Form.Control type="text" name="sale_price" onChange={handleChange} required />
                    </Form.Group>
                    <Button variant="primary" type="submit">
                        Save Product
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default AddProductModal;