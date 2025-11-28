import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  SpaceBetween,
  Select
} from "@awsui/components-react";
import CustomPromptModal from "../ui-components/CustomPromptModal";

const PresentationControls = ({
  selectedServiceOption,
  onServiceOptionChange,
  selectedOption,
  onSentimentChange,
  onClearText,
  onStartPresentation,
  onEndPresentation,
  setCustomPrompt,
  listening,
  startPresentationButtonLoading,
  presentationStart,
  introPrompts,
  isserviceselected,
  islanguageselected
}) => {
  const { t } = useTranslation();

  const serviceSelected = (
    <Select
      selectedOption={selectedServiceOption}
      onChange={({ detail }) => onServiceOptionChange(detail.selectedOption)}
      options={introPrompts}
      selectedAriaLabel={t('common.status.text.selected')}
      disabled={isserviceselected === "true"}
    />
  );

  const languageSelected = (
    <Select
      selectedOption={selectedOption}
      onChange={({ detail }) => onSentimentChange(detail.selectedOption)}
      options={[
        { label: t('sentiment.options.noSentiment'), value: "" },
        { label: t('sentiment.options.friendly'), value: "FRIENDLY" },
        { label: t('sentiment.options.neutral'), value: "NEUTRAL" },
        { label: t('sentiment.options.mildlyAnnoyed'), value: "MILDLY ANNOYED" },
        { label: t('sentiment.options.angry'), value: "ANGRY" },
      ]}
      disabled={islanguageselected === "true"}
      selectedAriaLabel={t('common.status.text.selected')}
    />
  );

  const calibrated = listening ? (
    <>
      <Button disabled>{t('presentation.actions.view')}</Button>
      <Button onClick={onEndPresentation}>{t('presentation.actions.end')}</Button>
    </>
  ) : (
    <>
      <Button href="/metrics" variant="primary">{t('presentation.actions.view')}</Button>
      <Button 
        variant="primary" 
        onClick={onStartPresentation} 
        loading={startPresentationButtonLoading}
      >
        {t('presentation.actions.start')}
      </Button>
    </>
  );

  return (
    <SpaceBetween direction="horizontal" size="s">
      {serviceSelected}
      {languageSelected}
      {!(selectedServiceOption.label === "Custom Scenario" && selectedServiceOption.label === "Perfect Pitch Gen AI") || presentationStart && (
        <Button onClick={onClearText}>{t('presentation.actions.clear')}</Button>
      )}
      <CustomPromptModal setCustomPrompt={setCustomPrompt} />
      {calibrated}
    </SpaceBetween>
  );
};

export default PresentationControls;