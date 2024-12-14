import React, {useState, useEffect} from 'react';
import Button from './Button.js';
import { useQuery, useMutation } from '@apollo/client';
import { GET_PRODUCT_DETAILS, GET_PRODUCT_ATTRIBUTES } from '../graphql/queries';
import { ADD_TO_CART_MUTATION } from '../graphql/mutations.js'
import { useParams } from 'react-router-dom';
import '../styles/ProductDetails.css';
import parse from "html-react-parser";


function ProductDetails() {
  const { id } = useParams();
  const { loading, error, data: product } = useQuery(GET_PRODUCT_DETAILS, {
    variables: { id },
  });
  const [productAttributes, setAttributes] = useState(null);
  const [selectedOption, setOption] = useState(null);

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

  const {data: attributes} = useQuery(GET_PRODUCT_ATTRIBUTES, {
    variables: { id },
  });
  
  useEffect(() => {
    if (attributes) {
      
      const associativeArray  = Object.entries(attributes).map(([key, value]) => ({ key, value }));      
      
      setAttributes(associativeArray);
  }
  }, [attributes]);
  
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  
  
  
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
            {productAttributes && productAttributes.map((attribute) => (
              <div className="attribute" >
              <p className="attribute-name">{attribute['key']}:</p>
              <div className="attribute-values">
                {attribute['value'] && attribute['value'].map(item => ( 
                    <button
                    key={item}
                    className={`attribute-value-btn ${selectedOption === item ? 'selected' : ''}`}
                    onClick={() => setOption(item)}
                    style={{backgroundColor: attribute['key'] == "Color" ? item : ''}}
                  >
                    {attribute['key'] == "Color" ? '' : item}
                  </button>
                ))
                }
              </div>
            </div>
            ))}
          </div>
        <div className="price">
        <h1>{product.amount}$</h1>
        </div>
        <div>
           <Button data-testid='add-to-cart' className='add-to-cart' text="Add To Cart" onClick={handleAddToCart} />
           <div className="description">
           {parse(product.description)}        
           </div>
        </div>
      </div>     
    </div>
  );
}

export default ProductDetails;
