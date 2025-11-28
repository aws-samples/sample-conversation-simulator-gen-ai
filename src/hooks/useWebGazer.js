import { useRef } from 'react';

const UPPER_CUTOFF = window.innerHeight / 8;
const LEFT_CUTOFF = window.innerWidth / 4;
const RIGHT_CUTOFF = window.innerWidth / 4;

export const useWebGazer = () => {
  const webgazerRef = useRef(null);
  const timerRef = useRef(null);
  const countdownRef = useRef(null);

  const startCamera = (onEyeMetricUpdate, presentationCount, setFlashbarItems) => {
    window.navigator.mediaDevices.getUserMedia({
      video: false,
      audio: true,
    });
    
    webgazerRef.current = window.webgazer;
    
    let prevflashbarItems = [];
    if (presentationCount <= 1) {
      prevflashbarItems.push({
        type: 'in-progress',
        dismissible: true,
        content: 'Starting eye detection model.',
        id: 'isloading-eye-detection',
      });
      setFlashbarItems(prevflashbarItems);
    }

    countdownRef.current = setInterval(() => {
      if (presentationCount <= 1) {
        prevflashbarItems = prevflashbarItems.filter(item => item.id !== 'isloading-eye-detection');
        setFlashbarItems(prevflashbarItems);
        clearInterval(countdownRef.current);
      }
    }, 6000);

    webgazerRef.current
      .setGazeListener((data, timestamp) => {
        if (data == null) return;
        
        if (data.y <= UPPER_CUTOFF && data.x >= LEFT_CUTOFF && data.y <= RIGHT_CUTOFF) {
          clearInterval(timerRef.current);
          timerRef.current = setInterval(() => {
            // Eye tracking logic handled in parent component
          }, 1000);
        }
      })
      .begin();

    webgazerRef.current.showPredictionPoints(false);
    webgazerRef.current.showFaceOverlay(false);
    webgazerRef.current.showVideo(false);
    webgazerRef.current.showFaceFeedbackBox(false);
  };

  const endCamera = () => {
    if (webgazerRef.current) {
      webgazerRef.current.end();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
  };

  return { startCamera, endCamera };
};