// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import axios from 'axios';
import { get } from 'aws-amplify/api';

async function getBedrockCredentials() {
  try {
    const response = await get({
      apiName: 'restApi',
      path: '/bedrock',
      options: {
        headers: {}
      }
    });
    return response;
  } catch (error) {
    console.error('Error getting bedrock credentials:', error);
    throw error;
  }
}

export default function getCredentials() {
    return getBedrockCredentials();
}
