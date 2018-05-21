$(function(){
    let hiddenClass = "hidden";
    let statusDisplayer = (function(){
        let $sectionEl = $("#status-section");
        let $messageEl = $("#status-message");
        let statusClasses = {
            failureClass:"failure-message",
            progressClass:"progress-message",
            successClass:"success-message"
        };
        let toggleStatusClassOnElement = function($jqElement, desiredClass){
            for (const classKey in statusClasses) {
                if (statusClasses.hasOwnProperty(classKey)) {
                    const currentClass = statusClasses[classKey];
                    if(currentClass == desiredClass){$jqElement.addClass(currentClass);}
                    else{$jqElement.removeClass(currentClass);}
                }
            }
        }
        let setMessageOnForm = function(message){
            $messageEl.text(message);
        };
        let hiddenClass = "hidden";
        let show = function(){ $sectionEl.removeClass(hiddenClass);}
        let hide = function(){ $sectionEl.addClass(hiddenClass);}
        let setMessageAndStatusClassOnForm = function(message, statusClass){
            setMessageOnForm(message);
            toggleStatusClassOnElement($sectionEl, statusClass);
        }
        let displayFailureMessage = function(failureMessage){
            setMessageAndStatusClassOnForm(failureMessage, statusClasses.failureClass);
            show();
        };
        let displaySuccessMessage = function(successMessage){
            setMessageAndStatusClassOnForm(successMessage, statusClasses.successClass);
            show();
        };
        let displayProgressMessage = function(progressMessage){
            setMessageAndStatusClassOnForm(progressMessage, statusClasses.progressClass);
            show();
        };
        return{
            displayFailureMessage:displayFailureMessage,
            displaySuccessMessage:displaySuccessMessage,
            displayProgressMessage:displayProgressMessage,
            hide:hide
        };
    }());
    let youtubeIDSource = getYoutubeIDSource();
    let bookmarksModule = getBookmarksModule({},youtubeIDSource);
    let getDataForPage = function(dataHandlerCallback){
        bookmarksModule.getAllData(dataHandlerCallback);
    };
    let addEditAndDeleteModeFlagsToBookmark = function(bookmark){
        bookmark["inEditMode"] = false;
        bookmark["inDeleteMode"] = false;
    }
    let removeEditAndDeleteModeFlagsFromBookmark = function(bookmark){
        delete bookmark["inEditMode"];
        delete bookmark["inDeleteMode"];
    }
    let addEditAndDeleteModeFlagsToBookmarks = function(bookmarkArray){
        for (const key in bookmarkArray) {
            if (bookmarkArray.hasOwnProperty(key)) {
                const element = bookmarkArray[key];
                addEditAndDeleteModeFlagsToBookmark(bookmarkArray[key]);
            }
        }
    }
    
    
    let addDataToGroupedData = function(groupedData, videoID, dataToAdd){
        if (typeof groupedData[videoID.toString()] === "undefined"){
            groupedData[videoID.toString()] = {};
        }
        groupedData[videoID.toString()] = dataToAdd;
    };
    let addDataToGroupedDataBookmarks = function(groupedData, videoID, bookmarks){
        addDataToGroupedData(groupedData, videoID, bookmarks, "bookmarks")
    }
    let addDataToGroupedDataVideoInfo = function(groupedData, videoID, videoInfo){
        addDataToGroupedData(groupedData, videoID, videoInfo, "info")
    }
    let addDataToGroupedDataVideoData = function(groupedData, videoID, videoData){
        addDataToGroupedData(groupedData, videoID, videoData)
    }

    let getRetrievedDataGroupedByID = function(retrievedData){
        var groupedData = {};
        //loop through data, filling a lookup table all the way.
        for (const storageKey in retrievedData) {
            if (retrievedData.hasOwnProperty(storageKey)) {
                let currentData = retrievedData[storageKey];
                if(youtubeIDSource.isValidVideoDataKey(storageKey)){
                    let videoID = youtubeIDSource.getVideoIDFromStorageKey(storageKey);
                    addDataToGroupedData(groupedData, videoID, currentData);
                    addEditAndDeleteModeFlagsToBookmarks(groupedData[videoID.toString()]["bookmarks"]);
                }
            }
        }
        return groupedData;
    };
    let groupedData = {};
    let setGroupedDataFromRetrievedData = function(retrievedData){
        groupedData = getRetrievedDataGroupedByID(retrievedData);
    }
    let getTimeLink = function(videoIDKey, time){
        let timeAddString = "?t=" + hhmmssformal(time);
        return `https://youtu.be/${videoIDKey}${timeAddString}`;
    }
    let getDescriptionData = function(bookmark){
        let hasDescription = bookmark.description && bookmark.description.trim() !== "";
        let noDescriptionClass = hasDescription ? "" : "no-description";
        let description = hasDescription ? bookmark.description : "";
        return {description:description, descriptionClass:noDescriptionClass}
    }
    let escapeBookmark = function(element){
        for (const key in element) {
            if (element.hasOwnProperty(key)) {
                if(typeof(variable) === "boolean"){continue;}
                element[key] = escapeHTMLString(element[key]);
            }
        }
        return element;
    }
    let getBookmarkFromPageData = function(videoID, time){
        return groupedData[videoID]["bookmarks"][time.toString()];
    }
    let getVideoIDAndTimeFromElement = function($jQel){
        return {"videoID": $jQel.attr("data-videoid"), "time":$jQel.attr("data-time")}
    }
    let setFlagInPageBookmark = function(videoID, time, flagName, value){
        groupedData[videoID]["bookmarks"][time.toString()][flagName] = value;
    }
    let setEditFlagInPageData = function(videoID, time, value){
        setFlagInPageBookmark(videoID, time, "inEditMode", value);
    }
    let setDeleteFlagInPageData = function(videoID, time, value){
        setFlagInPageBookmark(videoID, time, "inDeleteMode", value);
    }
    let getBookmarkFromEditControls = function($rowEl){
        let bookmark = {};
        bookmark["time"] = hhmmssToSeconds($.trim($rowEl.find("#time-text").val()));
        var newDescription = $.trim($rowEl.find("#description-text").val()) || "";
        bookmark["description"] = newDescription;
        return bookmark;
    }
    let getAndSetBookmarksInSection = function(videoID, $bookmarkListEl){
        bookmarksModule.getBookmarksByID(videoID, function(ActionResult){
            if(ActionResult.displayErrorIfPresent(displayMessageAsAlert)) return;
            let items = ActionResult.data;
            addEditAndDeleteModeFlagsToBookmarks(items);
            groupedData[videoID]["bookmarks"] = items;
            $bookmarkListEl.html($.parseHTML(getBookmarksHTML(videoID, groupedData[videoID]["bookmarks"])))
        })
    }
    function sendActionAsMessageFromCurrentTab(actionToSend) {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action: actionToSend });
        });
    }
    let sendDataChangeMessage = function(){
        sendActionAsMessageFromCurrentTab("datachange");
    }
    let setUpBookmarkButtonEvents = function(){
        $(document).on("click.showdelete", ".show-delete-button", function(e){
            let videoIDAndTime = getVideoIDAndTimeFromElement($(this));
            setDeleteFlagInPageData(videoIDAndTime.videoID, videoIDAndTime.time, true);
            setEditFlagInPageData(videoIDAndTime.videoID, videoIDAndTime.time, false);
            let bookmark = getBookmarkFromPageData(videoIDAndTime.videoID, videoIDAndTime.time);
            let $rowEl = $(this).closest(".bookmark-row");
            $rowEl.html($.parseHTML(getIndividualBookmarkHTMLBasedOnState(bookmark, videoIDAndTime.videoID)));
        })
        $(document).on("click.showedit", ".show-edit-button", function(e){
            let videoIDAndTime = getVideoIDAndTimeFromElement($(this));
            setDeleteFlagInPageData(videoIDAndTime.videoID, videoIDAndTime.time, false);
            setEditFlagInPageData(videoIDAndTime.videoID, videoIDAndTime.time, true);
            let bookmark = getBookmarkFromPageData(videoIDAndTime.videoID, videoIDAndTime.time);
            let $rowEl = $(this).closest(".bookmark-row");
            $rowEl.html($.parseHTML(getIndividualBookmarkHTMLBasedOnState(bookmark, videoIDAndTime.videoID)));
            
        })
        $(document).on("click.cancel", ".cancel-button", function(e){
            let videoIDAndTime = getVideoIDAndTimeFromElement($(this));
            setDeleteFlagInPageData(videoIDAndTime.videoID, videoIDAndTime.time, false);
            setEditFlagInPageData(videoIDAndTime.videoID, videoIDAndTime.time, false);
            let bookmark = getBookmarkFromPageData(videoIDAndTime.videoID, videoIDAndTime.time);
            let $rowEl = $(this).closest(".bookmark-row");
            $rowEl.html($.parseHTML(getIndividualBookmarkHTMLBasedOnState(bookmark, videoIDAndTime.videoID)));
        })
        
        $(document).on("click.update", ".update-button", function(e){
            let videoIDAndTime = getVideoIDAndTimeFromElement($(this));
            let videoID = videoIDAndTime.videoID;
            let time = videoIDAndTime.time;
            let bookmark = getBookmarkFromPageData(videoID, time);
            let $rowEl = $(this).closest(".bookmark-row");
            let $bookmarkListEl = $(this).closest(".bookmarks");
            let newBookmark = getBookmarkFromEditControls($rowEl);
            bookmarksModule.updateBookmarkByID(videoID, time, newBookmark, function(ActionResult){
                if(ActionResult.displayErrorIfPresent(displayMessageAsAlert)) return;
                getAndSetBookmarksInSection(videoID, $bookmarkListEl);
            });
        })
        $(document).on("click.delete", ".delete-button", function(e){
            let videoIDAndTime = getVideoIDAndTimeFromElement($(this));
            let videoID = videoIDAndTime.videoID;
            let time = videoIDAndTime.time;
            let bookmark = getBookmarkFromPageData(videoID, time);
            let $bookmarkListEl = $(this).closest(".bookmarks");
            bookmarksModule.deleteBookmarkByIDAndTime(videoID, time, function(ActionResult){
                if(ActionResult.displayErrorIfPresent(displayMessageAsAlert)) return;
                getAndSetBookmarksInSection(videoID, $bookmarkListEl);
            });
        })
        $(document).on("click.share", ".share-button", function(e){
            $(this).siblings(".share-link-panel").removeClass("hidden");
        })
        
        $(document).on("click", "html", function() {
            $('.share-link-panel').addClass(hiddenClass);
         })
         $(document).on("click.showhelp", '.actions', function(e){
            e.stopPropagation();
        });
        $(document).on("click.closeshare", ".share-close-button", function(e){
            $(this).closest(".share-link-panel").addClass("hidden");
        })
        
    }
    let getDataAttributeStringForButtons = function(bookmark, videoID){
        let videoIDAndTimeElement = {videoID:videoID, time:bookmark.time};
        videoIDAndTimeElement = escapeBookmark(videoIDAndTimeElement);
        return `data-time='${videoIDAndTimeElement.time}' data-videoid='${videoIDAndTimeElement.videoID}'`;
    }
    let getIndividualBookmarkHTMLBasedOnState = function(bookmark, videoID){
        let time = escapeHTMLString(bookmark.time);
        let timeLink = getTimeLink(videoID, time);
        let hhmmssTime = hhmmss(time);
        let descriptionData = getDescriptionData(bookmark);
        //descriptionData.description = escapeHTMLString(descriptionData.description);
        let html = "";
        let dataAttributesToAdd = getDataAttributeStringForButtons(bookmark, videoID);
        let displayDescription = descriptionData.description == "" ? "No Description" : descriptionData.description;
        if(bookmark.inEditMode == true){
            html += `
            <div class="cell time"><input type="text" id="time-text"  maxlength="8" class="time-textbox" value="${hhmmssTime}"/ ></div>
            <div class="cell description">
            <textarea type="text" id="description-text" class="description" placeholder="Description" rows=3 cols=25>${descriptionData.description}</textarea>
            </div>
            <div class="cell actions">
                <button class="btn btn-grey update-button" type="button" ${dataAttributesToAdd} >Update</button>
                <button class="btn btn-grey cancel-button" type="button" ${dataAttributesToAdd}>Cancel</button>
            </div>`;
        }
        else if(bookmark.inDeleteMode == true){
            html += `
            <a class="cell time time-link" target="_blank" href="${timeLink}">${hhmmssTime}</a>
            <div class="cell description ${descriptionData.descriptionClass}">${displayDescription}</div>
            <div class="cell actions">
                <span>Are you sure you want to delete this bookmark?</span>
                <button class="btn btn-grey delete-button" type="button" ${dataAttributesToAdd} >Yes</button>
                <button class="btn btn-grey cancel-button" type="button" ${dataAttributesToAdd}>Cancel</button>
            </div>`;
        }
        else{
            html += `
            <a class="cell time time-link" target="_blank" href="${timeLink}">${hhmmssTime}</a>
            <div class="cell description ${descriptionData.descriptionClass}">${displayDescription}</div>
            <div class="cell actions">
                <button class="btn btn-grey show-edit-button" type="button" ${dataAttributesToAdd} >Edit</button>
                <button class="btn btn-grey show-delete-button" type="button"  ${dataAttributesToAdd} >Delete</button>
                <button class="btn btn-grey share-button" type="button"  ${dataAttributesToAdd} >Share Link</button>
                <div class="share-link-panel hidden">
                <button type="button" class="share-close-button">x</button>
                <div class="text-center">Copy Link</div>
                <input class="share-link-text" readonly value="${timeLink}" />
                </div>
            </div>`;
        }
        return html;
    };
    let getIndividualBookmarkHTML = function(bookmark, videoIDKey){
        bookmark = escapeBookmark(bookmark);
        let html = `<div class="bookmark-row">`;
        html += getIndividualBookmarkHTMLBasedOnState(bookmark, videoIDKey);
        html += `</div>`
        return html;
    };

    let getBookmarksHTML = function(videoIDKey, bookmarkArray){
        let html="";
        for (const key in bookmarkArray) {
            if (bookmarkArray.hasOwnProperty(key)) {
                const element = bookmarkArray[key];
                html += getIndividualBookmarkHTML(element, videoIDKey)
            }
        }
        if(html == ""){return "No Bookmarks for this video.";}
        return html;
    }
    let getTitleDataFromBookmarksAndInfoObject = function(bookmarksAndInfoObject){
        let hasInfo = typeof bookmarksAndInfoObject["info"] !== "undefined"
        let titleClass = hasInfo ? "" : "no-title"
        let title = hasInfo ? bookmarksAndInfoObject["info"]["title"] : "No Title for this video."
        return {title:title, titleClass:titleClass};
    }
    let getHTMLForVideoInfo = function(videoIDKey, currentBookmarksAndInfo){
        let bookmarksHTML = getBookmarksHTML(videoIDKey, currentBookmarksAndInfo["bookmarks"]);
        let videoTitleData = getTitleDataFromBookmarksAndInfoObject(currentBookmarksAndInfo);
        let html = 
            `<div class="video-info">
        <div class="video-header">
            <span class="video-title ${videoTitleData.titleClass}">${videoTitleData.title}</span>
        </div>
        <div class="bookmarks">
            ${bookmarksHTML}
        </div>
        </div>
        </div>`;
        return html;
    };
    let getPageHTMLFromData = function(groupedData){
        let html = "";
        for (const videoIDKey in groupedData) {
            if (groupedData.hasOwnProperty(videoIDKey)) {
                const currentBookmarksAndInfo = groupedData[videoIDKey];
                html += getHTMLForVideoInfo(videoIDKey, currentBookmarksAndInfo);
            }
        }
        return $.parseHTML(html);
    }
    
    let init = function(){
        bookmarksModule.getAllData(function(ActionResult){
            if(ActionResult.displayErrorIfPresent(displayMessageAsAlert)) return;
            let retrievedData = ActionResult.data;
            setGroupedDataFromRetrievedData(retrievedData);
            html = getPageHTMLFromData(groupedData);
            $("#full-list").html(html);
            setUpBookmarkButtonEvents();
        });
    }
    init();
});