import React from 'react';
import Button from './Button.js';
import { useQuery, useMutation } from '@apollo/client';
import { GET_PRODUCT_DETAILS, GET_PRODUCT_ATTRIBUTES } from '../graphql/queries';
import { ADD_TO_CART_MUTATION } from '../graphql/mutations.js'
import { useParams } from 'react-router-dom';
import '../styles/ProductDetails.css';

function ProductDetails() {
  const { id } = useParams();
  const { loading, error, data: product } = useQuery(GET_PRODUCT_DETAILS, {
    variables: { id },
  });

  const [addToCart] = useMutation(ADD_TO_CART_MUTATION, {
    onCompleted: () => {
      window.location.reload();
      alert('Product added to cart!');
    },
    onError: (error) => {
      console.error(error.message);
    },
  });

  const handleAddToCart = () => {
    addToCart({
      variables: {
        productId: product.product_id,
        quantity: 1,
      },
    });
  };

  const {data: attributes} = useQuery(GET_PRODUCT_ATTRIBUTES);
  
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const productAttributes = attributes
    ? attributes.filter(attribute => attribute.product_id === product.product_id)
    : attributes;
    
  return (
    <div className="product-page">
      <div data-testid='product-gallery' className="gallary">
        <div className="main-image">
          <img className="product-card__image" src={product.image_url} alt={product.name}/>
        </div>
      </div>
      
      <div data-testid='product-description' className="details">
        <h1 className="product-name">{product.name}</h1>
        <p className="product-brand">{product.brand}</p>
        <div>
            {productAttributes&& productAttributes.map((attribute, index) => (
              <div className="attribute" key={index}>
              <p className="attribute-name">{attribute.name}:</p>
              <div className="attribute-values">
                <button className="attribute-value-btn">{attribute.value}</button>
              </div>
            </div>
            ))}
          </div>
        <div className="price">
        <h1>{product.amount}$</h1>
        </div>
        <div>
           <Button data-testid='add-to-cart' className='add-to-cart' text="Add To Cart" onClick={handleAddToCart} />
        </div>
      </div>     
    </div>
  );
}

export default ProductDetails;
