//the videoPlayer should have an interface including:
//seekToTime - a method to go to a certain time.
//getVideoDuration - a method to get a video's duration.
var getBinarySearcher = function (videoPlayer) {
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
};