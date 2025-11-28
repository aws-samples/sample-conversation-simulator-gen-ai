import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Checkbox, SpaceBetween } from "@awsui/components-react";
import AvatarDisplay from "../pages/AvatarDisplay";
import QuestionGeneration from "../pages/QuestionGeneration";

// Main content area with avatar, feedback toggle, and AI question generation
const MainContent = ({ 
  bedrockTranscription, 
  userTranscript, 
  isContextualFeedbackEnabled, 
  onToggleChange, 
  childRef, 
  genAIprompt, 
  speakerFirst, 
  selectedServiceOption, 
  start, 
  selectedOption, 
  handleAudioEnd, 
  onAudioStart, 
  avatarEmotion 
}) => {
  const { t } = useTranslation();

  return (
    <SpaceBetween size="m" direction="vertical">
      {/* Avatar display section */}
      <Box textAlign="center">
        <AvatarDisplay avatarEmotion={avatarEmotion} selectedScenario={selectedServiceOption} />
      </Box>
      {/* Contextual feedback toggle */}
      <Checkbox
        toggle
        checked={isContextualFeedbackEnabled}
        onChange={onToggleChange}
      >{t('transcription.settings.contextualFeedback')}</Checkbox>
      {/* AI question generation component */}
      <QuestionGeneration 
        ref={childRef} 
        prompt={genAIprompt} 
        speakerFirst={speakerFirst} 
        label={selectedServiceOption.label} 
        transcript={bedrockTranscription + userTranscript} 
        isEndPresentation={!start} 
        sentiment={selectedOption.value} 
        handleAudioEnd={handleAudioEnd} 
        onAudioStart={onAudioStart} 
        isContextualFeedbackMetricsEnabled={isContextualFeedbackEnabled} 
      />
    </SpaceBetween>
  );
};

export default MainContent;