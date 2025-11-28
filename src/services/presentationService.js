import { createPresentation } from "../graphql/mutations";
import { generateClient } from 'aws-amplify/api';

const client = generateClient();

// Save presentation data to DynamoDB
export const savePresentationData = async (presentationData, username, subId) => {
  const input = {
    EyeContact: presentationData.eyeMetric,
    SpeakingPaceRealTime: presentationData.avgPace,
    SpeakingPacePerMin: presentationData.words,
    Engagement: presentationData.displayTime,
    FillerWords: presentationData.filler,
    WeaselWords: presentationData.weasel,
    BiasEmotionSpecificWords: presentationData.g1,
    owner: username,
    PresentationTime: presentationData.presentationTime.toLocaleString(),
    sub: subId,
  };

  try {
    await client.graphql({
      query: createPresentation,
      variables: { input }
    });
  } catch (err) {
    console.log(err);
  }
};