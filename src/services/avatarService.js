import invokeBedrockModel from './bedrockService';

// Generate avatar emotion based on transcript
export const generateAvatarEmotion = async (transcript) => {
  const avatarEmotionPrompt = `
    You are a customer for SFDC. An sales from AWS came to you with the pitch in <pitch>. You need to react based on the pitch. The allowed reactions you can have is in <allowed_reactions> XML tag. Remember you can only pick only one reaction in the output. 

    <pitch>
    ${transcript}
    </pitch>

    <allowed_reactions>
    - agreeNodding (agree with the pitch and encourage the sales to continue)
    - happy (geniuely happy about the pitch)
    - hello (saying hello)
    - idontknow (the customer doesn't understand the question and don't know the answer to the sales question)
    - nice (statisfied with the pitch and express many 
    - ohhh (slightly impressed and express certain interest on the pitch)
    - okkk (understand the pitch and have their own thoughts)
    - noddingLong (nodding and want to continue the conversation)(this is the default reaction)
    - eyebrowsFrowning (eyebrows frowning indicating the concern on the pitch and not sure about the pitch)
    </allowed_reactions>

    Output example: 
    <output>
    idontknow
    </output>`;

  try {
    const responseData = await invokeBedrockModel({ prompt: avatarEmotionPrompt });
    const chunks = [];
    for await (const event of responseData.body) {
      const chunk = JSON.parse(new TextDecoder().decode(event.chunk.bytes));
      const chunk_type = chunk.type;
      if (chunk_type === "content_block_delta") {
        const text = chunk.delta.text;
        chunks.push(text);
      }
    }
    return chunks.join("");
  } catch (error) {
    console.error('Error running Bedrock model:', error);
    return "normal";
  }
};