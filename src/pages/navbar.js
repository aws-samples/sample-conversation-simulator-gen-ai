// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { useEffect, useState } from "react";
import { TopNavigation } from "@awsui/components-react";
import { getCurrentUser, signOut } from 'aws-amplify/auth';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function Navbar({ home }) {
  const [userName, setUserName] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    getCurrentUser().then((data) => {
      setUserName(data.username);
    });
  }, []);

  async function onSignOutClick() {
    try {
      return(await signOut());
    } catch (error) {
      console.log("error signing out: ", error);
    }
  }

  const getI18nStrings = () => ({
    searchIconAriaLabel: t('common.actions.text.search'),
    searchDismissIconAriaLabel: t('common.actions.text.close') + ' ' + t('common.actions.text.search').toLowerCase(),
    overflowMenuTriggerText: t('common.actions.text.more'),
    overflowMenuTitleText: t('common.actions.text.all'),
    overflowMenuBackIconAriaLabel: t('common.actions.text.back'),
    overflowMenuDismissIconAriaLabel: t('common.actions.text.close') + ' menu',
  });

  return (
    <>
      <div>
        {home ? (
          <TopNavigation
            identity={{
              href: "",
              title: "Amazon Actor",
            }}
            utilities={[
              {
                type: "menu-dropdown",
                text: userName,
                description: userName,
                iconName: "user-profile",
                items: [
                  {
                    id: "feedback",
                    text: t('common.actions.text.feedback', 'Feedback'),
                    items: [
                      {
                        id: "history",
                        text: t('navigation.menu.history'),
                        href: "/metrics",
                      },
                    ],
                  }
                ],
              },
              {
                type: "custom",
                content: <LanguageSwitcher />
              },
              {
                type: "button",
                variant: "primary-button",
                text: t('auth.actions.logout'),
                onClick: onSignOutClick,
              },
            ]}
            i18nStrings={getI18nStrings()}
          />
        ) : (
          <TopNavigation
            identity={{
              href: "/",
              title: "Amazon Virtual Buddy",
            }}
            utilities={[
              {
                type: "button",
                href: "/",
                iconAlign: "right",
                iconName: "external",
                variant: "normal",
                text: t('presentation.actions.present'),
              },
              {
                type: "custom",
                content: <LanguageSwitcher />
              },
              {
                type: "button",
                variant: "primary-button",
                text: t('auth.actions.logout'),
                onClick: onSignOutClick,
              },
            ]}
            i18nStrings={getI18nStrings()}
          />
        )}
      </div>
    </>
  );
}
