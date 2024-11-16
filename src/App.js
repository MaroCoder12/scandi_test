
import React from 'react';
import Navbar from './components/Navbar';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ProductList from './components/ProductList';
import CartPopup from './components/CartPopup';  
import ProductDetails from './components/ProductDetails';
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';



function App() {
  return (
    <>
    <Navbar></Navbar>
    <Router>

      <Routes>
        <Route path="/" element={<ProductList />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/category/clothes" element={<ProductList category_id={14} category="clothes" />} />
        <Route path="/category/tech" element={<ProductList category_id={15} category="tech" />} />
        <Route path="/cart" element={<CartPopup />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
      </Routes>
    </Router>
    </>
  );
}

export default App;
