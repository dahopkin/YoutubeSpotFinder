
var currentTabURL = window.location.href;
var getYoutubeVideoIDFromURL = function (url) {
    var regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    var match = url.match(regExp);
    if (match && match[2].length == 11) {
        return match[2];
    } else {
        return undefined;
    }
};

var getNetflixVideoIDFromURL = function (url) {
    var regExp = /^.*(netflix\.com\/watch\/)([^#\&\?]*).*/;
    var match = url.match(regExp);
    if (match && match[2].length == 8) {
        return match[2];
    } else {
        return undefined;
    }
};


var getVideoPlayerButtonFunctionObject = function (videoObject) {
    var seekToTime = videoObject.seekToTime;
    var getVideoDuration = videoObject.getVideoDuration;
    var getCurrentTime = videoObject.getCurrentTime;
    var goTo1_4thPoint = function () { videoObject.seekToPercentage((1 / 4)); };
    var goTo2_4thPoint = function () { videoObject.seekToPercentage((2 / 4)); };
    var goTo3_4thPoint = function () { videoObject.seekToPercentage((3 / 4)); };
    var goTo30Point = function () { videoObject.seekToSecondsBeforeEnd(30); };
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
    var seekToPercentage = function(percentage){ seekToTime(getVideoDuration() * percentage); };
    var seekToSecondsBeforeEnd = function (seconds) {
        if (getVideoDuration() > seconds) {
            seekToTime(getVideoDuration() - seconds);
        }
    };
    return {
        seekToTime: seekToTime,
        getVideoDuration: getVideoDuration,
        getCurrentTime:getCurrentTime,
        seekToPercentage:seekToPercentage,
        seekToSecondsBeforeEnd:seekToSecondsBeforeEnd
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
    var seekToPercentage = function(percentage){ seekToTime(getVideoDuration() * percentage); };
    var seekToSecondsBeforeEnd = function (seconds) {
        if (getVideoDuration() > seconds) {
            seekToTime(getVideoDuration() - seconds);
        }
    };
    return {
        seekToTime: seekToTime,
        getVideoDuration: getVideoDuration,
        getCurrentTime:getCurrentTime,
        seekToPercentage:seekToPercentage,
        seekToSecondsBeforeEnd:seekToSecondsBeforeEnd
    };
}();

var flashVideoPlayer = function () {
    return getVideoPlayerButtonFunctionObject(flashVideoObject);
}();

var netflixVideoObject = function () {
    var innerPlayer = function () {
        var tempPlayer = window.netflix.appContext.state.playerApp.getAPI().videoPlayer;
        var playerSessionId = tempPlayer.getAllPlayerSessionIds()[0];
        var player = tempPlayer.getVideoPlayerBySessionId(playerSessionId);
        return player;
    };
    var getVideoDuration = function () { return Number(innerPlayer().getDuration()/1000); };
    var seekToTime = function (seconds) { innerPlayer().seek(seconds*1000); };
    var getCurrentTime = function(){ return innerPlayer().getCurrentTime()/1000; };
    var seekToPercentage = function(percentage){ seekToTime(getVideoDuration() * percentage); };
    var seekToSecondsBeforeEnd = function (seconds) {
        var milliseconds = seconds * 1000;
        if (getVideoDuration() > milliseconds) {
            seekToTime(getVideoDuration() - milliseconds);
        }
    };
    return {
        seekToTime: seekToTime,
        getVideoDuration: getVideoDuration,
        getCurrentTime:getCurrentTime,
        seekToPercentage:seekToPercentage,
        seekToSecondsBeforeEnd:seekToSecondsBeforeEnd
    };
}();
var netflixVideoPlayer = function () {
    return getVideoPlayerButtonFunctionObject(netflixVideoObject);
}();

var netflixIDSource = function(){
    var getNetflixVideoIDFromURL = function (url) {
        url = url || currentTabURL;
        var regExp = /^.*(netflix\.com\/watch\/)([^#\&\?]*).*/;
        var match = url.match(regExp);
        if (match && match[2].length == 8) {
            return match[2];
        } else {
            return undefined;
        }
    };
    var pageIsNetflix = function(){
        return typeof getNetflixVideoIDFromURL(currentTabURL) !== "undefined";
    };
    var getBookmarkKey = function(videoID){
        var videoID = videoID || getNetflixVideoIDFromURL(currentTabURL);
        return "netflix-" + videoID.toString() +  "-bookmarks";
    };
    return{
        pageIsNetflix:pageIsNetflix,
        getBookmarkKey:getBookmarkKey,
        getVideoID:getNetflixVideoIDFromURL
    };
}();
var youtubeIDSource = function(){
    var getYoutubeVideoIDFromURL = function (url) {
        url = url || currentTabURL;
        var regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        var match = url.match(regExp);
        if (match && match[2].length == 11) {
            return match[2];
        } else {
            return undefined;
        }
    };
    var pageIsYoutube = function(){
        return typeof getYoutubeVideoIDFromURL(currentTabURL) !== "undefined";
    };
    var getBookmarkKey = function(videoID){
        var videoID = videoID || getYoutubeVideoIDFromURL(currentTabURL);
        return "youtube-" + videoID.toString() +  "-bookmarks";
    };
    return{
        pageIsYoutube:pageIsYoutube,
        getBookmarkKey:getBookmarkKey,
        getVideoID:getYoutubeVideoIDFromURL
    };
}();
var getURLIDSourceSettingsObject = function(urlRegex, urlIDLength, urlRegexMatchNumber){
    return{
        urlRegex: urlRegex,
        urlIDLength: urlIDLength,
        urlRegexMatchNumber: urlRegexMatchNumber
    }
};
/*
settings:
-urlRegex - regex to use on url for matching.
-urlIDLength - length of the id within the URL.
-urlRegexMatchNumber - regex match index number to return if valid
 as the ID when the matching happens.
*/
var getURLIDSource = function(settings){
    var getVideoIDFromURL = function (url) {
        url = url || currentTabURL;
        var regExp = settings.urlRegex;
        var match = url.match(regExp);
        if (match && match[settings.urlRegexMatchNumber].length == settings.urlIDLength) {
            return match[settings.urlRegexMatchNumber];
        } else {
            return undefined;
        }
    };
    var pageMatches = function(){
        return typeof getVideoIDFromURL(currentTabURL) !== "undefined";
    };
    var getBookmarkKey = function(videoID){
        var videoID = videoID || getVideoIDFromURL(currentTabURL);
        return "youtube-" + videoID.toString() +  "-bookmarks";
    };
    return{
        pageMatches:pageMatches,
        getBookmarkKey:getBookmarkKey,
        getVideoID:getYoutubeVideoIDFromURL
    };
};
var getIdSource = function(){

    if(netflixIDSource.pageIsNetflix()) return netflixIDSource;
    if(youtubeIDSource.pageIsYoutube()) return youtubeIDSource;
}
var youtubeVideoPlayer = function(){
    if(pageHasHTML5Video()) return html5VideoPlayer;
    if(pageHasFlashVideo()) return flashVideoPlayer;
}();
var getVideoPlayer = function () { 
    if(youtubeIDSource.pageIsYoutube()) return youtubeVideoPlayer;
    if(netflixIDSource.pageIsNetflix()) return netflixVideoPlayer;
 }


var getMultipleDataAndSend = function(sendResponse){
    bookmarks.getBookmarkData(function(bookmarkData){
        var appData = {
            "binarySearchStatusInfo":binarySearcher.getBinarySearchStatus(),
            "bookmarkInfo":bookmarkData
        };
        sendResponse(appData);
    });
}
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
        getMultipleDataAndSend(sendResponse);
    }
    else if (request.action == "goLeft") {
        binarySearcher.goLeft();
        getMultipleDataAndSend(sendResponse);
    }
    else if (request.action == "goRight") {
        binarySearcher.goRight();
        getMultipleDataAndSend(sendResponse);
    }
    else if (request.action == "start") { 
        getMultipleDataAndSend(sendResponse);
    }
    else if (request.action == "goToTime") {
        videoPlayer.seekToTime(request.time);
        getMultipleDataAndSend(sendResponse);
    }
    else if (request.action == "saveDefaultBookmark") {
        bookmarks.saveDefaultBookmark(function(saveResult){
            getMultipleDataAndSend(sendResponse)
        });
    }
    else if (request.action == "deleteBookmark") {
        bookmarks.deleteBookmark(request.time, function(saveResult){
            getMultipleDataAndSend(sendResponse);
        });
    }
    else if (request.action == "updateBookmark") {
        var updateBookmarkData = {time:request.updateData.newTime, description:request.updateData.newDescription};
        bookmarks.updateBookmark(request.updateData.oldTime, updateBookmarkData, function(saveResult){
            getMultipleDataAndSend(sendResponse);
        });
    }
    
    return true;

});
var videoPlayer, idSource, binarySearcher, bookmarks;
function initialize(){
    chrome.runtime.sendMessage({ action: "show" });
    videoPlayer = getVideoPlayer();
    idSource = getIdSource();
    binarySearcher = getBinarySearcher(videoPlayer);
    bookmarks = getBookmarksModule(videoPlayer,idSource);
}
$(window).on("load", function() { initialize(); });