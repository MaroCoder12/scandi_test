// src/components/ProductList.js
import { useQuery, useMutation } from '@apollo/client';
import { GET_PRODUCTS, GET_CART_QUERY } from '../graphql/queries';
import { ADD_TO_CART_MUTATION } from '../graphql/mutations';
import { Link } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import cart from '../assets/img/Vector.svg';
import '../styles/ProductList.css';

function ProductList({ category_id, category }) {
  const { loading, error, data } = useQuery(GET_PRODUCTS);
  const { showSuccess, showError } = useToast();

  const [addToCart] = useMutation(ADD_TO_CART_MUTATION, {
    refetchQueries: [{ query: GET_CART_QUERY }],
    awaitRefetchQueries: true,
    onCompleted: () => {
      showSuccess('Product added to cart!');
    },
    onError: (error) => {
      console.error('Add to cart error:', error);
      showError('Failed to add product to cart. Please try again.');
    },
    errorPolicy: 'all'
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const products = category
    ? data.products.filter(product => product.category_id === category_id)
    : data.products;

  // Helper function to convert product name to kebab case
  const toKebabCase = (str) => {
    return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  };

  // Handle quick shop (add to cart with default options)
  const handleQuickShop = (e, productId) => {
    e.preventDefault(); // Prevent navigation to product details
    e.stopPropagation(); // Stop event bubbling

    addToCart({
      variables: {
        productId: productId,
        quantity: 1,
      },
    });
  };

  return (
    <>
    <div className="products">
      <div className="header">
        <h1>{category ? category: "All"}</h1>
      </div>
        {products.map((product) => (
          <div className='product-card' data-testid={`product-${toKebabCase(product.name)}`} key={product.id}>
            <Link className='product-link' to={`/product/${product.id}`}>
              <div className="image-container">
                <img className="product-card__image" src={product.image_url} alt={product.name} />
              </div>
              <p className="product-card__brand">{product.brand}</p>
              <div className="product-name">{product.name}</div>
              <div className="price">
                ${product.amount}
              </div>
            </Link>

            {/* Quick Shop Button - only visible on hover */}
            <button
              className="quick-shop-btn"
              onClick={(e) => handleQuickShop(e, product.id)}
              data-testid={`add-to-cart-${toKebabCase(product.name)}`}
              title="Quick Shop"
            >
              <img src={cart} width="20" height="20" alt="Add to Cart" />
            </button>
          </div>
        ))}
    </div>
    </>
  );
}

export default ProductList;
