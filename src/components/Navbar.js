// src/components/Navbar.js
import React, { useState } from 'react';
import { AiOutlineShoppingCart } from 'react-icons/ai';
import CartPopup from './CartPopup';
import '../styles/NavBar.css';

function Navbar() {
  const [isCartOpen, setIsCartOpen] = useState(false);  

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <a href="/">All</a>
        <a href="/category/clothes">Clothes</a>
        <a href="/category/tech">Tech</a>
      </div>
      <div className="navbar-right">
        <AiOutlineShoppingCart onClick={() => setIsCartOpen(!isCartOpen)} />
      </div>
      <CartPopup
        isOpen={isCartOpen}
        closePopup={() => setIsCartOpen(false)}
      />
    </nav>
  );
}

export default Navbar;
