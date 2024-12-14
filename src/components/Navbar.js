// src/components/Navbar.js
import React, { useState } from 'react';
import CartPopup from './CartPopup';
import { useQuery } from '@apollo/client';
import { GET_CART_QUERY } from '../graphql/queries';
import { NavLink } from 'react-router-dom';
import logo from '../assets/img/Group.svg';
import cart from '../assets/img/Vector.svg';
import '../styles/NavBar.css';

function Navbar() {
  const [isCartOpen, setIsCartOpen] = useState(false);  
  const { data } = useQuery(GET_CART_QUERY);

  const cartCount = data?.reduce((total, item) => total + item.quantity, 0) || 0;

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : '')}>All</NavLink>
        <NavLink data-testid='category-link' to="/category/clothes" className={({ isActive }) => (isActive ? 'active' : '')}>Clothes</NavLink>
        <NavLink data-testid='category-link' to="/category/tech" className={({ isActive }) => (isActive ? 'active' : '')}>Tech</NavLink>
      </div>
      <img src={logo} width={30} height={30}/>
      <div className="navbar-right">
        <div className="cart-icon-container" onClick={() => setIsCartOpen(!isCartOpen)}>
          <img src={cart} width={20} height={20}/>
          {cartCount === 0 ? null : (
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
