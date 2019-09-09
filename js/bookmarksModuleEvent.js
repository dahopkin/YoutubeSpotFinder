//TODO: change this to "getStorageModule" when done. It applies to more things now.
var getBookmarksModuleEventBased = function(pubSub, videoPlayer, idSource){
    var eventNames = {
        "bookmarksRequestedFromPage" : "bookmarksRequestedFromPage",
        "bookmarksRequestedFromID" : "bookmarksRequestedFromID",
        "bookmarkAndVideoInfoRequestedByPage":"bookmarkAndVideoInfoRequestedByPage",
        "bookmarkAndVideoInfoRequestedByID":"bookmarkAndVideoInfoRequestedByID",
        "bookmarkUpdateRequestedFromPage" : "bookmarkUpdateRequestedFromPage",
        "bookmarkUpdateRequestedFromID" : "bookmarkUpdateRequestedFromID",
        "bookmarkCreateRequestedFromPage" : "bookmarkCreateRequestedFromPage",
        "bookmarkCreateRequestedFromID" : "bookmarkCreateRequestedFromID",
        "bookmarkDeleteRequestedFromPage" : "bookmarkDeleteRequestedFromPage",
        "bookmarkDeleteRequestedFromIDAndTime" : "bookmarkDeleteRequestedFromIDAndTime",
        "bookmarkDeleted":"bookmarkDeleted",
        "bookmarkUpdated":"bookmarkUpdated",
        "bookmarkCreated":"bookmarkCreated",
        "bookmarksRetrieved":"bookmarksRetrieved",
    }
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
    function emitBookmarkError(error){
        //callback(new ActionResult({message:error.message, error:error}));
        pubSub.emit("bookmarkError", {message:error.message});
    }
    
    // var getBookmarkData = function(callback){
    //     var videoID = idSource.getVideoID(currentTabURL);
    //     getBookmarksByID(videoID, callback);
    // };

    var getBookmarkData = function(requestData){
        requestData["videoID"] = idSource.getVideoID(currentTabURL);
        getBookmarksByID(requestData);
    };
    // var getBookmarksByID = function (videoID, callback) {
    //     try {
    //         var videoID = videoID || idSource.getVideoID(currentTabURL);
    //         if (videoID) {
    //             var key = idSource.getVideoDataKey(videoID);
    //             var defaultObject = {};
    //             defaultObject[key] = {};
    //             defaultObject[key]["bookmarks"] = {};
    //             storageArea.get(defaultObject, function (items) {
    //                 throwCustomErrorIfThereWasStorageError();
    //                 var bookmarksForVideo = items[key]["bookmarks"];
    //                 bookmarksForVideo = getItemOrBlankObjectIfItemIsNotObject(bookmarksForVideo);
    //                 //callback(new ActionResult({data:bookmarksForVideo}));
    //                 pubSub.emit("bookmarksRetrieved", bookmarksForVideo)
    //             });
    //         }

    //     } catch (error) {
    //         runCallbackWithActionResultError(callback, error);
    //     }
    // };
    var getBookmarksByID = function (requestData, callback) {
        try {

            var videoID = requestData["videoID"] || idSource.getVideoID(currentTabURL);
            if (videoID) {
                var key = idSource.getVideoDataKey(videoID);
                var defaultObject = {};
                defaultObject[key] = {};
                defaultObject[key]["bookmarks"] = {};
                storageArea.get(defaultObject, function (items) {
                    throwCustomErrorIfThereWasStorageError();
                    var bookmarksForVideo = items[key]["bookmarks"];
                    bookmarksForVideo = getItemOrBlankObjectIfItemIsNotObject(bookmarksForVideo);
                    //callback(new ActionResult({data:bookmarksForVideo}));
                    pubSub.emit(eventNames.bookmarksRetrieved, bookmarksForVideo)
                });
            }

        } catch (error) {
            emitBookmarkError(error);
        }
    };
    pubSub.on(eventNames.bookmarksRequestedFromPage, getBookmarkData);
    pubSub.on(eventNames.bookmarksRequestedFromID, getBookmarksByID);
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
            emitBookmarkError(error);
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
            emitBookmarkError(error);
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
            emitBookmarkError(error);
        }
    };
    var getAllData = function(callback){
        try {
            storageArea.get(null, function(items) {
            throwCustomErrorIfThereWasStorageError();
            callback(new ActionResult({data:items}));
            });
            
        } catch (error) {
            emitBookmarkError(error);
        }
    };
    var saveAllData = function(replacementData, callback){
        try {
        storageArea.set(replacementData, function(items) {
            throwCustomErrorIfThereWasStorageError();
            callback(new ActionResult({message:"Data was saved successfully."}));
          });
            
        } catch (error) {
            emitBookmarkError(callback,error);
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

    // var saveCustomBookmarkAndVideoInfo = function(oneBookmarkData, callback){
    //     var videoID = idSource.getVideoID(currentTabURL);
    //     saveCustomBookmarkAndVideoInfoByID(videoID, oneBookmarkData, callback);
    // };
    // var saveCustomBookmarkAndVideoInfoByID = function (videoID, oneBookmarkData, callback) {
    //     try {
    //         var videoID = videoID || idSource.getVideoID(currentTabURL);
    //         throwCustomErrorIfVideoIDIsInvalid(videoID);
    //         throwCustomErrorIfBookmarkIsInvalid(oneBookmarkData);
    //         var dataKey = idSource.getVideoDataKey(videoID);
    //         getBookmarkAndVideoInfoDataByID(videoID, function (ActionResult) {
    //             let successFunction = function(){callback(ActionResult);}
    //             let bookmarkArray = ActionResult.data["bookmarks"];
    //             let videoInfo = ActionResult.data["info"];
    //             bookmarkArray = addBookmarkToBookmarkListObject(oneBookmarkData, bookmarkArray)
    //             videoInfo = getCorrectVideoInfoFromSuggestionAndData(idSource.getVideoTitle(), videoInfo);
    //             setBookmarkAndVideoInfoInStorage(dataKey, bookmarkArray, videoInfo, successFunction);
    //         });
    //     } catch (error) {
    //         runCallbackWithActionResultError(callback, error);
    //     }
    // };
    var saveCustomBookmarkAndVideoInfo = function(eventData){
        eventData["videoID"] = idSource.getVideoID(currentTabURL);
        saveCustomBookmarkAndVideoInfoByID(eventData);
    };
    var saveCustomBookmarkAndVideoInfoByID = function (eventData) {
        try {
            var videoID = eventData["videoID"] || idSource.getVideoID(currentTabURL);
            var oneBookmarkData = eventData["bookmark"];
            throwCustomErrorIfVideoIDIsInvalid(videoID);
            throwCustomErrorIfBookmarkIsInvalid(oneBookmarkData);
            var dataKey = idSource.getVideoDataKey(videoID);
            getBookmarkAndVideoInfoDataByID(videoID, function (ActionResult) {
                let successFunction = function(){
                //    callback(ActionResult);
                pubSub.emit("bookmarkCreated",{});
                }
                let bookmarkArray = ActionResult.data["bookmarks"];
                let videoInfo = ActionResult.data["info"];
                bookmarkArray = addBookmarkToBookmarkListObject(oneBookmarkData, bookmarkArray)
                videoInfo = getCorrectVideoInfoFromSuggestionAndData(idSource.getVideoTitle(), videoInfo);
                setBookmarkAndVideoInfoInStorage(dataKey, bookmarkArray, videoInfo, successFunction);
            });
        } catch (error) {
            emitBookmarkError(error);
        }
    };
    pubSub.on(eventNames.bookmarkCreateRequestedFromPage, saveCustomBookmarkAndVideoInfo);
    pubSub.on(eventNames.bookmarkCreateRequestedFromID, saveCustomBookmarkAndVideoInfoByID);
    // var updateBookmark = function(bookmarkTime, oneBookmarkData, callback){ 
    //     videoID = idSource.getVideoID(currentTabURL);
    //     updateBookmarkByID(videoID, bookmarkTime, oneBookmarkData, callback);

    // };
    // var updateBookmarkByID = function (videoID, bookmarkTime, oneBookmarkData, callback) {
    //     try {
    //         var videoID = videoID || idSource.getVideoID(currentTabURL);
    //         throwCustomErrorIfVideoIDIsInvalid(videoID);
    //         throwCustomErrorIfBookmarkIsInvalid(oneBookmarkData);
    //         var key = idSource.getVideoDataKey(videoID);
    //         getBookmarkAndVideoInfoDataByID(videoID, function (ActionResult) {
    //             let bookmarkObjectList = ActionResult.data["bookmarks"];
    //             let videoInfo = ActionResult.data["info"];
    //             let successFunction = function () { callback(ActionResult); }
    //             bookmarkObjectList = deleteBookmarkByTimeFromBookmarkListObject(bookmarkObjectList, bookmarkTime);
    //             bookmarkObjectList = addBookmarkToBookmarkListObject(oneBookmarkData, bookmarkObjectList);
    //             setBookmarkAndVideoInfoInStorage(key, bookmarkObjectList, videoInfo, successFunction);
    //         });

    //     } catch (error) {
    //         emitBookmarkError(error);
    //     }
    // };
    var updateBookmark = function(eventData){ 
        eventData["videoID"] = idSource.getVideoID(currentTabURL);
        updateBookmarkByID(eventData);

    };
    var updateBookmarkByID = function (eventData) {
        try {
            var videoID = eventData["videoID"] || idSource.getVideoID(currentTabURL);
            var bookmarkTime = eventData["oldTime"];
            var oneBookmarkData = eventData["bookmark"];
            throwCustomErrorIfVideoIDIsInvalid(videoID);
            throwCustomErrorIfBookmarkIsInvalid(oneBookmarkData);
            var key = idSource.getVideoDataKey(videoID);
            getBookmarkAndVideoInfoDataByID(videoID, function (ActionResult) {
                let bookmarkObjectList = ActionResult.data["bookmarks"];
                let videoInfo = ActionResult.data["info"];
                let successFunction = function () { 
                //    callback(ActionResult); 
                pubSub.emit("bookmarkUpdated",{});
                }
                bookmarkObjectList = deleteBookmarkByTimeFromBookmarkListObject(bookmarkObjectList, bookmarkTime);
                bookmarkObjectList = addBookmarkToBookmarkListObject(oneBookmarkData, bookmarkObjectList);
                setBookmarkAndVideoInfoInStorage(key, bookmarkObjectList, videoInfo, successFunction);
            });

        } catch (error) {
            emitBookmarkError(error);
        }
    };
    pubSub.on(eventNames.bookmarkUpdateRequestedFromPage, updateBookmark);
    pubSub.on(eventNames.bookmarkUpdateRequestedFromID, updateBookmarkByID);
    var deleteBookmarkByTimeFromBookmarkListObject = function(bookmarkListObject, bookmarkTime){
        bookmarkListObject = getItemOrBlankObjectIfItemIsNotObject(bookmarkListObject);
        if(typeof bookmarkListObject[bookmarkTime.toString()] !== "undefined"){
            delete bookmarkListObject[bookmarkTime.toString()];
        }
        return bookmarkListObject;
    }

    // var deleteBookmark = function(bookmarkTime, callback){
    //     var videoID = idSource.getVideoID(currentTabURL);
    //     deleteBookmarkByIDAndTime(videoID, bookmarkTime, callback);
    // };

    // var deleteBookmarkByIDAndTime = function(videoID, bookmarkTime, callback){
    //     try {
    //     var videoID = videoID || idSource.getVideoID(currentTabURL);
    //     throwCustomErrorIfVideoIDIsInvalid(videoID);
    //         var key = idSource.getVideoDataKey(videoID);
    //             getBookmarkAndVideoInfoDataByID(videoID, function (ActionResult) {
    //                 throwCustomErrorIfThereWasStorageError();
    //                 let bookmarkObjectList = ActionResult.data["bookmarks"];
    //                 let videoInfo = ActionResult.data["info"];
    //                 let successFunction = function(){callback(ActionResult);}
    //                 bookmarkObjectList = deleteBookmarkByTimeFromBookmarkListObject(bookmarkObjectList, bookmarkTime);
    //                 if(isEmpty(bookmarkObjectList)){
    //                     storageArea.remove([key], successFunction);
    //                 } else{
    //                     setBookmarkAndVideoInfoInStorage(key, bookmarkObjectList, videoInfo, successFunction);
    //                 }
    //             });
            
    //     } catch (error) {
    //         emitBookmarkError(error);
    //     }
    // };

    var deleteBookmark = function(eventData){
        eventData["videoID"] = idSource.getVideoID(currentTabURL);
        deleteBookmarkByIDAndTime(eventData);
    };

    var deleteBookmarkByIDAndTime = function(eventData){
        try {
        var videoID = eventData["videoID"] || idSource.getVideoID(currentTabURL);
        var bookmarkTime = eventData["time"];
        throwCustomErrorIfVideoIDIsInvalid(videoID);
            var key = idSource.getVideoDataKey(videoID);
                getBookmarkAndVideoInfoDataByID(videoID, function (ActionResult) {
                    throwCustomErrorIfThereWasStorageError();
                    let bookmarkObjectList = ActionResult.data["bookmarks"];
                    let videoInfo = ActionResult.data["info"];
                    let successFunction = function(){
                    //    callback(ActionResult);
                    pubSub.emit("bookmarkDeleted",{});
                    }
                    bookmarkObjectList = deleteBookmarkByTimeFromBookmarkListObject(bookmarkObjectList, bookmarkTime);
                    if(isEmpty(bookmarkObjectList)){
                        storageArea.remove([key], successFunction);
                    } else{
                        setBookmarkAndVideoInfoInStorage(key, bookmarkObjectList, videoInfo, successFunction);
                    }
                });
            
        } catch (error) {
            emitBookmarkError(error);
        }
    };
    pubSub.on(eventNames.bookmarkDeleteRequestedFromPage, deleteBookmark);
    pubSub.on(eventNames.bookmarkDeleteRequestedFromIDAndTime, deleteBookmarkByIDAndTime);
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
    var importData = function(firstActionResult, callback){
        if(firstActionResult.hasError()){
            emitBookmarkError(callback, firstActionResult.error)
            return;
        }
        let jsonData = firstActionResult.data;
        getAllData(function (ActionResult) {
            if(ActionResult.hasError()){throw ActionResult.error;}
            let allData = ActionResult.data;
            allData = overwriteInternalWithExternalData(allData, jsonData);
            saveAllData(allData, callback);
        })
    }
    var importExternalData = function(fileToRead, callback){
        let actionResult = getActionResult();
        let jsonData = undefined;
        try {
            let fileHandler = new JSONFileHandler(fileToRead);
            let fileData = fileHandler.getJSONFile(function(jsonData){
                importData(jsonData, callback);
            });
        } catch (error) {
            emitBookmarkError(error);
            return;
        }

    };
    var clearAllStorage = function(callback){
        try {
            storageArea.clear(callback)
        } catch (error) {
            emitBookmarkError(error);
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
        clearAllStorage:clearAllStorage,
        eventNames:eventNames
    };
};