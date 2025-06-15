import React, { useState } from 'react';

function NetworkTest() {
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (message, type = 'info') => {
    setTestResults(prev => [...prev, { 
      message, 
      type, 
      timestamp: new Date().toLocaleTimeString() 
    }]);
  };

  const testDirectFetch = async () => {
    setIsLoading(true);
    addResult('Testing direct fetch to GraphQL endpoint...', 'info');

    try {
      const response = await fetch('https://glidel.store/graphql.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          query: 'query cart { cart { id product { id name price image } quantity } }'
        })
      });

      addResult(`Response status: ${response.status}`, response.ok ? 'success' : 'error');
      
      const data = await response.json();
      addResult(`Response data: ${JSON.stringify(data)}`, 'info');

      if (data.data && data.data.cart) {
        addResult(`Cart items found: ${data.data.cart.length}`, 'success');
        
        if (data.data.cart.length > 0) {
          // Test remove mutation
          const firstItemId = data.data.cart[0].id;
          addResult(`Testing remove mutation for item ${firstItemId}...`, 'info');
          
          const removeResponse = await fetch('http://localhost:8000', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              query: 'mutation RemoveFromCart($itemId: ID!) { removeFromCart(itemId: $itemId) { id product { id name price image } quantity } }',
              variables: { itemId: String(firstItemId) }
            })
          });

          const removeData = await removeResponse.json();
          addResult(`Remove response: ${JSON.stringify(removeData)}`, removeResponse.ok ? 'success' : 'error');
        }
      } else if (data.errors) {
        addResult(`GraphQL errors: ${JSON.stringify(data.errors)}`, 'error');
      }

    } catch (error) {
      addResult(`Network error: ${error.message}`, 'error');
      console.error('Network test error:', error);
    }

    setIsLoading(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Network Test</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={testDirectFetch}
          disabled={isLoading}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#4CAF50', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            marginRight: '10px'
          }}
        >
          {isLoading ? 'Testing...' : 'Test Direct Fetch'}
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
        <div style={{ 
          maxHeight: '400px', 
          overflowY: 'auto', 
          border: '1px solid #ccc', 
          padding: '10px',
          backgroundColor: '#f9f9f9'
        }}>
          {testResults.map((result, index) => (
            <div 
              key={index} 
              style={{ 
                color: result.type === 'error' ? 'red' : 
                       result.type === 'success' ? 'green' : 
                       result.type === 'warning' ? 'orange' : 'blue',
                marginBottom: '5px',
                fontFamily: 'monospace',
                fontSize: '12px'
              }}
            >
              [{result.timestamp}] {result.message}
            </div>
          ))}
          {testResults.length === 0 && (
            <div style={{ color: '#888', fontStyle: 'italic' }}>
              No test results yet. Click "Test Direct Fetch" to start.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NetworkTest;

