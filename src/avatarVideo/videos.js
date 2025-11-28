import { Box } from "@awsui/components-react";
import React, { useEffect, useRef, useState } from 'react';

// List of configured avatars with video files
// Add your avatar alias here when you set up videos
const configuredAvatars = [
  // Add your avatar aliases here as you configure them
  // Example: 'myavatar', 'customavatar1', etc.
];

// Helper function to check if avatar has videos configured
// Returns true only if the alias has video files properly set up
export const hasAvatarVideos = (alias) => {
  return configuredAvatars.includes(alias);
};

// Export function to get configured avatars list
hasAvatarVideos.getConfiguredAvatars = () => configuredAvatars;

const AvatarTemp = ({ alias, avatarEmotion }) => {
  const videoRef = useRef(null);
  const [hasVideo, setHasVideo] = useState(false);

  useEffect(() => {
    // Check if videos exist for this alias
    const videosAvailable = hasAvatarVideos(alias);
    setHasVideo(videosAvailable);
    
    if (videosAvailable && videoRef.current) {
      // Custom video logic can be added here
      // See README.md for instructions on adding custom avatar videos
      // Example:
      // const videoSource = getVideoForEmotion(alias, avatarEmotion);
      // if (videoSource) {
      //   videoRef.current.src = videoSource;
      // }
    }
  }, [avatarEmotion, alias]);

  // Return null if no videos available - triggers fallback to text snippets
  if (!hasVideo) {
    return null;
  }

  return (
    <Box css={{width: "800px"}}>
        <video width="350px" autoPlay loop muted ref={videoRef}>
        <source src="" type="video/mp4" />
        </video>
    </Box>
  );
};

export default AvatarTemp;