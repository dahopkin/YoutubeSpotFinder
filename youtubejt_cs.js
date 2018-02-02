chrome.runtime.sendMessage({ action: "show" });

var getVideoPlayerButtonFunctionObject = function (videoObject) {
    var seekToTime = videoObject.seekToTime;
    var getVideoDuration = videoObject.getVideoDuration;
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
        getVideoDuration: getVideoDuration
    };
};
var html5VideoObject = function () {
    var innerPlayer = document.getElementsByTagName("video")[0];
    var getVideoDuration = function () { return Number(innerPlayer.duration); }
    var seekToTime = function (seconds) { innerPlayer.currentTime = seconds; }
    return {
        seekToTime: seekToTime,
        getVideoDuration: getVideoDuration
    };
}();

var html5VideoPlayer = function () {
    return getVideoPlayerButtonFunctionObject(html5VideoObject);
}();

var flashVideoObject = function () {
    var innerPlayer = document.getElementById("movie_player");
    var getVideoDuration = function () { return Number(innerPlayer.getDuration()); }
    var seekToTime = function (seconds) { innerPlayer.seekTo(seconds); }
    return {
        seekToTime: seekToTime,
        getVideoDuration: getVideoDuration
    };
}();

var flashVideoPlayer = function () {
    return getVideoPlayerButtonFunctionObject(flashVideoObject);
}();

var getVideoPlayer = function () { return html5VideoPlayer; }

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
        return { isRunning : isRunning};
    }
    return {
        startOrStop: startOrStop,
        goLeft: goLeft,
        goRight: goRight,
        getBinarySearchStatus: getBinarySearchStatus

    };
}(videoPlayer);

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
    if (request.action == "startOrStop") {
        binarySearcher.startOrStop();
    }
    if (request.action == "goLeft") {
        binarySearcher.goLeft();
    }
    if (request.action == "goRight") {
        binarySearcher.goRight();
    }
    if (request.action == "start") { }
    sendResponse(binarySearcher.getBinarySearchStatus());

});