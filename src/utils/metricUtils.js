// Color constants for metrics
const COLORS = {
  GREEN: "rgb(29,129,2)",
  ORANGE: "rgb(255,153,0)", 
  RED: "rgb(209,50,18)"
};

// Get color based on metric value and thresholds
export const getMetricColor = (value, type) => {
  switch (type) {
    case 'pace':
      return (value < 125 || value > 150) ? COLORS.RED : COLORS.GREEN;
    case 'avgPace':
      return (value < 125 || value > 150) ? COLORS.RED : COLORS.GREEN;
    case 'eye':
      if (value >= 60) return COLORS.GREEN;
      if (value >= 40) return COLORS.ORANGE;
      return COLORS.RED;
    case 'engagement':
      if (value <= 60) return COLORS.GREEN;
      if (value <= 120) return COLORS.ORANGE;
      return COLORS.RED;
    case 'words':
      if (value < 10) return COLORS.GREEN;
      if (value <= 20) return COLORS.ORANGE;
      return COLORS.RED;
    default:
      return COLORS.GREEN;
  }
};

// Check if metric should trigger alert
export const shouldAlert = (value, type) => {
  switch (type) {
    case 'pace':
      return value < 125 || value > 150;
    case 'avgPace':
      return value < 125 || value > 150;
    case 'eye':
      return value < 40;
    case 'engagement':
      return value > 120;
    case 'words':
      return value > 20;
    default:
      return false;
  }
};