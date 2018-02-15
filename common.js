//https://jsfiddle.net/mplungjan/u8ar8en8/
function pad(str) {
    return ("0"+str).slice(-2);
}
function hhmmss(secs) {
  var minutes = Math.floor(secs / 60);
  secs = secs%60;
  var hours = Math.floor(minutes/60)
  minutes = minutes%60;
  return pad(hours)+":"+pad(minutes)+":"+pad(secs);
}
//end url help.

//https://stackoverflow.com/questions/9640266/convert-hhmmss-string-to-seconds-only-in-javascript
function hhmmssToSeconds(hhmmssString){
    var p = hhmmssString.split(':'),
        s = 0, m = 1;

    while (p.length > 0) {
        s += m * parseInt(p.pop(), 10);
        m *= 60;
    }

    return s;
}