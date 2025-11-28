// copied from https://github.com/aws-samples/medical-transcription-analysis/
// and modified to current application.
import { countWords } from '../metrics/Pace';
import { getTime, getLanguage } from '../pages/Home';
import { findFiller } from '../metrics/Filler';
import { findWeasel } from '../metrics/Weasel';
import { findBiasEmotionSpecificity } from '../metrics/Bias_Emotion_Specificity';
import crypto from 'crypto-browserify'
import getPredefinedWords from "../services/getPredefinedWords"; // utilities for encoding and decoding UTF8
import MicrophoneStream from "microphone-stream"; 
const audioUtils = require('./audioUtils');  // for encoding audio data as PCM
// tot sign our pre-signed URL
const v4 = require('./aws-signature-v4'); // to generate our pre-signed URL
const marshaller = require("@aws-sdk/eventstream-marshaller"); // for converting binary event stream messages to and from JSON
const util_utf8_node = require("@aws-sdk/util-utf8-node"); // collect microphone input as a stream of raw bytes


// This is the converter between binary event streams messages and JSON - creating an instance of EventStreamMarshaller that will be used to marshal and unmarshal data in the event stream format, using the provided functions for encoding and decoding data to and from UTF-8
// Constants
const eventStreamMarshaller = new marshaller.EventStreamMarshaller(util_utf8_node.toUtf8, util_utf8_node.fromUtf8);
const region = "us-east-1";
const sampleRate = 48000;

// Global variables
let languageCode, languageChosen;
let socket;
let micStream;
let inputSampleRate;
let socketError = false;
let transcribeException = false;
let firstConnect = true;

/**
 * This is the function that starts recording the user audio stream and sends the audio data to Amazon Transcribe.
 * @param {*} toggleStartStop: the function to change `listening` to decide if "End presentation" or "Start presentation" will be displayed
 * @param {*} getTranscript: the function to get the transcript from Amazon Transcribe
 * @param {*} clientCredentials: credentials
 * @param {*} setWordCount: the function to set word count for pace per minute 
 * @param {*} setMinute 
 * @param {*} setAvg: the function to set average pace WPM
 * @param {*} setFiller: the function to count total filler words
 * @param {*} setWeasel: the function to count total weasel words
 * @param {*} setBiasEmotionSpec: the function to count total bias/emotion/specificity words
 * @param {*} resetTalkCount: the function to reset the response time so that the bedrock will be invoked when the response time is more than x seconds 
 */
export const startAudio = async (toggleStartStop, getTranscript, clientCredentials, setWordCount, setMinute, setAvg, setFiller, setWeasel, setBiasEmotionSpec, resetTalkCount) => {
    window.navigator.mediaDevices.getUserMedia({
        video: false,
        audio: true
    })
        .then((medStream) =>
            streamAudioToWebSocket(medStream, toggleStartStop, getTranscript, clientCredentials, setWordCount, setMinute, setAvg, setFiller, setWeasel, setBiasEmotionSpec, resetTalkCount))
        .catch(function (error) {
            console.log('There was an error streaming your audio to Amazon Transcribe. Please try again.');
            console.log(error)
            toggleStartStop();
        });
    toggleStartStop();
}


/**
 * This is the function that streaming audio data from the user's microphone to a web socket server
 * @param {*} userMediaStream: the audio stream from the user's microphone
 */
function streamAudioToWebSocket(userMediaStream, toggleStartStop, getTranscript, clientCredentials, setWordCount, setMinute, setAvg, setFiller, setWeasel, setBiasEmotionSpec, resetTalkCount) {
    //let's get the mic input from the browser, via the microphone-stream module
    micStream = new MicrophoneStream();
    // event listener to get audio stream sample rate
    micStream.on("format", function (data) {
        inputSampleRate = data.sampleRate;
    });
    micStream.setStream(userMediaStream);

    let url = createPresignedUrl(clientCredentials);
    //open up our WebSocket connection
    console.log("open up the WebSocket connection")

    // Chrome will try to connect to the same socket connection if the previous is not closed
    if (firstConnect) {
        socket = new WebSocket(url);
      } else {
        if (socket.readyState !== socket.OPEN) {
            socket.close();
            socket = new WebSocket(url);
        }
      }
    socket.binaryType = "arraybuffer";

    // once we open the socket, add the event listener for audio streaming sending to web socket
    socket.onopen = function () {
        firstConnect = false;
        // add the event listener to receive available audio chunk and send to web socket
        micStream.on('data', function (rawAudioChunk) {
            // the audio stream is raw audio bytes. Transcribe expects PCM with additional metadata, encoded as binary
            let binary = convertAudioToBinaryMessage(rawAudioChunk);
            if (socket.readyState === socket.OPEN) socket.send(binary);
          });
        
    };
    // handle messages, errors, and close events
    wireSocketEvents(toggleStartStop, getTranscript, setWordCount, setMinute, setAvg, setFiller, setWeasel, setBiasEmotionSpec, resetTalkCount);
}

/**
 * This is the function that handles the socket message, error, and close events
 */
function wireSocketEvents(toggleStartStop, getTranscript, setWordCount, setMinute, setAvg, setFiller, setWeasel, setBiasEmotionSpec, resetTalkCount) {
    // handle inbound messages from Amazon Transcribe
    socket.onmessage = function (message) {
        //convert the binary event stream message to JSON
        let messageWrapper = eventStreamMarshaller.unmarshall(Buffer(message.data));
        let messageBody = JSON.parse(String.fromCharCode.apply(String, messageWrapper.body));
        if (messageWrapper.headers[":message-type"].value === "event") {
            handleEventStreamMessage(messageBody, getTranscript, setWordCount, setMinute, setAvg, setFiller, setWeasel, setBiasEmotionSpec, resetTalkCount);
        }
        else {
            transcribeException = true;
            showError(messageBody.Message);
            toggleStartStop();
        }
    };
    socket.onerror = function () {
        socketError = true;
        showError('WebSocket connection error. Try again.');
        toggleStartStop();
    };

    socket.onclose = function (closeEvent) {
        console.log("WebSocket closed")
        micStream.stop();

        // the close event immediately follows the error event; only handle one.
        if (!socketError && !transcribeException) {
            if (closeEvent.code !== 1000) {
                showError('</i><strong>Streaming Exception</strong><br>' + closeEvent.reason);
            }
            toggleStartStop();
        }
    };
}
let handleEventStreamMessage = function (messageJson, getTranscript, setWordCount, setMinute, setAvg, setFiller, setWeasel, setBiasEmotionSpec, resetTalkCount) {
    let results = messageJson.Transcript.Results;
    if (results.length > 0) {
        resetTalkCount()
        if (results[0].Alternatives.length > 0) {
            let transcript = results[0].Alternatives[0].Transcript;
            // fix encoding for accented characters
            transcript = decodeURIComponent(escape(transcript));

            // update the textarea with the latest result
            getTranscript(transcript, false);
            let transcription = ""
            // if this transcript segment is final, add it to the overall transcription
            if (!results[0].IsPartial) {
                //scroll the textarea down
                var objDiv = document.getElementById("transcript");
                objDiv.scrollTop = objDiv.scrollHeight
                transcription += transcript + "\n";
                getTranscript(transcript, true); //this portion will take the outputted sentence and find word count
                var str = transcript
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
}

 

function convertAudioToBinaryMessage(audioChunk) {
    let raw = MicrophoneStream.toRaw(audioChunk);
    console.log("what is audio.chunk", audioChunk.length)
    if (raw == null) return;
    // downsample and convert the raw audio bytes to PCM
    let downsampledBuffer = raw
    // if the audio chunk sample rate is larger than the expected sample rate, down sample them
    if(audioChunk.length >= sampleRate){
        downsampledBuffer = audioUtils.downsampleBuffer(raw, audioChunk.length, sampleRate);
    }
    let pcmEncodedBuffer = audioUtils.pcmEncode(downsampledBuffer);
    // add the right JSON headers and structure to the message
    let audioEventMessage = getAudioEventMessage(Buffer.from(pcmEncodedBuffer));
    //convert the JSON object + headers into a binary event stream message
    let binary = eventStreamMarshaller.marshall(audioEventMessage);
    return binary;
}
function getAudioEventMessage(buffer) {
    // wrap the audio data in a JSON envelope
    return {
        headers: {
            ':message-type': {
                type: 'string',
                value: 'event'
            },
            ':event-type': {
                type: 'string',
                value: 'AudioEvent'
            }
        },
        body: buffer
    };
}

function createPresignedUrl(clientCredentials) {
    let endpoint = "transcribestreaming." + region + ".amazonaws.com:8443";
    // get a preauthenticated URL that we can use to establish our WebSocket
    languageChosen = getLanguage()

    if (languageChosen === "English") {
        languageCode = "en-US"
    } else if (languageChosen === "French") {
        languageCode = "fr-FR";
    } else if (languageChosen === "French-Canadian") {
        languageCode = "fr-CA";
    } else if (languageChosen === "Spanish") {
        languageCode = "es-US";
    } else if (languageChosen === "Portugese") {
        languageCode = "pt-BR";
    } else if (languageChosen === "Japanese") {
        languageCode = "ja-JP";
    } else if (languageChosen === "Italian") {
        languageCode = "it-IT";
    } else if (languageChosen === "German") {
        languageCode = "de-DE";
    } else if (languageChosen === "Chinese-Mandarin") {
        languageCode = "zh-CN";
    }

    return v4.createPresignedURL(
        'GET',
        endpoint,
        '/stream-transcription-websocket',
        'transcribe',
        crypto.createHash('sha256').update('', 'utf8').digest('hex'), {
        'key': clientCredentials.accessKeyId,
        'secret': clientCredentials.secretAccessKey,
        'sessionToken': clientCredentials.sessionToken,
        'protocol': 'wss',
        'expires': 15,
        'region': region,
        'query': "language-code=" + languageCode + "&media-encoding=pcm&sample-rate=" + sampleRate
    }
    );
}
function showError(message) {
    console.error(message);
}
let closeSocket = function () {
    if (socket.readyState === socket.OPEN) {
        micStream.stop();
        // Send an empty frame so that Transcribe initiates a closure of the WebSocket after submitting all transcripts
        let emptyMessage = getAudioEventMessage(Buffer.from(new Buffer([])));
        let emptyBuffer = eventStreamMarshaller.marshall(emptyMessage);
        socket.send(emptyBuffer);
    }
}
export function stopAudio() {
    closeSocket();
}