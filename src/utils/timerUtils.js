// Convert seconds to HH:MM:SS format
export const secondsToHms = (d) => {
  d = Number(d);
  var h = Math.floor(d / 3600);
  var m = Math.floor((d - h * 3600) / 60);
  var s = Math.floor(d - h * 3600 - m * 60);
  if (h < 10) {
    h = "0" + h;
  }
  if (m < 10) {
    m = "0" + m;
  }
  if (s < 10) {
    s = "0" + s;
  }
  return h + ":" + m + ":" + s;
};

// Convert seconds to "MM:SSs ago" format for engagement metric
export const timeToLastQConvert = (d) => {
  d = Number(d);
  var h = Math.floor(d / 3600);
  var m = Math.floor((d % 3600) / 60);
  var s = Math.floor((d % 3600) % 60);
  var mDisplay = m > 9 ? m : "0" + m + ":";
  var sDisplay = s > 9 ? s : "0" + s;
  return mDisplay + sDisplay + "s ago";
};