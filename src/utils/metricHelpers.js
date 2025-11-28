import { getMetricColor, shouldAlert } from './metricUtils';

// Metric helper functions for class components
export const createMetricHelpers = (setState) => ({
  updatePaceMetric: (count) => {
    setState(prevState => ({
      words: count + " WPM",
      colorPace: getMetricColor(count, 'pace')
    }));
    return shouldAlert(count, 'pace');
  },

  updateAvgPaceMetric: (countAvg, presentationTime) => {
    const avgPaceSet = presentationTime !== 0 ? Math.floor((countAvg / presentationTime) * 60) : 0;
    setState(prevState => ({
      avgPace: avgPaceSet + " WPM",
      colorAvgPace: getMetricColor(avgPaceSet, 'avgPace')
    }));
    return shouldAlert(avgPaceSet, 'avgPace');
  },

  updateFillerMetric: (count) => {
    setState(prevState => ({
      filler: count,
      colorFiller: getMetricColor(count, 'words')
    }));
    return shouldAlert(count, 'words');
  },

  updateWeaselMetric: (count) => {
    setState(prevState => ({
      weasel: count,
      colorWeasel: getMetricColor(count, 'words')
    }));
    return shouldAlert(count, 'words');
  },

  updateBiasMetric: (count) => {
    setState(prevState => ({
      g1: count,
      colorBias: getMetricColor(count, 'words')
    }));
    return shouldAlert(count, 'words');
  },

  updateEyeMetric: (eyeDetection) => {
    setState(prevState => ({
      eyeMetric: eyeDetection + "%",
      colorEye: getMetricColor(eyeDetection, 'eye')
    }));
    return shouldAlert(eyeDetection, 'eye');
  },

  updateEngagementMetric: (diff) => {
    setState(prevState => ({
      colorQ: getMetricColor(diff, 'engagement')
    }));
    return shouldAlert(diff, 'engagement');
  }
});