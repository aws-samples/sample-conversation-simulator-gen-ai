import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { useTranslation } from 'react-i18next';
import invokeBedrockModel from '../services/bedrockService'; // Update the import path
import { Message, Button } from "semantic-ui-react";
import AWS from 'aws-sdk';
import { fetchAuthSession } from 'aws-amplify/auth';
import AudioPlayer from '../services/AudioPlayer'
import Markdown from 'markdown-to-jsx';
import {Header} from "@awsui/components-react";



const QuestionGeneration = forwardRef(({ prompt, transcript, label, isEndPresentation, sentiment, handleAudioEnd, onAudioStart, isContextualFeedbackMetricsEnabled, speakerFirst}, ref) => {
  const { t } = useTranslation();
  //const [response, setResponse] = useState(null);
  const [chunks, setChunks] = useState([])
  const [messages, setMessages] = useState("")
  const [output, setOutput] = useState("")
  //const [sentiment, setSentiment] = useState("ANGRY")
  const [emotion, setEmotion] = useState("No Sentiment")
  const [audioUrl, setAudioUrl] = useState('');

  useImperativeHandle(ref, () => {
    return {
      runBedrock: runBedrockModel,
    };
  })

  const runBedrockModel = async () => {
    
    try {
      /*
      if(emotion != "No Sentiment")
        prompt += "ONE EXTRA RULE: CLAUDE IS" + sentiment
      */
      onAudioStart()
      var responseData = {
        body: ""
      }
      
      //This was causing doubling up on messaging for some prompts
      const newMessages = messages + `\n\nHuman: ${transcript}`
      //If human speaks first and theres no transcript wait for user
      if(speakerFirst == false || transcript != "" || messages != ""){
        console.log("triggering bedrock")
        responseData = await invokeBedrockModel({ newMessages, prompt, label, transcript, isEndPresentation, isContextualFeedbackMetricsEnabled })
      }

      if (isEndPresentation) {
        
        const blob = new Blob([output], { type: 'text/plain' });

        // Create a link element
        const link = document.createElement('a');

        // Set the download attribute with a filename
        link.download = 'output.txt';

        // Create a URL for the Blob and set it as the href attribute
        link.href = URL.createObjectURL(blob);

        // Append the link to the body (required for Firefox)
        document.body.appendChild(link);

        // Programmatically click the link to trigger the download
        link.click();

        // Remove the link from the document
        document.body.removeChild(link);
         
        setMessages("")
        setOutput("")
      }

      const chunks = [];

      for await (const event of responseData.body) {
          
          const chunk = JSON.parse(new TextDecoder().decode(event.chunk.bytes));
          const chunk_type = chunk.type;
      
          if (chunk_type === "content_block_delta") {
            const text = chunk.delta.text;
            chunks.push(text)
            setChunks(chunks)
          }
      };
      // Extract completion response and log it.
      const completion = chunks.join('');

      // if there is output XML tag in the completion, extract the actual response
      // Regular expression to match the content between <output> and </output> tags
      const outputRegex = /<output>(.*?)<\/output>/s;
      let actualResponse = completion;
      // Test if the completion string contains the output XML tag
      if (outputRegex.test(completion)) {
        // Extract the actual response using match() and capturing group
        actualResponse = completion.match(outputRegex)[1];
        console.log("Actual Response:", actualResponse);
      } else {
        console.log("No output XML tag found in the completion string.");
      }

      setOutput(messages + `\nHuman: ${transcript} \nAssistant: ${actualResponse} `)
      setMessages(messages + `\n\nHuman: ${transcript} \n\nAI Assistant: ${actualResponse}`)

      synthesizeSpeech(actualResponse)
    } catch (error) {
      console.error('Error running Bedrock model:', error);
    }

   
  };




  const synthesizeSpeech = async (responseData) => {  
    const credentials = (await fetchAuthSession()).credentials ?? {}

    AWS.config.update({
      region: 'us-east-1',
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken
    });
    const polly = new AWS.Polly();

    const params = {
      OutputFormat: 'mp3',
      Text: responseData,
      VoiceId: 'Ruth', // VoiceId of the voice you want to use
      Engine: 'generative'
    };

    try {
      const data = await polly.synthesizeSpeech(params).promise();
      setAudioUrl(data.AudioStream.buffer)
    } catch (err) {
      console.error('Error synthesizing speech:', err);
    }
  };

  const getResponse = () => {
      runBedrockModel()
  }

  return (
    <div>
      <Header variant="h3">{t('presentation.content.customerResponse')}</Header>

      {chunks.join('') && (
        <div style={{ width: '650px', marginRight: "20px" }}>
          <Message style={{ width: '650px' }}>

            <p>
              {/*{chunks.join('')}*/}
              <Markdown>{chunks.join('')}</Markdown>
            </p>
            {!isEndPresentation ? <AudioPlayer audioBuffer={audioUrl} onAudioEnd={handleAudioEnd} onAudioStart={onAudioStart}/> : <div/>}
            <Button onClick={getResponse}>{t('presentation.actions.startResponse')}</Button>
          </Message>
        </div>
      )}
    </div>
  );
});

export default QuestionGeneration;