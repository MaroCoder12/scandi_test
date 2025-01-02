import React from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_CART_QUERY } from '../graphql/queries';
import { UPDATE_CART_MUTATION, REMOVE_FROM_CART_MUTATION, PLACE_ORDER_MUTATION } from '../graphql/mutations';
import '../styles/CartPopup.css';

function CartPopup({ isOpen, closePopup, cartItems }) {
  const { loading, error } = useQuery(GET_CART_QUERY);

  console.log(cartItems);
  

  // Mutations
  const [updateCartItem] = useMutation(UPDATE_CART_MUTATION);
  const [removeFromCart] = useMutation(REMOVE_FROM_CART_MUTATION);
  const [placeOrder] = useMutation(PLACE_ORDER_MUTATION);
  
  // Prevent rendering if the popup is closed
  if (!isOpen) return null;

  // Show loading state
  if (loading) return <div className="cart-popup">Loading...</div>;

  // Show error state
  if (error) return <div className="cart-popup">Error loading cart: {error.message}</div>;

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0).toFixed(2);
  };

  // Increase Quantity Handler
  const handleIncreaseQuantity = (itemId) => {
    window.location.reload();
    updateCartItem({
      variables: { itemId, quantityChange: 1 },
      refetchQueries: [{ query: GET_CART_QUERY }],
    });
  };

  // Decrease Quantity Handler
  const handleDecreaseQuantity = (itemId, currentQuantity) => {
    if (currentQuantity > 1) {
      window.location.reload();
      updateCartItem({
        variables: { itemId, quantityChange: -1 },
        refetchQueries: [{ query: GET_CART_QUERY }],
      });
    }
  };

  const handleRemoveProduct = (itemId) => {
    window.location.reload();
    removeFromCart({
      variables: { itemId },
      refetchQueries: [{ query: GET_CART_QUERY }],
    });
  };

  // Place Order Handler
  const handlePlaceOrder = () => {
    window.location.reload();
    placeOrder({
      refetchQueries: [{ query: GET_CART_QUERY }],
    })
      .then(() => alert('Order placed successfully!'))
      .catch((err) => alert(`Failed to place order: ${err.message}`));
  };

  return (
    <div className="modalBackground">
      <div className="modalContainer">
        <h2>My Bag, {cartItems.length} items</h2>
        {cartItems.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <div>
            {cartItems.map((item) => (
              <div key={item.id} className="cart-item" data-testId="">
                <div className="cart-item-details">
                  <p>{item.product.name}</p>
                  <p data-testid='cart-item-amount'>Price: ${item.product.price}</p>
                  
                  <div className="cart-item-controls">
                    <button data-testid='cart-item-amount-decrease' onClick={() => handleDecreaseQuantity(item.product.id, item.quantity)}>-</button>
                    <span>{item.quantity && item.quantity}</span>
                    <button data-testid='cart-item-amount-increase' onClick={() => handleIncreaseQuantity(item.product.id)}>+</button>
                  </div>
                </div>
                <img src={item.product.image_url} alt={item.product.name} />
              </div>
            ))}
              {/* Total Section */}
            <div className="total-section">
            <p>Total</p>
            <p>${calculateTotal()}</p>
            </div>
            <button onClick={handlePlaceOrder} className="place-order-btn">
              Place Order
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartPopup;
