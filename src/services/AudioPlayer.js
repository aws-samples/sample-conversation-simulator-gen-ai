import React, { useEffect, useRef, } from 'react';

const AudioPlayer = ({ audioBuffer, onAudioEnd, onAudioStart }) => {
  const audioContextRef = useRef(null);
  const sourceRef = useRef(null);
  const isStartedRef = useRef(false);

  useEffect(() => {
    // Exit early if audioBuffer is not available or is detached
    if (!audioBuffer || audioBuffer.byteLength === 0) {
      return;
    }

    let audioContext;
    let source;

    try {
      // Create a new AudioContext
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;

      // Create a buffer source
      source = audioContext.createBufferSource();
      sourceRef.current = source;

      // Decode the audio buffer
      audioContext.decodeAudioData(audioBuffer.slice(), (buffer) => {
        if (source && audioContext && audioContext.state !== 'closed') {
          source.buffer = buffer;
          source.connect(audioContext.destination);

          onAudioStart();
          source.start();
          isStartedRef.current = true;

          source.onended = () => {
            console.log('The audio has finished playing.');
            isStartedRef.current = false;
            onAudioEnd();
          };
        }
      }, (error) => {
        console.error('Error decoding audio data:', error);
      });
    } catch (error) {
      console.error('Error creating audio context or source:', error);
    }

    return () => {
      // Cleanup resources if needed
      try {
        if (sourceRef.current && isStartedRef.current) {
          sourceRef.current.stop();
          sourceRef.current.disconnect();
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close();
        }
      } catch (error) {
        console.error('Error during audio cleanup:', error);
      }
      isStartedRef.current = false;
    };
}, [audioBuffer, onAudioEnd, onAudioStart]);


  return (
    <div>
    </div>
  );
};

export default AudioPlayer;
