// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { Amplify } from 'aws-amplify';
import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito';
import awsconfig from './aws-exports';
import { amplifyConfig as environmentConfig } from './amplify-environment';

/**
 * Amplify Gen 2 Authentication Configuration
 * 
 * This file configures Amplify Auth service using the Gen 2 format.
 * It provides a comprehensive configuration for Cognito user pools and identity pools.
 */

// Create a complete Auth configuration based on aws-exports.js
const authConfig = {
  // Authentication Configuration
  Auth: {
    Cognito: {
      // Mandatory configuration
      userPoolId: awsconfig.aws_user_pools_id,
      userPoolClientId: awsconfig.aws_user_pools_web_client_id,
      region: awsconfig.aws_cognito_region,
      
      // Identity pool configuration (for AWS service access)
      identityPoolId: awsconfig.aws_cognito_identity_pool_id,
      
      // Authentication options
      loginWith: {
        email: true,
        phone: false,
        username: true
      },
      
      // Multi-factor authentication configuration
      mfa: {
        status: awsconfig.aws_cognito_mfa_configuration === 'ON' ? 'optional' : 'disabled',
        types: awsconfig.aws_cognito_mfa_types?.map(type => type.toLowerCase()) || []
      },
      
      // Password requirements
      passwordFormat: {
        minLength: awsconfig.aws_cognito_password_protection_settings?.passwordPolicyMinLength || 8,
        requireNumbers: awsconfig.aws_cognito_password_protection_settings?.passwordPolicyCharacters?.includes('REQUIRES_NUMBERS') || false,
        requireLowercase: awsconfig.aws_cognito_password_protection_settings?.passwordPolicyCharacters?.includes('REQUIRES_LOWERCASE') || false,
        requireUppercase: awsconfig.aws_cognito_password_protection_settings?.passwordPolicyCharacters?.includes('REQUIRES_UPPERCASE') || false,
        requireSymbols: awsconfig.aws_cognito_password_protection_settings?.passwordPolicyCharacters?.includes('REQUIRES_SYMBOLS') || false
      },
      
      // Sign-up and verification settings
      signUpAttributes: awsconfig.aws_cognito_signup_attributes || ['EMAIL'],
      verificationMechanisms: awsconfig.aws_cognito_verification_mechanisms || ['EMAIL'],
      
      // Additional options
      mandatorySignIn: true,
      signUpVerificationMethod: 'code',
      
      // Credentials configuration
      identityPoolRegion: awsconfig.aws_cognito_region,
      allowGuestAccess: false
    }
  },
  // API Configuration
  API: {
    // GraphQL API Configuration
    GraphQL: {
      endpoint: awsconfig.aws_appsync_graphqlEndpoint,
      region: awsconfig.aws_appsync_region,
      defaultAuthMode: 'userPool', // Translating AMAZON_COGNITO_USER_POOLS to userPool
      authModes: [
        {
          type: 'userPool',
          options: {
            userPoolId: awsconfig.aws_user_pools_id,
            userPoolClientId: awsconfig.aws_user_pools_web_client_id
          }
        },
        {
          type: 'iam'
        }
      ]
    },
    
    // REST API Configuration
    REST: {
      // Map all custom REST APIs from aws-exports
      ...Object.fromEntries(
        (awsconfig.aws_cloud_logic_custom || []).map(api => [
          api.name,
          {
            endpoint: api.endpoint,
            region: api.region
          }
        ])
      )
    }
  }
};

// Decide which configuration to use
// If we're using environment-specific config, use that
// Otherwise, fall back to the dynamic config generated from aws-exports.js
const finalAuthConfig = environmentConfig?.Auth ? environmentConfig : authConfig;

// Configure Amplify with the Auth configuration
// Note: This only configures the Auth module, not the entire Amplify library
Amplify.configure(finalAuthConfig);

// Set up token provider for AppSync
cognitoUserPoolsTokenProvider.setKeyValueStorage({
  getItem: (key) => localStorage.getItem(key),
  setItem: (key, value) => localStorage.setItem(key, value),
  removeItem: (key) => localStorage.removeItem(key),
});

// Export the configuration for use in other files
export default finalAuthConfig;

// Log configuration details for debugging
console.log('Amplify Gen 2 auth configuration loaded successfully');
console.log('User Pool ID:', awsconfig.aws_user_pools_id);
console.log('User Pool Client ID:', awsconfig.aws_user_pools_web_client_id);
console.log('Identity Pool ID:', awsconfig.aws_cognito_identity_pool_id);
console.log('Using configuration source:', environmentConfig?.Auth ? 'Environment-specific config' : 'Dynamic config from aws-exports.js');