// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * GraphQL Client Configuration for Amplify Gen 2
 * 
 * This file configures the GraphQL client using Amplify Gen 2 patterns.
 * It provides a centralized client instance that can be imported throughout the application.
 */

import { generateClient } from 'aws-amplify/api';
import { fetchAuthSession } from 'aws-amplify/auth';

// Generate the GraphQL client
const client = generateClient();

/**
 * Enhanced GraphQL client with additional functionality
 * 
 * This object wraps the standard Amplify Gen 2 GraphQL client with additional
 * helper methods for common operations.
 */
const graphqlClient = {
  /**
   * Execute a GraphQL query
   * @param {Object} options - Query options
   * @param {string|DocumentNode} options.query - The GraphQL query
   * @param {Object} options.variables - Query variables
   * @param {string} options.authMode - Authentication mode (optional)
   * @returns {Promise<Object>} Query result
   */
  query: async ({ query, variables, authMode }) => {
    return client.graphql({
      query,
      variables,
      authMode: authMode || undefined
    });
  },

  /**
   * Execute a GraphQL mutation
   * @param {Object} options - Mutation options
   * @param {string|DocumentNode} options.mutation - The GraphQL mutation
   * @param {Object} options.variables - Mutation variables
   * @param {string} options.authMode - Authentication mode (optional)
   * @returns {Promise<Object>} Mutation result
   */
  mutate: async ({ mutation, variables, authMode }) => {
    return client.graphql({
      query: mutation,
      variables,
      authMode: authMode || undefined
    });
  },

  /**
   * Create a GraphQL subscription
   * @param {Object} options - Subscription options
   * @param {string|DocumentNode} options.subscription - The GraphQL subscription
   * @param {Object} options.variables - Subscription variables
   * @param {string} options.authMode - Authentication mode (optional)
   * @param {Function} options.next - Callback for subscription events
   * @param {Function} options.error - Callback for subscription errors
   * @returns {Object} Subscription object with unsubscribe method
   */
  subscribe: ({ subscription, variables, authMode, next, error }) => {
    const observable = client.graphql({
      query: subscription,
      variables,
      authMode: authMode || undefined
    });

    return observable.subscribe({
      next,
      error
    });
  },

  /**
   * Get the current authentication session
   * @returns {Promise<Object>} Current auth session
   */
  getAuthSession: async () => {
    return fetchAuthSession();
  },

  /**
   * Get the raw client instance
   * @returns {Object} Raw GraphQL client
   */
  getClient: () => client
};

export default graphqlClient;