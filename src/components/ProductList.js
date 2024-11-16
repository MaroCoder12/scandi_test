// src/components/ProductList.js
import React from 'react';
import Button from './Button.js';
import { useQuery, useMutation } from '@apollo/client';
import { GET_PRODUCTS } from '../graphql/queries';
import { ADD_TO_CART_MUTATION } from '../graphql/mutations.js'
import { Link } from 'react-router-dom';
import '../styles/ProductList.css';

function ProductList({ category_id, category }) {
  const { loading, error, data } = useQuery(GET_PRODUCTS);
  const [addToCart] = useMutation(ADD_TO_CART_MUTATION, {
    onCompleted: () => {
      console.log('Product added to cart!');
    },
    onError: (error) => {
      console.error(error.message);
    },
  });

  const handleAddToCart = (id) => {
    addToCart({
      variables: {
        productId: id,
        quantity: 1,
      },
    });
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  
  const products = category
    ? data.filter(product => product.category_id === category_id)
    : data;
    
  return (
    <>
    <div className="products">
      <div className="header">
        <h1>{category ? category: "All"}</h1>
      </div>
        {products.map((product) => (
          <div className='product-card' key={product.id}>
           
            <Link className='product-link' to={`/product/${product.product_id}`}>
            <img className="product-card__image" src={product.image_url} />
            <p className="product-card__brand">{product.brand}</p>
            {product.name}
            <div className="price">
              {product.amount}$
            </div>
            </Link>
            <div>
             <Button className='add-to-cart' text="Add To Cart" />
            </div>
          </div>
        ))}
    </div>
    </>
  );
}

export default ProductList;
