import {Predictions} from "aws-amplify";
import AWS from 'aws-sdk';
import React, { useState } from 'react';
import { Auth } from 'aws-amplify';
import { useTranslation } from "react-i18next"

function TTS() {
    const { t } = useTranslation;
    const [text, setText] = useState('');
  
  
    return (
      <div>
        <textarea value={text} onChange={(e) => setText(e.target.value)} />
        <button onClick={synthesizeSpeech}>{t("transcription.service.textToSpeech.synthesize")}</button>
        {audioUrl && <audio controls src={audioUrl} />}
      </div>
    );
  }
  
  export default TTS;