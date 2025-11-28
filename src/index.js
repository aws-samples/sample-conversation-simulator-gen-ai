// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

// Import polyfills first
import './polyfills';

import React from "react";
import { createRoot } from "react-dom/client";
import { Authenticator } from "@aws-amplify/ui-react";
import { StrictMode } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import "@aws-amplify/ui-react/styles.css";

// Import our custom Amplify Gen2 configuration
// First import auth config to ensure auth is configured first
import './auth-config-gen2';
import './amplify-config-gen2';

// Import i18n configuration
import './i18n';

import App from "./App";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <Authenticator.Provider>
      <Router>
        <App />
      </Router>
    </Authenticator.Provider>
  </StrictMode>
);
