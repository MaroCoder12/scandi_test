import React, { useState } from 'react';
import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import { GET_CART_QUERY } from '../graphql/queries';
import { UPDATE_CART_MUTATION, REMOVE_FROM_CART_MUTATION, PLACE_ORDER_MUTATION } from '../graphql/mutations';
import '../styles/CartPopup.css';

function CartPopup({ isOpen, closePopup, cartItems }) {
  const { loading, error, data, refetch } = useQuery(GET_CART_QUERY, {
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true
  });
  const client = useApolloClient();

  // State for managing selected options for each cart item
  const [selectedOptions, setSelectedOptions] = useState({});

  console.log('CartPopup props cartItems:', cartItems);
  console.log('CartPopup query data:', data);
  console.log('CartPopup query loading:', loading);
  console.log('CartPopup query error:', error);


  // Mutations
  const [updateCartItem] = useMutation(UPDATE_CART_MUTATION, {
    onError: (error) => {
      console.error('Update cart error:', error);
      console.error('GraphQL errors:', error.graphQLErrors);
      console.error('Network error:', error.networkError);
    },
    errorPolicy: 'all'
  });
  const [removeFromCart] = useMutation(REMOVE_FROM_CART_MUTATION, {
    onError: (error) => {
      console.error('Remove from cart error:', error);
      console.error('GraphQL errors:', error.graphQLErrors);
      console.error('Network error:', error.networkError);
    },
    errorPolicy: 'all'
  });
  const [placeOrder] = useMutation(PLACE_ORDER_MUTATION, {
    onError: (error) => {
      console.error('Place order error:', error);
      console.error('GraphQL errors:', error.graphQLErrors);
      console.error('Network error:', error.networkError);
    },
    errorPolicy: 'all'
  });

  // Prevent rendering if the popup is closed
  if (!isOpen) return null;

  // Show loading state
  if (loading) return <div className="cart-popup">Loading...</div>;

  // Show error state
  if (error) return <div className="cart-popup">Error loading cart: {error.message}</div>;

  // Use data from query instead of props for consistency
  const actualCartItems = data?.cart || cartItems || [];

  const calculateTotal = () => {
    if (!actualCartItems || !Array.isArray(actualCartItems)) return '0.00';
    return actualCartItems.reduce((total, item) => total + item.product.price * item.quantity, 0).toFixed(2);
  };

  const getTotalItemCount = () => {
    if (!actualCartItems || !Array.isArray(actualCartItems)) return 0;
    return actualCartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // Helper function to convert attribute name to kebab case
  const toKebabCase = (str) => {
    return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  };

  // Handle size selection
  const handleSizeSelect = (itemId, size) => {
    setSelectedOptions(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        size: size
      }
    }));
  };

  // Handle color selection
  const handleColorSelect = (itemId, color) => {
    setSelectedOptions(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        color: color
      }
    }));
  };

  // Get selected options for an item with defaults
  const getSelectedOptions = (itemId, productAttributes) => {
    if (!selectedOptions[itemId]) {
      // Set default selections based on available attributes
      const parsedAttributes = parseProductAttributes(productAttributes);
      const availableSizes = parsedAttributes.Size || parsedAttributes.size || ['S'];
      const availableColors = parsedAttributes.Color || parsedAttributes.color || ['#2B5D31'];

      return {
        size: availableSizes[0] || 'S',
        color: availableColors[0] || '#2B5D31'
      };
    }
    return selectedOptions[itemId];
  };

  // Parse product attributes
  const parseProductAttributes = (attributesString) => {
    try {
      if (!attributesString) return {};
      return JSON.parse(attributesString);
    } catch (error) {
      console.error('Error parsing product attributes:', error);
      return {};
    }
  };

  // Get attribute options for display
  const getAttributeOptions = (attributes, attributeName) => {
    const parsedAttributes = parseProductAttributes(attributes);
    return parsedAttributes[attributeName] || [];
  };

  // Increase Quantity Handler
  const handleIncreaseQuantity = (itemId) => {
    updateCartItem({
      variables: { itemId, quantityChange: 1 },
      refetchQueries: [{ query: GET_CART_QUERY }],
    })
    .then(() => {
      console.log('Quantity increased successfully');
    })
    .catch((error) => {
      console.error('Error increasing quantity:', error);
      alert('Failed to update quantity. Please try again.');
    });
  };

  // Decrease Quantity Handler - now removes item when quantity reaches 0
  const handleDecreaseQuantity = (itemId, currentQuantity) => {
    console.log('=== DECREASE QUANTITY DEBUG ===');
    console.log('Item ID:', itemId, 'Current Quantity:', currentQuantity);

    if (currentQuantity > 1) {
      // Decrease quantity by 1
      updateCartItem({
        variables: { itemId, quantityChange: -1 },
        refetchQueries: [{ query: GET_CART_QUERY }],
      })
      .then(() => {
        console.log('Quantity decreased successfully');
      })
      .catch((error) => {
        console.error('Error decreasing quantity:', error);
        alert('Failed to update quantity. Please try again.');
      });
    } else {
      // When quantity is 1, decrease it to 0 which should remove the item
      // Use the same updateCart mutation but with -1 to make it 0
      console.log('Quantity is 1, decreasing to 0 (should remove item)...');
      updateCartItem({
        variables: { itemId, quantityChange: -1 },
        refetchQueries: [{ query: GET_CART_QUERY }],
        awaitRefetchQueries: true
      })
      .then((result) => {
        console.log('Item quantity set to 0 (removed):', result);
      })
      .catch((error) => {
        console.error('Error removing item via quantity decrease:', error);
        alert('Failed to remove item. Please try again.');
      });
    }
  };

  const handleRemoveProduct = (itemId) => {
    console.log('=== REMOVE ITEM DEBUG ===');
    console.log('Attempting to remove item with ID:', itemId);
    console.log('Item ID type:', typeof itemId);
    console.log('Current cart items:', actualCartItems);

    // Convert itemId to string to ensure consistency
    const itemIdString = String(itemId);
    console.log('Using itemId as string:', itemIdString);

    removeFromCart({
      variables: { itemId: itemIdString },
      refetchQueries: [{ query: GET_CART_QUERY }],
      awaitRefetchQueries: true,
      optimisticResponse: {
        removeFromCart: {
          __typename: 'Cart',
          id: itemIdString,
          product: {
            __typename: 'Product',
            id: '',
            name: '',
            price: 0,
            image: ''
          },
          quantity: 0
        }
      },
      update: (cache, { data }) => {
        console.log('Cache update called with data:', data);
        try {
          // Update the cache to remove the item immediately
          const existingCart = cache.readQuery({ query: GET_CART_QUERY });
          console.log('Existing cart from cache:', existingCart);

          if (existingCart && existingCart.cart) {
            const updatedCart = existingCart.cart.filter(item => String(item.id) !== itemIdString);
            console.log('Updated cart after filter:', updatedCart);

            cache.writeQuery({
              query: GET_CART_QUERY,
              data: { cart: updatedCart }
            });
            console.log('Cache updated successfully');
          }
        } catch (cacheError) {
          console.error('Cache update error:', cacheError);
        }
      }
    })
    .then((result) => {
      console.log('=== REMOVE SUCCESS ===');
      console.log('Item removed successfully:', result);
      console.log('Mutation result data:', result.data);
    })
    .catch((error) => {
      console.error('=== REMOVE ERROR ===');
      console.error('Error removing item:', error);
      console.error('Error message:', error.message);
      console.error('GraphQL errors:', error.graphQLErrors);
      console.error('Network error:', error.networkError);
      console.error('Error stack:', error.stack);
      alert('Failed to remove item from cart. Please try again.');
    });
  };

  // Place Order Handler using dedicated endpoint
  const handlePlaceOrder = async () => {
    console.log('=== PLACE ORDER DEBUG ===');
    console.log('Current cart items before order:', actualCartItems);

    try {
      // Use dedicated place order endpoint
      console.log('Calling dedicated place order endpoint...');
      const response = await fetch('http://localhost:8000/place_order_endpoint.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation PlaceOrder {
              placeOrder {
                success
                message
              }
            }
          `
        })
      });

      const result = await response.json();
      console.log('=== PLACE ORDER SUCCESS ===');
      console.log('Order result:', result);

      if (result.data?.placeOrder?.success) {
        // Manually refetch the cart data
        console.log('Manually refetching cart data...');
        await refetch();
        console.log('Cart refetch completed');

        alert('Order placed successfully!');
        closePopup(); // Close the cart popup
      } else {
        throw new Error(result.data?.placeOrder?.message || 'Order failed');
      }

    } catch (err) {
      console.error('=== PLACE ORDER ERROR ===');
      console.error('Place order error:', err);
      alert(`Failed to place order: ${err.message}`);
    }
  };

  return (
    <div className="modalBackground">
      <div className="modalContainer">
        <div className="cart-header">
          <h2>My Bag, {getTotalItemCount()} items</h2>
          <button className="close-btn" onClick={closePopup}>×</button>
        </div>
        {!actualCartItems || actualCartItems.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <div className="cart-content">
            <div className="cart-items-container">
              {actualCartItems?.map((item, index) => {
                const itemOptions = getSelectedOptions(item.id, item.product.attributes);
                const productAttributes = parseProductAttributes(item.product.attributes);

                // Get available sizes and colors from product attributes
                const availableSizes = getAttributeOptions(item.product.attributes, 'Size') ||
                                     getAttributeOptions(item.product.attributes, 'size') ||
                                     ['XS', 'S', 'M', 'L']; // fallback
                const availableColors = getAttributeOptions(item.product.attributes, 'Color') ||
                                       getAttributeOptions(item.product.attributes, 'color') ||
                                       ['#C4D79B', '#2B5D31', '#0F4C3A']; // fallback

                console.log('Product attributes for', item.product.name, ':', productAttributes);
                console.log('Available sizes:', availableSizes);
                console.log('Available colors:', availableColors);

                return (
                  <div key={item.id} className="cart-item">
                    <div className="cart-item-left">
                      <h3 className="product-name">{item.product.name}</h3>
                      <p className="product-price" data-testid='cart-item-amount'>${item.product.price}</p>

                      {availableSizes.length > 0 && (
                        <div className="size-section" data-testid={`cart-item-attribute-${toKebabCase('Size')}`}>
                          <span className="size-label">Size:</span>
                          <div className="size-options">
                            {availableSizes.map(size => (
                              <button
                                key={size}
                                className={`size-btn ${itemOptions.size === size ? 'selected' : ''}`}
                                onClick={() => handleSizeSelect(item.id, size)}
                                data-testid={`cart-item-attribute-${toKebabCase('Size')}-${toKebabCase(size)}${itemOptions.size === size ? '-selected' : ''}`}
                              >
                                {size}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {availableColors.length > 0 && (
                        <div className="color-section" data-testid={`cart-item-attribute-${toKebabCase('Color')}`}>
                          <span className="color-label">Color:</span>
                          <div className="color-options">
                            {availableColors.map(color => (
                              <div
                                key={color}
                                className={`color-circle ${itemOptions.color === color ? 'selected' : ''}`}
                                style={{backgroundColor: color}}
                                onClick={() => handleColorSelect(item.id, color)}
                                data-testid={`cart-item-attribute-${toKebabCase('Color')}-${toKebabCase(color)}${itemOptions.color === color ? '-selected' : ''}`}
                              ></div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                  <div className="cart-item-right">
                    <div className="cart-item-image">
                      <img src={item.product.image} alt={item.product.name} />
                    </div>
                    <div className="quantity-section">
                      <div className="cart-item-controls">
                        <button
                          className="quantity-btn"
                          data-testid='cart-item-amount-decrease'
                          onClick={() => handleDecreaseQuantity(item.id, item.quantity)}
                        >
                          -
                        </button>
                        <span className="quantity-display">{item.quantity}</span>
                        <button
                          className="quantity-btn"
                          data-testid='cart-item-amount-increase'
                          onClick={() => handleIncreaseQuantity(item.id)}
                        >
                          +
                        </button>
                      </div>
                      <div className="item-number">{index + 1}</div>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
            {/* Total Section */}
            <div className="total-section" data-testid="cart-total">
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
