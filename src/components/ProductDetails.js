import React, { useState, useEffect } from 'react';
import Button from './Button.js';
import { useQuery, useMutation } from '@apollo/client';
import { GET_PRODUCT_DETAILS } from '../graphql/queries';
import { ADD_TO_CART_MUTATION } from '../graphql/mutations.js'
import { GET_CART_QUERY } from '../graphql/queries'
import { useParams } from 'react-router-dom';
import '../styles/ProductDetails.css';
import parse from "html-react-parser";


function ProductDetails() {
  const { id } = useParams();
  const { loading, error, data: product } = useQuery(GET_PRODUCT_DETAILS, {
    variables: { id: id },
  });
  const [productAttributes, setAttributes] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState(null);

  const [addToCart] = useMutation(ADD_TO_CART_MUTATION, {
    refetchQueries: [{ query: GET_CART_QUERY }],
    awaitRefetchQueries: true,
    onCompleted: (data) => {
      console.log('=== ADD TO CART SUCCESS ===');
      console.log('Product added to cart successfully:', data);
      alert('Product added to cart!');
    },
    onError: (error) => {
      console.error('=== ADD TO CART ERROR ===');
      console.error('Add to cart error:', error);
      console.error('Error message:', error.message);
      console.error('GraphQL errors:', error.graphQLErrors);
      console.error('Network error:', error.networkError);
      console.error('Variables that were sent:', error.operation?.variables);
      alert('Failed to add product to cart. Please try again.');
    },
    errorPolicy: 'all'
  });

  const handleOptionSelect = (attributeKey, optionValue) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [attributeKey]: optionValue,
    }));
  };

  // Helper function to convert attribute name to kebab case
  const toKebabCase = (str) => {
    return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  };

  const handleAddToCart = () => {
    const productId = product?.product?.id || id;
    console.log('Using product ID:', productId);

    addToCart({
      variables: {
        productId: productId,
        quantity: 1,
      },
    });
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  if (!product.product) return <p>Product not found</p>;
  console.log(product)

  return (
    <div className="product-page">
      <div data-testid='product-gallery' className="gallary">
        <div className="main-image">
          <img className="product-card__image" src={product.product.image_url} alt={product.product.name}/>
        </div>
      </div>

      <div data-testid='product-description' className="details">
        <h1 className="product-name">{product.product.product.name}</h1>
        <p className="product-brand">{product.product.product.brand}</p>
        <div>
            {productAttributes && productAttributes.length > 0 ? (
              productAttributes.map((attribute) => (
                <div className="attribute" key={attribute['key']} data-testid={`product-attribute-${toKebabCase(attribute['key'])}`}>
                  <p className="attribute-name">{attribute['key']}:</p>
                  <div className="attribute-values">
                    {attribute['value'] && attribute['value'].map(item => (
                        <button
                        key={item}
                        className={`attribute-value-btn ${selectedOptions && selectedOptions[attribute['key']] === item ? 'selected' : ''}`}
                        onClick={() =>{if (attribute['key']) handleOptionSelect(attribute['key'], item)}}
                        style={{backgroundColor: attribute['key'] === "Color" ? item : ''}}
                      >
                        {attribute['key'] === "Color" ? '' : item}
                      </button>
                    ))
                    }
                  </div>
                </div>
              ))
            ) : (
              <p>No attributes available for this product.</p>
            )}
          </div>
        <div className="price">
        <p className="product-price">{product.product.product.amount}$</p>
        </div>
        <div>
           <Button data-testid='add-to-cart' className='add-to-cart' text="Add To Cart" onClick={handleAddToCart} />
            <div className="description">
              {product.product.product.description ? parse(product.product.product.description) : <p>No description available</p>}
            </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
