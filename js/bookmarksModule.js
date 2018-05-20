//TODO: change this to "getStorageModule" when done. It applies to more things now.
var getBookmarksModule = function(videoPlayer, idSource){
    var storageArea = chrome.storage.local;
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
    //remove doesn't get too deep. From my understanding you can't delete nested items
    var deleteItemsInStorage = function(keyArray, deleteComplete){
        storageArea.set(keyArray, function(items) {
            deleteComplete(items[key]);
          })
    };
    var getEmptyObjectDefaultForKey = function(key){
        var defaultObject = {};
        defaultObject[key] = {};
        return defaultObject;
    }
    var throwCustomErrorIfThereWasStorageError = function(){
        if (chrome.runtime.lastError) {
            var errorMsg = chrome.runtime.lastError.message;
            throw new AppError(errorMsg);
         }
    }
    var throwCustomErrorIfVideoIDIsInvalid = function(videoID){
        if (!videoID) { throw new AppError("Video ID is invalid."); }
    }
    var throwCustomErrorIfBookmarkIsInvalid = function(bookmark){
        if(!validators.bookmarkIsValid(bookmark)){ throw new AppError("The time must be a number."); }
    }
    function runCallbackWithActionResultError(callback, error){
        callback(new ActionResult({message:error.message, error:error}));
    }

    var getBookmarkData = function(callback){
        var videoID = idSource.getVideoID(currentTabURL);
        getBookmarksByID(videoID, callback);
    };
    var getBookmarksByID = function (videoID, callback) {
        try {
            var videoID = videoID || idSource.getVideoID(currentTabURL);
            if (videoID) {
                var key = idSource.getVideoDataKey(videoID);
                var defaultObject = {};
                defaultObject[key] = {};
                defaultObject[key]["bookmarks"] = {};
                storageArea.get(defaultObject, function (items) {
                    throwCustomErrorIfThereWasStorageError();
                    var bookmarksForVideo = items[key]["bookmarks"];
                    bookmarksForVideo = getItemOrBlankObjectIfItemIsNotObject(bookmarksForVideo);
                    callback(new ActionResult({data:bookmarksForVideo}));
                });
            }

        } catch (error) {
            runCallbackWithActionResultError(callback, error);
        }
    };
    var getBookmarkByIDAndTime = function(videoID, time, callback){
        try {
            var videoID = videoID || idSource.getVideoID(currentTabURL);
            throwCustomErrorIfVideoIDIsInvalid(videoID);
            //if(videoID){
            var key = idSource.getVideoDataKey(videoID);
            var defaultObject = {};
            defaultObject[key] = {};
            defaultObject[key]["bookmarks"] = {};
            defaultObject[key]["bookmarks"][time.toString()] = {};
            storageArea.get(defaultObject, function(items) {
                throwCustomErrorIfThereWasStorageError();
                var bookmark = items[key]["bookmarks"][time.toString()];
                bookmark = getItemOrBlankObjectIfItemIsNotObject(bookmark);
                callback(new ActionResult({data:bookmark}));
              });
        //}
        } catch (error) {
            runCallbackWithActionResultError(callback, error);
        }
        
    };

    var getVideoInfoData = function(callback){
        try {
            var videoID = idSource.getVideoID(currentTabURL);
            throwCustomErrorIfVideoIDIsInvalid(videoID);
            //if(videoID){
                var key = idSource.getVideoDataKey(videoID);
                var defaultObject = {};
                defaultObject[key] = {};
                defaultObject[key]["info"] = {};
                storageArea.get(defaultObject, function(items) {
                    throwCustomErrorIfThereWasStorageError();
                    var infoForVideo = items[key]["info"];
                    //callback(infoForVideo);
                    callback(new ActionResult({data:infoForVideo}));
                });
            //}
        } catch (error) {
            runCallbackWithActionResultError(callback, error);
        }
        
    };

    var getBookmarkAndVideoInfoData = function(callback){
        var videoID = idSource.getVideoID(currentTabURL);
        getBookmarkAndVideoInfoDataByID(videoID, callback);
    };
    var getBookmarkAndVideoInfoDataByID = function(videoID, callback){
        try {
            var videoID = videoID || idSource.getVideoID(currentTabURL);
                throwCustomErrorIfVideoIDIsInvalid(videoID);
                var videoDataKey = idSource.getVideoDataKey(videoID);
                var defaultObject = {};
                defaultObject[videoDataKey] = {};
                storageArea.get(defaultObject, function(items) {
                    throwCustomErrorIfThereWasStorageError();
                    var bookmarksForVideo = items[videoDataKey]["bookmarks"] || {};
                    var infoForVideo = items[videoDataKey]["info"] || {};
                    bookmarksForVideo = getItemOrBlankObjectIfItemIsNotObject(bookmarksForVideo);
                    callback(new ActionResult({data:{bookmarks: bookmarksForVideo, info: infoForVideo}}));
                  });
        } catch (error) {
            runCallbackWithActionResultError(callback, error);
        }
    };
    var getAllData = function(callback){
        try {
            storageArea.get(null, function(items) {
            throwCustomErrorIfThereWasStorageError();
            callback(new ActionResult({data:items}));
            });
            
        } catch (error) {
            runCallbackWithActionResultError(callback, error);
        }
    };
    var saveAllData = function(replacementData, callback){
        try {
        storageArea.set(replacementData, function(items) {
            throwCustomErrorIfThereWasStorageError();
            callback(new ActionResult({message:"Data was saved successfully."}));
          });
            
        } catch (error) {
            runCallbackWithActionResultError(callback,error);
        }
    };
    var formatBookmarkData = function(oneBookmarkData){
        var time = Math.floor(oneBookmarkData.time);
        var description = oneBookmarkData.description;
        return {time:time, description:description};
    }

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
        storageArea.set(saveObject, callback);
    };

    var saveCustomBookmarkAndVideoInfo = function(oneBookmarkData, callback){
        var videoID = idSource.getVideoID(currentTabURL);
        saveCustomBookmarkAndVideoInfoByID(videoID, oneBookmarkData, callback);
    };
    var saveCustomBookmarkAndVideoInfoByID = function (videoID, oneBookmarkData, callback) {
        try {
            var videoID = videoID || idSource.getVideoID(currentTabURL);
            throwCustomErrorIfVideoIDIsInvalid(videoID);
            //if(!validators.bookmarkIsValid(oneBookmarkData)){ throw new AppError("The time must be a number."); }
            throwCustomErrorIfBookmarkIsInvalid(oneBookmarkData);
            var dataKey = idSource.getVideoDataKey(videoID);
            getBookmarkAndVideoInfoDataByID(videoID, function (ActionResult) {
                let successFunction = function(){callback(ActionResult);}
                let bookmarkArray = ActionResult.data["bookmarks"];
                let videoInfo = ActionResult.data["info"];
                bookmarkArray = addBookmarkToBookmarkListObject(oneBookmarkData, bookmarkArray)
                videoInfo = getCorrectVideoInfoFromSuggestionAndData(idSource.getVideoTitle(), videoInfo);
                setBookmarkAndVideoInfoInStorage(dataKey, bookmarkArray, videoInfo, successFunction);
            });
        } catch (error) {
            runCallbackWithActionResultError(callback, error);
        }
    };
    var updateBookmark = function(bookmarkTime, oneBookmarkData, callback){ 
        videoID = idSource.getVideoID(currentTabURL);
        updateBookmarkByID(videoID, bookmarkTime, oneBookmarkData, callback);

    };
    var updateBookmarkByID = function (videoID, bookmarkTime, oneBookmarkData, callback) {
        try {
            var videoID = videoID || idSource.getVideoID(currentTabURL);
            throwCustomErrorIfVideoIDIsInvalid(videoID);
            //if (!validators.bookmarkIsValid(oneBookmarkData)) { throw new AppError("The time must be a number."); }
            throwCustomErrorIfBookmarkIsInvalid(oneBookmarkData);
            var key = idSource.getVideoDataKey(videoID);
            getBookmarkAndVideoInfoDataByID(videoID, function (ActionResult) {
                let bookmarkObjectList = ActionResult.data["bookmarks"];
                let videoInfo = ActionResult.data["info"];
                let successFunction = function () { callback(ActionResult); }
                bookmarkObjectList = deleteBookmarkByTimeFromBookmarkListObject(bookmarkObjectList, bookmarkTime);
                bookmarkObjectList = addBookmarkToBookmarkListObject(oneBookmarkData, bookmarkObjectList);
                setBookmarkAndVideoInfoInStorage(key, bookmarkObjectList, videoInfo, successFunction);
            });

        } catch (error) {
            runCallbackWithActionResultError(callback, error);
        }
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
        try {
        var videoID = videoID || idSource.getVideoID(currentTabURL);
        throwCustomErrorIfVideoIDIsInvalid(videoID);
            var key = idSource.getVideoDataKey(videoID);
                getBookmarkAndVideoInfoDataByID(videoID, function (ActionResult) {
                    throwCustomErrorIfThereWasStorageError();
                    let bookmarkObjectList = ActionResult.data["bookmarks"];
                    let videoInfo = ActionResult.data["info"];
                    let successFunction = function(){callback(ActionResult);}
                    bookmarkObjectList = deleteBookmarkByTimeFromBookmarkListObject(bookmarkObjectList, bookmarkTime);
                    if(isEmpty(bookmarkObjectList)){
                        storageArea.remove([key], successFunction);
                    } else{
                        setBookmarkAndVideoInfoInStorage(key, bookmarkObjectList, videoInfo, successFunction);
                    }
                });
            
        } catch (error) {
            runCallbackWithActionResultError(callback, error);
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
            //if the key is a valid data key, validate the new data
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
            if(!validators.fileIsJSONFile(fileData)){throw new AppError("The import file can only be a .json file.")};
            jsonData = JSON.parse(fileData);
            //get all data from storage.
            getAllData(function(allData){
                allData = overwriteInternalWithExternalData(allData, jsonData);
                saveAllData(allData, callback);
            })
        } catch (error) {
            runCallbackWithActionResultError(callback, error);
            return;
        }

    };
    var clearAllStorage = function(callback){
        try {
            storageArea.clear(callback)
        } catch (error) {
            runCallbackWithActionResultError(callback, error);
            return;
        }

    };
    return {
        getBookmarkData:getBookmarkData,
        saveCustomBookmarkAndVideoInfo: saveCustomBookmarkAndVideoInfo,
        deleteBookmark:deleteBookmark,
        updateBookmark:updateBookmark,
        updateBookmarkByID,updateBookmarkByID,
        importExternalData:importExternalData,
        getAllData:getAllData,
        getBookmarksByID:getBookmarksByID,
        getBookmarkByIDAndTime:getBookmarkByIDAndTime,
        deleteBookmarkByIDAndTime:deleteBookmarkByIDAndTime,
        saveCustomBookmarkAndVideoInfoByID:saveCustomBookmarkAndVideoInfoByID,
        clearAllStorage:clearAllStorage
    };
};