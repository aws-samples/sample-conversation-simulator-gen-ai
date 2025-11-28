
// --------------------------   ANTHROPIC MODEL --------------------------

import { BedrockRuntimeClient, InvokeModelWithResponseStreamCommand } from "@aws-sdk/client-bedrock-runtime";
import { fetchAuthSession } from 'aws-amplify/auth';
import { generateContextualFeedbackMetricsPrompt } from "../commons/generate-contextual-feedback-prompt";

// HTML escape function to prevent XSS attacks
const escapeHtml = (unsafe) => {
  if (typeof unsafe !== 'string') return unsafe;
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

/**
 * Invokes the Bedrock model with the given options.
 * @param {Object} options - The options for invoking the Bedrock model.
 * @returns {Promise<string>} - A Promise that resolves to the model's response.
 */
const invokeBedrockModel = async (options = {}) => {
  var maxTokens = 150
  const {
    prompt = options.prompt,
    label = options.label,
    transcript = "",
    temperature = 0.4,
    topK = 75,
    topP = 0.9,
    stopSequences = ["\n\nHuman:"],
    contentType = 'application/json',
    accept = '*/*',
    systemPrompt
  } = options;
  const messages = options.newMessages;
  var modelId = 'anthropic.claude-3-sonnet-20240229-v1:0'
  //anthropic.claude-3-5-sonnet-20240620-v1:0 Can't stream yet
  //anthropic.claude-3-sonnet-20240229-v1:0 


  //- Format your reasons for the score as a pros and cons list
  //- Be polite
  // Only return the performance results on answering the given questions -
  let formattedPrompt = ``

  if (options.isEndPresentation == true) {
    maxTokens = 800
    if (options.isContextualFeedbackMetricsEnabled) {
      formattedPrompt = generateContextualFeedbackMetricsPrompt("Sales Person", options);
    } else if(label === "Perfect Pitch Gen AI"){
    modelId = 'anthropic.claude-v2:1'
    formattedPrompt = `\n\nHuman: Based upon the context given your job is to score the salesperson's response on the questions they were given with a number score. 
      USE THIS RUBRIC TO GRADE THE USER:
      Discovery and Understanding of Customer Challenge or Opportunity
      - Clearly understands the customer problem statement/opportunity, is able to articulate it and how it impacts the customers’ business (e.g. use of value maps, working backwards framework)
      - Includes the problem statement/market opportunity for the customer
      - Conducted customer-relevant discovery, including past AI-related engagements and opportunities. Data effectively aligned with the customer challenge/ opportunity
      Setting the Scene and Conversation
      - Tailored the conversation/objectives to where the customer is on their generative AI journey and what challenges they are currently facing/opportunities to explore (e.g. exploring, POC ready, in production)
      Messaging and Customer Story/Use Case
      - Used AWS terminology, approved core messaging that best aligned with the customer's mission objective and challenges/market opportunity
      - Worked backwards from the customer to understand their requirements or possibilities with Generative AI
      - Used an impactful and customer-relevant use case by working backwards from customer business drivers that communicated AWS generative AI value propositions and core messaging in their executive point of view. Highlighted reasons for “why now” for Generative AI
      Understanding of AWS Generative AI Services/Benefits
      - Accurately described AWS differentiators as they exist at time of training within the Generative AI competitive landscape
      - Focused on solving customer challenges/opportunity exploration vs. AWS products
      - Didn’t use service name unless customer used it first
      - Strong understanding of key AWS products and services (SageMaker Jumpstart, CodeWhisperer, Bedrock, AWS Inferentia2 and Trainium) and able to speak to them at different levels
      Objection Handling
      - Restated questions and handled objections using clear and humble language/admits what is unknown and find the answer after
      - Understood the ‘why’ behind the question and stayed focused on the customer’s business drivers
      - Actively highlighted potential business value and outcomes, and differentiated AWS solutions without disparaging competitors or other points of view.
      Storytelling and Presentation Skills
      - Presented using their voice versus sounding scripted, kept a strong and engaging pace and tone, minimized filler words.
      - Built a strong rapport with the customer.
      - Identified customer has worked with AWS on past Generative AI related opportunities/engagements and built on the storyline
      - Confirmed any prior engagements with accelerator/incubator or assistance path teams e.g. Envision Engineering
      - Inclusion of the matrix and demonstration of the customer engagement model framework especially for the early stages of the selling cycle where appropriate
      Time Management
      - Used time to learn more about the customer challenge uncovered challenges such as lack ofexperience, skills, or bandwidth with the customer; technical limitations or priorities, including database and infrastructure; timeline expectations from company leaders, board, etc
      Next Steps
      - Asked for customer commitment to agree on next steps and effectively recapped deliverables
      - At end of call, circled back to desired outcome using customer’s language and recapped how AWS can help
      - If customer has already formed a POv on generative AI and is ready to explore use cases, secured a follow-up with an SA for L200 conversations
      - If customer is far along the path to pilots or production workloads, secured a call supported by an SA for L300 conversations
      

      context
      ${escapeHtml(messages)}Human:  ${escapeHtml(prompt)} ${escapeHtml(options.transcript)}
      /context

      Here are some important rules for the interaction:
      - ORGANIZE THE FEEDBACK USING THE RUBRIC 
      - Rank the performance on each rubric category from 1-10 BE HARSH ON GRADES
      - Only use information the information in context
      - Do not make anything up
      - Start your response with: FEEDBACK!:
      

      \n\nAssistant: 
      `
    }
      else if (label === "Call Center Customer"){
      //Customer Call Scenario
      formattedPrompt = `\n\nHuman: Based upon the context given your job is to score the customer service response on the questions they were given with a number score. 
      USE THIS RUBRIC TO GRADE THE USER:
      Greeting the Customer:
      0 - Does not introduce self to customer	
      5 - Introduces self, by stating their name	
      10 - Introduces self, by stating their name, and asks how the customer is doing today

      Understanding the problem:
      0 - Does not ask what the problem is	
      5 - Asks what the problem is	
      10 - Ask what the problem is, and asks when the problem started

      Troubleshooting:
      0 - Does not attempt to troubleshoot the problem	
      5 - Asks the customer to connect the laptop's power supply to the wall	
      10 - Asks the customer to connect the laptop's power supply to a new wall outlet

      Understands the return policy:
      0 - Does not know the return policy	
      5 - Tells the customer the return policy on laptops is 30 days	
      10 - Tells customer the return policy on laptops is a no questions asked for 30 days

      Close out the call:
      0 - Ends the call by saying “good-bye"	
      5 - Ends the call by saying "Have a great day"	
      10 - Ends the call by saying "thank you for shopping at Amazon.com and have a great day"

      context
      ${escapeHtml(messages)}Human:  ${escapeHtml(prompt)} ${escapeHtml(options.transcript)}
      /context

      Here are some important rules for the interaction:
      - ORGANIZE THE FEEDBACK USING THE RUBRIC 
      - START THE FEEDBACK FOR EACH QUESTION WITH restating the question
      - Add the string "linebreak" directly after each question's feedback
      - Rank the performance on each rubric category from 1-10 BE HARSH ON GRADES
      - Only use information the information in context
      - Do not make anything up
      - Start your response with: FEEDBACK!:
      

      \n\nAssistant:`
      }
      else if (label === "RISE with SAP"){
        formattedPrompt = `\n\nHuman: Based upon the context given your job is to score the customer service response on the questions they were given with a number score. 
        USE THIS RUBRIC TO GRADE THE USER:
        rubric
        Discovery and Understanding of Customer Challenge or Opportunity
        - Clearly understands the customer problem statement/opportunity, is able to articulate it and how it impacts the customers’ business (e.g. use of value maps, working backwards framework)
        - Includes the problem statement/market opportunity for the customer
        - Conducted customer-relevant discovery, including past SAP-related engagements and opportunities. Data effectively aligned with the customer challenge/ opportunity
        Messaging and Customer Story/Use Case
        - Used AWS terminolog and approved core messaging that best aligned with the customer's mission objective and challenges/market opportunity
        - Worked backwards from the customer to understand their worries about using RISE with SAP
        - Used an impactful and customer-relevant use case by working backwards from customer business drivers for moving to cloud services for SAP ERP
        Understanding of AWS SAP Services/Benefits
        - Accurately described AWS differentiators as they exist at the time of training with SAP ERP 
        - Focused on solving customer challenges/opportunity exploration vs. AWS products
        - Didn’t use service name unless customer used it first
        Objection Handling
        - Restated questions and handled objections using clear and humble language/admits what is unknown and find the answer after
        - Understood the ‘why’ behind the question and stayed focused on the customer’s business drivers
        - Actively highlighted potential business value and outcomes, and differentiated AWS solutions without disparaging competitors or other points of view.
        Storytelling and Presentation Skills
        - Presented using their voice versus sounding scripted, kept a strong and engaging pace and tone, minimized filler words.
        - Built a strong rapport with the customer.
        - Identified whether the customer has worked with AWS on related past opportunities/engagements and built on the storyline
        - Confirmed any prior engagements with accelerator/incubator or assistance path teams e.g. Envision Engineering
        - Inclusion of the matrix and demonstration of the customer engagement model framework especially for the early stages of the selling cycle where appropriate
        Time Management
        - Used time to learn more about the customer challenge uncovered challenges such as lack ofexperience, skills, or bandwidth with the customer; technical limitations or priorities, including database and infrastructure; timeline expectations from company leaders, board, etc
        Next Steps
        - Asked for customer commitment to agree on next steps and effectively recapped deliverables
        - At end of call, circled back to desired outcome using customer’s language and recapped how AWS can help
        - If customer has already formed a POV on RISE for SAP and is ready to explore use cases, secured a follow-up with an SA for L200 conversations
        - If customer is far along the path to pilots or production workloads, secured a call supported by an SA for L300 conversations
      
        /rubric
    
        context
        ${escapeHtml(messages)}Human:  ${escapeHtml(prompt)} ${escapeHtml(options.transcript)}
        /context
    
        Here are some important rules for the interaction:
        - ORGANIZE THE FEEDBACK USING THE RUBRIC 
        - START THE FEEDBACK FOR EACH QUESTION WITH restating the question
        - Add the string "linebreak" directly after each question's feedback
        - Rank the performance on each rubric category from 1-10 BE HARSH ON GRADES
        - Only use information the information in context
        - Do not make anything up
        - Start your response with: FEEDBACK!:
        
    
        \n\nAssistant:`
      }
      ;
  }
  else {
    if (transcript === "") { //if we are grading
      formattedPrompt = `conversation_history ${escapeHtml(messages)} /conversation_history \n\nHuman:  ${escapeHtml(prompt)}. \n\nAssistant:`;
    }
    else { //if we are asking a question
      formattedPrompt = `\n\nHuman: ${escapeHtml(prompt)}\n conversation_history ${escapeHtml(messages)} /conversation_history \n\nAssistant:`;
      console.log("formattedPrompt: ", formattedPrompt)
    }
  }

  try {
    // Get AWS credentials using Amplify Auth.
    const credentials = (await fetchAuthSession()).credentials ?? {};

    // Create an instance of the BedrockRuntimeClient.
    const bedrockruntime = new BedrockRuntimeClient({
      region: 'us-east-1',
      apiVersion: '2023-09-30',
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
        sessionToken: credentials.sessionToken
      }
    });

    // Build the request body.
    const inf_params = {"maxTokens": maxTokens, "topP": topP, "topK": topK, "temperature": temperature}
/*
    const requestBody = {
      "schemaVersion": "messages-v1",
      "messages": [{
        role: "user",
        content: [{text: formattedPrompt }],
      }],
      "system": systemPrompt,
      "inferenceConfig": inf_params,
  }
  */

    const requestBody = {
      //prompt: formattedPrompt,
      //_to_sample
      temperature,
      top_k: topK,
      top_p: topP,
      stop_sequences: stopSequences,
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: [{ type: "text", text: formattedPrompt }],
        },
      ],
    };

    // Set the parameters for the Bedrock model request.
    const params = {
      body: Buffer.from(JSON.stringify(requestBody)),
      modelId,
    };

    // log request
    console.log('(Request) to Bedrock Model: ', requestBody)

    // Use InvokeModelCommand for both streaming and non-st reaming requests.
    const command = new InvokeModelWithResponseStreamCommand(params);
    const res = await bedrockruntime.send(command)

    return res//chunks.join('')//JSON.parse(completion).completions[0].data.text;

}  catch (error) {        
  console.error('Error invoking Bedrock model:', error);
  throw error;
}


}

export default invokeBedrockModel;

