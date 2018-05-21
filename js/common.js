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
        let currentElement = p.pop();
        if (isNaN(currentElement)) return undefined;
        s += m * parseInt(currentElement, 10);
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

  function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}
function isObject(item){
    return item !== null 
    && typeof item === "object"
    && !Array.isArray(item);
}
function isNullOrUndefined(item){
    return item === null || typeof item === "undefined"
}
function AppError(message){
    this.message = message;
}

AppError.prototype = new Error();

let validators = (function(){
    let fileIsJSONFile = function(fileFromFileRead){
        let supportedFormats = ['application/json'];
        if (fileFromFileRead && fileFromFileRead.type) {
            if (0 > supportedFormats.indexOf(fileFromFileRead.type)) {
                return false;
            } else { return true };
        }
        return false;
    };
    //a top-level item from storage contains "bookmarks" and "info" objects.
    let importDataItemIsValid = function(importDataItem){
        if(isNullOrUndefined(importDataItem["bookmarks"]) || isNullOrUndefined(importDataItem["info"])) return false;
        if(isNullOrUndefined(importDataItem["bookmarks"]["title"])) return false;
        let bookmarksToCheck = importDataItem["bookmarks"];
        for (const key in bookmarksToCheck) {
            if (bookmarksToCheck.hasOwnProperty(key)) {
                const currentBookmark = bookmarksToCheck[key];
                if(!bookmarkIsValid(currentBookmark)) return false;
            }
        }
        return true;
    };
    let bookmarkIsValid = function(bookmark){
        return !isNaN(bookmark.time);
    };
    return{
        fileIsJSONFile:fileIsJSONFile,
        importDataItemIsValid:importDataItemIsValid,
        bookmarkIsValid:bookmarkIsValid
    };
}());
/*ActionResult's settings are:
message: the message
error: the error (if there is one. If there is, the error message will be the message above)
data: if things went well, then there will be data
*/
function ActionResult(settings){
    this.error = settings.error;
    this.data = settings.data;
    this.message = settings.message;
    this.hasError = function(){return !isNullOrUndefined(this.error);}
    this.displayErrorIfPresent = function(displayFunction){
        if(this.hasError()){
            displayFunction(this.message);
            return true;
        }
        return false;
    }
}

function jQEventList(){
    this.eventList = [];
    this.bindEvents = function(){
        for (let index = 0; index < this.eventList.length; index++) {
            const currentListElement = this.eventList[index];
            if(currentListElement.selector){
                currentListElement.element.on(currentListElement.eventName, currentListElement.selector, currentListElement.event);
            } else{
                currentListElement.element.on(currentListElement.eventName, currentListElement.event);
            }
            
        }
    }
    this.unbindEvents = function(){
        for (let index = 0; index < this.eventList.length; index++) {
            const currentListElement = this.eventList[index];
            if(currentListElement.selector){
                currentListElement.element.off(currentListElement.eventName, currentListElement.selector, currentListElement.event);
            } else{
                currentListElement.element.off(currentListElement.eventName, currentListElement.event);
            }
            
        }
    }
    this.addEventToList = function(jqElement, eventName, eventFunction, selector){
        this.eventList.push({
            "element":jqElement, 
            "event":eventFunction, 
            "eventName":eventName, 
            "selector":selector
        });
    }
}
var displayMessageFromActionResult = function(ActionResult, displayFunction){
    //let message = ActionResult.message;
    displayFunction(ActionResult.message);
}
class JSONFileHandler{
    constructor(fileToRead){
        this.file = fileToRead;
    }
    getData(event, callback){
        try {
            let jsonData = undefined;
            let jsonFile = event.target.result;
            jsonData = JSON.parse(jsonFile);
            callback(new ActionResult({data:jsonData}));
        } catch (error) {
            callback(new ActionResult({message:error.message, error:new AppError(error.message)}));
        }
    }
    handleFileError(event){
        throw new AppError(event.message);
    }
    getJSONFile(callback){
        if (!validators.fileIsJSONFile(this.file)) { throw new AppError("The import file can only be JSON.") }
        var reader = new FileReader();
        let _this = this;
        reader.onload = function(event){
            _this.getData(event, callback);
        };
        reader.onerror = this.handleFileError;
        reader.readAsText(this.file);
    }
}
function displayMessageAsAlert(message){
    alert(message);
}
