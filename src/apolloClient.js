import { ApolloClient, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
  uri: process.env.REACT_APP_GRAPHQL_ENDPOINT || 'https://scandtest.freesite.online/index.php',
  cache: new InMemoryCache(),
});

export default client;
