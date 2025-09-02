// frontend/src/App.js

import React from 'react';
import { Container } from 'react-bootstrap';
import ProductList from './components/ProductList'; // Import the component

function App() {
  return (
    <Container className="mt-4">
      <h1>Inventory Management System</h1>
      <hr />
      <ProductList /> {/* Add the component here */}
    </Container>
  );
}

export default App;