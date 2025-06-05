import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_CART_QUERY } from '../graphql/queries';

function CartTest() {
  const { loading, error, data } = useQuery(GET_CART_QUERY);

  if (loading) return <div>Loading cart...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const cartItems = data?.cart || [];

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Cart Test Page</h2>
      <p>Total items in cart: {cartItems.length}</p>

      {cartItems.length === 0 ? (
        <p>Cart is empty</p>
      ) : (
        <div>
          <h3>Cart Items:</h3>
          {cartItems.map((item, index) => (
            <div key={item.id} style={{
              border: '1px solid #ccc',
              padding: '10px',
              margin: '10px 0',
              borderRadius: '5px'
            }}>
              <p><strong>Item {index + 1}:</strong></p>
              <p>ID: {item.id}</p>
              <p>Product: {item.product.name}</p>
              <p>Price: ${item.product.price}</p>
              <p>Quantity: {item.quantity}</p>
              <p>Attributes: {item.product.attributes || 'No attributes'}</p>
              <p>Image: <img src={item.product.image} alt={item.product.name} style={{width: '50px', height: '50px', objectFit: 'cover'}} /></p>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        <p><strong>Raw cart data:</strong></p>
        <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '5px' }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
}

export default CartTest;
