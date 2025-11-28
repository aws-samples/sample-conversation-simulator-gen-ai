// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React, { Component, useRef } from "react";
import { useTranslation } from 'react-i18next';
import { renderToString } from "react-dom/server";
import ContentEditable from "react-contenteditable";
import "./Home.css";
import Webcam from "react-webcam";
import invokeBedrockModel from '../services/bedrockService';
import { createPresentation } from "../graphql/mutations";
//import { API, graphqlOperation } from "aws-amplify";
import { startAudio, stopAudio, pauseAudio, resumeAudio } from "../audio/newMiceAudioStream";
import { fetchAuthSession } from 'aws-amplify/auth';
import { amplifyConfig } from '../amplify-environment';
import runComprehend from "../comprehend/comprehendUtil";
import { TranscriptLine } from "../comprehend/TranscriptLine";
import { createIntroPrompts } from "../prompts/scenarioPrompts"
import CustomPromptModal from "../ui-components/CustomPromptModal"
import {
  Button,
  Header,
  Container,
  ContentLayout,
  ColumnLayout,
  Box,
  StatusIndicator,
  SpaceBetween,
  Select,
  Modal,
  Flashbar,
  Spinner,
  Form,
  AppLayout,
  Checkbox,
  Link,
  Popover,
  Grid,
} from "@awsui/components-react";
import QuestionGeneration from "./QuestionGeneration";
import AvatarDisplay from "./AvatarDisplay";
import PresentationMetrics from "../components/PresentationMetrics";
import WelcomeModal from "../components/WelcomeModal";
import PresentationControls from "../components/PresentationControls";
import TranscriptionSection from "../components/TranscriptionSection";
import CalibrationOverlay from "../components/CalibrationOverlay";
import MainContent from "../components/MainContent";

import { secondsToHms, timeToLastQConvert } from "../utils/timerUtils";
import { createMetricHelpers } from "../utils/metricHelpers";
import { savePresentationData } from "../services/presentationService";
import { generateAvatarEmotion } from "../services/avatarService";
import responseTrigger from '../services/responseTrigger'
import { getCurrentUser } from 'aws-amplify/auth';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/api';
import config from '../amplifyconfiguration.json';
import {basePrompt} from '../prompt/basePrompt'
import {getGenAIBasePrompt, defaultGenAIBasePrompt, getCustomBasePrompt} from "../prompt/genAIPrompt";

// Configure Amplify with full configuration in all environments
console.log('Home.js: Configuring Amplify with full configuration');
Amplify.configure(config);

const client = generateClient();

// WebGazer configuration
window.saveDataAcrossSessions = true;

// Eye contact detection boundaries
const UPPER_CUTOFF = window.innerHeight / 8;
const LEFT_CUTOFF = window.innerWidth / 4;
const RIGHT_CUTOFF = window.innerWidth / 4;

// Global variables
var time = 0;
let timer = null;
let startLookTime = 0;
let eyeDetection = 0;
let y = 0;
let x = 0;
let interval = null;
let presentationStart = false;
let countdown = 0;
let startup = 0;
var language = null;
let webgazer = null;
let presentationCount = 0;
let username = null;
var countPace = 0;
var countAvgPace = 0;
let avgPaceSet = 0;
let paceSet = 0;
var countFillerWords = 0;
var countWeaselWords = 0;
var countBiasWords = 0;
let eyeAlert = false;
let avgAlert = false;
let paceAlert = false;
let engagementAlert = false;
let fillerAlert = false;
let weaselAlert = false;
let biasAlert = false;
let isAudio = false;
let responseTime = 4
let speakerFirst = true

var service = null;

let prompt = ``

// let grade = "";


function App() {
  return <HomeScreen />;
}

// Utility functions
export function getTime() {
  return time;
}

// Metric check functions for session reset
export function paceCheck() {
  return countPace;
}

export function avgPaceCheck() {
  return countAvgPace;
}

export function fillerCheck() {
  return countFillerWords;
}

export function weaselCheck() {
  return countWeaselWords;
}

export function biasCheck() {
  return countBiasWords;
}

export function getLanguage() {
  return language;
}

export function getService() {
  return service;
}

// Header wrapper component to use translation hook in class component
const HeaderWrapper = () => {
  const { t } = useTranslation();
  return t('home.branding.text.playgroundTitle');
};

// PresentationControls wrapper component to use translation hook in class component
const PresentationControlsWrapper = (props) => {
  const { t } = useTranslation();
  const introPrompts = createIntroPrompts(t);
  
  // Extract only the safe props that PresentationControls expects
  const {
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
    isserviceselected,
    islanguageselected
    // Removed ...otherProps to eliminate all spread operator patterns
  } = props;
  
  return (
    <PresentationControls
      selectedServiceOption={selectedServiceOption}
      onServiceOptionChange={onServiceOptionChange}
      selectedOption={selectedOption}
      onSentimentChange={onSentimentChange}
      onClearText={onClearText}
      onStartPresentation={onStartPresentation}
      onEndPresentation={onEndPresentation}
      setCustomPrompt={setCustomPrompt}
      listening={listening}
      startPresentationButtonLoading={startPresentationButtonLoading}
      presentationStart={presentationStart}
      isserviceselected={isserviceselected}
      islanguageselected={islanguageselected}
      introPrompts={introPrompts}
    />
  );
};

export default App;

function HomeScreen() {
    const { t } = useTranslation();
    return <HomeScreenClass t={t} />
}

class HomeScreenClass extends Component {
  //all initial state values used when user first logins to page

  constructor(props) {
    const { t } = props;
    super(props);
    this.childRef = React.createRef();
    this.metrics = createMetricHelpers(this.setState.bind(this));
    this.state = {
      isContextualFeedbackEnabled: true,
      position : { x: 0, y: 0 },
      presentationTime: 0,
      displayTime: "00:00:00",
      listening: false,
      start: false,
      userTranscript: "",
      userTranscriptHistory: "",
      bedrockTranscription: "",
      clientCredentials: {},
      grade: "",
      eyeMetric: (
        <StatusIndicator type="loading">{t("common.status.text.pendingInput")}</StatusIndicator>
      ),
      colorEye: null,
      colorPace: null,
      colorAvgPace: null,
      colorQ: null,
      colorFiller: null,
      colorWeasel: null,
      colorBias: null,
      stamp: "-",
      diff: 0,
      diffDisplay: (
        <StatusIndicator type="loading">{t("common.status.text.pendingInput")}</StatusIndicator>
      ),
      words: <StatusIndicator type="loading">{t("common.status.text.pendingInput")}</StatusIndicator>,
      mins: "-",
      avgPace: <StatusIndicator type="loading">{t("common.status.text.pendingInput")}</StatusIndicator>,
      filler: <StatusIndicator type="loading">{t("common.status.text.pendingInput")}</StatusIndicator>,
      weasel: <StatusIndicator type="loading">{t("common.status.text.pendingInput")}</StatusIndicator>,
      g1: <StatusIndicator type="loading">{t("common.status.text.pendingInput")}</StatusIndicator>,
      selectedOption: { label: "No Sentiment", value: "" }, // This will be updated dynamically
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
      genAIprompt: defaultGenAIBasePrompt
    };

  }

  componentDidMount() {
    // Get real user data in all environments
    getCurrentUser().then((data) => {
      console.log(data);
      this.setState({ subId: data.userId });
      username = data.username;
    }).catch(error => {
      console.error('Error getting current user:', error);
    });
  }

  resetTalkCount = () => {
    console.log("reset Count")
    x = 0
  }

  // Start audio recording with credentials
  startRecording = async () => {
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
        this.toggleStartStop,
        this.getTranscript,
        formattedCredentials,
        this.setWordCount,
        this.setMinute,
        this.setAvg,
        this.setFiller,
        this.setWeasel,
        this.setBiasEmotionSpec,
        this.resetTalkCount,
      );
      this.setState({ startPresentationButtonLoading: false });
      this.setState({ clientCredentials: formattedCredentials });
    } catch (err) {
      console.error('Error getting credentials:', err);
      this.setState({ startPresentationButtonLoading: false });
    }
  };

  onAudioStart = () => {
    isAudio = true;
  }

  handleToggleChange = () => {
    this.setState(prevState => ({
      isContextualFeedbackEnabled: !prevState.isContextualFeedbackEnabled
    }));
  };

  handleAudioEnd = () => {
    isAudio = false;
  }

  setCustomPrompt = (accountName, AIJobTitle, userJobTitle, context) => {
    if(this.state.selectedServiceOption.label == "Custom Scenario"){
      this.setState({genAIprompt: getCustomBasePrompt(accountName, AIJobTitle, userJobTitle, context)})
    }
    else{
      this.setState({genAIprompt: getGenAIBasePrompt(accountName, AIJobTitle, userJobTitle, context)})
    }
  }

  setWordCount = (count) => {
    paceCheck();
    countPace++;
    paceSet = count;
    paceAlert = this.metrics.updatePaceMetric(count);
  };

  setMinute = (seconds) => {
    this.setState({ mins: seconds });
  };

  setAvg = (countAvg) => {
    avgPaceCheck();
    countAvgPace++;
    avgAlert = this.metrics.updateAvgPaceMetric(countAvg, this.state.presentationTime);
  };

  setFiller = (count) => {
    fillerCheck();
    countFillerWords++;
    fillerAlert = this.metrics.updateFillerMetric(count);
  };

  setWeasel = (count) => {
    weaselCheck();
    countWeaselWords++;
    weaselAlert = this.metrics.updateWeaselMetric(count);
  };

  setBiasEmotionSpec = (count) => {
    biasCheck();
    countBiasWords++;
    biasAlert = this.metrics.updateBiasMetric(count);
  };

  // Update transcript from speech recognition
  getTranscript = (transcript) => {
    const previousTranscriptPiece = this.state.userTranscript;
    this.setState({
      userTranscript: previousTranscriptPiece + transcript+ " ",
    });
    speakerFirst = false

    this.scrollToBottom();
  };

  endRecording = () => {
    stopAudio();
  };

  toggleStartStop = () => {
    this.setState({ listening: !this.state.listening });
  };

  // Auto-scroll transcript
  scrollToBottom = () => {
    if (this.textarearef) {
      this.textarearef.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Time display updates
  updateDisplayTime = (seconds) => {
    this.setState({ displayTime: secondsToHms(seconds) });
  }

  updateDiffDisplay = (seconds) => {
    this.setState({ diffDisplay: timeToLastQConvert(seconds) });
  }

  // Main presentation timer
  timerConvert = () => {
   
    interval = setInterval(() => {
      y = y + 1;
      if (!isAudio & !this.state.startPresentationButtonLoading) {
        x = x + 1;
      }
      // Update timers
      this.setState({ presentationTime: y });
      this.updateDisplayTime(this.state.presentationTime);
      this.setState({ diff: x });
      this.updateDiffDisplay(this.state.diff);

      // Trigger AI response after timeout
      if (x >= responseTime && this.state.userTranscript) {
        console.log("trigger response with responseTime: ", x)
        x = 0;
        pauseAudio();
        this.childRef.current.runBedrock();
        this.runBedrockModelforAvatar();
        this.setState({
          bedrockTranscription: ""
        })
        runComprehend(this.state.userTranscript, this.state.clientCredentials).then(
          (entities) => {
            let htmltxt = renderToString(
              <TranscriptLine chunk={this.state.userTranscript} results={entities} />
            );
  
            this.setState({
              userTranscriptHistory: this.state.userTranscriptHistory + htmltxt,
              bedrockTranscription: this.state.bedrockTranscription + this.state.userTranscript,
              userTranscript: "",
            });
            resumeAudio();
          }
        );

      }
      //if question mark detected in transcript, reset engagement metric back to 0
      // else if (responseTrigger(this.state.bedrockTranscription) && !isAudio) { //TODO: Remove is Audio?
      //   x = 0;
      //   pauseAudio();
      //   this.childRef.current.runBedrock();
      //   this.runBedrockModelforAvatar();
      //   this.setState({
      //     bedrockTranscription: ""
      //   })
      //   runComprehend(this.state.userTranscript, this.state.clientCredentials).then(
      //     (entities) => {
      //       let htmltxt = renderToString(
      //         <TranscriptLine chunk={this.state.userTranscript} results={entities} />
      //       );
  
      //       this.setState({
      //         userTranscriptHistory: this.state.userTranscriptHistory + htmltxt,
      //         bedrockTranscription: this.state.bedrockTranscription + this.state.userTranscript,
      //         userTranscript: "",
      //       });
      //       resumeAudio();
      //     }
      //   );
      // }

      engagementAlert = this.metrics.updateEngagementMetric(this.state.diff);
    }, 1000);
  };

  endTimer = () => {
    clearInterval(interval);
  };

  dynamoDBHistory = async () => {
    await savePresentationData(this.state, username, this.state.subId);
  };

  runBedrockModelforAvatar = async () => {
    const emotion = await generateAvatarEmotion(this.state.bedrockTranscription + this.state.userTranscript);
    this.setState({ avatarEmotion: emotion });
  };
  

  //when user clicks Start Presentation button
  //\"What experience does Amazon have with AI?\" \"I don’t have any of my own staff to do this how can you help?\"
  onStartPresentation = (event) => {
    //increment number of presentations by 1 --> this is used in Check functions to reset metrics
    this.setState({ startPresentationButtonLoading: true });
    this.setState({ isPresentationView: true });
    presentationCount = presentationCount + 1;
    if (presentationCount > 1) {
      this.startCamera();
    }

    //set state variables with initial display values
    presentationStart = true;

    if (this.state.selectedServiceOption.label == "Custom Scenario" || this.state.selectedServiceOption.label == "Perfect Pitch Gen AI") {

    }
    else {
      this.setState({genAIprompt: this.state.selectedServiceOption.value})
    }


    //select language
    language = "English";
    this.setState({
      diffDisplay: "00:00:00",
      displayTime: "00:00:00",
      words: "- WPM",
      mins: "-",
      avgPace: "- WPM",
      filler: 0,
      weasel: 0,
      g1: 0,
      colorFiller: "rgb(" + 29 + "," + 129 + "," + 2 + ")",
      colorWeasel: "rgb(" + 29 + "," + 129 + "," + 2 + ")",
      colorBias: "rgb(" + 29 + "," + 129 + "," + 2 + ")",
      colorEye: null,
      colorPace: null,
      colorAvgPace: null,
      colorQ: null,
      userTranscript: "",
      userTranscriptHistory: "",
      grade: "",
      start: true
    }, () => {
      if(speakerFirst == false){
        this.childRef.current.runBedrock();
      }
      this.runBedrockModelforAvatar();
    })

    //remove model loaded alert and begin timer and recording audio

    this.setState({ isloaded: false });
    this.setState({ islanguageselected: "true" });
    this.setState({ isserviceselected: "true" });
    this.timerConvert();
    this.startRecording();
  };

  //when presentation ends, reset all variables, end audio and camera for eye detection

  onEndPresentation = () => {
    //this.setState({ ismodalVisible: true });
    this.setState({
      isPresentationView: false,
    });
    this.dynamoDBHistory();
    presentationStart = false;
    countPace = 0;
    countAvgPace = 0;
    countFillerWords = 0;
    countWeaselWords = 0;
    countBiasWords = 0;
    this.endCamera();
    this.endTimer();
    this.endRecording();
    this.handleAudioEnd();
    time = 0;
    startLookTime = 0;
    eyeDetection = 0;
    y = 0;
    x = 0;
    countdown = 0;
    startup = 0;
    eyeAlert = false;
    avgAlert = false;
    paceAlert = false;
    engagementAlert = false;
    fillerAlert = false;
    weaselAlert = false;
    biasAlert = false;
    this.setState({
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
      bedrockTranscription: this.state.bedrockTranscription + this.state.userTranscript,
    }, () => {
      this.childRef.current.runBedrock();
      this.runBedrockModelforAvatar();
      this.setState({
        bedrockTranscription: "",
        userTranscript: ""
      })
    })
    this.toggleStartStop();



  };


  onClearText = () => {
    this.setState({
      userTranscriptHistory: ""
    })
  }
  //WebGazer initialization

  startCamera = () => {
    window.navigator.mediaDevices.getUserMedia({
      video: false,
      audio: true,
    });
    webgazer = window.webgazer;
    this.setState({ visible: false });
    //check if model is already loaded in --> if no (a.k.a its the first dry run, show alert)

    let prevflashbarItems = this.state.flashbarItems
    if (presentationCount <= 1) {
      prevflashbarItems.push({
        type: 'in-progress',
        dismissible: true,
        content: 'Starting eye detection model.', // This will need a wrapper component for translation
        id: 'isloading-eye-detection',
      })
      this.setState({ isloading: true, flashbarItems: prevflashbarItems });
    } else {
      this.setState({ isloading: false });
    }

    //make green loaded alert and red square calibration appear once the model is loaded in and 6 seconds have passed (buffer time)
    countdown = setInterval(() => {
      startup = startup + 1;
      if (startup === 6 && presentationCount <= 1) {
        prevflashbarItems = prevflashbarItems.filter(item => item.id !== 'isloading-eye-detection')
        /*prevflashbarItems.push({
          type: "success",
          content: `Eye detection model loaded. Please click on the blue button below the webcam ${11 - this.state.clicks
            } times. You may start your presentation once finished.`,
          id: "eye-detection-loaded",
        })*/
        this.setState({ isloading: false });
        this.setState({ isloaded: true, flashbarItems: prevflashbarItems });
        //this.setState({ isclickable: true });
        clearInterval(countdown);
      } else if (startup === 6 && presentationCount > 1) {
        this.setState({ isloading: false });
        this.setState({ isloaded: false });
        clearInterval(countdown);
      }
    }, 1000);

    //start WebGazer client
    webgazer
      .setGazeListener((data, timestamp) => {
        time = timestamp;
        if (data == null) return;
        if (presentationStart === true) {
          //if X and Y coordinates in webcam range, increment counter to count time user is looking
          if (
            data.y <= UPPER_CUTOFF &&
            data.x >= LEFT_CUTOFF &&
            data.y <= RIGHT_CUTOFF
          ) {
            clearInterval(timer);
            timer = setInterval(() => {
              startLookTime = startLookTime + 1;
            }, 1000);
          }

          if (this.state.presentationTime === 0) {
            eyeDetection = 0;
            startLookTime = 0;
          }

          //take time user has looked at camera divided by total presentation time to update eye contact metric
          if (this.state.presentationTime >= 1) {
            eyeDetection = (
              (1 - startLookTime / this.state.presentationTime) *
              100
            ).toFixed(2);

            eyeAlert = this.metrics.updateEyeMetric(eyeDetection);
          }
        }

        //CENTRAL ALERT --> IF ANY METRIC THRESHOLD IS BREACHED, SET ALERT TO TRUE
        //TODO: Prevent this from chaining
/*
        const prevflashbarItems = this.state.flashbarItems
        if ((eyeAlert === true || avgAlert === true || paceAlert === true || engagementAlert === true || fillerAlert === true || weaselAlert === true || biasAlert === true)) {
          prevflashbarItems.push({
            type: 'warning',
            dismissible: true,
            content: 'One or more of your presentation metrics needs improvement.',
            id: 'message_1',
          })
          this.setState({ isalert: true, flashbarItems: prevflashbarItems });
        } else {
          this.setState({ isalert: false, flashbarItems: prevflashbarItems });
        }
          */
      })
      .begin();


    //remove default webgazer settings (ex. webcam box, overlay of face, red dot to track eyes, etc.)
    webgazer.showPredictionPoints(false);
    webgazer.showFaceOverlay(false);
    webgazer.showVideo(false);
    webgazer.showFaceFeedbackBox(false);
  };

  //end webgazer client
  endCamera = () => {
    if (webgazer) {
      webgazer.end();
    }
  };

  setRandomPosition = () => {
    const x = Math.random() * (window.innerWidth - 150);
    const y = Math.random() * (window.innerHeight - 50);
    this.setState({ position: { x, y } });
  };

  //counts number of times user clicks the red box during calibration, will disappear once 10 has been reached --> update states once 10 has been reached
  /*
  incrementClick = () => {
    this.setState({ clicks: this.state.clicks + 1 });
    this.setRandomPosition();
    if (this.state.clicks === 10) {
      this.setState({ isclickable: false });
      this.setState({ iscalibrated: "true" });
      this.setState({ isloaded: false });
    }
  };
  */


  //ALL POLARIS AND UI ELEMENTS HERE
  render() {
    const {
      isContextualFeedbackEnabled,
      position,
      displayTime,
      listening,
      userTranscript,
      start,
      textchunks,
      comprehendResults,
      line,
      userTranscriptHistory,
      eyeMetric,
      colorEye,
      colorPace,
      colorAvgPace,
      colorQ,
      colorFiller,
      colorWeasel,
      colorBias,
      stamp,
      words,
      diffDisplay,
      avgPace,
      weasel,
      g1,
      filler,
      selectedOption,
      selectedServiceOption,
      grade
    } = this.state;

    const videoConstraints = {
      width: window.innerWidth / 3.5,
      height: window.innerHeight / 4,
      facingMode: "user",
    };

    const islanguageselected = this.state.islanguageselected;
    const ismodal = this.state.ismodal;
    let modal;
    const iscalibrated = this.state.iscalibrated;
    const isclickable = this.state.isclickable;
    const isserviceselected = this.state.isserviceselected;



    // Welcome modal
    if (ismodal === "true") {
      modal = (
        <WelcomeModal 
          visible={this.state.visible} 
          onStartCamera={this.startCamera} 
        />
      );
    }


    // Calibration UI (unused)

    const handlePromptingChange = (evt) => {
      prompt = evt.target.value;
    }
    // Main UI layout
    return (
      <AppLayout
        navigationHide={true}
        notifications={
          this.state.flashbarItems && <Flashbar
            items={this.state.flashbarItems}
          />
        }
        toolsHide={true}
        content={
          <ContentLayout
          >
            <div ismodal={ismodal}>{modal}</div>
            <Container
              header={
                <Header variant="h1" actions={
                  <SpaceBetween direction="horizontal" size="xs">
                    <CalibrationOverlay 
                      isclickable={isclickable}
                      position={position}
                      onIncrementClick={this.incrementClick}
                    />
                    <PresentationControlsWrapper
                      selectedServiceOption={selectedServiceOption}
                      onServiceOptionChange={(option) => this.setState({ selectedServiceOption: option })}
                      selectedOption={selectedOption}
                      onSentimentChange={(option) => this.setState({ selectedOption: option })}
                      onClearText={this.onClearText}
                      onStartPresentation={this.onStartPresentation}
                      onEndPresentation={this.onEndPresentation}
                      setCustomPrompt={this.setCustomPrompt}
                      listening={listening}
                      startPresentationButtonLoading={this.state.startPresentationButtonLoading}
                      presentationStart={presentationStart}
                      isserviceselected={isserviceselected}
                      islanguageselected={islanguageselected}
                    />
                          </SpaceBetween>
                        }>
                        <HeaderWrapper />
                </Header>
              }
            >
              <Grid gridDefinition={[{ colspan: 7 }, { colspan: 5 }]}>
                <MainContent
                  bedrockTranscription={this.state.bedrockTranscription}
                  userTranscript={userTranscript}
                  isContextualFeedbackEnabled={isContextualFeedbackEnabled}
                  onToggleChange={this.handleToggleChange}
                  childRef={this.childRef}
                  genAIprompt={this.state.genAIprompt}
                  speakerFirst={speakerFirst}
                  selectedServiceOption={selectedServiceOption}
                  start={start}
                  selectedOption={this.state.selectedOption}
                  handleAudioEnd={this.handleAudioEnd}
                  onAudioStart={this.onAudioStart}
                  avatarEmotion={this.state.avatarEmotion}
                />
                <SpaceBetween size="m" direction="vertical">
                  <TranscriptionSection
                    userTranscriptHistory={userTranscriptHistory}
                    userTranscript={userTranscript}
                    listening={this.state.listening}
                    isAudio={isAudio}
                  />
                </SpaceBetween>
              </Grid>
            </Container>
            <PresentationMetrics metrics={{
              eyeMetric, colorEye, avgPace, colorAvgPace, words, colorPace,
              diffDisplay, colorQ, filler, colorFiller, weasel, colorWeasel,
              g1, colorBias
            }} />
          </ContentLayout>
        }
      />
    );
  }
}
