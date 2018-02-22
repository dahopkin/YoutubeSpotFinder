var getBookmarksModule = function(videoPlayer, idSource){
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
};