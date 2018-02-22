chrome.runtime.sendMessage({ action: "show" });
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

var getVideoPlayer = function () { 
    if(pageHasHTML5Video()) return html5VideoPlayer;
    if(pageHasFlashVideo()) return flashVideoPlayer;
 }

var pageIsYoutube = function(){
    return typeof getYoutubeVideoIDFromURL !== "undefined";
};
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
var getIdSource = function(){
    if(netflixIDSource.pageIsNetflix()) return netflixIDSource;
    if(youtubeIDSource.pageIsYoutube()) return youtubeIDSource;
}

var videoPlayer = getVideoPlayer();
var idSource = getIdSource();
var binarySearcher = getBinarySearcher(videoPlayer);
var bookmarks = function(videoPlayer, idSource){
    var getBookmarkKey = function(videoID){
        var videoID = videoID || getYoutubeVideoIDFromURL(currentTabURL);
        return videoID.toString() +  "-bookmarks";
    };
    var getBookmarkData = function(callback){
        var videoID = idSource.getVideoID(currentTabURL);
        if(videoID){
            var key = idSource.getBookmarkKey(videoID);
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
    var saveDefaultBookmark = function(callback){
        var defaultBookmark = {time:videoPlayer.getCurrentTime(), description: ""};
        defaultBookmark = formatBookmarkData(defaultBookmark);
        saveCustomBookmark(defaultBookmark, callback);
    }
    var saveCustomBookmark = function(oneBookmarkData, callback){
        var videoID = idSource.getVideoID(currentTabURL);
        var saveResult = {status:"", message:""};
        if(videoID){
            var key = idSource.getBookmarkKey(videoID);
            if(!singleBookmarkDataIsValid(oneBookmarkData)){
                saveResult["status"] = "failure";
                saveResult["message"] = "Please check to see that the time you entered isn't more than the duration of the video, and that the description is less than 100 characters.";
                callback(saveResult);
            }else{
                getBookmarkData(function(bookmarkArray){
                    bookmarkArray.push(oneBookmarkData);
                    var saveObject = {};
                    saveObject[key] = bookmarkArray;
                    chrome.storage.sync.set(saveObject, function(items) {
                        saveResult["status"] = "success";
                        saveResult["message"] = "Your bookmark was saved successfully.";
                        callback(saveResult);
                      });
                });
            }
        } else{
            saveResult["status"] = "failure";
            saveResult["message"] = "You cannot save bookmarks on this page.";
        }
    };
    var updateBookmark = function(bookmarkTime, oneBookmarkData, callback){
        var videoID = idSource.getVideoID(currentTabURL);
        var saveResult = {status:"", message:""};
        if(videoID){
            var key = idSource.getBookmarkKey(videoID);
            if(!singleBookmarkDataIsValid(oneBookmarkData)){
                saveResult["status"] = "failure";
                saveResult["message"] = "Please check to see that the time you entered isn't more than the duration of the video, and that the description is less than 100 characters.";
                callback(saveResult);
            }else{
                getBookmarkData(function(bookmarkArray){
                    var updateIndex = bookmarkArray.findIndex(bookmark => bookmark.time == bookmarkTime);
                    if(updateIndex != -1){
                        bookmarkArray[updateIndex].time = oneBookmarkData.time;
                        bookmarkArray[updateIndex].description = oneBookmarkData.description;
                    }
                    var saveObject = {};
                    saveObject[key] = bookmarkArray;
                    chrome.storage.sync.set(saveObject, function(items) {
                        saveResult["status"] = "success";
                        saveResult["message"] = "Your bookmark was saved successfully.";
                        callback(saveResult);
                      });
                });
            }
        } else{
            saveResult["status"] = "failure";
            saveResult["message"] = "You cannot save bookmarks on this page.";
        }
    };
    var bookmarkExists = function(oneBookmarkData){
        var key = getBookmarkKey();

    };
    var deleteBookmark = function(bookmarkTime, callback){
        var videoID = idSource.getVideoID(currentTabURL);
        var saveResult = {status:"", message:""};
        if(videoID){
            var key = idSource.getBookmarkKey(videoID);
                getBookmarkData(function(bookmarkArray){
                    bookmarkArray = bookmarkArray.filter(function(bookmark){
                        return Number(bookmark.time) !== Number(bookmarkTime);
                    }); 
                    var saveObject = {};
                    saveObject[key] = bookmarkArray;
                    chrome.storage.sync.set(saveObject, function(items) {
                        saveResult["status"] = "success";
                        saveResult["message"] = "Your bookmark was deleted successfully.";
                        callback(saveResult);
                      });
                });
        } else{
            saveResult["status"] = "failure";
            saveResult["message"] = "There was an error in deleting this bookmark.";
        }
    };
    return {
        getBookmarkData:getBookmarkData,
        saveDefaultBookmark:saveDefaultBookmark,
        saveCustomBookmark:saveCustomBookmark,
        deleteBookmark:deleteBookmark,
        updateBookmark:updateBookmark
    };
}(videoPlayer, idSource);
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
        getMultipleDataAndSend(sendResponse);
    }
    else if (request.action == "goTo2-4") {
        videoPlayer.goTo2_4thPoint();
        getMultipleDataAndSend(sendResponse);
    }
    else if (request.action == "goTo3-4") {
        videoPlayer.goTo3_4thPoint();
        getMultipleDataAndSend(sendResponse);
    }
    else if (request.action == "goTo30") {
        videoPlayer.goTo30Point();
        getMultipleDataAndSend(sendResponse);
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