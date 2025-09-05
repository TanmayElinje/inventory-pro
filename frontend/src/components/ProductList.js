// frontend/src/components/ProductList.js

import React from 'react';
import { Container, Alert, Button, Pagination, Form, Row, Col, Card, ListGroup, ButtonGroup, Carousel } from 'react-bootstrap';
import { PencilSquare, Trash, ArrowClockwise } from 'react-bootstrap-icons';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AddProductModal from './AddProductModal';
import EditProductModal from './EditProductModal';
import AdjustStockModal from './AdjustStockModal';
import api from '../api/axiosConfig';

const ProductCard = ({ user, product, onAdjustClick, onEditClick, onDeleteClick }) => {
    const canAdjustStock = user && (user.groups.includes('Admin') || user.groups.includes('Manager') || user.groups.includes('Staff'));
    const canEditDelete = user && (user.groups.includes('Admin') || user.groups.includes('Manager'));
    return (
        <Card className="h-100 card-lift">
            {/* --- THIS IS THE NEW CAROUSEL --- */}
            {product.images && product.images.length > 0 ? (
                <Carousel interval={null} indicators={false}>
                    {product.images.map(img => (
                        <Carousel.Item key={img.id}>
                            <Link to={`/products/${product.id}`}>
                                <img
                                    className="d-block w-100 product-card-img"
                                    src={img.image}
                                    alt={product.name}
                                />
                            </Link>
                        </Carousel.Item>
                    ))}
                </Carousel>
                ) : (
            <Link to={`/products/${product.id}`}>
                    <Card.Img
                        variant="top"
                        src={'https://via.placeholder.com/300x200.png?text=No+Image'}
                        className="product-card-img"
                    />
                </Link>
            )}
            <Card.Body className="d-flex flex-column">
                <Card.Title><Link to={`/products/${product.id}`} className="text-dark text-decoration-none">{product.name}</Link></Card.Title>
                <ListGroup variant="flush" className="flex-grow-1">
                    <ListGroup.Item>SKU: {product.sku}</ListGroup.Item>
                    <ListGroup.Item>Category: {product.category.name}</ListGroup.Item>
                    <ListGroup.Item>Stock: <strong>{product.quantity}</strong></ListGroup.Item>
                </ListGroup>
                <Card.Text className="mt-auto fs-5 fw-bold text-end">${parseFloat(product.sale_price).toFixed(2)}</Card.Text>
            </Card.Body>
            {canAdjustStock && (<Card.Footer><ButtonGroup style={{ width: '100%' }}><Button variant="info" size="sm" title="Adjust Stock" onClick={onAdjustClick}><ArrowClockwise size={20} /></Button>{canEditDelete && <Button variant="warning" size="sm" title="Edit Product" onClick={onEditClick}><PencilSquare size={20} /></Button>}{canEditDelete && <Button variant="danger" size="sm" title="Delete Product" onClick={onDeleteClick}><Trash size={20} /></Button>}</ButtonGroup></Card.Footer>)}
        </Card>
    );
};

const ProductList = () => {
    const { user } = useAuth();
    const [products, setProducts] = React.useState([]);
    const [pagination, setPagination] = React.useState(null);
    const [error, setError] = React.useState('');
    const [modalState, setModalState] = React.useState({ type: null, data: null });
    const [pageTitle, setPageTitle] = React.useState('All Products');
    
    const location = useLocation();
    const navigate = useNavigate();
    const { categoryId } = useParams();

    const searchParams = React.useMemo(() => new URLSearchParams(location.search), [location.search]);
    const [filters, setFilters] = React.useState({
        search: searchParams.get('search') || '',
        sale_price__gt: searchParams.get('sale_price__gt') || '',
        sale_price__lt: searchParams.get('sale_price__lt') || '',
    });

    const canModify = user && (user.groups.includes('Admin') || user.groups.includes('Manager'));
    
    // This single useEffect fetches data based on the URL.
    React.useEffect(() => {
        const params = new URLSearchParams(location.search);
        // If a categoryId is in the path (e.g. /categories/5/products), it takes precedence.
        if (categoryId) {
            params.set('category', categoryId);
            // Fetch the category name to display in the title
            api.get(`/api/categories/${categoryId}/`)
               .then(res => setPageTitle(`Products in ${res.data.name}`))
               .catch(err => console.error("Could not fetch category title"));
        } else {
            setPageTitle('All Products');
        }

        const apiUrl = `/api/products/?${params.toString()}`;
        api.get(apiUrl)
            .then(response => {
                setProducts(response.data.results);
                setPagination(response.data);
            })
            .catch(error => setError('Could not fetch products.'));
    }, [location.search, categoryId]);

    // WebSocket useEffect (no change, runs once)
    React.useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) return;
        const socket = new WebSocket(`ws://localhost:8000/ws/products/?token=${token}`);
        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'product_update') {
                setProducts(currentProducts =>
                    currentProducts.map(p => p.id === data.product.id ? data.product : p)
                );
            }
        };
        return () => { if (socket.readyState === WebSocket.OPEN) socket.close(); };
    }, []);

    const handleFilterChange = (e) => {
        setFilters(prevFilters => ({...prevFilters, [e.target.name]: e.target.value }));
    };

    const handleApplyFilters = () => {
        const params = new URLSearchParams();
        if (filters.search) params.set('search', filters.search);
        if (filters.sale_price__gt) params.set('sale_price__gt', filters.sale_price__gt);
        if (filters.sale_price__lt) params.set('sale_price__lt', filters.sale_price__lt);
        navigate(`/products?${params.toString()}`);
    };

    const handleClearFilters = () => {
        setFilters({ search: '', sale_price__gt: '', sale_price__lt: '' });
        navigate('/products');
    };
    
    const handlePageChange = (url) => {
        if (!url) return;
        const searchString = new URL(url).search;
        const basePath = categoryId ? `/categories/${categoryId}/products` : '/products';
        navigate(`${basePath}${searchString}`);
    };
    
    const handleCloseModal = () => setModalState({ type: null, data: null });
    const handleActionSuccess = () => { navigate(0); handleCloseModal(); }; // Simplified: just refresh
    const handleDelete = async (productId) => { if (window.confirm('Are you sure?')) { try { await api.delete(`/api/products/${productId}/`); handleActionSuccess(); } catch (error) { setError('Could not delete product.'); } } };
    
    const totalPages = Math.ceil((pagination?.count || 0) / 50);
    const currentPage = pagination ? (new URLSearchParams(location.search).get('page') || 1) : 1;

    return (
        <Container className="mt-4">
            <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2>{pageTitle}</h2>
                    {canModify && (<Button variant="primary" onClick={() => setModalState({ type: 'add' })}>Add Product</Button>)}
                </div>
                
                {/* Don't show filters when viewing a specific category's page */}
                {!categoryId && (
                    <Card className="mb-4">
                        <Card.Body>
                            <Form onSubmit={(e) => { e.preventDefault(); handleApplyFilters(); }}>
                                <Row className="align-items-end">
                                    <Col md={5}><Form.Group><Form.Label>Search</Form.Label><Form.Control type="text" name="search" placeholder="By name, SKU, or category..." value={filters.search} onChange={handleFilterChange}/></Form.Group></Col>
                                    <Col md={2}><Form.Group><Form.Label>Price Greater Than</Form.Label><Form.Control type="number" name="sale_price__gt" value={filters.sale_price__gt} onChange={handleFilterChange}/></Form.Group></Col>
                                    <Col md={2}><Form.Group><Form.Label>Price Less Than</Form.Label><Form.Control type="number" name="sale_price__lt" value={filters.sale_price__lt} onChange={handleFilterChange}/></Form.Group></Col>
                                    <Col md={3} className="d-grid gap-2 d-md-flex justify-content-md-end align-items-end">
                                        <Button variant="outline-secondary" onClick={handleClearFilters}>Clear Filters</Button>
                                        <Button variant="primary" type="submit">Apply Filters</Button>
                                    </Col>
                                </Row>
                            </Form>
                        </Card.Body>
                    </Card>
                )}

                <AddProductModal show={modalState.type === 'add'} handleClose={handleCloseModal} onProductAdded={handleActionSuccess} />
                <EditProductModal show={modalState.type === 'edit'} handleClose={handleCloseModal} product={modalState.data} onProductUpdated={handleActionSuccess}/>
                <AdjustStockModal show={modalState.type === 'adjust'} handleClose={handleCloseModal} product={modalState.data} onStockUpdated={handleActionSuccess}/>

                {error && <Alert variant="danger">{error}</Alert>}

                <Row xs={1} md={2} lg={4} xl={5} className="g-4">
                    {products.map(product => (
                        <Col key={product.id}>
                            <ProductCard user={user} product={product} onAdjustClick={() => setModalState({ type: 'adjust', data: product })} onEditClick={() => setModalState({ type: 'edit', data: product })} onDeleteClick={() => handleDelete(product.id)} />
                        </Col>
                    ))}
                </Row>
                
                {totalPages > 1 && pagination && (
                    <div className="d-flex justify-content-center mt-4">
                        <Pagination>
                            <Pagination.Prev onClick={() => handlePageChange(pagination.previous)} disabled={!pagination.previous} />
                            <Pagination.Item disabled>Page {currentPage} of {totalPages}</Pagination.Item>
                            <Pagination.Next onClick={() => handlePageChange(pagination.next)} disabled={!pagination.next} />
                        </Pagination>
                    </div>
                )}
            </div>
        </Container>
    );
};

export default ProductList;