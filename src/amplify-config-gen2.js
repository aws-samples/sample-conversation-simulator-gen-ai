// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { Amplify } from 'aws-amplify';
import awsconfig from './aws-exports';
import { amplifyConfig as environmentConfig, currentEnvironment } from './amplify-environment';

/**
 * Amplify Gen 2 Configuration
 * 
 * This file configures all Amplify services using the Gen 2 format.
 * It transforms the aws-exports.js configuration into the proper Gen 2 structure.
 * It also incorporates environment-specific configurations.
 */

// Create a dynamic configuration based on aws-exports.js
const dynamicConfig = {
  // Authentication Configuration
  Auth: {
    Cognito: {
      userPoolId: awsconfig.aws_user_pools_id,
      userPoolClientId: awsconfig.aws_user_pools_web_client_id,
      identityPoolId: awsconfig.aws_cognito_identity_pool_id,
      region: awsconfig.aws_cognito_region,
      loginWith: {
        email: true,
        phone: false,
        username: true
      },
      mfa: {
        status: awsconfig.aws_cognito_mfa_configuration === 'ON' ? 'optional' : 'disabled',
        types: awsconfig.aws_cognito_mfa_types?.map(type => type.toLowerCase()) || []
      },
      passwordFormat: {
        minLength: awsconfig.aws_cognito_password_protection_settings?.passwordPolicyMinLength || 8,
        requireNumbers: awsconfig.aws_cognito_password_protection_settings?.passwordPolicyCharacters?.includes('REQUIRES_NUMBERS') || false,
        requireLowercase: awsconfig.aws_cognito_password_protection_settings?.passwordPolicyCharacters?.includes('REQUIRES_LOWERCASE') || false,
        requireUppercase: awsconfig.aws_cognito_password_protection_settings?.passwordPolicyCharacters?.includes('REQUIRES_UPPERCASE') || false,
        requireSymbols: awsconfig.aws_cognito_password_protection_settings?.passwordPolicyCharacters?.includes('REQUIRES_SYMBOLS') || false
      },
      signUpAttributes: awsconfig.aws_cognito_signup_attributes || ['EMAIL'],
      verificationMechanisms: awsconfig.aws_cognito_verification_mechanisms || ['EMAIL']
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
  },
  
  // Storage Configuration
  Storage: {
    S3: {
      bucket: awsconfig.aws_user_files_s3_bucket,
      region: awsconfig.aws_user_files_s3_bucket_region,
      defaultAccessLevel: 'guest' // Default access level, can be 'private', 'protected', or 'guest'
    }
  },
  
  // Geo Configuration (if used)
  ...(awsconfig.aws_geo_region ? {
    Geo: {
      LocationService: {
        region: awsconfig.aws_geo_region,
        maps: {
          items: {
            'default': {
              style: 'VectorEsriStreets'
            }
          },
          default: 'default'
        }
      }
    }
  } : {}),
  
  // Analytics Configuration (if used)
  ...(awsconfig.aws_mobile_analytics_app_id ? {
    Analytics: {
      Pinpoint: {
        appId: awsconfig.aws_mobile_analytics_app_id,
        region: awsconfig.aws_pinpoint_region || awsconfig.aws_project_region
      }
    }
  } : {}),
  
  // General Configuration
  region: awsconfig.aws_project_region
};

// Decide which configuration to use
// If we're using environment-specific config from amplifyconfiguration-gen2.json, use that
// Otherwise, fall back to the dynamic config generated from aws-exports.js
const amplifyConfig = environmentConfig || dynamicConfig;

// Configure Amplify with the Gen 2 configuration
// Note: We're not configuring Auth here since it's handled in auth-config-gen2.js
const configWithoutAuth = { ...amplifyConfig };
delete configWithoutAuth.Auth; // Remove Auth to avoid conflicts

// Configure Amplify with the non-Auth configuration
Amplify.configure(configWithoutAuth);

// Export the configuration for use in other files
export default amplifyConfig;

// Log configuration details for debugging
console.log(`Amplify Gen 2 configuration loaded successfully for environment: ${currentEnvironment}`);
console.log('Using configuration source:', environmentConfig ? 'Environment-specific config' : 'Dynamic config from aws-exports.js');