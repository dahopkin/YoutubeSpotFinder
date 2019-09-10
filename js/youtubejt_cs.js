
var currentTabURL = window.location.href;
var pubSub = new PubSub();

var getDecimalPercentage = function(percentage){
    percentage = Number(percentage);
    if(percentage >= 0 && percentage <= 1){ return percentage; }
    return percentage / 100;
};
var pageHasHTML5Video = function(){return typeof(document.getElementsByTagName("video")[0]) !== 'undefined';}

var getHtml5VideoObject = function (pubSub, videoDomElement) {
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
    let pubSubEvents = new PubSubEventList();
    let setUpEvents = function(){
        pubSubEvents.addEventToList("durationRequested", getVideoDuration);
        pubSubEvents.addEventToList("currentTimeRequested", getCurrentTime);
        pubSubEvents.addEventToList("goToTime", function(data){seekToTime(data.time)});
        pubSubEvents.addEventToList("goToPercentage", function(data){seekToPercentage(data.percentage)});
        pubSubEvents.addEventToList("rewind", function(data){rewind(data.seconds)});
        pubSubEvents.addEventToList("fastForward", function(data){fastForward(data.seconds)});
        pubSubEvents.resetEventsInPubSub(pubSub);

    }
    setUpEvents();
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

var html5VideoPlayer = getHtml5VideoObject(pubSub);
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

var youtubeIDSource = getYoutubeIDSource();

/*TODO: Figure out a solution for this; 
the check for seeing if the page has html5 video might fail, 
but using an html5 player anyway turns out fine. 
Might be because I'm retrieving the dom element constantly.*/
var youtubeVideoPlayer = function(){
    if(pageHasHTML5Video()) return html5VideoPlayer;
    //if(pageHasFlashVideo()) return flashVideoPlayer;
    return html5VideoPlayer;
}();

var appInfo;
var setAppInfo = function(bookmarkData){
    appInfo = {
        "binarySearchStatusInfo":binarySearcher.getBinarySearchStatus(),
        "bookmarkInfo":bookmarkData,
        "isPlaying":videoPlayer.isPlaying()
    };
    pubSub.emit("appInfoChanged", appInfo);
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
        //insertHTMLAfterElement("#player.style-scope.ytd-watch", html); //pushes down the items to the side.
        //insertHTMLAfterElement("#content-separator", html); //further down the page in theater mode.
        //insertHTMLAtBottomOfElement("#player-container", html) //appears behind other elements.
        //insertHTMLAtBottomOfElement("#content-separator", html); //further down the page in theater mode.
        insertHTMLBeforeElement("#info", html);//works for now
        //insertHTMLAfterElement("#player", html);//new test with flexy
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
var constantUICheck, mutationObserver;
function resetAdWatchUICheckInterval(){
    clearInterval(constantUICheck);
    constantUICheck = setInterval(changeUIPropertiesDependingOnCurrentState, 450);
}
function setupMutationObserverForAdWatch(){
    var observer = new MutationObserver(function(mutations){
        mutations.forEach(function(mutation){
            console.log(mutation);
            blockOrShowUIDependingOnAdStatus();
        });
    });
    observer.observe(document.getElementsByClassName("html5-video-player")[0], {attributes:true, childList:true});
}
function resetWindowResizeUIChangeEvents(){
    let theaterModeSelector = ".ytp-size-button";
    let changeFunction = changeUIPropertiesDependingOnCurrentState
    $(window).off("resize.ui", changeFunction);
    $(document).off("click.ui", theaterModeSelector, changeFunction);
    $(window).on("resize.ui", changeFunction);
    $(document).on("click.ui", theaterModeSelector, changeFunction);
}
function resetPubSubEvent(eventName, eventFunction){
    pubSub.off(eventName, eventFunction);
    pubSub.on(eventName, eventFunction);
}
function resetPubSubEvents(){
    resetPubSubEvent("bookmarksRetrieved", setAppInfo);
    //resetPubSubEvent("bookmarkUpdated", setAppInfo);
    //resetPubSubEvent("bookmarkCreated", setAppInfo);
    //resetPubSubEvent("bookmarkDeleted", setAppInfo);
    resetPubSubEvent("appInfoChanged", setPageDom);
}
function requestBookmarks(){pubSub.emit("bookmarksRequestedFromPage", {})}
let spotFinderView, bookmarkListView, bookmarkEditPopup, shareLinkPopup, deletePopup;
function setViewElements(pubSub){
    spotFinderView = getSpotFinderView(pubSub);
    bookmarkListView = getBookmarkListView(pubSub);
    deletePopup = getDeletePopup(pubSub, "#delete-panel");
}
function initialize() {
    pubSub = new PubSub();
    chrome.runtime.sendMessage({ action: "show" });
    idSource = youtubeIDSource;
    //videoPlayer = youtubeVideoPlayer;
    videoPlayer = getHtml5VideoObject(pubSub);
    binarySearcher = getBinarySearcher(pubSub);
    //bookmarks = getBookmarksModule(videoPlayer, idSource);
    bookmarks = getBookmarksModuleEventBased(pubSub, videoPlayer, idSource);
    embedUIOnPage(function () {
        // spotFinderView = getSpotFinderView(pubSub);
        // bookmarkListView = getBookmarkListView(pubSub);
        setViewElements(pubSub);
        resetPubSubEvents();
        changeUIPropertiesDependingOnCurrentState();
        resetAdWatchUICheckInterval();
        requestBookmarks();
        binarySearcher.emitChangeEvent();
        //setAppInfo(setPageDom);
    });
}
var playerWindowSelector = "#player.style-scope.ytd-watch";
var mainPanelSelector = ".yjt-html";
function getPlayerWindowElement(){return $(playerWindowSelector);}
function resizeUIToFitPlayer(){
    var $playerWindowElement = $(playerWindowSelector);
    var playerWidth = $playerWindowElement.outerWidth();
    var desiredWidth = playerWidth;
    $(".yjt-html").css({width:desiredWidth});
}
function changePageToFitUI(){
    var $playerWindowElement = $(playerWindowSelector);
    if($playerWindowElement.css("margin-bottom") == 0) return;
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
// function initializeWhenElementIsLoaded(){
//     $(window).on("load", function() { 
//         waitForElementToDisplay("#info", 500, initialize);
//     });
// }
// function getSpotFinderView(pubSub, selector){
//     var selector = selector || "#before-after-section";
//     let $mainEl = $(selector);
//     let $startStopButton = $mainEl.find("#startOrStop")
//     let $goLeftButton = $mainEl.find("#goLeft");
//     let $goRightButton = $mainEl.find("#goRight");
//     let $undoButton = $mainEl.find("#undo");
//     let $leftRightButtons = $mainEl.find("#goLeft, #goRight");
//     let $progressBarOuter = $mainEl.find(".progress-outer");
//     let $progressBarInner = $mainEl.find(".progress-inner");
//     let $progressBarMid = $mainEl.find(".progress-mid");

//     let disableButton = function($buttonEl){
//         $buttonEl.prop("disabled",true).addClass("btn-disabled");
//     }
//     let enableButton = function($buttonEl){
//         $buttonEl.prop("disabled",false).removeClass("btn-disabled");
//     }
//     let setUndoButtonDom = function(binarySearchStatusInfo){
//         if(binarySearchStatusInfo.isRunning && binarySearchStatusInfo.canUndoLastStep){
//             enableButton($undoButton);
//         } else{
//             disableButton($undoButton);
//         }
//     }
//     let setProgressBarDom = function(binarySearchStatusInfo){
//         if(binarySearchStatusInfo.isRunning){
//             $progressBarOuter.show();
//             var progressBarWidth = $progressBarOuter.width();
//             var start = binarySearchStatusInfo.start;
//             var end = binarySearchStatusInfo.end;
//             var mid = binarySearchStatusInfo.mid;
//             var duration = binarySearchStatusInfo.duration;
//             var difference = end - start;
//             var differencePercentage = difference/duration;
//             var startOnProgressPercentage = start/duration;
//             var midPercentage = mid/duration;
//             var startLeftMid = midPercentage * progressBarWidth;
//             var startLeft = startOnProgressPercentage * progressBarWidth;
//             var innerProgressWidth = differencePercentage * progressBarWidth;
//             $progressBarInner.css({width:innerProgressWidth, left:startLeft});
//             $progressBarMid.css({left:startLeftMid});
//         } else{
//             $progressBarOuter.hide();
//         }
//     }
//     let render = function (binarySearchStatusInfo){
//         if(binarySearchStatusInfo){
//             if(binarySearchStatusInfo.isRunning){
//                 $startStopButton.text("Stop").removeClass("btn-blue").addClass("btn-red");
//                 $startStopButton.attr("tooltip", "Stop spot finding.");
//                 enableButton($leftRightButtons);
//             } else{
//                 $startStopButton.text("Find").removeClass("btn-red").addClass("btn-blue");
//                 $startStopButton.attr("tooltip", "Start finding your spot.");
//                 disableButton($leftRightButtons);
//             }
//         }
//         setUndoButtonDom(binarySearchStatusInfo);
//         setProgressBarDom(binarySearchStatusInfo);
//     }
//     let eventList = new jQEventList();
//     let requestStartOrStop = function(){
//         pubSub.emit("startOrStopSearch", {});
//     }
//     let requestGoLeft = function(){
//         pubSub.emit("goLeft", {});
//     }
//     let requestGoRight = function(){
//         pubSub.emit("goRight", {});
//     }
//     let requestUndo = function(){
//         pubSub.emit("undo", {});
//     }
//     let setUpEvents = function(){
//         pubSub.reset("binarySearchDataChanged", render);
//         eventList.addEventToList($startStopButton, "click.startstop",requestStartOrStop);
//         eventList.addEventToList($goLeftButton, "click.goleft",requestGoLeft);
//         eventList.addEventToList($goRightButton, "click.goright",requestGoRight);
//         eventList.addEventToList($undoButton, "click.undo",requestUndo);
//         eventList.resetEvents();
//     }
//     let init = function(){
//         setUpEvents();
//     }
//     init();
//     return {render:render};
// }

// function getBookmarkListView(pubSub, selector){
//     var selector = selector || "#bookmark-section";
//     //var selector = selector || "#bookmark-table";
//     let $mainEl = $(selector);
//     let $tableEl = $mainEl.find("#bookmark-table");
//     //let $editButtons = $(".edit-button");
//     //let $shareButtons = $(".share-button");
//     let bookmarks = {};
//     let eventList = new jQEventList();
//     let requestStartOrStop = function(){
//         pubSub.emit("startOrStopSearch", {});
//     }
//     let requestGoLeft = function(){
//         pubSub.emit("goLeft", {});
//     }
//     let requestGoRight = function(){
//         pubSub.emit("goRight", {});
//     }
//     let requestUndo = function(){
//         pubSub.emit("undo", {});
//     }
//     let getBookmarkArrayFromBookmarkListObject = function(bookmarkListObject){
//         let bookmarkArray = [];
//         for (const key in bookmarkListObject) {
//             if (bookmarkListObject.hasOwnProperty(key)) {
//                 const element = bookmarkListObject[key];
//                 if(isNullOrUndefined(element.time)){continue;}
//                 bookmarkArray.push(element);
//             }
//         }
//         return bookmarkArray;
//     }
//     let getHTMLFromBookmark = function(bookmark){
//         let time = bookmark.time;
//         time = escapeHTMLString(time);
//         let bookmarkHasNoDescription = bookmark.description == ""
//         let description = bookmarkHasNoDescription ? "No Description" : bookmark.description;
//         let descriptionClass = bookmarkHasNoDescription ? "no-description" : "";
//         let formattedTime = hhmmss(bookmark.time);
//         let html = `<tr class="bookmark-row">
//     <td><a class='time-link' data-time='${time}'>${escapeHTMLString(formattedTime)}</a></td>
//     <td><span class='description ${descriptionClass}' data-time='${time}'>${escapeHTMLString(description)}</span></td>
//     <td><button data-time='${time}' class='edit-button btn btn-small btn-primary'>Edit</button></td>
//     <td><button data-time='${time}' class='show-delete-button btn btn-small btn-primary'>Delete</button></td>
//     <td><button data-time='${time}' class='share-button btn btn-small btn-primary'>Share</button></td>
//     <tr>`;
//     return html;
//     }
//     let getTableContentsFromBookmarks = function(bookmarkInfo) {
//         bookmarkInfo = getBookmarkArrayFromBookmarkListObject(bookmarkInfo);
//         var currentBookmark, html, time, formattedTime, description;
//         html = "";
//         if (isEmpty(bookmarkInfo)) {
//             html += "<tr><td class='note'>No bookmarked times for this video.</td><tr>";
//             return html;
//         } else {
//             for (var i = 0; i < bookmarkInfo.length; i++) {
//                 currentBookmark = bookmarkInfo[i];
//                 if (i === 0) {
//                     html += `<tr><th>Go To</th><th>Description</th><th>Actions</th><tr>`;
//                 }
//                 currentBookmark = bookmarkInfo[i];
//                 html += getHTMLFromBookmark(currentBookmark);
//             }
//         }
//         return $.parseHTML(html);
        
//     }
//     let getBookmarkFromDataViewBookmarks = function(time){
//         return bookmarks[time.toString()];
//     }
//     let bookmarkRowSelector = ".bookmark-row";
//     let showCreateBookmarkForm = function(e){
//         e.preventDefault();
//         var time = $(this).data("time");
//         var bookmarkData = {time: Math.floor(videoPlayer.getCurrentTime()), description:""};
//         if(!bookmarkData){ return; }
//         let bookmarkChangePopup = getBookmarkChangePopup(pubSub, "#bookmark-edit-section");
//         pubSub.emit("showCreateBookmarkForm",{mode:"create", "bookmark":bookmarkData});
//     }
//     let showUpdateBookmarkForm = function(e){
//         e.preventDefault();
//         var time = $(this).data("time");
//         var bookmarkData = getBookmarkFromDataViewBookmarks(time);
//         if(!bookmarkData){ return; }
//         let bookmarkChangePopup = getBookmarkChangePopup(pubSub, "#bookmark-edit-section", $(this).closest(bookmarkRowSelector));
//         pubSub.emit("showUpdateBookmarkForm",{oldTime:time, mode:"edit", "bookmark":bookmarkData});
//     }
//     let showShareButtonDialog = function(e){
//         e.preventDefault();
//         var time = $(this).data("time");
//         var videoID = youtubeIDSource.getVideoID();
//         var link = getTimeLink(videoID, time);
//         shareLinkPopup = getShareLinkPopup("#share-link", $(this).closest(bookmarkRowSelector));
//         shareLinkPopup.setLink(link);
//         shareLinkPopup.show(); 
//     }
//     let goToTime = function(e){
//         e.preventDefault();
//         var time = $(this).data("time");
//         videoPlayer.seekToTime(time);
//     };
//    let showDeleteBookmarkDialog = function(e){
//         e.preventDefault();
//         var time = $(this).data("time");
//         let deletePopup = getDeletePopup(pubSub, "#delete-panel", $(this).closest(".bookmark-row"));
//         pubSub.emit("showDeleteBookmarkForm",{time:time});
//     }
//     //$(document).on("click.showsavebookmark", '#showSaveBookmark', showCreateBookmarkForm);
//     //$(document).on("click.edit", ".edit-button", showUpdateBookmarkForm);
//     //$(document).on("click.share", ".share-button", showShareButtonDialog);
//     let setUpEvents = function(){
//         pubSub.reset("bookmarksRetrieved", render);
//         eventList.addEventToList($tableEl, "click.showsavebookmark",showCreateBookmarkForm, "#showSaveBookmark");
//         eventList.addEventToList($tableEl, "click.edit",showUpdateBookmarkForm, ".edit-button");
//         eventList.addEventToList($tableEl, "click.share",showShareButtonDialog, ".share-button");
//         eventList.addEventToList($tableEl, "click.showdelete",showDeleteBookmarkDialog, ".show-delete-button");
//         eventList.addEventToList($tableEl, "click.gototime",goToTime, ".time-link");
//         eventList.resetEvents();
//     }
//     let render = function(bookmarkData){
//         bookmarks = bookmarkData;
//         $tableEl.html(getTableContentsFromBookmarks(bookmarks));
//     }
//     let init = function(){
//         setUpEvents();
//     }
//     init();
//     return {render:render};
// }
function setPageDom(newAppInfo){
    appInfo = newAppInfo || appInfo;
    //setBookmarkDom(appInfo.bookmarkInfo);
}

// function getBookmarkArrayFromBookmarkListObject(bookmarkListObject){
//     let bookmarkArray = [];
//     for (const key in bookmarkListObject) {
//         if (bookmarkListObject.hasOwnProperty(key)) {
//             const element = bookmarkListObject[key];
//             if(isNullOrUndefined(element.time)){continue;}
//             bookmarkArray.push(element);
//         }
//     }
//     return bookmarkArray;
// }
// function getHTMLFromBookmark(bookmark){
//             let time = bookmark.time;
//             time = escapeHTMLString(time);
//             let bookmarkHasNoDescription = bookmark.description == ""
//             let description = bookmarkHasNoDescription ? "No Description" : bookmark.description;
//             let descriptionClass = bookmarkHasNoDescription ? "no-description" : "";
//             let formattedTime = hhmmss(bookmark.time);
//             let html = `<tr class="bookmark-row">
//         <td><a class='time-link' data-time='${time}'>${escapeHTMLString(formattedTime)}</a></td>
//         <td><span class='description ${descriptionClass}' data-time='${time}'>${escapeHTMLString(description)}</span></td>
//         <td><button data-time='${time}' class='edit-button btn btn-small btn-primary'>Edit</button></td>
//         <td><button data-time='${time}' class='show-delete-button btn btn-small btn-primary'>Delete</button></td>
//         <td><button data-time='${time}' class='share-button btn btn-small btn-primary'>Share</button></td>
//         <tr>`;
//         return html;
// }
// function getTableContentsFromBookmarks(bookmarkInfo) {
//     bookmarkInfo = getBookmarkArrayFromBookmarkListObject(bookmarkInfo);
//     var currentBookmark, html, time, formattedTime, description;
//     html = "";
//     if (isEmpty(bookmarkInfo)) {
//         html += "<tr><td class='note'>No bookmarked times for this video.</td><tr>";
//         return html;
//     } else {
//         for (var i = 0; i < bookmarkInfo.length; i++) {
//             currentBookmark = bookmarkInfo[i];
//             if (i === 0) {
//                 html += `<tr><th>Go To</th><th>Description</th><th>Actions</th><tr>`;
//             }
//             currentBookmark = bookmarkInfo[i];
//             html += getHTMLFromBookmark(currentBookmark);
//         }
//     }
//     return $.parseHTML(html);
// }

function setBookmarkDom(bookmarkInfo){
    //$('#description').val("");
    //$('#time').text('');
    //$('#bookmark-table').html(getTableContentsFromBookmarks(bookmarkInfo));
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
        playerWindowIsInTheaterMode = $playerSizeButtonDescription.toLowerCase() == "default mode"
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
function changeUIPropertiesDependingOnCurrentState(){
    blockOrShowUIDependingOnAdStatus();
    moveUIDependingOnContainerStatus();
    resizeUIToFitPlayer();
    changePageToFitUI();
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action == "change") {
        currentTabURL = request.data.url;
        if (isAVideoWatchPage(request.data.url)) {
            waitForElementToDisplay("#items", 250, initialize);
        } else {
            chrome.runtime.sendMessage({ action: "hide" });
        }
    } 
    return true;
});