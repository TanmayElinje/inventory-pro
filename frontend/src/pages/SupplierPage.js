// frontend/src/pages/SupplierPage.js

import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Modal, Form, Alert, Pagination, InputGroup, Container } from 'react-bootstrap';
import { PencilSquare, Trash } from 'react-bootstrap-icons';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';

const SupplierPage = () => {
    const { user } = useAuth();
    const [suppliers, setSuppliers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentSupplier, setCurrentSupplier] = useState(null);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    const [pagination, setPagination] = useState({ next: null, previous: null, count: 0, currentPage: 1 });
    const [activePageUrl, setActivePageUrl] = useState('/api/suppliers/');
    const itemsPerPage = 50;

    const canModify = user && (user.groups.includes('Admin') || user.groups.includes('Manager'));

    const fetchSuppliers = useCallback((url) => {
        api.get(url)
            .then(res => {
                const results = res.data.results || res.data;
                const count = res.data.count === undefined ? results.length : res.data.count;
                setSuppliers(results);
                setPagination({
                    next: res.data.next || null,
                    previous: res.data.previous || null,
                    count: count,
                    currentPage: new URLSearchParams(url.split('?')[1]).get('page') || 1
                });
            })
            .catch(err => setError('Could not fetch suppliers.'));
    }, []);

    useEffect(() => {
        const timerId = setTimeout(() => { setDebouncedSearchTerm(searchTerm); }, 500);
        return () => clearTimeout(timerId);
    }, [searchTerm]);

    useEffect(() => {
        const params = new URLSearchParams();
        if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
        const url = `/api/suppliers/?${params.toString()}`;
        setActivePageUrl(url);
    }, [debouncedSearchTerm]);

    useEffect(() => {
        fetchSuppliers(activePageUrl);
    }, [activePageUrl, fetchSuppliers]);

    const handleClose = () => { setShowModal(false); setIsEditing(false); setCurrentSupplier(null); setError(''); };
    const handleShowAdd = () => { setCurrentSupplier({ name: '', contact_info: '' }); setIsEditing(false); setShowModal(true); };
    const handleShowEdit = (supplier) => { setCurrentSupplier(supplier); setIsEditing(true); setShowModal(true); };
    const handleDelete = (id) => { if (window.confirm('Are you sure?')) { api.delete(`/api/suppliers/${id}/`).then(() => fetchSuppliers(activePageUrl)).catch(err => setError('Could not delete supplier.')); } };
    const handleSubmit = (e) => { e.preventDefault(); const url = isEditing ? `/api/suppliers/${currentSupplier.id}/` : '/api/suppliers/'; const method = isEditing ? 'put' : 'post'; api[method](url, { name: currentSupplier.name, contact_info: currentSupplier.contact_info }).then(() => { fetchSuppliers(activePageUrl); handleClose(); }).catch(err => setError('Failed to save supplier.')); };
    const handlePageChange = (url) => { if (url) setActivePageUrl(url); };
    const totalPages = Math.ceil(pagination.count / itemsPerPage);

    return (
        <Container className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Manage Suppliers</h2>
                {canModify && <Button onClick={handleShowAdd}>Add New Supplier</Button>}
            </div>
            
            <Form.Group className="mb-3">
                <InputGroup>
                    <InputGroup.Text>Search</InputGroup.Text>
                    <Form.Control type="text" placeholder="Search by name or contact..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </InputGroup>
            </Form.Group>
            
            {error && <Alert variant="danger">{error}</Alert>}

            {/* --- THIS IS THE UPDATED PART --- */}
            <div className="table-container">
                <Table responsive className="custom-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Contact Info</th>
                            {canModify && <th>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {suppliers.map(sup => (
                            <tr key={sup.id}>
                                <td>{sup.name}</td>
                                <td>{sup.contact_info}</td>
                                {canModify && (
                                    <td>
                                        <Button variant="warning" size="sm" className="me-2" onClick={() => handleShowEdit(sup)}><PencilSquare /></Button>
                                        <Button variant="danger" size="sm" onClick={() => handleDelete(sup.id)}><Trash /></Button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
            
            {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-3">
                    <Pagination>
                        <Pagination.Prev onClick={() => handlePageChange(pagination.previous)} disabled={!pagination.previous} />
                        <Pagination.Item disabled>Page {pagination.currentPage} of {totalPages}</Pagination.Item>
                        <Pagination.Next onClick={() => handlePageChange(pagination.next)} disabled={!pagination.next} />
                    </Pagination>
                </div>
            )}

            {currentSupplier && (<Modal show={showModal} onHide={handleClose}><Modal.Header closeButton><Modal.Title>{isEditing ? 'Edit Supplier' : 'Add New Supplier'}</Modal.Title></Modal.Header><Form onSubmit={handleSubmit}><Modal.Body><Form.Group className="mb-3"><Form.Label>Supplier Name</Form.Label><Form.Control type="text" value={currentSupplier.name} onChange={e => setCurrentSupplier({ ...currentSupplier, name: e.target.value })} required /></Form.Group><Form.Group><Form.Label>Contact Info</Form.Label><Form.Control as="textarea" rows={3} value={currentSupplier.contact_info} onChange={e => setCurrentSupplier({ ...currentSupplier, contact_info: e.target.value })}/></Form.Group></Modal.Body><Modal.Footer><Button variant="secondary" onClick={handleClose}>Close</Button><Button variant="primary" type="submit">Save Changes</Button></Modal.Footer></Form></Modal>)}
        </Container>
    );
};

export default SupplierPage;