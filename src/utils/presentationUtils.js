export const secondsToHms = (d) => {
  d = Number(d);
  var h = Math.floor(d / 3600);
  var m = Math.floor((d - h * 3600) / 60);
  var s = Math.floor(d - h * 3600 - m * 60);
  if (h < 10) h = "0" + h;
  if (m < 10) m = "0" + m;
  if (s < 10) s = "0" + s;
  return h + ":" + m + ":" + s;
};

export const timeToLastQConvert = (d) => {
  d = Number(d);
  var h = Math.floor(d / 3600);
  var m = Math.floor((d % 3600) / 60);
  var s = Math.floor((d % 3600) % 60);
  var mDisplay = m > 9 ? m : "0" + m + ":";
  var sDisplay = s > 9 ? s : "0" + s;
  return mDisplay + sDisplay + "s ago";
};

export const getColorForMetric = (value, thresholds) => {
  const { good, warning, danger } = thresholds;
  if (value >= good.min && value <= good.max) return "rgb(29, 129, 2)";
  if (value >= warning.min && value <= warning.max) return "rgb(255, 153, 0)";
  return "rgb(209, 50, 18)";
};