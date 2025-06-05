import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_CART_QUERY } from '../graphql/queries';
import { REMOVE_FROM_CART_MUTATION } from '../graphql/mutations';

function TestCart() {
  const [testResults, setTestResults] = useState([]);
  
  const { loading, error, data, refetch } = useQuery(GET_CART_QUERY, {
    onCompleted: (data) => {
      console.log('Cart query completed:', data);
      addTestResult('Cart query completed successfully', 'success');
    },
    onError: (error) => {
      console.error('Cart query error:', error);
      addTestResult(`Cart query error: ${error.message}`, 'error');
    }
  });

  const [removeFromCart] = useMutation(REMOVE_FROM_CART_MUTATION, {
    onCompleted: (data) => {
      console.log('Remove mutation completed:', data);
      addTestResult('Remove mutation completed successfully', 'success');
      refetch(); // Refetch cart data
    },
    onError: (error) => {
      console.error('Remove mutation error:', error);
      addTestResult(`Remove mutation error: ${error.message}`, 'error');
    }
  });

  const addTestResult = (message, type) => {
    setTestResults(prev => [...prev, { message, type, timestamp: new Date().toLocaleTimeString() }]);
  };

  const testRemoveItem = () => {
    if (data?.cart && data.cart.length > 0) {
      const firstItem = data.cart[0];
      console.log('Testing remove with item:', firstItem);
      addTestResult(`Testing remove for item ID: ${firstItem.id}`, 'info');
      
      removeFromCart({
        variables: { itemId: firstItem.id }
      });
    } else {
      addTestResult('No items in cart to remove', 'warning');
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  if (loading) return <div>Loading cart...</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Cart Test Page</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Cart Data:</h3>
        {error ? (
          <div style={{ color: 'red' }}>
            Error: {error.message}
          </div>
        ) : (
          <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={testRemoveItem}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#ff4444', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            marginRight: '10px'
          }}
        >
          Test Remove First Item
        </button>
        
        <button 
          onClick={() => refetch()}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#4444ff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            marginRight: '10px'
          }}
        >
          Refetch Cart
        </button>

        <button 
          onClick={clearResults}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#888', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px'
          }}
        >
          Clear Results
        </button>
      </div>

      <div>
        <h3>Test Results:</h3>
        <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px' }}>
          {testResults.map((result, index) => (
            <div 
              key={index} 
              style={{ 
                color: result.type === 'error' ? 'red' : result.type === 'success' ? 'green' : result.type === 'warning' ? 'orange' : 'blue',
                marginBottom: '5px'
              }}
            >
              [{result.timestamp}] {result.message}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TestCart;
