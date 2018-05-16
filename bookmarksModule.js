//TODO: change this to "getStorageModule" when done. It applies to more things now.
var getBookmarksModule = function(videoPlayer, idSource){
    var storageArea = chrome.storage.sync;
    var getItemOrBlankObjectIfItemIsNotObject = function(item){
        if(!isObject(item)) return {};
        return item;
    }
    var getItemsFromStorage = function(itemKeyValueRequestObject, itemHandlerCallback){
        storageArea.get(itemKeyValueRequestObject, function(items) {
            itemHandlerCallback(items[key]);
          })
    };
    var setItemsInStorage = function(itemKeyValueSetObject, storageCompleteCallback){
        storageArea.set(itemKeyValueSetObject, function(items) {
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
        getBookmarksByID(videoID, callback);
    };
    var getBookmarksByID = function(videoID, callback){
        var videoID = videoID || idSource.getVideoID(currentTabURL);
        if(videoID){
            var key = idSource.getVideoDataKey(videoID);
            var defaultObject = {};
            defaultObject[key] = {};
            defaultObject[key]["bookmarks"] = {};
            storageArea.get(defaultObject, function(items) {
                var bookmarksForVideo = items[key]["bookmarks"];
                bookmarksForVideo = getItemOrBlankObjectIfItemIsNotObject(bookmarksForVideo);
                callback(bookmarksForVideo);
              });
        }
    };
    var getBookmarkByIDAndTime = function(videoID, time, callback){
        var videoID = videoID || idSource.getVideoID(currentTabURL);
        if(videoID){
            var key = idSource.getVideoDataKey(videoID);
            var defaultObject = {};
            defaultObject[key] = {};
            defaultObject[key]["bookmarks"] = {};
            defaultObject[key]["bookmarks"][time.toString()] = {};
            storageArea.get(defaultObject, function(items) {
                var bookmark = items[key]["bookmarks"][time.toString()];
                bookmark = getItemOrBlankObjectIfItemIsNotObject(bookmark);
                callback(bookmark);
              });
        }
    };

    var getVideoInfoData = function(callback){
        var videoID = idSource.getVideoID(currentTabURL);
        if(videoID){
            var key = idSource.getVideoDataKey(videoID);
            var defaultObject = {};
            defaultObject[key] = {};
            defaultObject[key]["info"] = {};
            storageArea.get(defaultObject, function(items) {
                var infoForVideo = items[key]["info"];
                callback(infoForVideo);
              });
        }
    };

    var getBookmarkAndVideoInfoData = function(callback){
        var videoID = idSource.getVideoID(currentTabURL);
        getBookmarkAndVideoInfoDataByID(videoID, callback);
    };
    var getBookmarkAndVideoInfoDataByID = function(videoID, callback){
        var videoID = videoID || idSource.getVideoID(currentTabURL);
        if(videoID){
            var videoDataKey = idSource.getVideoDataKey(videoID);
            var defaultObject = {};
            defaultObject[videoDataKey] = {};
            storageArea.get(defaultObject, function(items) {
                var bookmarksForVideo = items[videoDataKey]["bookmarks"] || {};
                var infoForVideo = items[videoDataKey]["info"] || {};
                bookmarksForVideo = getItemOrBlankObjectIfItemIsNotObject(bookmarksForVideo);
                callback(bookmarksForVideo, infoForVideo);
              });
        }
    };
    var getAllData = function(callback){
        storageArea.get(null, function(items) {
            callback(items);
          });
    };
    var saveAllData = function(replacementData, callback){
        storageArea.set(replacementData, function(items) {
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
    var singleBookmarkDataIsValid = function(singleBookmarkData){
        return true;
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
                    storageArea.set(saveObject, function(items) {
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
    var addBookmarkToBookmarkListObject = function(bookmark, bookmarkListObject){
        bookmarkListObject = getItemOrBlankObjectIfItemIsNotObject(bookmarkListObject);
        bookmarkKey = `${bookmark.time.toString()}`
        bookmarkListObject[bookmarkKey] = bookmark;
        return bookmarkListObject;
    }

    var getCorrectVideoInfoFromSuggestionAndData = function(suggestedTitle, videoInfo){
        if(isNullOrUndefined(videoInfo)){videoInfo = {}};
        var videoTitle = videoInfo["title"];
        //overwrite title if it's blank from being undefined or saved blank somehow.    
        if(isNullOrUndefined(videoTitle) || videoTitle.trim() === ""){
                videoTitle = suggestedTitle;
                videoInfo["title"] = videoTitle;
        }
        return videoInfo;
    }
    var setBookmarkAndVideoInfoInStorage = function(dataKey, bookmarks, videoInfo, callback){
        var saveObject = {};
        saveObject[dataKey] = {};
        var saveSubObject = {};
        saveSubObject["bookmarks"] = bookmarks;
        saveSubObject["info"] = videoInfo;
        saveObject[dataKey] = saveSubObject;
        storageArea.set(saveObject, function(items) {
            let saveResult = {};
            saveResult["status"] = "success";
            saveResult["message"] = "Your bookmark was saved successfully.";
            callback(saveResult);
        });
    };

    var saveCustomBookmarkAndVideoInfo = function(oneBookmarkData, callback){
        var videoID = idSource.getVideoID(currentTabURL);
        saveCustomBookmarkAndVideoInfoByID(videoID, oneBookmarkData, callback);
    };
    var saveCustomBookmarkAndVideoInfoByID = function(videoID, oneBookmarkData, callback){
        var videoID = videoID || idSource.getVideoID(currentTabURL);
        var saveResult = {status:"", message:""};
        if(videoID){
            var dataKey = idSource.getVideoDataKey(videoID);
            var bookmarkKey = idSource.getBookmarkKey(videoID);
            var videoInfoKey = idSource.getVideoInfoKey(videoID);
            if(!singleBookmarkDataIsValid(oneBookmarkData)){
                saveResult["status"] = "failure";
                saveResult["message"] = "Please check to see that the time you entered isn't more than the duration of the video, and that the description is less than 100 characters.";
                callback(saveResult);
            }else{
                getBookmarkAndVideoInfoDataByID(videoID,function(bookmarkArray, videoInfo){
                    bookmarkArray = addBookmarkToBookmarkListObject(oneBookmarkData, bookmarkArray)
                    videoInfo = getCorrectVideoInfoFromSuggestionAndData(idSource.getVideoTitle(), videoInfo);
                    setBookmarkAndVideoInfoInStorage(dataKey, bookmarkArray, videoInfo, callback);
                });
            }
        } else{
            saveResult["status"] = "failure";
            saveResult["message"] = "You cannot save bookmarks on this page.";
        }
    };
    var updateBookmark = function(bookmarkTime, oneBookmarkData, callback){ 
        saveCustomBookmarkAndVideoInfo(oneBookmarkData, callback);
    };
    var updateBookmarkByID = function(videoID, bookmarkTime, oneBookmarkData, callback){ 
        saveCustomBookmarkAndVideoInfoByID(videoID, oneBookmarkData, callback);
    };
    var deleteBookmarkByTimeFromBookmarkListObject = function(bookmarkListObject, bookmarkTime){
        bookmarkListObject = getItemOrBlankObjectIfItemIsNotObject(bookmarkListObject);
        if(typeof bookmarkListObject[bookmarkTime.toString()] !== "undefined"){
            delete bookmarkListObject[bookmarkTime.toString()];
        }
        return bookmarkListObject;
    }

    var deleteBookmark = function(bookmarkTime, callback){
        var videoID = idSource.getVideoID(currentTabURL);
        deleteBookmarkByIDAndTime(videoID, bookmarkTime, callback);
    };
    var deleteBookmarkByIDAndTime = function(videoID, bookmarkTime, callback){
        var videoID = videoID || idSource.getVideoID(currentTabURL);
        var saveResult = {status:"", message:""};
        if(videoID){
            //var key = idSource.getBookmarkKey(videoID);
            var key = idSource.getVideoDataKey(videoID);
                getBookmarkAndVideoInfoDataByID(videoID, function(bookmarkObjectList, videoInfo){
                    let successFunction = function(saveResult){
                        saveResult = saveResult || {};
                        saveResult["status"] = "success";
                        saveResult["message"] = "Your bookmark was deleted successfully.";
                        callback(saveResult);
                    }
                    bookmarkObjectList = deleteBookmarkByTimeFromBookmarkListObject(bookmarkObjectList, bookmarkTime);
                    if(isEmpty(bookmarkObjectList)){
                        storageArea.remove([key], successFunction);
                    } else{
                        setBookmarkAndVideoInfoInStorage(key, bookmarkObjectList, videoInfo, successFunction);
                    }
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
            if(idSource.isValidVideoDataKey(externalKey)){
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
        updateBookmarkByID,updateBookmarkByID,
        importExternalData:importExternalData,
        getAllData:getAllData,
        getBookmarksByID:getBookmarksByID,
        getBookmarkByIDAndTime:getBookmarkByIDAndTime,
        deleteBookmarkByIDAndTime:deleteBookmarkByIDAndTime,
        saveCustomBookmarkAndVideoInfoByID:saveCustomBookmarkAndVideoInfoByID,
    };
};