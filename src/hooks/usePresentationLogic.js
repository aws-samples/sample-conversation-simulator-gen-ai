import { useRef, useCallback } from 'react';
import { renderToString } from "react-dom/server";
import { getCurrentUser } from 'aws-amplify/auth';
import { startAudio, stopAudio, pauseAudio, resumeAudio } from "../audio/newMiceAudioStream";
import { fetchAuthSession } from 'aws-amplify/auth';
import { amplifyConfig } from '../amplify-environment';
import awsconfig from '../aws-exports';
import runComprehend from "../comprehend/comprehendUtil";
import { TranscriptLine } from "../comprehend/TranscriptLine";
import { getGenAIBasePrompt, getCustomBasePrompt } from "../prompt/genAIPrompt";
import { savePresentationData, generateAvatarEmotion } from "../services/presentationService";
import { secondsToHms, timeToLastQConvert } from "../utils/presentationUtils";

export const usePresentationLogic = (state, setState) => {
  const childRef = useRef();
  const intervalRef = useRef();
  const textareaRef = useRef();

  let presentationCount = 0;
  let username = null;
  let y = 0, x = 0;
  let isAudio = false;
  let speakerFirst = true;
  const responseTime = 4;

  const resetTalkCount = useCallback(() => {
    x = 0;
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const session = await fetchAuthSession();
      const credentials = session.credentials;
      
      if (!credentials) {
        throw new Error('No credentials available');
      }

      // Format credentials to match expected structure
      const formattedCredentials = {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
        sessionToken: credentials.sessionToken,
        region: amplifyConfig.region
      };

      startAudio(
        toggleStartStop,
        getTranscript,
        formattedCredentials,
        setWordCount,
        setMinute,
        setAvg,
        setFiller,
        setWeasel,
        setBiasEmotionSpec,
        resetTalkCount,
      );
      setState(prev => ({ ...prev, startPresentationButtonLoading: false, clientCredentials: formattedCredentials }));
    } catch (err) {
      console.error('Error getting credentials:', err);
      setState(prev => ({ ...prev, startPresentationButtonLoading: false }));
    }
  }, []);

  const setWordCount = useCallback((count) => {
    const color = count < 125 || count > 150 ? "rgb(209, 50, 18)" : "rgb(29, 129, 2)";
    setState(prev => ({ ...prev, words: count + " WPM", colorPace: color }));
  }, []);

  const setMinute = useCallback((seconds) => {
    setState(prev => ({ ...prev, mins: seconds }));
  }, []);

  const setAvg = useCallback((countAvg) => {
    if (state.presentationTime !== 0) {
      const avgPaceSet = Math.floor((countAvg / state.presentationTime) * 60);
      const color = avgPaceSet < 125 || avgPaceSet > 150 ? "rgb(209, 50, 18)" : "rgb(29, 129, 2)";
      setState(prev => ({ ...prev, avgPace: avgPaceSet + " WPM", colorAvgPace: color }));
    }
  }, [state.presentationTime]);

  const setFiller = useCallback((count) => {
    let color = "rgb(29, 129, 2)";
    if (count >= 10 && count <= 20) color = "rgb(255, 153, 0)";
    else if (count > 20) color = "rgb(209, 50, 18)";
    setState(prev => ({ ...prev, filler: count, colorFiller: color }));
  }, []);

  const setWeasel = useCallback((count) => {
    let color = "rgb(29, 129, 2)";
    if (count >= 10 && count <= 20) color = "rgb(255, 153, 0)";
    else if (count > 20) color = "rgb(209, 50, 18)";
    setState(prev => ({ ...prev, weasel: count, colorWeasel: color }));
  }, []);

  const setBiasEmotionSpec = useCallback((count) => {
    let color = "rgb(29, 129, 2)";
    if (count >= 10 && count <= 20) color = "rgb(255, 153, 0)";
    else if (count > 20) color = "rgb(209, 50, 18)";
    setState(prev => ({ ...prev, g1: count, colorBias: color }));
  }, []);

  const getTranscript = useCallback((transcript) => {
    setState(prev => ({ ...prev, userTranscript: prev.userTranscript + transcript + " ", speakerFirst: false }));
    scrollToBottom();
  }, []);

  const scrollToBottom = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const toggleStartStop = useCallback(() => {
    setState(prev => ({ ...prev, listening: !prev.listening }));
  }, []);

  const timerConvert = useCallback(() => {
    intervalRef.current = setInterval(() => {
      y = y + 1;
      if (!isAudio && !state.startPresentationButtonLoading) {
        x = x + 1;
      }

      setState(prev => ({
        ...prev,
        presentationTime: y,
        displayTime: secondsToHms(y),
        diff: x,
        diffDisplay: timeToLastQConvert(x)
      }));

      if (x >= responseTime && state.userTranscript) {
        console.log("Triggering AI response", x, state.userTranscript);
        x = 0;
        pauseAudio();
        if (childRef.current && childRef.current.runBedrock) {
          childRef.current.runBedrock();
        }
        generateAvatarEmotion(state.bedrockTranscription + state.userTranscript)
          .then(emotion => setState(prev => ({ ...prev, avatarEmotion: emotion })));
        
        runComprehend(state.userTranscript, state.clientCredentials).then((entities) => {
          let htmltxt = renderToString(
            <TranscriptLine chunk={state.userTranscript} results={entities} />
          );
          setState(prev => ({
            ...prev,
            userTranscriptHistory: prev.userTranscriptHistory + htmltxt,
            bedrockTranscription: prev.bedrockTranscription + prev.userTranscript,
            userTranscript: "",
          }));
          resumeAudio();
        });
      }

      const diffColor = x <= 60 ? "rgb(29, 129, 2)" : x <= 120 ? "rgb(255, 153, 0)" : "rgb(209, 50, 18)";
      setState(prev => ({ ...prev, colorQ: diffColor }));
    }, 1000);
  }, [state.userTranscript, state.bedrockTranscription, state.clientCredentials, state.startPresentationButtonLoading]);

  const onStartPresentation = useCallback(() => {
    setState(prev => ({ ...prev, startPresentationButtonLoading: true, isPresentationView: true }));
    presentationCount = presentationCount + 1;

    if (state.selectedServiceOption.label === "Custom Scenario" || state.selectedServiceOption.label === "Perfect Pitch Gen AI") {
      // Keep current genAIprompt
    } else {
      setState(prev => ({ ...prev, genAIprompt: prev.selectedServiceOption.value }));
    }

    setState(prev => ({
      ...prev,
      diffDisplay: "00:00:00",
      displayTime: "00:00:00",
      words: "- WPM",
      mins: "-",
      avgPace: "- WPM",
      filler: 0,
      weasel: 0,
      g1: 0,
      colorFiller: "rgb(29, 129, 2)",
      colorWeasel: "rgb(29, 129, 2)",
      colorBias: "rgb(29, 129, 2)",
      colorEye: null,
      colorPace: null,
      colorAvgPace: null,
      colorQ: null,
      userTranscript: "",
      userTranscriptHistory: "",
      grade: "",
      start: true,
      isloaded: false,
      islanguageselected: "true",
      isserviceselected: "true"
    }));
    
    // Trigger initial AI response after state is set
    setTimeout(() => {
      if (!speakerFirst && childRef.current && childRef.current.runBedrock) {
        childRef.current.runBedrock();
      }
      generateAvatarEmotion(state.bedrockTranscription + state.userTranscript)
        .then(emotion => setState(prev => ({ ...prev, avatarEmotion: emotion })));
    }, 100);

    timerConvert();
    startRecording();
  }, [state.selectedServiceOption, state.bedrockTranscription, state.userTranscript]);

  const onEndPresentation = useCallback(() => {
    setState(prev => ({ ...prev, isPresentationView: false }));
    
    savePresentationToDB({
      eyeMetric: state.eyeMetric,
      avgPace: state.avgPace,
      words: state.words,
      displayTime: state.displayTime,
      filler: state.filler,
      weasel: state.weasel,
      g1: state.g1,
      presentationTime: state.presentationTime
    }, username, state.subId);

    // Reset all variables
    y = 0;
    x = 0;
    isAudio = false;
    
    clearInterval(intervalRef.current);
    stopAudio();
    
    setState(prev => ({
      ...prev,
      presentationTime: 0,
      start: false,
      stamp: "-",
      diff: 0,
      islanguageselected: "false",
      isserviceselected: "false",
      visible: true,
      ismodal: "false",
      isalert: false,
      colorAvgPace: null,
      avgPace: "- WPM",
      bedrockTranscription: prev.bedrockTranscription + prev.userTranscript,
    }), () => {
      childRef.current.runBedrock();
      generateAvatarEmotion(state.bedrockTranscription + state.userTranscript)
        .then(emotion => setState(prev => ({ ...prev, avatarEmotion: emotion })));
      setState(prev => ({ ...prev, bedrockTranscription: "", userTranscript: "" }));
    });

    toggleStartStop();
  }, [state]);

  const setCustomPrompt = useCallback((accountName, AIJobTitle, userJobTitle, context) => {
    if (state.selectedServiceOption.label === "Custom Scenario") {
      setState(prev => ({ ...prev, genAIprompt: getCustomBasePrompt(accountName, AIJobTitle, userJobTitle, context) }));
    } else {
      setState(prev => ({ ...prev, genAIprompt: getGenAIBasePrompt(accountName, AIJobTitle, userJobTitle, context) }));
    }
  }, [state.selectedServiceOption]);

  const onClearText = useCallback(() => {
    setState(prev => ({ ...prev, userTranscriptHistory: "" }));
  }, []);

  // Initialize user on mount
  const initializeUser = useCallback(() => {
    getCurrentUser().then((data) => {
      setState(prev => ({ ...prev, subId: data.userId }));
      username = data.username;
    });
  }, []);

  return {
    childRef,
    textareaRef,
    onStartPresentation,
    onEndPresentation,
    setCustomPrompt,
    onClearText,
    initializeUser
  };
};