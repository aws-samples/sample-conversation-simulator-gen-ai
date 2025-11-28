import React from 'react';
import { useTranslation } from 'react-i18next';
import ContentEditable from "react-contenteditable";
import {
  Header,
  Form,
  SpaceBetween
} from "@awsui/components-react";

const TranscriptionSection = ({ userTranscriptHistory, userTranscript, listening, isAudio }) => {
  const { t } = useTranslation();

  return (
    <SpaceBetween size="m" direction="vertical">
      <Header variant="h3">
        {t('transcription.display.realTime') + " - " + `${listening && !isAudio ? t('transcription.status.audioStarted') : t('common.status.text.pleaseWait')}`}
      </Header>
      <Form>
        <div className="homepage">
          <ContentEditable
            id="transcript"
            disabled={true}
            className="editable"
            html={userTranscriptHistory + userTranscript}
            name="transcription"
          />
        </div>
      </Form>
    </SpaceBetween>
  );
};

export default TranscriptionSection;