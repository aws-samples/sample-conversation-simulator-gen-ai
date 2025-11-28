// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Amplify Environment Configuration Utility
 * 
 * This utility helps manage environment-specific configurations for Amplify Gen 2.
 * It allows loading different configurations based on the current environment.
 */

// Import base configuration
import baseConfig from './amplifyconfiguration.json';

// Define available environments
const ENVIRONMENTS = {
  DEV: 'dev',
  DEV_TWO: 'devtwo',
  MARK_DEV_TWO: 'markdevtwo',
  PROD: 'prod'
};

/**
 * Get the current environment from environment variables or default to DEV
 * In a real application, this could come from:
 * - process.env.REACT_APP_ENV (for Create React App)
 * - import.meta.env.VITE_APP_ENV (for Vite)
 * - A build-time variable
 */
export const getCurrentEnvironment = () => {
  // For Vite
  if (import.meta.env?.VITE_APP_ENV) {
    return import.meta.env.VITE_APP_ENV.toLowerCase();
  }
  
  // For Create React App or other environments
  if (typeof process !== 'undefined' && process.env?.REACT_APP_ENV) {
    return process.env.REACT_APP_ENV.toLowerCase();
  }
  
  // Default to development environment
  return ENVIRONMENTS.DEV;
};

/**
 * Get environment-specific overrides for the Amplify configuration
 */
export const getEnvironmentOverrides = (environment = getCurrentEnvironment()) => {
  switch (environment) {
    case ENVIRONMENTS.DEV:
      return {
        // Dev-specific overrides
        API: {
          GraphQL: {
            // Example: override endpoint for dev environment
            // endpoint: 'https://dev-endpoint.appsync-api.us-east-1.amazonaws.com/graphql'
          }
        }
      };
    
    case ENVIRONMENTS.DEV_TWO:
      return {
        // DevTwo-specific overrides
      };
    
    case ENVIRONMENTS.MARK_DEV_TWO:
      return {
        // MarkDevTwo-specific overrides
      };
    
    case ENVIRONMENTS.PROD:
      return {
        // Production-specific overrides
      };
    
    default:
      return {};
  }
};

/**
 * Deep merge utility for merging configuration objects
 */
export const deepMerge = (target, source) => {
  const output = { ...target };
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  
  return output;
};

/**
 * Helper to check if value is an object
 */
const isObject = (item) => {
  return item && typeof item === 'object' && !Array.isArray(item);
};

/**
 * Get the complete Amplify configuration for the current environment
 */
export const getAmplifyConfig = (environment = getCurrentEnvironment()) => {
  const environmentOverrides = getEnvironmentOverrides(environment);
  return deepMerge(baseConfig, environmentOverrides);
};

// Export the current environment and configuration
export const currentEnvironment = getCurrentEnvironment();
export const amplifyConfig = getAmplifyConfig(currentEnvironment);

export default amplifyConfig;