import { useState } from 'react';
import { StatusIndicator } from "@awsui/components-react";
import { defaultGenAIBasePrompt } from "../prompt/genAIPrompt";
import { useTranslation } from "react-i18next";

export const usePresentationState = () => {
  const { t } = useTranslation();
  const [state, setState] = useState({
    isContextualFeedbackEnabled: true,
    position: { x: 0, y: 0 },
    presentationTime: 0,
    displayTime: "00:00:00",
    listening: false,
    start: false,
    userTranscript: "",
    userTranscriptHistory: "",
    bedrockTranscription: "",
    clientCredentials: {},
    grade: "",
    eyeMetric: <StatusIndicator type="loading">{t("common.status.text.pendingInput")}</StatusIndicator>,
    colorEye: null,
    colorPace: null,
    colorAvgPace: null,
    colorQ: null,
    colorFiller: null,
    colorWeasel: null,
    colorBias: null,
    stamp: "-",
    diff: 0,
    diffDisplay: <StatusIndicator type="loading">{t("common.status.text.pendingInput")}</StatusIndicator>,
    words: <StatusIndicator type="loading">{t("common.status.text.pendingInput")}</StatusIndicator>,
    mins: "-",
    avgPace: <StatusIndicator type="loading">{t("common.status.text.pendingInput")}</StatusIndicator>,
    filler: <StatusIndicator type="loading">{t("common.status.text.pendingInput")}</StatusIndicator>,
    weasel: <StatusIndicator type="loading">{t("common.status.text.pendingInput")}</StatusIndicator>,
    g1: <StatusIndicator type="loading">{t("common.status.text.pendingInput")}</StatusIndicator>,
    selectedOption: { label: "No Sentiment", value: "" },
    selectedServiceOption: { label: "Perfect Pitch Gen AI", value: defaultGenAIBasePrompt },
    visible: "true",
    ismodal: "true",
    ismodalVisible: false,
    iscalibrated: "true",
    isclickable: false,
    clicks: 1,
    isalert: false,
    subId: "",
    isPresentationView: false,
    questionPrompted: false,
    avatarGeneratedselectedOption: { label: "Default Avatars", value: "1" },
    uploadedImage: null,
    defaultAvatar: null,
    avatarEmotion: "normal",
    flashbarItems: [],
    startPresentationButtonLoading: false,
    genAIprompt: defaultGenAIBasePrompt,
    speakerFirst: true
  });

  return [state, setState];
};