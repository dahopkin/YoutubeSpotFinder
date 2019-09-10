//the videoPlayer should have an interface including:
//seekToTime - a method to go to a certain time.
//getVideoDuration - a method to get a video's duration.
//var getBinarySearcher = function (pubSub, videoPlayer) {
var getBinarySearcher = function (pubSub) {
    var isRunning = false;
    var start, end, mid;
    var calculateMid = function () { mid = (start + end) / 2; }
    var searchHistory = [];
    var saveCurrentStatusToSearchHistory = function(){
        searchHistory.push({start:start, mid:mid, end:end});
    };
    var clearSearchHistory = function(){searchHistory = [];}
    var setStatusFromStatusObject = function(statusObject){
        start = statusObject.start;
        mid = statusObject.mid;
        end = statusObject.end;
    };
    var searchHistoryIsEmpty = function(){
        return searchHistory.length == 0;
    };
    var setStartEndAndMidToDefault = function () {
        start = 0;
        end = videoPlayer.getVideoDuration();
        calculateMid();
    }
    var resetBinarySearcher = function () {
        setStartEndAndMidToDefault();
        clearSearchHistory();
        isRunning = false;
        emitChangeEvent();
    };
    var startBinarySearcher = function () {
        setStartEndAndMidToDefault();
        isRunning = true;
        goToMid();
        emitChangeEvent();
    }
    var goToMid = function () { 
        //videoPlayer.seekToTime(mid); 
        pubSub.emit("goToTime", {time:mid});
    }
    var startOrStop = function () {
        if (isRunning) { resetBinarySearcher(); }
        else {
            startBinarySearcher();
        }
    }
    var shouldEndNow = function () { return start > end; }
    var endSearchIfNoMoreValidTimes = function(){
        if (shouldEndNow()) {resetBinarySearcher();}
    };
    var setStartAfterMiddle = function(){start = mid + 1;};
    var setEndBeforeMiddle = function(){end = mid - 1;};
    var emitChangeEvent = function(){
        pubSub.emit("binarySearchDataChanged", getBinarySearchStatus());
    }
    var changeStartOrEndAndJumpToMiddle = function (startOrEndChangeFunction) {
        if (!isRunning) { return; }
        saveCurrentStatusToSearchHistory();
        startOrEndChangeFunction();
        calculateMid();
        goToMid();
        endSearchIfNoMoreValidTimes();
        emitChangeEvent()
    };
    var goLeft = function () {
        changeStartOrEndAndJumpToMiddle(setEndBeforeMiddle);  
    };
    var goRight = function () {
        changeStartOrEndAndJumpToMiddle(setStartAfterMiddle);
    };
    var undoLastStep = function(){
        if(isRunning && !searchHistoryIsEmpty()){
            var lastStatusObject = searchHistory.pop();
            setStatusFromStatusObject(lastStatusObject);
            goToMid();
            endSearchIfNoMoreValidTimes();
            emitChangeEvent();
        }
    }
    var getBinarySearchStatus = function(){
        return { 
            isRunning : isRunning, 
            start:start, 
            end:end, 
            mid:mid, 
            duration:videoPlayer.getVideoDuration(),
            canUndoLastStep: !searchHistoryIsEmpty(),
          };
    };
    var pubSubEventList = new PubSubEventList();
    var setUpPubSubEvents = function(){
        pubSubEventList.addEventToList("undo", undoLastStep);
        pubSubEventList.addEventToList("goRight", goRight);
        pubSubEventList.addEventToList("goLeft", goLeft);
        pubSubEventList.addEventToList("startOrStopSearch", startOrStop);
        pubSubEventList.bindEventsToPubSub(pubSub);
    }();
    return {
        startOrStop: startOrStop,
        goLeft: goLeft,
        goRight: goRight,
        getBinarySearchStatus: getBinarySearchStatus,
        reset:resetBinarySearcher,
        undoLastStep:undoLastStep,
        emitChangeEvent:emitChangeEvent

    };
};