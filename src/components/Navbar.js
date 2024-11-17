// src/components/Navbar.js
import React, { useState } from 'react';
import { FaShoppingCart } from 'react-icons/fa';
import CartPopup from './CartPopup';
import IconComponent from './IconComponent';
import { useQuery } from '@apollo/client';
import { GET_CART_QUERY } from '../graphql/queries';
import '../styles/NavBar.css';

function Navbar() {
  const [isCartOpen, setIsCartOpen] = useState(false);  
  const {loading, data } = useQuery(GET_CART_QUERY);  


  const cartCount = data?.reduce((total, item) => total + item.quantity, 0) || 0;

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <a href="/">All</a>
        <a href="/category/clothes">Clothes</a>
        <a href="/category/tech">Tech</a>
      </div>
      <div className="navbar-right">
        <a href='/login'><IconComponent type="login"></IconComponent></a>
        <a href='/signup'><IconComponent type="signup"></IconComponent></a>
        <div className="cart-icon-container">
          <FaShoppingCart className="cart-icon" onClick={() => setIsCartOpen(!isCartOpen)} />
          {loading ? null : (
            <span className="cart-count">{cartCount}</span>
          )}
        </div>
      </div>
      <CartPopup
        isOpen={isCartOpen}
        closePopup={() => setIsCartOpen(false)}
        cartItems={data}
      />
    </nav>
  );
}

export default Navbar;
