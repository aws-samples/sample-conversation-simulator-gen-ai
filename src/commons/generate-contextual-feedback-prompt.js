export function generateContextualFeedbackMetricsPrompt(role = "Sales Person", options) {
    const { messages, prompt, transcript } = options;

    // Define the dimensions and rules with escaped \n
    const dimensions = `
        - Conversational Ability: Ability to engage in natural, contextual conversations, understanding responses and providing appropriate follow-up. 
        - Contextual Awareness: Ability to adapt its responses based on the sales scenario, customer persona, and other relevant information. 
        - Active Listening: Ability to demonstrate active listening skills, such as paraphrasing, asking clarifying questions, and acknowledging the customer. 
        - Product Knowledge: Ability to effectively convey the features, benefits, and differentiators of the company's products and services. 
        - Objection Handling: Ability to address customer concerns, overcome objections, and provide satisfactory responses.
    `;

    const rules = `
       - Summarized feedback must be concise
       - Summarized feedback must be actionable
       - Summarized feedback must be constructive
       - Quantitative metrics for all dimensions must be provided
       - Quantitative metrics for all dimensions must be justified with a concise justification
       - Do not make anything up
       - Only use information in <context>
       - Format the feedback into sections, first section displays dimension related scores and justifications as bullet points, then provide summarized constructive feedback as paragraph, then provide actionable items as bullet points
       - Format the feedback where each section is seperated with spaces and linebreaks
    `;

    // Generate the evaluation string with escaped \n
    const evaluationString = `
        \\n\\nHuman: Evaluate the conversation and provide metric quantitatively, out of 10 points, on ${role}’s performance across following dimensions and provide overall summarized feedback constructively, concisely and also provide actionable items by co-relative the dimensions that needs improvements. :
        
        <rubric>
            Dimensions are: 
                ${dimensions}
        </rubric>
        
        <context> 
            ${messages}Human: ${prompt} ${transcript}
        </context>
        
        Here are some important rules for providing feedback:
            ${rules}
        
        \\n\\nAssistant: `;

    return evaluationString
}