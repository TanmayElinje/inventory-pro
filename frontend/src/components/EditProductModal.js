// frontend/src/components/EditProductModal.js

import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import api from '../api/axiosConfig';

const EditProductModal = ({ show, handleClose, product, onProductUpdated }) => {
    const [formData, setFormData] = useState({});
    const [productImage, setProductImage] = useState(null);
    const [categories, setCategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]);

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name, sku: product.sku, quantity: product.quantity,
                sale_price: product.sale_price, cost_price: product.cost_price,
                category_id: product.category.id, supplier_id: product.supplier.id,
            });
        }
        if (show) {
            setProductImage(null);
            api.get('/api/categories/').then(res => setCategories(res.data.results || res.data));
            api.get('/api/suppliers/').then(res => setSuppliers(res.data.results || res.data));
        }
    }, [product, show]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        setProductImage(e.target.files[0]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const data = new FormData();
        for (const key in formData) {
            data.append(key, formData[key]);
        }
        if (productImage) {
            data.append('image', productImage);
        }
        
        api.patch(`/api/products/${product.id}/`, data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }).then(res => {
            onProductUpdated(res.data);
            handleClose();
        }).catch(err => {
            console.error("Error updating product:", err.response.data);
            alert('Failed to update product.');
        });
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton><Modal.Title>Edit Product</Modal.Title></Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3"><Form.Label>Product Name</Form.Label><Form.Control type="text" name="name" value={formData.name || ''} onChange={handleChange} required /></Form.Group>
                    <Form.Group className="mb-3"><Form.Label>SKU</Form.Label><Form.Control type="text" name="sku" value={formData.sku || ''} onChange={handleChange} required /></Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Category</Form.Label>
                        <Form.Select name="category_id" value={formData.category_id || ''} onChange={handleChange} required>
                            <option value="">Select Category</option>
                            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Supplier</Form.Label>
                        <Form.Select name="supplier_id" value={formData.supplier_id || ''} onChange={handleChange} required>
                            <option value="">Select Supplier</option>
                            {suppliers.map(sup => <option key={sup.id} value={sup.id}>{sup.name}</option>)}
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3"><Form.Label>Quantity</Form.Label><Form.Control type="number" name="quantity" value={formData.quantity || ''} onChange={handleChange} required /></Form.Group>
                    <Form.Group className="mb-3"><Form.Label>Cost Price ($)</Form.Label><Form.Control type="text" name="cost_price" value={formData.cost_price || ''} onChange={handleChange} required /></Form.Group>
                    <Form.Group className="mb-3"><Form.Label>Sale Price ($)</Form.Label><Form.Control type="text" name="sale_price" value={formData.sale_price || ''} onChange={handleChange} required /></Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Upload New Image (Optional)</Form.Label>
                        <Form.Control type="file" name="image" onChange={handleImageChange} />
                    </Form.Group>
                    <Button variant="primary" type="submit">Save Changes</Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default EditProductModal;
