import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_CART_QUERY } from '../graphql/queries';
import { PLACE_ORDER_MUTATION } from '../graphql/mutations';

function FinalCartTest() {
  const [logs, setLogs] = useState([]);
  const { loading, error, data, refetch } = useQuery(GET_CART_QUERY, {
    fetchPolicy: 'network-only'
  });
  
  const [placeOrder] = useMutation(PLACE_ORDER_MUTATION);

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(message);
  };

  const cartItems = data?.cart || [];

  const testPlaceOrder = async () => {
    setLogs([]);
    addLog('🚀 Starting place order test...');
    addLog(`📦 Cart items before order: ${cartItems.length}`);
    
    if (cartItems.length === 0) {
      addLog('❌ No items in cart to test with');
      return;
    }

    try {
      addLog('📤 Sending place order mutation...');
      const result = await placeOrder();
      addLog(`✅ Place order mutation completed: ${JSON.stringify(result.data)}`);
      
      addLog('🔄 Refetching cart data...');
      const refetchResult = await refetch();
      addLog(`📥 Refetch completed. New cart items: ${refetchResult.data?.cart?.length || 0}`);
      
      if (refetchResult.data?.cart?.length === 0) {
        addLog('🎉 SUCCESS: Cart is now empty!');
      } else {
        addLog('❌ FAILED: Cart still has items after order');
        addLog(`Remaining items: ${JSON.stringify(refetchResult.data.cart)}`);
      }
      
    } catch (err) {
      addLog(`❌ ERROR: ${err.message}`);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  if (loading) return <div>Loading cart...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Final Cart Place Order Test</h2>
      
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
        <h3>Current Cart Status</h3>
        <p><strong>Items in cart: {cartItems.length}</strong></p>
        {cartItems.map((item, index) => (
          <div key={item.id} style={{ marginBottom: '5px' }}>
            • {item.product.name} (Qty: {item.quantity})
          </div>
        ))}
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={testPlaceOrder}
          disabled={cartItems.length === 0}
          style={{
            padding: '10px 20px',
            backgroundColor: cartItems.length === 0 ? '#ccc' : '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: cartItems.length === 0 ? 'not-allowed' : 'pointer',
            marginRight: '10px'
          }}
        >
          🧪 Test Place Order
        </button>
        
        <button 
          onClick={() => refetch()}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          🔄 Refresh Cart
        </button>
        
        <button 
          onClick={clearLogs}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          🗑️ Clear Logs
        </button>
      </div>
      
      <div style={{
        backgroundColor: '#000',
        color: '#00ff00',
        padding: '15px',
        borderRadius: '5px',
        minHeight: '300px',
        fontFamily: 'monospace',
        fontSize: '12px',
        whiteSpace: 'pre-wrap',
        overflow: 'auto'
      }}>
        <div style={{ color: '#00ff00', marginBottom: '10px' }}>
          === CART PLACE ORDER TEST CONSOLE ===
        </div>
        {logs.length === 0 ? (
          <div style={{ color: '#888' }}>
            Ready to test... Click "Test Place Order" button above.
            {cartItems.length === 0 && '\n\n⚠️  Add some items to cart first from the main page.'}
          </div>
        ) : (
          logs.map((log, index) => (
            <div key={index}>{log}</div>
          ))
        )}
      </div>
      
      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p><strong>Instructions:</strong></p>
        <ol>
          <li>Add items to cart from the main page</li>
          <li>Come back here and click "Test Place Order"</li>
          <li>Watch the console logs to see exactly what happens</li>
          <li>This will help us identify where the issue is</li>
        </ol>
      </div>
    </div>
  );
}

export default FinalCartTest;
