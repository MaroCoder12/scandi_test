import { gql } from '@apollo/client';

export const GET_PRODUCTS = gql`
  query products {
    products {
      id
      name
      amount
      inStock
      image_url
    }
  }
`;

export const GET_PRODUCT_DETAILS = gql`
  query product($id: ID!) {
    product(id: $id) {
      id
      name
      brand
      description
      inStock
      amount
      image_url
      attributes
    }
  }
`;

export const GET_PRODUCT_ATTRIBUTES = gql`
  query attributes($id: ID!) {
    attributes(id: $id)
  }
`;

export const GET_CART_QUERY = gql`
  query cart {
    cart {
      id
      product {
        id
        name
        price
        image
        attributes
      }
      quantity
    }
  }
`;
