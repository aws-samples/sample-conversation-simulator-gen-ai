// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0


import { Flex, Image, useTheme } from "@aws-amplify/ui-react";
import { useTranslation } from 'react-i18next';

export function Header() {
  const { tokens } = useTheme();
  const { t } = useTranslation();

  return (
    <div>
      <Flex justifyContent="center">
      </Flex>
      <div style={{ color: "white", textAlign: "center", paddingBottom: '1em' }}>
        <h1>{t('home.branding.text.title')}</h1>
      </div>
    </div>
  );
}