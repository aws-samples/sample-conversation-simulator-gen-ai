// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import axios from 'axios';
import { get } from 'aws-amplify/api';

async function getTranscribeCredentials() {
  try {
    const response = await get({
      apiName: 'restApi',
      path: '/transcribe',
      options: {
        headers: {}
      }
    });
    return response;
  } catch (error) {
    console.error('Error getting transcribe credentials:', error);
    throw error;
  }
}

export default function getCredentials() {
    return getTranscribeCredentials();
}