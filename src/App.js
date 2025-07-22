
import Navbar from './components/Navbar';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ProductList from './components/ProductList';
import CartPopup from './components/CartPopup';
import ProductDetails from './components/ProductDetails';
import { ToastProvider } from './contexts/ToastContext';
import 'typeface-raleway';


function App() {
  return (
    <ToastProvider>
      <Router>
        <Navbar></Navbar>
        <Routes>
          <Route path="/" element={<ProductList />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/category/clothes" element={<ProductList category_id={14} category="clothes" />} />
          <Route path="/category/tech" element={<ProductList category_id={15} category="tech" />} />
          <Route path="/cart" element={<CartPopup />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;
