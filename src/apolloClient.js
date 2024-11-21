import { ApolloClient, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
  uri: process.env.REACT_APP_GRAPHQL_ENDPOINT || 'https://oza.fc3.mytemp.website/index.php',
  cache: new InMemoryCache(),
});

export default client;
