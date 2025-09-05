import React, { useState } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import api from '../api/axiosConfig';
import { useUI } from '../context/UIContext';

const SignUpModal = () => {
    const { isSignUpModalOpen, closeSignUpModal, switchToLogin } = useUI();
    const [formData, setFormData] = useState({ username: '', email: '', password: '', password2: '', code: '' });
    const [error, setError] = useState({});
    const [success, setSuccess] = useState('');

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError({});
        setSuccess('');
        if (formData.password !== formData.password2) {
            setError({ password2: "Passwords do not match." });
            return;
        }
        try {
            await api.post('/api/register/', formData);
            setSuccess('Signup successful! Please log in.');
            setTimeout(() => {
                switchToLogin(); // Switch to the login modal
            }, 2000);
        } catch (err) {
            setError(err.response.data);
        }
    };

    return (
        <Modal show={isSignUpModalOpen} onHide={closeSignUpModal} centered dialogClassName="custom-login-modal">
            <Modal.Header closeButton>
                <Modal.Title className="w-100 text-center">Sign Up</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
                {success && <Alert variant="success">{success}</Alert>}
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3"><Form.Label>Username</Form.Label><Form.Control type="text" name="username" onChange={handleChange} isInvalid={!!error.username} required /><Form.Control.Feedback type="invalid">{error.username}</Form.Control.Feedback></Form.Group>
                    <Form.Group className="mb-3"><Form.Label>Email</Form.Label><Form.Control type="email" name="email" onChange={handleChange} isInvalid={!!error.email} required /><Form.Control.Feedback type="invalid">{error.email}</Form.Control.Feedback></Form.Group>
                    <Form.Group className="mb-3"><Form.Label>Password</Form.Label><Form.Control type="password" name="password" onChange={handleChange} isInvalid={!!error.password} required /><Form.Control.Feedback type="invalid">{error.password}</Form.Control.Feedback></Form.Group>
                    <Form.Group className="mb-3"><Form.Label>Confirm Password</Form.Label><Form.Control type="password" name="password2" onChange={handleChange} isInvalid={!!error.password2} required /><Form.Control.Feedback type="invalid">{error.password2}</Form.Control.Feedback></Form.Group>
                    <Form.Group className="mb-3"><Form.Label>Role Code</Form.Label><Form.Control type="text" name="code" onChange={handleChange} isInvalid={!!error.code} required /><Form.Control.Feedback type="invalid">{error.code}</Form.Control.Feedback></Form.Group>
                    <div className="d-grid mt-4"><Button type="submit" className="btn-custom-teal" size="lg">Sign Up</Button></div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default SignUpModal;

