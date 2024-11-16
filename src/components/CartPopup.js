import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_CART_QUERY } from '../graphql/queries';
import '../styles/CartPopup.css';

function CartPopup({ isOpen, closePopup }) {
  const { loading, error, data } = useQuery(GET_CART_QUERY);
  
  if (!isOpen) return null;
  
  if (loading) return <div className="cart-popup">Loading...</div>;
  if (error) return <div className="cart-popup">Error loading cart</div>;
  
  const cartItems = data;

  return (
    <div className="cart-popup">
      <button onClick={closePopup} className="close-popup-btn">X</button>
      <h2>My Cart</h2>
      {cartItems === "undefined" ? (
        <p>Your cart is empty.</p>
      ) : (
        cartItems.map((item) => (
          <div key={item.id} className="cart-item">
            <img src={item.product.image_url} alt={item.product.name} />
            <div>
              <p>{item.product.name}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default CartPopup;
