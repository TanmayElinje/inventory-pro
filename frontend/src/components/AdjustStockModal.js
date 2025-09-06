// frontend/src/components/AdjustStockModal.js

import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import api from '../api/axiosConfig'; 

const AdjustStockModal = ({ show, handleClose, product, onStockUpdated }) => {
    const [quantityChange, setQuantityChange] = useState('');
    const [reason, setReason] = useState('');

    const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
        quantity_change: Number(quantityChange),
        reason: reason,
    };

    api.post(`/api/products/${product.id}/adjust_stock/`, data)
        .then(res => {
            onStockUpdated(res.data); 
            setQuantityChange('');
            setReason('');
            handleClose();
        })
        .catch(err => {
            console.error("Full error response from backend:", err.response);
            
            let errorMessage = 'Please check your input.';
            if (err.response && err.response.data) {
                const errorData = err.response.data;
                const errorKey = Object.keys(errorData)[0];
                if (errorKey && Array.isArray(errorData[errorKey])) {
                    errorMessage = errorData[errorKey][0];
                } else if (errorData.error) {
                    errorMessage = errorData.error;
                }
            }
            alert(`Error adjusting stock: ${errorMessage}`);
        });
};

    React.useEffect(() => {
        if (show) {
            setQuantityChange('');
            setReason('');
        }
    }, [show]);

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
