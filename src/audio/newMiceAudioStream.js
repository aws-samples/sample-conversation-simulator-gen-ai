// copied from https://github.com/aws-samples/medical-transcription-analysis/
// and modified to current application.
import { countWords } from '../metrics/Pace';
import { getTime, getLanguage } from '../pages/Home';
import { findFiller } from '../metrics/Filler';
import { findWeasel } from '../metrics/Weasel';
import { findBiasEmotionSpecificity } from '../metrics/Bias_Emotion_Specificity';
import getPredefinedWords from "../services/getPredefinedWords";
import {
  TranscribeStreamingClient,
  StartStreamTranscriptionCommand,
} from "@aws-sdk/client-transcribe-streaming";
import { pEventIterator } from 'p-event';
import * as audioUtils from './audioUtils';
let inputSampleRate;
let mediaRecorder;
const language = "en-US";
const SAMPLE_RATE = 48000;
let transcribeClient = undefined;
const region = "us-east-1";



const startStreaming = async (clientCredentials, toggleStartStop, language, getTranscript, setWordCount, setMinute, setAvg, setFiller, setWeasel, setBiasEmotionSpec, resetTalkCount) => {
  const audioContext = new window.AudioContext();
  let stream = await window.navigator.mediaDevices.getUserMedia({
    video: false,
    audio: true,
  })
  const source1 = audioContext.createMediaStreamSource(stream);
  const recordingprops = {
    numberOfChannels: 1,
    sampleRate: audioContext.sampleRate,
    maxFrameCount: audioContext.sampleRate * 1 / 10
  };

  try {
    await audioContext.audioWorklet.addModule('./worklets/recording-processor.js');
  } catch (error) {
    console.log(`Add module error ${error}`);
  }
  mediaRecorder = new AudioWorkletNode(
    audioContext,
    'recording-processor',
    {
      processorOptions: recordingprops,
    },
  );

  const destination = audioContext.createMediaStreamDestination();

  mediaRecorder.port.postMessage({
    message: 'UPDATE_RECORDING_STATE',
    setRecording: true,
  });

  source1.connect(mediaRecorder).connect(destination);
  mediaRecorder.port.onmessageerror = (error) => {
    console.log(`Error receving message from worklet ${error}`);
  };
  mediaRecorder.port.start();
  const audioDataIterator = pEventIterator(mediaRecorder.port, 'message');

  const getAudioStream = async function* () {
    for await (const chunk of audioDataIterator) {
      if (chunk.data.message === 'SHARE_RECORDING_BUFFER') {
        const abuffer = audioUtils.pcmEncode(chunk.data.buffer[0]);
        const audiodata = new Uint8Array(abuffer);
        yield {
          AudioEvent: {
            AudioChunk: audiodata,
          },
        };
      }
    }
  };
  transcribeClient = new TranscribeStreamingClient({
    region: region,
    credentials: {
      accessKeyId: clientCredentials.accessKeyId,
      secretAccessKey: clientCredentials.secretAccessKey,

      sessionToken: clientCredentials.sessionToken,
    },
  });

  const command = new StartStreamTranscriptionCommand({
    LanguageCode: language,
    MediaEncoding: "pcm",
    MediaSampleRateHertz: SAMPLE_RATE,
    AudioStream: getAudioStream(),
  });

  const data = await transcribeClient.send(command);
  for await (const event of data.TranscriptResultStream) {
    for (const result of event.TranscriptEvent.Transcript.Results || []) {
      resetTalkCount()
      if (result.IsPartial === false) {
        // Get the complete transcript text instead of individual items
        let transcript = result.Alternatives[0].Transcript;
        transcript = decodeURIComponent(escape(transcript));

        // update the textarea with the latest result
        getTranscript(transcript); //this portion will take the outputted sentence and find word count
        var x = getTime()
        var currentTime = x / 1000

        //pass transcript and current time to appropriate functions for computation
        const words = getPredefinedWords();
        countWords(setWordCount, transcript, currentTime, setMinute, setAvg)
        findFiller(transcript, words.filler, setFiller)
        findWeasel(transcript, words.weasel, setWeasel)
        findBiasEmotionSpecificity(transcript, words.specificity, words.bias, words.emotion, setBiasEmotionSpec)
      }
    }
  }
};

export const startAudio = async (toggleStartStop, getTranscript, clientCredentials, setWordCount, setMinute, setAvg, setFiller, setWeasel, setBiasEmotionSpec, resetTalkCount) => {

  if (mediaRecorder || transcribeClient) {
    stopStreaming();
  }
  toggleStartStop();
  await startStreaming(clientCredentials, toggleStartStop, language, getTranscript, setWordCount, setMinute, setAvg, setFiller, setWeasel, setBiasEmotionSpec, resetTalkCount);
};

// Using imported pcmEncode from audioUtils instead of local implementation

const stopStreaming = async () => {
  if (mediaRecorder) {
    mediaRecorder.port.postMessage({
      message: 'UPDATE_RECORDING_STATE',
      setRecording: false,
    });
    mediaRecorder.port.close();
    mediaRecorder.disconnect();
  } else {
    console.log('no media recorder available to stop');
  }

  if (transcribeClient) {
    transcribeClient.destroy();
  }
};

export const stopAudio = () => {
  console.log("Stop audio...");
  stopStreaming();
};

//pause
export const pauseRecording = function () {
  if (mediaRecorder.state === "recording") {
    mediaRecorder.pause();
    // recording paused
  }
};
export function pauseAudio() {
  console.log("Pause audio...");
  pauseRecording();
}

//resume 
export const resumeRecording = function () {
  if (mediaRecorder.state === "paused") {
    mediaRecorder.resume();
    // resume recording
  }
};
export function resumeAudio() {
  console.log("Resume audio...");
  resumeRecording();
}