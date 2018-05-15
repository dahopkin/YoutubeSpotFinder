//https://jsfiddle.net/mplungjan/u8ar8en8/
function pad(str) {
    return ("0"+str).slice(-2);
}
function getHoursMinutesSecondsFromSeconds(seconds){
    var minutes = Math.floor(seconds / 60);
    seconds = seconds%60;
    var hours = Math.floor(minutes/60)
    minutes = minutes%60;
    return{hours:hours, minutes:minutes, seconds:seconds};
}
function hhmmss(seconds) {
  let hhmmssdata = getHoursMinutesSecondsFromSeconds(seconds);
  return pad(hhmmssdata.hours)+":"+pad(hhmmssdata.minutes)+":"+pad(hhmmssdata.seconds);
}
function getFormalStringFromhhmmssData(hhmmssdata){
    let formalString = ""
    if(hhmmssdata.hours > 0){formalString += `${hhmmssdata.hours}h`;}
    if(hhmmssdata.minutes > 0){formalString += `${hhmmssdata.minutes}m`;}
    if(hhmmssdata.seconds > 0){formalString += `${hhmmssdata.seconds}s`;}
    return formalString;
}
function hhmmssformal(seconds){
    let hhmmssdata = getHoursMinutesSecondsFromSeconds(seconds);
    return getFormalStringFromhhmmssData(hhmmssdata);
    
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

//escape html
//source code comes from:
//https://stackoverflow.com/questions/6020714/escape-html-using-jquery
// List of HTML entities for escaping.
var htmlEscapes = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };
  
  // Regex containing the keys listed immediately above.
  var htmlEscaper = /[&<>"'\/]/g;
  
  // Escape a string for HTML interpolation.
  var escapeHTMLString = function(string) {
    return ('' + string).replace(htmlEscaper, function(match) {
      return htmlEscapes[match];
    });
  };