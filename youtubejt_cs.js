chrome.runtime.sendMessage({ action: "show" });

var html5VideoPlayer = function () {
    var innerPlayer = document.getElementsByTagName("video")[0];
    var getVideoDuration = function(){return Number(innerPlayer.duration);}
    var seekToTime = function (seconds) { innerPlayer.currentTime = seconds;}
    var goTo1_4thPoint = function () { seekToTime(getVideoDuration() * (1 / 4)); };
    var goTo2_4thPoint = function () { seekToTime(getVideoDuration() * (2 / 4)); };
    var goTo3_4thPoint = function () { seekToTime(getVideoDuration() * (3 / 4)); };
    var goTo30Point = function () { if (getVideoDuration() > 30) { seekToTime(getVideoDuration() - 30); } };
    return {
        goTo1_4thPoint: goTo1_4thPoint,
        goTo2_4thPoint: goTo2_4thPoint,
        goTo3_4thPoint: goTo3_4thPoint,
        goTo30Point: goTo30Point,
        seekToTime:seekToTime
    };
}();

var flashVideoPlayer = function () {
    var innerPlayer = document.getElementById("movie_player");
    var getVideoDuration = function(){return Number(innerPlayer.getDuration());}
    var seekToTime = function (seconds) { innerPlayer.seekTo(seconds);}
    var goTo1_4thPoint = function () { seekToTime(getVideoDuration() * (1 / 4)); };
    var goTo2_4thPoint = function () { seekToTime(getVideoDuration() * (2 / 4)); };
    var goTo3_4thPoint = function () { seekToTime(getVideoDuration() * (3 / 4)); };
    var goTo30Point = function () { if (getVideoDuration() > 30) { seekToTime(getVideoDuration() - 30); } };
    return {
        goTo1_4thPoint: goTo1_4thPoint,
        goTo2_4thPoint: goTo2_4thPoint,
        goTo3_4thPoint: goTo3_4thPoint,
        goTo30Point: goTo30Point,
        seekToTime: seekToTime
    };
}();

var getVideoPlayer = function () { return html5VideoPlayer;}
var videoPlayer = getVideoPlayer();

//alert("script running");
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action == "goTo1-4") {
        videoPlayer.goTo1_4thPoint();
    }
    if (request.action == "goTo2-4") {
        videoPlayer.goTo2_4thPoint();
    }
    if (request.action == "goTo3-4") {
        videoPlayer.goTo3_4thPoint();
    }
    if (request.action == "goTo30") {
        videoPlayer.goTo30Point();
    }
});