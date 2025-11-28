import React from 'react';
import { useTranslation } from 'react-i18next';

// videos
import AvatarTemp, { hasAvatarVideos } from "../avatarVideo/videos.js";

import { SpaceBetween, Box } from "@awsui/components-react";

const AvatarDisplay = ({ avatarEmotion, selectedScenario }) => {
  const { t } = useTranslation();
  
  // Automatically get the first configured avatar, or use "default" if none configured
  const getConfiguredAlias = () => {
    const configuredAvatars = hasAvatarVideos.getConfiguredAvatars?.() || [];
    return configuredAvatars.length > 0 ? configuredAvatars[0] : "default";
  };
  
  const avatarAlias = getConfiguredAlias();
  
  // Check if current avatar has videos available
  const videosAvailable = hasAvatarVideos(avatarAlias)
  
  // Get scenario description based on selected scenario
  const getScenarioDescription = () => {
    if (!selectedScenario || !selectedScenario.label) {
      return "No scenario selected. Choose a scenario from the dropdown above to begin your conversation practice.";
    }
    
    const scenarioDescriptions = {
      "Perfect Pitch Gen AI": "Practice your perfect pitch with an Amazon Gen AI assistant. This scenario helps you refine your sales pitch, messaging, and value proposition delivery for Amazon's generative AI solutions in a conversational setting.",
      "Custom Scenario": "Create your own custom conversation scenario. Define the context, roles, and objectives to practice any specific situation you need.",
      "Call Center Customer": "Simulate a customer support interaction where you help resolve a customer's laptop issue. Practice troubleshooting, empathy, and problem-solving skills.",
      "LA DCFS": "Practice conversations related to LA Department of Children and Family Services scenarios.",
      "Single Line Security": "Practice security-related conversations and protocols.",
      "AWS Core Messaging": "Practice delivering AWS core messaging and value propositions to potential customers.",
      "RISE with SAP": "Practice SAP RISE solution conversations and demonstrations.",
      "AWS Intro Sales Call": "Practice introductory AWS sales calls with potential customers."
    };
    
    return scenarioDescriptions[selectedScenario.label] || `Practice conversations for the ${selectedScenario.label} scenario.`;
  }

  return (
    <SpaceBetween size="m" direction="vertical">
      {/* Avatar automatically uses the first configured avatar or shows fallback */}
      {videosAvailable ? (
        <AvatarTemp 
          avatarEmotion={avatarEmotion} 
          alias={avatarAlias}
        />
      ) : (
        /* Fallback to text snippets when no videos available */
        <SpaceBetween size="s" direction="vertical">
          <Box variant="awsui-key-label" padding="m">
            <h4>Current Scenario</h4>
            <p>
              {getScenarioDescription()}
            </p>
          </Box>
          
          <Box variant="awsui-key-label" padding="m">
            <h4>How to Set Up Custom Avatars</h4>
            <p>
              To add animated avatar reactions with video clips:
            </p>
            <ul style={{ marginLeft: '20px', marginTop: '10px', listStyleType: 'disc' }}>
              <li>Add avatar images to <code>src/img/</code></li>
              <li>Add video clips to <code>src/avatarVideo/[avatar-name]/</code></li>
              <li>Update the video mapping in <code>src/avatarVideo/videos.js</code></li>
              <li>See the "Custom Avatar Setup" section in README.md for detailed instructions</li>
            </ul>
          </Box>
        </SpaceBetween>
      )}
   
  </SpaceBetween>)
};

export default AvatarDisplay;