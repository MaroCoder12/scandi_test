import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_CART_QUERY } from '../graphql/queries';
import { UPDATE_CART_MUTATION } from '../graphql/mutations';
import { useToast } from '../contexts/ToastContext';
import '../styles/CartPopup.css';

function CartPopup({ isOpen, closePopup, cartItems }) {
  const { loading, error, data, refetch } = useQuery(GET_CART_QUERY, {
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true
  });

  // State for managing selected options for each cart item
  const [selectedOptions] = useState({});
  const { showSuccess, showError } = useToast();




  // Mutations
  const [updateCartItem] = useMutation(UPDATE_CART_MUTATION, {
    onError: (error) => {
      console.error('Update cart error:', error);
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

  // Note: Size and color selection are non-functional in cart as per requirements
  // Attributes are display-only

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
    .catch((error) => {
      console.error('Error increasing quantity:', error);
      showError('Failed to update quantity. Please try again.');
    });
  };

  // Decrease Quantity Handler - now removes item when quantity reaches 0
  const handleDecreaseQuantity = (itemId, currentQuantity) => {
    if (currentQuantity > 1) {
      // Decrease quantity by 1
      updateCartItem({
        variables: { itemId, quantityChange: -1 },
        refetchQueries: [{ query: GET_CART_QUERY }],
      })
      .catch((error) => {
        console.error('Error decreasing quantity:', error);
        alert('Failed to update quantity. Please try again.');
      });
    } else {
      // When quantity is 1, decrease it to 0 which should remove the item
      updateCartItem({
        variables: { itemId, quantityChange: -1 },
        refetchQueries: [{ query: GET_CART_QUERY }],
        awaitRefetchQueries: true
      })
      .catch((error) => {
        console.error('Error removing item via quantity decrease:', error);
        alert('Failed to remove item. Please try again.');
      });
    }
  };



  // Place Order Handler using dedicated endpoint
  const handlePlaceOrder = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://glidel.store';
      const response = await fetch(`${backendUrl}/place_order_endpoint.php`, {
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

      if (result.data?.placeOrder?.success) {
        // Refetch the cart data to update UI
        await refetch();
        showSuccess('Order placed successfully!');
        closePopup(); // Close the cart popup
      } else {
        throw new Error(result.data?.placeOrder?.message || 'Order failed');
      }

    } catch (err) {
      console.error('Place order error:', err);
      showError(`Failed to place order: ${err.message}`);
    }
  };

  return (
    <div className="modalBackground" onClick={closePopup}>
      <div className="modalContainer" onClick={(e) => e.stopPropagation()}>
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

                // Get available sizes and colors from product attributes
                const availableSizes = getAttributeOptions(item.product.attributes, 'Size') ||
                                     getAttributeOptions(item.product.attributes, 'size') ||
                                     ['XS', 'S', 'M', 'L']; // fallback
                const availableColors = getAttributeOptions(item.product.attributes, 'Color') ||
                                       getAttributeOptions(item.product.attributes, 'color') ||
                                       ['#C4D79B', '#2B5D31', '#0F4C3A']; // fallback



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
                              <span
                                key={size}
                                className={`size-btn ${itemOptions.size === size ? 'selected' : ''} non-clickable`}
                                data-testid={`cart-item-attribute-${toKebabCase('Size')}-${toKebabCase(size)}${itemOptions.size === size ? '-selected' : ''}`}
                              >
                                {size}
                              </span>
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
                                className={`color-circle ${itemOptions.color === color ? 'selected' : ''} non-clickable`}
                                style={{backgroundColor: color}}
                                data-testid={`cart-item-attribute-${toKebabCase('Color')}-${toKebabCase(color)}${itemOptions.color === color ? '-selected' : ''}`}
                              ></div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                  <div className="cart-item-right">
                    <div className="image-quantity-container">
                      <div className="cart-item-controls">
                        <button
                          className="quantity-btn quantity-btn-increase"
                          data-testid='cart-item-amount-increase'
                          onClick={() => handleIncreaseQuantity(item.id)}
                        >
                          +
                        </button>
                        <span className="quantity-display">{item.quantity}</span>
                        <button
                          className="quantity-btn quantity-btn-decrease"
                          data-testid='cart-item-amount-decrease'
                          onClick={() => handleDecreaseQuantity(item.id, item.quantity)}
                        >
                          –
                        </button>
                      </div>
                      <div className="cart-item-image">
                        <img src={item.product.image} alt={item.product.name} />
                      </div>
                    </div>
                    <div className="item-number">{index + 1}</div>
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
