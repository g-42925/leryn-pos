import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

export function makeClient() {
  const httpLink = new HttpLink({
    uri: "http://localhost:3000/api/graphql",
  });

  const authLink = setContext((_, { headers }) => {
    // Check if window is defined to avoid SSR errors
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

    return {
      headers: {
        ...headers,
        Authorization: token ? `Bearer ${token}` : "",
      },
    };
  });

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: authLink.concat(httpLink),
  });
}