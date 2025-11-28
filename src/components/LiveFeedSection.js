import React from 'react';
import { SpaceBetween, Header } from "@awsui/components-react";
import { useTranslation } from 'react-i18next';

// Live feed section placeholder for webcam display
const LiveFeedSection = () => {
  const { t } = useTranslation();
  return (
    <SpaceBetween size="m" direction="vertical">
      <Header variant="h3">{t("presentation.components.liveFeedSection")}</Header>
    </SpaceBetween>
  );
};

export default LiveFeedSection;