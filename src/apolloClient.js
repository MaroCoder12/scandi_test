import { ApolloClient, InMemoryCache, from, createHttpLink } from '@apollo/client';
import { onError } from '@apollo/client/link/error';

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  console.log('Apollo Client Error Handler triggered');
  console.log('Operation:', operation.operationName);
  console.log('Variables:', operation.variables);

  if (graphQLErrors) {
    console.error('GraphQL Errors:', graphQLErrors);
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    );
  }
  if (networkError) {
    console.error(`[Network error]:`, networkError);
    console.error('Network error details:', {
      name: networkError.name,
      message: networkError.message,
      statusCode: networkError.statusCode,
      result: networkError.result
    });
  }
});

// HTTP link
const graphqlEndpoint = process.env.REACT_APP_GRAPHQL_ENDPOINT || 'https://glidel.store/';
console.log('GraphQL Endpoint:', graphqlEndpoint);

const httpLink = createHttpLink({
  uri: graphqlEndpoint,
});

const client = new ApolloClient({
  link: from([errorLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          cart: {
            merge: false, // Don't merge, replace the entire array
            // Always fetch from network after mutations
            read(existing, { canRead }) {
              console.log('Cart cache read - existing:', existing);
              return existing;
            }
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});

// Clear cache on startup
client.clearStore();

export default client;
