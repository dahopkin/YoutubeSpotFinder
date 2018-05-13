//TODO: change this to "getStorageModule" when done. It applies to more things now.
var getBookmarksModule = function(videoPlayer, idSource){
    var getItemsFromStorage = function(itemKeyValueRequestObject, itemHandlerCallback){
        chrome.storage.sync.get(itemKeyValueRequestObject, function(items) {
            itemHandlerCallback(items[key]);
          })
    };
    var setItemsInStorage = function(itemKeyValueSetObject, storageCompleteCallback){
        chrome.storage.sync.set(itemKeyValueSetObject, function(items) {
            storageCompleteCallback(items[key]);
          })
    };
    var getEmptyObjectDefaultForKey = function(key){
        var defaultObject = {};
        defaultObject[key] = {};
        return defaultObject;
    }
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
    var getVideoInfoData = function(callback){
        var videoID = idSource.getVideoID(currentTabURL);
        if(videoID){
            var key = idSource.getVideoInfoKey(videoID);
            var defaultObject = {};
            defaultObject[key] = {};
            chrome.storage.sync.get(defaultObject, function(items) {
                var infoForVideo = items[key];
                callback(infoForVideo);
              });
        }
    };
    var getBookmarkAndVideoInfoData = function(callback){
        var videoID = idSource.getVideoID(currentTabURL);
        if(videoID){
            var bookmarkKey = idSource.getBookmarkKey(videoID);
            var videoInfoKey = idSource.getVideoInfoKey(videoID);
            var defaultObject = {};
            defaultObject[bookmarkKey] = [];
            defaultObject[videoInfoKey] = {};
            chrome.storage.sync.get(defaultObject, function(items) {
                var bookmarksForVideo = items[bookmarkKey];
                var infoForVideo = items[videoInfoKey];
                callback(bookmarksForVideo, infoForVideo);
              });
        }
    };
    var getAllData = function(callback){
        chrome.storage.sync.get(null, function(items) {
            callback(items);
          });
    };
    var saveAllData = function(replacementData, callback){
        chrome.storage.sync.set(replacementData, function(items) {
            let actionResult = getActionResult();
            actionResult.setMessage("Data was saved successfully")
            callback(actionResult);
          });
    };
    let bookmarkTimeIsANumber = function(bookmark){
        
    }
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
    var saveDefaultBookmarkAndVideoInfo = function(callback){
        var defaultBookmark = {time:videoPlayer.getCurrentTime(), description: ""};
        defaultBookmark = formatBookmarkData(defaultBookmark);
        saveCustomBookmarkAndVideoInfo(defaultBookmark, callback);
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
    //Automatically save title if no title exists for the video.
    var saveCustomBookmarkAndVideoInfo = function(oneBookmarkData, callback){
        var videoID = idSource.getVideoID(currentTabURL);
        var saveResult = {status:"", message:""};
        if(videoID){
            var bookmarkKey = idSource.getBookmarkKey(videoID);
            var videoInfoKey = idSource.getVideoInfoKey(videoID);
            if(!singleBookmarkDataIsValid(oneBookmarkData)){
                saveResult["status"] = "failure";
                saveResult["message"] = "Please check to see that the time you entered isn't more than the duration of the video, and that the description is less than 100 characters.";
                callback(saveResult);
            }else{
                getBookmarkAndVideoInfoData(function(bookmarkArray, videoInfo){
                    bookmarkArray.push(oneBookmarkData);
                    var videoTitle = videoInfo.title;
                    var videoTitleChanged = false;
                    if(!videoTitle || videoTitle.trim() === ""){
                        videoTitle = idSource.getVideoTitle();
                        videoTitleChanged = true;
                    }
                    var saveObject = {};
                    saveObject[bookmarkKey] = bookmarkArray;
                    if(videoTitleChanged){saveObject[videoInfoKey] = {title:videoTitle};}
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
    var getValidBookmarksFromBookmarkArray = function(bookmarkArray){
        for (let index = bookmarkArray.length; index >= 0; index--) {
            let currentElement = bookmarkArray[index];
        }
    };
    var overwriteInternalWithExternalData = function(internalData, externalData){
        /*for each key in the external data*/
        for(var externalKey in externalData){
            //if the key is a valid bookmark or video info key, validate the new data
            // then overwrite the old data
            if(idSource.isValidBookmarkKey(externalKey)){
                internalData[externalKey] = externalData[externalKey];
            } else if(idSource.isValidVideoInfoKey(externalKey)){
                internalData[externalKey] = externalData[externalKey];
            }
        }
        return internalData;
    };
    var importExternalData = function(fileData, callback){
        let actionResult = getActionResult();
        let jsonData = undefined;
        try {
            jsonData = JSON.parse(fileData);
        } catch (error) {
            actionResult.addToErrors("invalid-data", error)
            actionResult.setMessage("The data is invalid");
            callback(actionResult);
            return;
        }
        //get all data from storage.
        getAllData(function(allData){
            allData = overwriteInternalWithExternalData(allData, jsonData);
            saveAllData(allData, callback);
        })

    };
    return {
        getBookmarkData:getBookmarkData,
        saveDefaultBookmark:saveDefaultBookmark,
        saveCustomBookmark:saveCustomBookmark,
        saveCustomBookmarkAndVideoInfo: saveCustomBookmarkAndVideoInfo,
        saveDefaultBookmarkAndVideoInfo:saveDefaultBookmarkAndVideoInfo,
        deleteBookmark:deleteBookmark,
        updateBookmark:updateBookmark,
        importExternalData:importExternalData
    };
};