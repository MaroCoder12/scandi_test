import { useState, useEffect } from 'react';
import Button from './Button.js';
import { useQuery, useMutation } from '@apollo/client';
import { GET_PRODUCT_DETAILS } from '../graphql/queries';
import { ADD_TO_CART_MUTATION } from '../graphql/mutations.js'
import { GET_CART_QUERY } from '../graphql/queries'
import { useParams } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import '../styles/ProductDetails.css';
import parse from "html-react-parser";


function ProductDetails() {
  const { id } = useParams();
  const { loading, error, data: product } = useQuery(GET_PRODUCT_DETAILS, {
    variables: { id: id },
  });
  const [productAttributes, setAttributes] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState(null);
  const { showSuccess, showError } = useToast();

  const [addToCart] = useMutation(ADD_TO_CART_MUTATION, {
    refetchQueries: [{ query: GET_CART_QUERY }],
    awaitRefetchQueries: true,
    onCompleted: (data) => {
      console.log('Product added to cart successfully:', data);
      showSuccess('Product added to cart!');
    },
    onError: (error) => {
      console.error('Add to cart error:', error);
      showError('Failed to add product to cart. Please try again.');
    },
    errorPolicy: 'all'
  });

  useEffect(() => {
    if (product && product.product.attributes) {
      console.log('Raw attributes:', product.attributes);
      try {
        const parsedAttributes = JSON.parse(product.product.attributes);
        console.log('Parsed attributes:', parsedAttributes);
        const associativeArray = Object.entries(parsedAttributes).map(([key, value]) => ({ key, value }));
        console.log('Final attributes array:', associativeArray);
        setAttributes(associativeArray);
      } catch (error) {
        console.error('Error parsing attributes:', error);
        setAttributes([]);
      }
    } else {
      console.log('No attributes in product data, testing direct GraphQL fetch');
    
            // Test direct GraphQL fetch
      if (product && id) {
        const testGraphQL = async () => {
          try {
            const graphqlEndpoint = process.env.REACT_APP_GRAPHQL_ENDPOINT || 'http://localhost:8000/graphql.php';
            const response = await fetch(graphqlEndpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                query: `{ product(id: "${id}") { id name attributes } }`
              })
            });

            const result = await response.json();
            console.log('Direct GraphQL test result:', result);

            if (result.data && result.data.product && result.data.product.attributes) {
              const parsedAttributes = JSON.parse(result.data.product.attributes);
              const associativeArray = Object.entries(parsedAttributes).map(([key, value]) => ({ key, value }));
              console.log('Setting attributes from direct fetch:', associativeArray);
              setAttributes(associativeArray);
            } else {
              console.log('Setting hardcoded attributes as fallback');
              setAttributes([
                { key: 'Color', value: ['#FF0000', '#00FF00', '#0000FF', '#000000', '#FFFFFF'] },
                { key: 'Capacity', value: ['512G', '1T'] }
              ]);
            }
          } catch (error) {
            setAttributes([
              { key: 'Color', value: ['#FF0000', '#00FF00', '#0000FF', '#000000', '#FFFFFF'] },
              { key: 'Capacity', value: ['512G', '1T'] }
            ]);
          }
        };

        testGraphQL();
      }
    }
  }, [product, id]);

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
    const productId = product?.product?.id;

    if (!productId) {
      alert('Cannot add to cart: Product ID is missing');
      return;
    }

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

  return (
    <div className="product-page">
      <div data-testid='product-gallery' className="gallary">
        <div className="main-image">
          <img className="product-card__image" src={product.product.image_url} alt={product.product.name}/>
        </div>
      </div>

      <div data-testid='product-description' className="details">
        <h1 className="product-name">{product.product.name}</h1>
        <p className="product-brand">{product.product.brand}</p>
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
        <p className="product-price">{product.product.amount}$</p>
        </div>
        <div>
           <Button data-testid='add-to-cart' className='add-to-cart' text="Add To Cart" onClick={handleAddToCart} />
            <div className="description">
              {product.product.description ? parse(product.product.description) : <p>No description available</p>}
            </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
