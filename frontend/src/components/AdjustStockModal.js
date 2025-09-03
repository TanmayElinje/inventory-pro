// frontend/src/components/AdjustStockModal.js

import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';

const AdjustStockModal = ({ show, handleClose, product, onStockUpdated }) => {
    const [quantityChange, setQuantityChange] = useState(0);
    const [reason, setReason] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = {
            quantity_change: quantityChange,
            reason: reason,
        };

        axios.post(`/api/products/${product.id}/adjust_stock/`, data)
            .then(res => {
                onStockUpdated(res.data); // Update the product list in the parent
                handleClose(); // Close the modal
                setQuantityChange(0); // Reset form
                setReason('');
            })
            .catch(err => {
                console.error(err);
                alert('Error adjusting stock: ' + (err.response?.data?.error || 'Unknown error'));
            });
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Adjust Stock for {product?.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Quantity Change</Form.Label>
                        <Form.Control 
                            type="number"
                            placeholder="e.g., 10 for stock-in, -5 for stock-out"
                            value={quantityChange}
                            onChange={(e) => setQuantityChange(e.target.value)} 
                            required 
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Reason</Form.Label>
                        <Form.Control 
                            type="text"
                            placeholder="e.g., 'New shipment' or 'Sold item'"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)} 
                            required 
                        />
                    </Form.Group>
                    <Button variant="primary" type="submit">
                        Submit Adjustment
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default AdjustStockModal;