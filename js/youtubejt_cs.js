
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
        var minTime = 0;
        var rewindTime = getCurrentTime() - seconds;
        if(rewindTime < minTime) rewindTime = minTime;
        seekToTime(rewindTime);
    };
    var fastForward = function(seconds){
        var maxTime = getVideoDuration();
        var fastForwardTime = getCurrentTime() + seconds;
        //fast-forwarding to the exact end of the video restarts it.
        if(fastForwardTime > maxTime) fastForwardTime = maxTime-.1;
        seekToTime(fastForwardTime);
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

var youtubeIDSource = getYoutubeIDSource();
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
    bookmarks.getBookmarkData(function(ActionResult){
        if(ActionResult.displayErrorIfPresent(displayMessageAsAlert)) return;
        bookmarkData = ActionResult.data;
        appInfo = {
            "binarySearchStatusInfo":binarySearcher.getBinarySearchStatus(),
            "bookmarkInfo":bookmarkData,
            "isPlaying":videoPlayer.isPlaying()
        };
        appInfoCallback(appInfo);
    });
}

var videoPlayer, idSource, binarySearcher, bookmarks;
var insertHTMLAfterElement = function(elementSelector, html){
    $(elementSelector).after(html);
};
var insertHTMLBeforeElement = function(elementSelector, html){
    $(elementSelector).before(html);
};
var insertHTMLAtTopOfElement = function(elementSelector, html){
    $(elementSelector).prepend(html);
}
var insertHTMLAtBottomOfElement = function(elementSelector, html){
    $(elementSelector).append(html);
}
var embedUIOnPage = function (functionToRunAfter) {
    $.get(chrome.runtime.getURL('../html/ui-inject.html'), function(data) {
        var html = $.parseHTML(data);
        var checkSelector = ".yjt-html";
        if($(checkSelector).length){$(checkSelector).remove();}
        insertHTMLAfterElement("#player.style-scope.ytd-watch", html);
        if($(checkSelector).length){$(checkSelector).show();}
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
var constantUICheck;
function initialize() {
    chrome.runtime.sendMessage({ action: "show" });
    idSource = getIdSource();
    videoPlayer = getVideoPlayer();
    binarySearcher = getBinarySearcher(videoPlayer);
    bookmarks = getBookmarksModule(videoPlayer, idSource);
    embedUIOnPage(function () {
        setAppInfo(setPageDom);
        clearInterval(constantUICheck);
        constantUICheck = setInterval(changeUIDependingOnCurrentState, 250);
        resizeUIToFitPlayer();
    });
}
var playerWindowSelector = "#player.style-scope.ytd-watch";
var mainPanelSelector = ".yjt-html";
function getPlayerWindowElement(){return $(playerWindowSelector);}
function resizeUIToFitPlayer(){
    var $playerWindowElement = $(playerWindowSelector);
    var playerWidth = $playerWindowElement.innerWidth();
    var desiredWidth = playerWidth;
    $(".yjt-html").css({width:desiredWidth});
}
function changePageToFitUI(){
    var $playerWindowElement = $(playerWindowSelector);
    $playerWindowElement.css({"margin-bottom":0});
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
        let $startStopButton = $("#startOrStop");
        let $leftRightButtons = $("#goLeft, #goRight");
        if(binarySearchStatusInfo.isRunning){
            $startStopButton.text("Stop").removeClass("btn-blue").addClass("btn-red");
            $startStopButton.attr("tooltip", "Stop spot finding.");
            $leftRightButtons.prop("disabled",false).removeClass("btn-disabled");
        } else{
            $startStopButton.text("Find").removeClass("btn-red").addClass("btn-blue");
            $startStopButton.attr("tooltip", "Start finding your spot.");
            $leftRightButtons.prop("disabled",true).addClass("btn-disabled");
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

function getBookmarkArrayFromBookmarkListObject(bookmarkListObject){
    let bookmarkArray = [];
    for (const key in bookmarkListObject) {
        if (bookmarkListObject.hasOwnProperty(key)) {
            const element = bookmarkListObject[key];
            if(isNullOrUndefined(element.time)){continue;}
            bookmarkArray.push(element);
        }
    }
    return bookmarkArray;
}
function getHTMLFromBookmark(bookmark){
            time = bookmark.time;
            time = escapeHTMLString(time);
            description = bookmark.description == "" ? "No Description" : bookmark.description;
            formattedTime = hhmmss(bookmark.time);
            html = `<tr class="bookmark-row">
        <td><a class='time-link' data-time='${time}'>${escapeHTMLString(formattedTime)}</a></td>
        <td><span class='description' data-time='${time}'>${escapeHTMLString(description)}</span></td>
        <td><button data-time='${time}' class='edit-button btn btn-small btn-primary'>Edit</button></td>
        <td><button data-time='${time}' class='show-delete-button btn btn-small btn-primary'>Delete</button></td>
        <td><button data-time='${time}' class='share-button btn btn-small btn-primary'>Share</button></td>
        <tr>`;
        return html;
}
function getTableContentsFromBookmarks(bookmarkInfo) {
    bookmarkInfo = getBookmarkArrayFromBookmarkListObject(bookmarkInfo);
    var currentBookmark, html, time, formattedTime, description;
    html = "";
    if (isEmpty(bookmarkInfo)) {
        html += "<tr><td class='note'>No bookmarked times for this video.</td><tr>";
        return html;
    } else {
        for (var i = 0; i < bookmarkInfo.length; i++) {
            currentBookmark = bookmarkInfo[i];
            if (i === 0) {
                html += `<tr><th>Go To</th><th>Description</th><th>Actions</th><tr>`;
            }
            currentBookmark = bookmarkInfo[i];
            html += getHTMLFromBookmark(currentBookmark);
        }
    }
    return $.parseHTML(html);
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
//block UI if an ad is playing.
//code for this function taken (and changed) from:
//https://github.com/adamgajzlerowicz/muter/blob/master/muter.js
let blockedBecauseOfCommercial = false;
let muteButton = undefined;
let commercialElement = undefined;
function blockOrShowUIDependingOnAdStatus(){
    try {
        commercialElement = document.getElementsByClassName('ad-interrupting')[0];
        uiElement = document.getElementsByClassName('yjt-html')[0];
    } catch (e) {
        console.log('no commercial playing or UI to toggle');
        return;
    }
    //block UI if commercial is running.
    if (commercialElement) {
        blockedBecauseOfCommercial = true;
        $("#ui-blocker").removeClass("hidden");
        return;
    }
    //show UI if commercial is not running.
    if (blockedBecauseOfCommercial) {
        $("#ui-blocker").addClass("hidden");
    }
}
var $containerElement = undefined;
var uiIsAfterPlayerElement = false;
var uiIsAtBottomOfContentSeparator = false;
function moveUIDependingOnContainerStatus(){
    var $containerElement = $("#container.style-scope.ytd-watch");
    var containerWidth = $containerElement.width();
    var $playerWindowElement = getPlayerWindowElement()
    var playerWidth = $playerWindowElement.innerWidth();
    var $playerSizeButtonDescription = $(".ytp-size-button").attr("title");
    var playerWindowIsInTheaterMode = false;
    if($playerSizeButtonDescription){
        $playerSizeButtonDescription.toLowerCase() == "default mode"
    };
    //if the player is in theater mode or the main container is as big as the player window, move the UI to
    //right after the player window so it'll sit on top of the container and all the other content.
    if(((containerWidth <= playerWidth) || playerWindowIsInTheaterMode) && !uiIsAfterPlayerElement){
        var ui = $(mainPanelSelector).detach();
        insertHTMLAfterElement(playerWindowSelector, ui);
        uiIsAfterPlayerElement = true;
        uiIsAtBottomOfContentSeparator = false;
    }
    //if the main container isn't as big as the player window, move the UI to
    //the bottom of the content-separator so it'll fit within the container.
    if((containerWidth > playerWidth) && !uiIsAtBottomOfContentSeparator){
        var ui = $(mainPanelSelector).detach();
        insertHTMLAtBottomOfElement("#content-separator", ui);
        uiIsAtBottomOfContentSeparator = true;
        uiIsAfterPlayerElement = false;
    }

}
function changeUIDependingOnCurrentState(){
    blockOrShowUIDependingOnAdStatus();
    resizeUIToFitPlayer();
    changePageToFitUI();
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