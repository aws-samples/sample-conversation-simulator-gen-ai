// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Amplify Gen 2 Authentication Methods
 * 
 * This file provides authentication utility functions using Amplify Gen 2 APIs.
 * It includes methods for sign-in, sign-up, sign-out, and other auth operations.
 */

import {
  signIn,
  signUp,
  confirmSignUp,
  resendSignUpCode,
  signOut,
  resetPassword,
  confirmResetPassword,
  getCurrentUser,
  fetchAuthSession,
  updatePassword,
  updateUserAttributes,
  confirmUserAttribute
} from 'aws-amplify/auth';

// Authentication is already initialized in auth-minimal.js

/**
 * Sign in a user with username and password
 * @param {string} username - The username or email
 * @param {string} password - The password
 * @returns {Promise<object>} - The sign-in result
 */
export const authenticateUser = async (username, password) => {
  try {
    const { isSignedIn, nextStep } = await signIn({ username, password });
    
    if (isSignedIn) {
      return { success: true, user: await getCurrentUser() };
    }
    
    // Handle additional authentication steps if needed
    if (nextStep) {
      return { 
        success: false, 
        nextStep: nextStep.signInStep,
        additionalInfo: nextStep 
      };
    }
    
    return { success: false, error: 'Unknown authentication result' };
  } catch (error) {
    console.error('Error signing in:', error);
    return { success: false, error };
  }
};

/**
 * Register a new user
 * @param {string} username - The username
 * @param {string} password - The password
 * @param {string} email - The email address
 * @returns {Promise<object>} - The sign-up result
 */
export const registerUser = async (username, password, email) => {
  try {
    const { isSignUpComplete, userId, nextStep } = await signUp({
      username,
      password,
      options: {
        userAttributes: {
          email
        }
      }
    });
    
    return {
      success: true,
      isSignUpComplete,
      userId,
      nextStep
    };
  } catch (error) {
    console.error('Error signing up:', error);
    return { success: false, error };
  }
};

/**
 * Confirm a user's registration with verification code
 * @param {string} username - The username
 * @param {string} code - The verification code
 * @returns {Promise<object>} - The confirmation result
 */
export const confirmRegistration = async (username, code) => {
  try {
    const { isSignUpComplete, nextStep } = await confirmSignUp({
      username,
      confirmationCode: code
    });
    
    return {
      success: true,
      isSignUpComplete,
      nextStep
    };
  } catch (error) {
    console.error('Error confirming sign up:', error);
    return { success: false, error };
  }
};

/**
 * Resend verification code for sign-up
 * @param {string} username - The username
 * @returns {Promise<object>} - The result
 */
export const resendVerificationCode = async (username) => {
  try {
    const { destination, deliveryMedium, attributeName } = await resendSignUpCode({
      username
    });
    
    return {
      success: true,
      destination,
      deliveryMedium,
      attributeName
    };
  } catch (error) {
    console.error('Error resending code:', error);
    return { success: false, error };
  }
};

/**
 * Sign out the current user
 * @param {boolean} global - Whether to sign out from all devices
 * @returns {Promise<object>} - The sign-out result
 */
export const logoutUser = async (global = false) => {
  try {
    await signOut({ global });
    return { success: true };
  } catch (error) {
    console.error('Error signing out:', error);
    return { success: false, error };
  }
};

/**
 * Get the current authenticated user
 * @returns {Promise<object>} - The current user or null
 */
export const getAuthenticatedUser = async () => {
  try {
    const user = await getCurrentUser();
    return { success: true, user };
  } catch (error) {
    console.error('Error getting current user:', error);
    return { success: false, error };
  }
};

/**
 * Get the current authentication session
 * @returns {Promise<object>} - The session information
 */
export const getAuthSession = async () => {
  try {
    const session = await fetchAuthSession();
    return { 
      success: true, 
      session,
      isAuthenticated: !!session.tokens,
      credentials: session.credentials
    };
  } catch (error) {
    console.error('Error fetching auth session:', error);
    return { success: false, error };
  }
};

/**
 * Check if the user is authenticated
 * @returns {Promise<boolean>} - True if authenticated, false otherwise
 */
export const isAuthenticated = async () => {
  try {
    const { tokens } = await fetchAuthSession();
    return !!tokens;
  } catch (error) {
    console.error('Error checking authentication status:', error);
    return false;
  }
};

/**
 * Initiate password reset
 * @param {string} username - The username
 * @returns {Promise<object>} - The result
 */
export const forgotPassword = async (username) => {
  try {
    const { nextStep } = await resetPassword({ username });
    return { success: true, nextStep };
  } catch (error) {
    console.error('Error initiating password reset:', error);
    return { success: false, error };
  }
};

/**
 * Complete password reset with verification code
 * @param {string} username - The username
 * @param {string} code - The verification code
 * @param {string} newPassword - The new password
 * @returns {Promise<object>} - The result
 */
export const confirmForgotPassword = async (username, code, newPassword) => {
  try {
    await confirmResetPassword({
      username,
      confirmationCode: code,
      newPassword
    });
    return { success: true };
  } catch (error) {
    console.error('Error confirming password reset:', error);
    return { success: false, error };
  }
};

/**
 * Change password for authenticated user
 * @param {string} oldPassword - The old password
 * @param {string} newPassword - The new password
 * @returns {Promise<object>} - The result
 */
export const changePassword = async (oldPassword, newPassword) => {
  try {
    await updatePassword({ oldPassword, newPassword });
    return { success: true };
  } catch (error) {
    console.error('Error updating password:', error);
    return { success: false, error };
  }
};

/**
 * Update user attributes
 * @param {object} attributes - The attributes to update
 * @returns {Promise<object>} - The result
 */
export const updateAttributes = async (attributes) => {
  try {
    const result = await updateUserAttributes({ userAttributes: attributes });
    return { success: true, result };
  } catch (error) {
    console.error('Error updating user attributes:', error);
    return { success: false, error };
  }
};

/**
 * Confirm updated user attribute with verification code
 * @param {string} attributeName - The attribute name
 * @param {string} code - The verification code
 * @returns {Promise<object>} - The result
 */
export const confirmAttribute = async (attributeName, code) => {
  try {
    await confirmUserAttribute({
      userAttributeKey: attributeName,
      confirmationCode: code
    });
    return { success: true };
  } catch (error) {
    console.error('Error confirming attribute:', error);
    return { success: false, error };
  }
};