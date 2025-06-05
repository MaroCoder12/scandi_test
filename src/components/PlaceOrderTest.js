import React from 'react';
import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import { GET_CART_QUERY } from '../graphql/queries';
import { PLACE_ORDER_MUTATION } from '../graphql/mutations';

function PlaceOrderTest() {
  const { loading, error, data, refetch } = useQuery(GET_CART_QUERY);
  const client = useApolloClient();
  
  const [placeOrder] = useMutation(PLACE_ORDER_MUTATION, {
    onCompleted: (data) => {
      console.log('Place order completed:', data);
    },
    onError: (error) => {
      console.error('Place order error:', error);
    }
  });

  const cartItems = data?.cart || [];

  const handlePlaceOrder = async () => {
    console.log('Testing place order...');
    console.log('Cart items before order:', cartItems);
    
    try {
      const result = await placeOrder({
        update: (cache, { data }) => {
          console.log('Updating cache after place order');
          cache.writeQuery({
            query: GET_CART_QUERY,
            data: { cart: [] }
          });
        }
      });
      
      console.log('Place order result:', result);
      
      // Force cache reset
      await client.resetStore();
      console.log('Cache reset completed');
      
      alert('Order placed successfully! Cart should be empty now.');
      
    } catch (err) {
      console.error('Place order error:', err);
      alert(`Failed to place order: ${err.message}`);
    }
  };

  const handleRefreshCart = () => {
    refetch();
  };

  if (loading) return <div>Loading cart...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Place Order Test</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <p><strong>Cart Items: {cartItems.length}</strong></p>
        {cartItems.length === 0 ? (
          <p>Cart is empty</p>
        ) : (
          <div>
            {cartItems.map((item, index) => (
              <div key={item.id} style={{ 
                border: '1px solid #ccc', 
                padding: '10px', 
                margin: '5px 0',
                borderRadius: '5px'
              }}>
                <p>Item {index + 1}: {item.product.name} (Qty: {item.quantity})</p>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={handlePlaceOrder}
          disabled={cartItems.length === 0}
          style={{
            padding: '10px 20px',
            backgroundColor: cartItems.length === 0 ? '#ccc' : '#5ECE7B',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: cartItems.length === 0 ? 'not-allowed' : 'pointer',
            marginRight: '10px'
          }}
        >
          Place Order
        </button>
        
        <button 
          onClick={handleRefreshCart}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Refresh Cart
        </button>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <p><strong>Instructions:</strong></p>
        <ol>
          <li>Add some items to cart from the main page</li>
          <li>Come back to this test page and refresh</li>
          <li>Click "Place Order" to test the functionality</li>
          <li>Check if cart is properly cleared after order</li>
        </ol>
      </div>
    </div>
  );
}

export default PlaceOrderTest;
