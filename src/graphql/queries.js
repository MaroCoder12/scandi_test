import { gql } from '@apollo/client';

export const GET_PRODUCTS = gql`
  query products { 
    products {
      id
      name
      price
      inStock
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
    }
  }
`;

export const GET_PRODUCT_ATTRIBUTES = gql`
  query attributes {
    attributes {
      id
      name
      value
    }
  }
`;

export const GET_CART_QUERY = gql`
  query getCart {
    cart {
      id
      product
      quantity
    }
  }
`;
