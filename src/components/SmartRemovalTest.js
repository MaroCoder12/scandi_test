import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_CART_QUERY } from '../graphql/queries';

function SmartRemovalTest() {
  const [logs, setLogs] = useState([]);
  const { loading, error, data, refetch } = useQuery(GET_CART_QUERY, {
    fetchPolicy: 'network-only'
  });

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(message);
  };

  const cartItems = data?.cart || [];

  const testSmartRemoval = async (itemId, currentQuantity) => {
    setLogs([]);
    addLog('🧪 Testing smart item removal...');
    addLog(`📦 Item ID: ${itemId}, Current Quantity: ${currentQuantity}`);
    
    if (currentQuantity !== 1) {
      addLog('⚠️ This test only works with items that have quantity = 1');
      addLog('💡 Use the + and - buttons in the cart to set an item to quantity 1 first');
      return;
    }

    try {
      addLog('📤 Calling remove endpoint (simulating decrease from 1 to 0)...');
      
      const response = await fetch('http://localhost:8000/remove_from_cart_endpoint.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          variables: { itemId: String(itemId) }
        })
      });

      const result = await response.json();
      addLog(`📥 Remove result: ${JSON.stringify(result)}`);

      if (result.data?.removeFromCart || !result.errors) {
        addLog('🔄 Refetching cart data...');
        const refetchResult = await refetch();
        addLog(`📊 New cart items count: ${refetchResult.data?.cart?.length || 0}`);
        
        // Check if the specific item was removed
        const itemStillExists = refetchResult.data?.cart?.some(item => String(item.id) === String(itemId));
        
        if (!itemStillExists) {
          addLog('✅ SUCCESS: Item was removed from cart!');
        } else {
          addLog('❌ FAILED: Item still exists in cart');
        }
      } else {
        addLog(`❌ FAILED: ${result.errors?.[0]?.message || 'Unknown error'}`);
      }
      
    } catch (error) {
      addLog(`❌ ERROR: ${error.message}`);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  if (loading) return <div>Loading cart...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Smart Item Removal Test</h2>
      
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
        <h3>Current Cart Items</h3>
        {cartItems.length === 0 ? (
          <p>No items in cart. Add some items first.</p>
        ) : (
          cartItems.map((item, index) => (
            <div key={item.id} style={{ 
              marginBottom: '10px', 
              padding: '10px', 
              border: '1px solid #ddd', 
              borderRadius: '5px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <strong>{item.product.name}</strong> (Qty: {item.quantity})
                <br />
                <small>ID: {item.id}</small>
              </div>
              <button 
                onClick={() => testSmartRemoval(item.id, item.quantity)}
                disabled={item.quantity !== 1}
                style={{
                  padding: '5px 10px',
                  backgroundColor: item.quantity === 1 ? '#dc3545' : '#ccc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: item.quantity === 1 ? 'pointer' : 'not-allowed',
                  fontSize: '12px'
                }}
              >
                {item.quantity === 1 ? '🧪 Test Remove' : 'Set Qty to 1 first'}
              </button>
            </div>
          ))
        )}
      </div>
      
      <div style={{ marginBottom: '20px' }}>
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
        minHeight: '200px',
        fontFamily: 'monospace',
        fontSize: '12px',
        whiteSpace: 'pre-wrap',
        overflow: 'auto'
      }}>
        <div style={{ color: '#00ff00', marginBottom: '10px' }}>
          === SMART REMOVAL TEST CONSOLE ===
        </div>
        {logs.length === 0 ? (
          <div style={{ color: '#888' }}>
            Ready to test smart removal...
            {cartItems.length === 0 && '\n\n⚠️  Add some items to cart first from the main page.'}
            {cartItems.length > 0 && cartItems.every(item => item.quantity > 1) && '\n\n💡 Use the cart to decrease item quantities to 1, then test here.'}
          </div>
        ) : (
          logs.map((log, index) => (
            <div key={index}>{log}</div>
          ))
        )}
      </div>
      
      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p><strong>How to test smart removal:</strong></p>
        <ol>
          <li>Add items to cart from the main page</li>
          <li>Use the cart's - button to decrease quantities to 1</li>
          <li>Come back here and click "Test Remove" on items with quantity 1</li>
          <li>This simulates what happens when you click - on an item with quantity 1</li>
        </ol>
      </div>
    </div>
  );
}

export default SmartRemovalTest;
