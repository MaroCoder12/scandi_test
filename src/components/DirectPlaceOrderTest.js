import React, { useState } from 'react';

function DirectPlaceOrderTest() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testDirectGraphQL = async () => {
    setLoading(true);
    setResult('Testing...');
    
    try {
      // First, check current cart
      console.log('1. Checking current cart...');
      const cartResponse = await fetch('http://localhost:8000', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query {
              cart {
                id
                product {
                  id
                  name
                  price
                }
                quantity
              }
            }
          `
        })
      });
      
      const cartData = await cartResponse.json();
      console.log('Cart before order:', cartData);
      setResult(prev => prev + '\n\nCart before order: ' + JSON.stringify(cartData, null, 2));
      
      // Place order
      console.log('2. Placing order...');
      const orderResponse = await fetch('http://localhost:8000', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation {
              placeOrder {
                success
                message
              }
            }
          `
        })
      });
      
      const orderData = await orderResponse.json();
      console.log('Order result:', orderData);
      setResult(prev => prev + '\n\nOrder result: ' + JSON.stringify(orderData, null, 2));
      
      // Check cart after order
      console.log('3. Checking cart after order...');
      const cartAfterResponse = await fetch('http://localhost:8000', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query {
              cart {
                id
                product {
                  id
                  name
                  price
                }
                quantity
              }
            }
          `
        })
      });
      
      const cartAfterData = await cartAfterResponse.json();
      console.log('Cart after order:', cartAfterData);
      setResult(prev => prev + '\n\nCart after order: ' + JSON.stringify(cartAfterData, null, 2));
      
      // Summary
      const beforeCount = cartData.data?.cart?.length || 0;
      const afterCount = cartAfterData.data?.cart?.length || 0;
      
      setResult(prev => prev + '\n\n=== SUMMARY ===');
      setResult(prev => prev + `\nItems before order: ${beforeCount}`);
      setResult(prev => prev + `\nItems after order: ${afterCount}`);
      setResult(prev => prev + `\nOrder success: ${orderData.data?.placeOrder?.success}`);
      
      if (afterCount === 0) {
        setResult(prev => prev + '\n✅ SUCCESS: Cart properly cleared!');
      } else {
        setResult(prev => prev + '\n❌ FAILED: Cart still has items!');
      }
      
    } catch (error) {
      console.error('Test error:', error);
      setResult(prev => prev + '\n\nERROR: ' + error.message);
    }
    
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Direct GraphQL Place Order Test</h2>
      
      <button 
        onClick={testDirectGraphQL}
        disabled={loading}
        style={{
          padding: '10px 20px',
          backgroundColor: loading ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: '20px'
        }}
      >
        {loading ? 'Testing...' : 'Test Place Order (Direct GraphQL)'}
      </button>
      
      <div style={{
        backgroundColor: '#f8f9fa',
        border: '1px solid #dee2e6',
        borderRadius: '5px',
        padding: '15px',
        minHeight: '200px',
        whiteSpace: 'pre-wrap',
        fontFamily: 'monospace',
        fontSize: '12px'
      }}>
        {result || 'Click the button to run the test...'}
      </div>
      
      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p><strong>This test:</strong></p>
        <ol>
          <li>Checks current cart items</li>
          <li>Places an order via direct GraphQL</li>
          <li>Checks cart items after order</li>
          <li>Compares before/after to verify cart clearing</li>
        </ol>
      </div>
    </div>
  );
}

export default DirectPlaceOrderTest;
