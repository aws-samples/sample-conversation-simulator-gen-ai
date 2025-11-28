// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { useState, useEffect } from "react";
import Home from "./pages/Home";
import { Login } from "./pages/Login";
import "semantic-ui-css/semantic.min.css";
import "./styles.css";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { useAuthenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import "@cloudscape-design/global-styles/index.css";
import History from "./pages/History";
import NavBar from "./pages/navbar";
import Metrics from "./pages/Metrics";

export default function App() {
  const { user, authStatus } = useAuthenticator();
  const location = useLocation();
  
  // Log authentication status to help debug
  console.log('Auth status:', authStatus);
  console.log('User:', user ? 'Authenticated' : 'Not authenticated');

  // Use authentication in all environments
  if (user) {
    return (
      <>
        {location.pathname === "/" ? (
          <NavBar home={true} />
        ) : (
          <NavBar home={false} />
        )}
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route exact path="/my-presentations" element={<History />} />
          <Route exact path="/metrics" element={<Metrics />} />
        </Routes>
      </>
    );
  }
  else {
    return (
      <Login/>
    )
  }
}
