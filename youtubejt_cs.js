
var currentTabURL = window.location.href;

var getDecimalPercentage = function(percentage){
    percentage = Number(percentage);
    if(percentage >= 0 && percentage <= 1){ return percentage; }
    return percentage / 100;
};
var pageHasHTML5Video = function(){return typeof(document.getElementsByTagName("video")[0]) !== 'undefined';}
var getHtml5VideoObject = function (videoDomElement) {
    var innerPlayer = function(){return videoDomElement || document.getElementsByTagName("video")[0]};
    var getVideoDuration = function () { return Number(innerPlayer().duration); };
    var seekToTime = function (seconds) { innerPlayer().currentTime = seconds; };
    var getCurrentTime = function(){return innerPlayer().currentTime; };
    var seekToPercentage = function(percentage){ seekToTime(getVideoDuration() * getDecimalPercentage(percentage)); };
    var seekToSecondsBeforeEnd = function (seconds) {
        if (getVideoDuration() > seconds) {
            seekToTime(getVideoDuration() - seconds);
        }
    };
    var rewind = function(seconds){
        var rewindTime = getCurrentTime() - seconds;
        if(rewindTime > 0) seekToTime(rewindTime);
    };
    var fastForward = function(seconds){
        var fastForwardTime = getCurrentTime() + seconds;
        if(fastForwardTime < getVideoDuration()) seekToTime(fastForwardTime);
    };
    var play = function(){innerPlayer().play();};
    var pause = function(){innerPlayer().pause();};
    var isPlaying = function(){ return !innerPlayer().paused;}
    return {
        seekToTime: seekToTime,
        getVideoDuration: getVideoDuration,
        getCurrentTime:getCurrentTime,
        seekToPercentage:seekToPercentage,
        seekToSecondsBeforeEnd:seekToSecondsBeforeEnd,
        rewind:rewind,
        fastForward:fastForward,
        play:play,
        pause:pause,
        isPlaying:isPlaying
    };
};

var html5VideoPlayer = getHtml5VideoObject();
var pageHasFlashVideo = function(){return typeof(document.getElementById("movie_player")) !== 'undefined';}
var flashVideoPlayer = function () {
    var innerPlayer = function(){document.getElementById("movie_player")};
    var getVideoDuration = function () { return Number(innerPlayer().getDuration()); };
    var seekToTime = function (seconds) { innerPlayer().seekTo(seconds); };
    var getCurrentTime = function(){ return innerPlayer().getCurrentTime(); };
    var seekToPercentage = function(percentage){ seekToTime(getVideoDuration() * getDecimalPercentage(percentage)); };
    var seekToSecondsBeforeEnd = function (seconds) {
        if (getVideoDuration() > seconds) {
            seekToTime(getVideoDuration() - seconds);
        }
    };
    var rewind = function(seconds){
        var rewindTime = getCurrentTime() - seconds;
        if(rewindTime > 0) seekToTime(rewindTime);
    };
    var fastForward = function(seconds){
        var fastForwardTime = getCurrentTime() + seconds;
        if(fastForwardTime < getVideoDuration()) seekToTime(fastForwardTime);
    };
    var play = function(){innerPlayer().playVideo();};
    var pause = function(){innerPlayer().pauseVideo();};
    var isPlaying = function(){
        var playerStatePlaying = 1;
        return innerPlayer().getPlayerState() == playerStatePlaying;
    }
    return {
        seekToTime: seekToTime,
        getVideoDuration: getVideoDuration,
        getCurrentTime:getCurrentTime,
        seekToPercentage:seekToPercentage,
        seekToSecondsBeforeEnd:seekToSecondsBeforeEnd,
        rewind:rewind,
        fastForward:fastForward,
        play:play,
        pause:pause,
        isPlaying:isPlaying
    };
}();

var netflixVideoPlayer = function () {
    var innerPlayer = function () {
        var tempPlayer = window.netflix.appContext.state.playerApp.getAPI().videoPlayer;
        var playerSessionId = tempPlayer.getAllPlayerSessionIds()[0];
        var player = tempPlayer.getVideoPlayerBySessionId(playerSessionId);
        return player;
    };
    var getVideoDuration = function () { return Number(innerPlayer().getDuration()/1000); };
    var seekToTime = function (seconds) { innerPlayer().seek(seconds*1000); };
    var getCurrentTime = function(){ return innerPlayer().getCurrentTime()/1000; };
    var seekToPercentage = function(percentage){ seekToTime(getVideoDuration() * getDecimalPercentage(percentage)); };
    var seekToSecondsBeforeEnd = function (seconds) {
        var milliseconds = seconds * 1000;
        if (getVideoDuration() > milliseconds) {
            seekToTime(getVideoDuration() - milliseconds);
        }
    };
    var rewind = function(seconds){
        var rewindTime = getCurrentTime() - seconds;
        if(rewindTime > 0) seekToTime(rewindTime);
    };
    var fastForward = function(seconds){
        var fastForwardTime = getCurrentTime() + seconds;
        if(fastForwardTime < getVideoDuration()) seekToTime(fastForwardTime);
    };
    var play = function(){innerPlayer.play();};
    var pause = function(){innerPlayer.pause();};
    var isPlaying = function(){ return !innerPlayer.getPaused() }
    return {
        seekToTime: seekToTime,
        getVideoDuration: getVideoDuration,
        getCurrentTime:getCurrentTime,
        seekToPercentage:seekToPercentage,
        seekToSecondsBeforeEnd:seekToSecondsBeforeEnd,
        rewind:rewind,
        fastForward:fastForward,
        play:play,
        pause:pause,
        isPlaying:isPlaying
    };
}();

var huluVideoPlayer = getHtml5VideoObject(document.getElementById("content-video-player"));

var getURLIDSourceSettingsObject = function(urlRegex, urlIDLength, urlRegexMatchNumber, bookmarkPrefix){
    return{
        urlRegex: urlRegex,
        urlIDLength: urlIDLength,
        urlRegexMatchNumber: urlRegexMatchNumber,
        bookmarkPrefix:bookmarkPrefix
    }
};
/*
settings:
-urlRegex - regex to use on url for matching.
-urlIDLength - length of the id within the URL.
-urlRegexMatchNumber - regex match index number to return if valid
 as the ID when the matching happens.
-bookmarkPrefix - prefix for the bookmark key.
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
    var pageMatches = function(url){
        url = url || currentTabURL;
        return typeof getVideoIDFromURL(url) !== "undefined";
    };
    var getBookmarkKey = function(videoID){
        var videoID = videoID || getVideoIDFromURL(currentTabURL);
        return settings.bookmarkPrefix+"-" + videoID.toString() +  "-bookmarks";
    };
    return{
        pageMatches:pageMatches,
        getBookmarkKey:getBookmarkKey,
        getVideoID:getYoutubeVideoIDFromURL
    };
};
var youtubeIDSource = getURLIDSource(
    getURLIDSourceSettingsObject(
        /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/,
        11, 2, "youtube"
    )
);
var netflixIDSource = getURLIDSource(
    getURLIDSourceSettingsObject(
        /^.*(netflix\.com\/watch\/)([^#\&\?]*).*/,
        8, 2, "netflix"
    )
);
var huluIDSource = getURLIDSource(
    getURLIDSourceSettingsObject(
        /^.*(hulu\.com\/watch\/)([^#\&\?]*).*/,
        6, 2, "hulu"
    )
);
var getIdSource = function(){
    var potentialIDSources = [youtubeIDSource, netflixIDSource, huluIDSource]
    for(var i=0; i < potentialIDSources.length; i++){
        if(potentialIDSources[i].pageMatches()) return potentialIDSources[i];
    }
}
/*TODO: Figure out a solution for this; 
the check for seeing if the page has html5 video might fail, 
but using an html5 player anyway turns out fine. 
Might be because I'm retrieving the dom element constantly.*/
var youtubeVideoPlayer = function(){
    if(pageHasHTML5Video()) return html5VideoPlayer;
    //if(pageHasFlashVideo()) return flashVideoPlayer;
    return html5VideoPlayer;
}();
var getVideoPlayer = function () { 
    var potentialIDSources = [youtubeIDSource, netflixIDSource, huluIDSource];
    var potentialPlayers = [youtubeVideoPlayer, netflixVideoPlayer, huluVideoPlayer];
    for(var i=0; i < potentialIDSources.length; i++){
        if(potentialIDSources[i].pageMatches()) return potentialPlayers[i];
    }
}
var appInfo;
var setAppInfo = function(appInfoCallback){
    bookmarks.getBookmarkData(function(bookmarkData){
        appInfo = {
            "binarySearchStatusInfo":binarySearcher.getBinarySearchStatus(),
            "bookmarkInfo":bookmarkData,
            "isPlaying":videoPlayer.isPlaying()
        };
        appInfoCallback(appInfo);
    });
}
var videoPlayer, idSource, binarySearcher, bookmarks;
var embedUIOnPage = function (functionToRunAfter) {
    $.get(chrome.runtime.getURL('ui-inject.html'), function(data) {
        var html = $.parseHTML(data);
        if($(".yjt-html").length){$(".yjt-html").remove();}
        $("#info").prepend(html);
        functionToRunAfter();
    });
};
function initializeVariables(callback){
    videoPlayer = getVideoPlayer();
    idSource = getIdSource();
    binarySearcher = getBinarySearcher(videoPlayer);
    bookmarks = getBookmarksModule(videoPlayer, idSource);
    callback()
}
function initialize() {
    chrome.runtime.sendMessage({ action: "show" });
    idSource = getIdSource();
    videoPlayer = getVideoPlayer();
    binarySearcher = getBinarySearcher(videoPlayer);
    bookmarks = getBookmarksModule(videoPlayer, idSource);
    embedUIOnPage(function () {
        setAppInfo(setPageDom);
    });
}
function waitForElementToDisplay(selector, time, functionToRun) {
    if(document.querySelector(selector)!=null && typeof document.querySelector(selector)!= "undefined") {
        functionToRun();
        return;
    }
    else {
        setTimeout(function() {
            waitForElementToDisplay(selector, time, functionToRun);
        }, time);
    }
}
function initializeWhenElementIsLoaded(){
    $(window).on("load", function() { 
        waitForElementToDisplay("#info", 500, initialize);
    });
}

function setPageDom(newAppInfo){
    appInfo = newAppInfo || appInfo;
    setBinarySearchDom(appInfo.binarySearchStatusInfo);
    setBookmarkDom(appInfo.bookmarkInfo);
    setPlayButton(appInfo.isPlaying);
}
function setPlayButton(isPlaying){
    if(isPlaying){
        $("#playOrPause").val("Pause").removeClass("btn-red").addClass("btn-red-inverse");
    } else{
        $("#playOrPause").val("Play").removeClass("btn-red-inverse").addClass("btn-red");
    }
};
function setBinarySearchDom(binarySearchStatusInfo){
    if(binarySearchStatusInfo){
        if(binarySearchStatusInfo.isRunning){
            $("#startOrStop").val("Stop").removeClass("btn-red").addClass("btn-red-inverse");
            $("#goLeft, #goRight").prop("disabled",false).removeClass("btn-disabled");
        } else{
            $("#startOrStop").val("Find").removeClass("btn-red-inverse").addClass("btn-red");
            $("#goLeft, #goRight").prop("disabled",true).addClass("btn-disabled");
        }
    }
    setUndoButtonDom(binarySearchStatusInfo);
    setProgressBarDom(binarySearchStatusInfo);
    
}
function setUndoButtonDom(binarySearchStatusInfo){
    if(binarySearchStatusInfo.isRunning && binarySearchStatusInfo.canUndoLastStep){
        $("#undo").prop("disabled",false).removeClass("btn-disabled");
    } else{
        $("#undo").prop("disabled",true).addClass("btn-disabled");
    }
}

function getTableContentsFromBookmarks(bookmarkInfo) {
    var currentBookmark, html, time, formattedTime, description;
    html = "";
    if (bookmarkInfo.length == 0) {
        html += "<tr><td class='note'>No bookmarked times for this video.</td><tr>";
        return html;
    } else {
        for (var i = 0; i < bookmarkInfo.length; i++) {
            currentBookmark = bookmarkInfo[i];
            if (i === 0) {
                html += "<tr><th>Time (hh:mm:ss)</th><th>Description</th><th>Actions</th><tr>";
            }
            time = currentBookmark.time;
            description = currentBookmark.description == "" ? "No Description" : currentBookmark.description;
            formattedTime = hhmmss(currentBookmark.time);
            html += `<tr>
        <td><a class='time-link' data-time='${time}'>${formattedTime}</a></td>
        <td><span class='description' data-time='${time}'>${description}</span></td>
        <td><button data-time='${time}' class='edit-button btn btn-small btn-primary'>Edit</button></td>
        <td><button data-time='${time}' class='delete-button btn btn-small btn-primary'>Delete</button></td>
        <tr>`;
            //Do something
        }
    }
    return html;
}

function setProgressBarDom(binarySearchStatusInfo){
    var $progressBarOuter = $(".progress-outer");
    var $progressBarInner = $(".progress-inner");
    var $progressBarMid = $(".progress-mid");
    if(binarySearchStatusInfo.isRunning){
        $progressBarOuter.show();
        var progressBarWidth = $progressBarOuter.width();
        var start = binarySearchStatusInfo.start;
        var end = binarySearchStatusInfo.end;
        var mid = binarySearchStatusInfo.mid;
        var duration = binarySearchStatusInfo.duration;
        var difference = end - start;
        var differencePercentage = difference/duration;
        var startOnProgressPercentage = start/duration;
        var midPercentage = mid/duration;
        var startLeftMid = midPercentage * progressBarWidth;
        var startLeft = startOnProgressPercentage * progressBarWidth;
        var innerProgressWidth = differencePercentage * progressBarWidth;
        $progressBarInner.css({width:innerProgressWidth, left:startLeft});
        $progressBarMid.css({left:startLeftMid});
    } else{
        $progressBarOuter.hide();
    }
}
function setBookmarkDom(bookmarkInfo){
    $('#description').val("");
    $('#time').text('');
    $('#bookmark-table').html(getTableContentsFromBookmarks(bookmarkInfo));
}
function resetDataForNewPage(){
    binarySearcher.reset();
    setAppInfo(setPageDom);
}
function isAVideoWatchPage(url){
    return youtubeIDSource.pageMatches(url)
}
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action == "change") {
        currentTabURL = request.data.url;
        if (isAVideoWatchPage(request.data.url)) {
            waitForElementToDisplay("#items", 500, initialize);
        } else {
            chrome.runtime.sendMessage({ action: "hide" });
        }
    }
    return true;
});