
import React from 'react';
import Navbar from './components/Navbar';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ProductList from './components/ProductList';
import CartPopup from './components/CartPopup';
import ProductDetails from './components/ProductDetails';
import TestCart from './components/TestCart';
import NetworkTest from './components/NetworkTest';
import CartTest from './components/CartTest';
import PlaceOrderTest from './components/PlaceOrderTest';
import DirectPlaceOrderTest from './components/DirectPlaceOrderTest';
import FinalCartTest from './components/FinalCartTest';
import DirectPlaceOrderEndpointTest from './components/DirectPlaceOrderEndpointTest';
import SmartRemovalTest from './components/SmartRemovalTest';
import 'typeface-raleway';


function App() {
  return (
    <>
    <Router>
    <Navbar></Navbar>
      <Routes>
        <Route path="/" element={<ProductList />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/category/clothes" element={<ProductList category_id={14} category="clothes" />} />
        <Route path="/category/tech" element={<ProductList category_id={15} category="tech" />} />
        <Route path="/cart" element={<CartPopup />} />
        <Route path="/test-cart" element={<TestCart />} />
        <Route path="/network-test" element={<NetworkTest />} />
        <Route path="/cart-test" element={<CartTest />} />
        <Route path="/place-order-test" element={<PlaceOrderTest />} />
        <Route path="/direct-place-order-test" element={<DirectPlaceOrderTest />} />
        <Route path="/final-cart-test" element={<FinalCartTest />} />
        <Route path="/endpoint-test" element={<DirectPlaceOrderEndpointTest />} />
        <Route path="/smart-removal-test" element={<SmartRemovalTest />} />
      </Routes>
    </Router>
    </>
  );
}

export default App;
