chrome.runtime.sendMessage({ action: "show" });

var getYoutubeVideoIDFromURL = function (url) {
    var regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    var match = url.match(regExp);
    if (match && match[2].length == 11) {
        return match[2];
    } else {
        return undefined;
    }
};

var getVideoPlayerButtonFunctionObject = function (videoObject) {
    var seekToTime = videoObject.seekToTime;
    var getVideoDuration = videoObject.getVideoDuration;
    var getCurrentTime = videoObject.getCurrentTime;
    var goTo1_4thPoint = function () { seekToTime(getVideoDuration() * (1 / 4)); };
    var goTo2_4thPoint = function () { seekToTime(getVideoDuration() * (2 / 4)); };
    var goTo3_4thPoint = function () { seekToTime(getVideoDuration() * (3 / 4)); };
    var goTo30Point = function () {
        if (getVideoDuration() > 30) {
            seekToTime(getVideoDuration() - 30);
        }
    };
    return {
        goTo1_4thPoint: goTo1_4thPoint,
        goTo2_4thPoint: goTo2_4thPoint,
        goTo3_4thPoint: goTo3_4thPoint,
        goTo30Point: goTo30Point,
        seekToTime: seekToTime,
        getVideoDuration: getVideoDuration,
        getCurrentTime: getCurrentTime
    };
};
var pageHasHTML5Video = function(){return typeof(document.getElementsByTagName("video")[0]) !== 'undefined';}
var html5VideoObject = function () {
    var innerPlayer = document.getElementsByTagName("video")[0];
    var getVideoDuration = function () { return Number(innerPlayer.duration); };
    var seekToTime = function (seconds) { innerPlayer.currentTime = seconds; };
    var getCurrentTime = function(){return innerPlayer.currentTime; };
    return {
        seekToTime: seekToTime,
        getVideoDuration: getVideoDuration,
        getCurrentTime:getCurrentTime
    };
}();

var html5VideoPlayer = function () {
    return getVideoPlayerButtonFunctionObject(html5VideoObject);
}();
var pageHasFlashVideo = function(){return typeof(document.getElementById("movie_player")) !== 'undefined';}
var flashVideoObject = function () {
    var innerPlayer = document.getElementById("movie_player");
    var getVideoDuration = function () { return Number(innerPlayer.getDuration()); };
    var seekToTime = function (seconds) { innerPlayer.seekTo(seconds); };
    var getCurrentTime = function(){ return innerPlayer.getCurrentTime(); };
    return {
        seekToTime: seekToTime,
        getVideoDuration: getVideoDuration,
        getCurrentTime:getCurrentTime
    };
}();

var flashVideoPlayer = function () {
    return getVideoPlayerButtonFunctionObject(flashVideoObject);
}();

var getVideoPlayer = function () { 
    if(pageHasHTML5Video()) return html5VideoPlayer;
    if(pageHasFlashVideo()) return flashVideoPlayer;
 }

var videoPlayer = getVideoPlayer();

var binarySearcher = function (videoPlayer) {
    var isRunning = false;
    var start, end, mid;
    var calculateMid = function () { mid = (start + end) / 2; }
    var setStartEndAndMidToDefault = function () {
        start = 0;
        end = videoPlayer.getVideoDuration();
        calculateMid();
    }
    var resetBinarySearcher = function () {
        setStartEndAndMidToDefault();
        isRunning = false;
    };
    var startBinarySearcher = function () {
        setStartEndAndMidToDefault();
        isRunning = true;
        goToMid();
    }
    var goToMid = function () { videoPlayer.seekToTime(mid); }
    var startOrStop = function () {
        if (isRunning) { resetBinarySearcher(); }
        else {
            startBinarySearcher();
        }
    }
    var shouldEndNow = function () { return start > end; }
    var goLeft = function () {
        if (!isRunning) { return; }
        end = mid - 1;
        calculateMid();
        goToMid();
        if (shouldEndNow()) {
            resetBinarySearcher();
        }
    };
    var goRight = function () {
        if (!isRunning) { return; }
        start = mid + 1;
        calculateMid();
        goToMid();
        if (shouldEndNow()) { resetBinarySearcher(); }
    };
    var getBinarySearchStatus = function(){
        return { isRunning : isRunning };
    }
    return {
        startOrStop: startOrStop,
        goLeft: goLeft,
        goRight: goRight,
        getBinarySearchStatus: getBinarySearchStatus,
        reset:resetBinarySearcher

    };
}(videoPlayer);

var bookmarks = function(videoPlayer){
    var getBookmarkKey = function(videoID){
        var videoID = videoID || getYoutubeVideoIDFromURL(currentTabURL);
        return videoID.toString() +  "-bookmarks";
    };
    var getBookmarkData = function(callback){
        var videoID = getYoutubeVideoIDFromURL(currentTabURL);
        if(videoID){
            var key = getBookmarkKey(videoID);
            var defaultObject = {};
            defaultObject[key] = [];
            chrome.storage.sync.get(defaultObject, function(items) {
                var bookmarksForVideo = items[key];
                callback(bookmarksForVideo);
              });
        }
    };
    var singleBookmarkDataIsValid = function(singleBookmarkData){
        //if the time is not a number or is more than the duration, fail.
        var time = singleBookmarkData.time;
        if(isNaN(time) || time > videoPlayer.getVideoDuration()) return false;
        //if the description is more than 100 characters, fail.
        var description = singleBookmarkData.description;
        if(description.length > 100) return false;
        return true;
    };
    var formatBookmarkData = function(oneBookmarkData){
        var time = Math.floor(oneBookmarkData.time);
        var description = oneBookmarkData.description;
        return {time:time, description:description};
    }
    var saveBookmark = function(callback){
        var defaultBookmark = {time:videoPlayer.getCurrentTime(), description: ""};
        defaultBookmark = formatBookmarkData(defaultBookmark);
        saveCustomBookmark(defaultBookmark, callback);
    }
    var saveCustomBookmark = function(oneBookmarkData, callback){
        var videoID = getYoutubeVideoIDFromURL(currentTabURL);
        var saveResult = {status:"", message:""};
        if(videoID){
            var key = getBookmarkKey(videoID);
            if(!singleBookmarkDataIsValid(oneBookmarkData)){
                saveResult["status"] = "failure";
                saveResult["message"] = "Please check to see that the time you entered isn't more than the duration of the video, and that the description is less than 100 characters.";
                callback(saveResult);
            }else{
                getBookmarkData(function(bookmarkArray){
                    bookmarkArray.push(oneBookmarkData);
                    saveResult["status"] = "success";
                    saveResult["message"] = "Your bookmark was saved successfully.";
                    callback(saveResult);
                });
            }
        } else{
            saveResult["status"] = "failure";
            saveResult["message"] = "You cannot save bookmarks on this page.";
        }
    };
    return {
        getBookmarkData:getBookmarkData,
        saveBookmark:saveBookmark,
        saveCustomBookmark:saveCustomBookmark
    };
}(videoPlayer);
var currentTabURL = ""
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    currentTabURL = request.url;
    if (request.action == "goTo1-4") {
        videoPlayer.goTo1_4thPoint();
    }
    else if (request.action == "goTo2-4") {
        videoPlayer.goTo2_4thPoint();
    }
    else if (request.action == "goTo3-4") {
        videoPlayer.goTo3_4thPoint();
    }
    else if (request.action == "goTo30") {
        videoPlayer.goTo30Point();
    }
    else if (request.action == "startOrStop") {
        binarySearcher.startOrStop();
    }
    else if (request.action == "goLeft") {
        binarySearcher.goLeft();
    }
    else if (request.action == "goRight") {
        binarySearcher.goRight();
    }
    else if (request.action == "start") { }
    bookmarks.getBookmarkData(function(bookmarkData){
        sendResponse(binarySearcher.getBinarySearchStatus());
    });
    return true;

    

});