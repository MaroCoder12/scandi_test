import { gql } from '@apollo/client';

export const ADD_TO_CART = gql`
  mutation AddToCart($productId: ID!, $quantity: Int!) {
    addToCart(productId: $productId, quantity: $quantity) {
      id
      name
      price
      quantity
    }
  }
`;

export const LOGIN_MUTATION = gql`
  mutation login ($username: String!, $password: String!) {
  login(username: $username, password: $password) {
    message
    user {
      id
      username
      email
      token
    }
  }
}
`;

export const SIGNUP_MUTATION = gql`
  mutation signup($username: String!, $email: String!, $password: String!) {
    signup(username: $username, email: $email, password: $password) {
      message
      user {
        id
        username
        email
      }
    }
  }
`;

export const ADD_TO_CART_MUTATION = gql`
  mutation AddToCart($productId: ID!, $quantity: Int!) {
    addToCart(productId: $productId, quantity: $quantity) {
      id
      product {
        id
        name
        amount
        image_url
      }
      quantity
    }
  }
`;