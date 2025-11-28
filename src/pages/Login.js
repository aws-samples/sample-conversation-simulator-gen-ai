// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { useTranslation } from 'react-i18next';
import { Header } from "./Header";

// Simple header component for the authenticator
const components = {
  Header
};

export function Login() {
  const { t } = useTranslation();

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh' 
    }}>
      <Authenticator components={components}>
        {({ signOut, user }) => (
          <div style={{ textAlign: 'center' }}>
            <h1>{t('common.greetings.text.hello')} {user.username}</h1>
            <button onClick={signOut}>{t('common.actions.text.signOut')}</button>
          </div>
        )}
      </Authenticator>
    </div>
  );
}
