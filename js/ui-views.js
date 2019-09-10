
function getSpotFinderView(pubSub, selector){
    var selector = selector || "#before-after-section";
    let $mainEl = $(selector);
    let $startStopButton = $mainEl.find("#startOrStop")
    let $goLeftButton = $mainEl.find("#goLeft");
    let $goRightButton = $mainEl.find("#goRight");
    let $undoButton = $mainEl.find("#undo");
    let $leftRightButtons = $mainEl.find("#goLeft, #goRight");
    let $progressBarOuter = $mainEl.find(".progress-outer");
    let $progressBarInner = $mainEl.find(".progress-inner");
    let $progressBarMid = $mainEl.find(".progress-mid");

    let disableButton = function($buttonEl){
        $buttonEl.prop("disabled",true).addClass("btn-disabled");
    }
    let enableButton = function($buttonEl){
        $buttonEl.prop("disabled",false).removeClass("btn-disabled");
    }
    let setUndoButtonDom = function(binarySearchStatusInfo){
        if(binarySearchStatusInfo.isRunning && binarySearchStatusInfo.canUndoLastStep){
            enableButton($undoButton);
        } else{
            disableButton($undoButton);
        }
    }
    let setProgressBarDom = function(binarySearchStatusInfo){
        if(binarySearchStatusInfo.isRunning){
            $progressBarOuter.show();
            var progressBarWidth = $progressBarOuter.width();
            var start = binarySearchStatusInfo.start;
            var end = binarySearchStatusInfo.end;
            var mid = binarySearchStatusInfo.mid;
            var duration = binarySearchStatusInfo.duration;
            var difference = end - start;
            var differencePercentage = difference/duration;
            var startOnProgressPercentage = start/duration;
            var midPercentage = mid/duration;
            var startLeftMid = midPercentage * progressBarWidth;
            var startLeft = startOnProgressPercentage * progressBarWidth;
            var innerProgressWidth = differencePercentage * progressBarWidth;
            $progressBarInner.css({width:innerProgressWidth, left:startLeft});
            $progressBarMid.css({left:startLeftMid});
        } else{
            $progressBarOuter.hide();
        }
    }
    let render = function (binarySearchStatusInfo){
        if(binarySearchStatusInfo){
            if(binarySearchStatusInfo.isRunning){
                $startStopButton.text("Stop").removeClass("btn-blue").addClass("btn-red");
                $startStopButton.attr("tooltip", "Stop spot finding.");
                enableButton($leftRightButtons);
            } else{
                $startStopButton.text("Find").removeClass("btn-red").addClass("btn-blue");
                $startStopButton.attr("tooltip", "Start finding your spot.");
                disableButton($leftRightButtons);
            }
        }
        setUndoButtonDom(binarySearchStatusInfo);
        setProgressBarDom(binarySearchStatusInfo);
    }
    let eventList = new jQEventList();
    let requestStartOrStop = function(){
        pubSub.emit("startOrStopSearch", {});
    }
    let requestGoLeft = function(){
        pubSub.emit("goLeft", {});
    }
    let requestGoRight = function(){
        pubSub.emit("goRight", {});
    }
    let requestUndo = function(){
        pubSub.emit("undo", {});
    }
    let setUpEvents = function(){
        pubSub.reset("binarySearchDataChanged", render);
        eventList.addEventToList($startStopButton, "click.startstop",requestStartOrStop);
        eventList.addEventToList($goLeftButton, "click.goleft",requestGoLeft);
        eventList.addEventToList($goRightButton, "click.goright",requestGoRight);
        eventList.addEventToList($undoButton, "click.undo",requestUndo);
        eventList.resetEvents();
    }
    let init = function(){
        setUpEvents();
    }
    init();
    return {render:render};
}

function getBookmarkListView(pubSub, selector){
    var selector = selector || "#bookmark-section";
    //var selector = selector || "#bookmark-table";
    let $mainEl = $(selector);
    let $tableEl = $mainEl.find("#bookmark-table");
    //let $editButtons = $(".edit-button");
    //let $shareButtons = $(".share-button");
    let bookmarks = {};
    let eventList = new jQEventList();
    let getBookmarkArrayFromBookmarkListObject = function(bookmarkListObject){
        let bookmarkArray = [];
        for (const key in bookmarkListObject) {
            if (bookmarkListObject.hasOwnProperty(key)) {
                const element = bookmarkListObject[key];
                if(isNullOrUndefined(element.time)){continue;}
                bookmarkArray.push(element);
            }
        }
        return bookmarkArray;
    }
    let getHTMLFromBookmark = function(bookmark){
        let time = bookmark.time;
        time = escapeHTMLString(time);
        let bookmarkHasNoDescription = bookmark.description == ""
        let description = bookmarkHasNoDescription ? "No Description" : bookmark.description;
        let descriptionClass = bookmarkHasNoDescription ? "no-description" : "";
        let formattedTime = hhmmss(bookmark.time);
        let html = `<tr class="bookmark-row">
    <td><a class='time-link' data-time='${time}'>${escapeHTMLString(formattedTime)}</a></td>
    <td><span class='description ${descriptionClass}' data-time='${time}'>${escapeHTMLString(description)}</span></td>
    <td><button data-time='${time}' class='edit-button btn btn-small btn-primary'>Edit</button></td>
    <td><button data-time='${time}' class='show-delete-button btn btn-small btn-primary'>Delete</button></td>
    <td><button data-time='${time}' class='share-button btn btn-small btn-primary'>Share</button></td>
    <tr>`;
    return html;
    }
    let getTableContentsFromBookmarks = function(bookmarkInfo) {
        bookmarkInfo = getBookmarkArrayFromBookmarkListObject(bookmarkInfo);
        var currentBookmark, html, time, formattedTime, description;
        html = "";
        if (isEmpty(bookmarkInfo)) {
            html += "<tr><td class='note'>No bookmarked times for this video.</td><tr>";
            return html;
        } else {
            for (var i = 0; i < bookmarkInfo.length; i++) {
                currentBookmark = bookmarkInfo[i];
                if (i === 0) {
                    html += `<tr><th>Go To</th><th>Description</th><th>Actions</th><tr>`;
                }
                currentBookmark = bookmarkInfo[i];
                html += getHTMLFromBookmark(currentBookmark);
            }
        }
        return $.parseHTML(html);
        
    }
    let getBookmarkFromDataViewBookmarks = function(time){
        return bookmarks[time.toString()];
    }
    let bookmarkRowSelector = ".bookmark-row";
    let showCreateBookmarkForm = function(e){
        e.preventDefault();
        var time = $(this).data("time");
        var bookmarkData = {time: Math.floor(videoPlayer.getCurrentTime()), description:""};
        if(!bookmarkData){ return; }
        let bookmarkChangePopup = getBookmarkChangePopup(pubSub, "#bookmark-edit-section");
        pubSub.emit("showCreateBookmarkForm",{mode:"create", "bookmark":bookmarkData});
    }
    let showUpdateBookmarkForm = function(e){
        e.preventDefault();
        var time = $(this).data("time");
        var bookmarkData = getBookmarkFromDataViewBookmarks(time);
        if(!bookmarkData){ return; }
        let bookmarkChangePopup = getBookmarkChangePopup(pubSub, "#bookmark-edit-section", $(this).closest(bookmarkRowSelector));
        pubSub.emit("showUpdateBookmarkForm",{oldTime:time, mode:"edit", "bookmark":bookmarkData});
    }
    let getTimeLink = function(videoIDKey, time){
        let timeAddString = "?t=" + hhmmssformal(time);
        return `https://youtu.be/${videoIDKey}${timeAddString}`;
    }
    let showShareButtonDialog = function(e){
        e.preventDefault();
        var time = $(this).data("time");
        var videoID = youtubeIDSource.getVideoID();
        var link = getTimeLink(videoID, time);
        let shareLinkPopup = getShareLinkPopup("#share-link", $(this).closest(bookmarkRowSelector));
        shareLinkPopup.setLink(link);
        shareLinkPopup.show(); 
    }
    let goToTime = function(e){
        e.preventDefault();
        var time = $(this).data("time");
        pubSub.emit("goToTime",{time:time});
        //videoPlayer.seekToTime(time);
    };
   let showDeleteBookmarkDialog = function(e){
        e.preventDefault();
        var time = $(this).data("time");
        let deletePopup = getDeletePopup(pubSub, "#delete-panel", $(this).closest(".bookmark-row"));
        pubSub.emit("showDeleteBookmarkForm",{time:time, positionElement:$(this).closest(".bookmark-row")});
    }
    let setUpEvents = function(){
        pubSub.reset("bookmarksRetrieved", render);
        eventList.addEventToList($mainEl, "click.showsavebookmark",showCreateBookmarkForm, "#showSaveBookmark");
        eventList.addEventToList($mainEl, "click.edit",showUpdateBookmarkForm, ".edit-button");
        eventList.addEventToList($mainEl, "click.share",showShareButtonDialog, ".share-button");
        eventList.addEventToList($mainEl, "click.showdelete",showDeleteBookmarkDialog, ".show-delete-button");
        eventList.addEventToList($mainEl, "click.gototime",goToTime, ".time-link");
        eventList.resetEvents();
    }
    let render = function(bookmarkData){
        bookmarks = bookmarkData;
        $tableEl.html(getTableContentsFromBookmarks(bookmarks));
    }
    let init = function(){
        setUpEvents();
    }
    init();
    return {render:render};
}
var getShareLinkPopup = function(selector, $jQpositionElement){
    let $wholeUI = $(".yjt-html");
    let $positionElement = $jQpositionElement;
    let $mainEl = $(selector);
    let $closeButton = $mainEl.find("#share-close-button");
    let $linkTextBox = $mainEl.find(".share-link-text");
    let link = "";
    let setLink = function(newLink){
        link = newLink;
        $linkTextBox.val(link);
    }
    //set the position below the bookmark row where the initial button was clicked.
    let setPopupPosition = function(){
        let mainUIOffset = $wholeUI.offset();
        let positionTop = $positionElement.offset().top - mainUIOffset.top + 25;
        let positionLeft = $positionElement.offset().left - mainUIOffset.left;
        $mainEl.css({top:positionTop, left:positionLeft});
    };
    let stopPropagation = function(e){ e.stopPropagation();}
    let bindEvents = function(){
        $closeButton.on("click.close", hide);
    }
    let unbindEvents = function(){
        $closeButton.off("click.close", hide);
    }
    let show = function(){
        $mainEl.removeClass(hiddenClass);
        bindEvents()
    }
    let hide = function(e){
        e.preventDefault();
        $mainEl.addClass(hiddenClass);
        unbindEvents();
    }
    let init = function(){
        setPopupPosition();
    }
    init();
    return{setLink:setLink, show:show};

};
var getDeletePopup = function(pubSub, selector, $jQpositionElement){
    let $wholeUI = $(".yjt-html");
    let $positionElement = $jQpositionElement;
    let $mainEl = $(selector);
    let $closeButton = $mainEl.find(".delete-close-button");
    let $deleteButton = $mainEl.find("#delete-button");
    let time = 0;
    let setTime = function(newTime){
        time = newTime;
        $deleteButton.attr("data-time", time);
    }
    let deleteBookmark = function(e){
        e.preventDefault();
        pubSub.emit(bookmarks.eventNames.bookmarkDeleteRequestedFromPage, {time:time});
    }
    //set the position below the bookmark row where the initial button was clicked.
    let setPopupPosition = function($positionElement){
        let mainUIOffset = $wholeUI.offset();
        let positionTop = $positionElement.offset().top - mainUIOffset.top + 25;
        let positionLeft = $positionElement.offset().left - mainUIOffset.left;
        $mainEl.css({top:positionTop, left:positionLeft});
    };
    const clickCloseEvent = "click.deleteclose";
    const clickDeleteEvent = "click.delete";
    let eventList = new jQEventList();
    let pubSubEventList = new PubSubEventList();
    let setUpEvents = function(){
        eventList.addEventToList($closeButton, clickCloseEvent, hide);
        eventList.addEventToList($deleteButton, clickDeleteEvent, deleteBookmark);
        pubSubEventList.addEventToList(bookmarks.eventNames.bookmarkDeleted, updateAndHide);
        pubSubEventList.addEventToList("bookmarkError", function(data){displayMessageWithPopup(data.message)});
        pubSubEventList.addEventToList("showDeleteBookmarkForm", show);
        pubSubEventList.bindEventsToPubSub(pubSub);
    };
    let show = function(eventData){
        setTime(eventData["time"]);
        if(eventData["positionElement"]){
            setPopupPosition(eventData["positionElement"]);
        }
        $mainEl.removeClass(hiddenClass);
        eventList.bindEvents()
    }
    let hide = function(e){
        eventList.unbindEvents();
        pubSubEventList.unbindEventsInPubSub(pubSub);
        $mainEl.addClass(hiddenClass);
    }
    let updateAndHide = function(e){
        requestBookmarks();
        hide(e);
    }
    let init = function(){
        setUpEvents();
    }
    init();
    return{setTime:setTime, show:show};

};
var getMessagePopup = function(selector){
    var selector = selector || "#message-popup";
    let $wholeUI = $(".yjt-html");
    let $positionElement = $wholeUI;
    let $mainEl = $(selector);
    let $closeButton = $mainEl.find(".message-close-button");
    let $messageEl = $mainEl.find(".message-text");
    let message = 0;
    let setMessage = function(newMessage){
        message = escapeHTMLString(newMessage);
        $messageEl.text(message);
    }
    //set the position somewhere below the top of the main ui.
    let setPopupPosition = function(){
        let mainUIWidthHalf = $wholeUI.width()/2;
        let mainElWidthHalf = $mainEl.width()/2;
        let desiredLeftPush = mainUIWidthHalf - mainElWidthHalf;
        let mainUIOffset = $wholeUI.offset();
        let positionTop = $positionElement.offset().top - mainUIOffset.top + 25;
        let positionLeft = $positionElement.offset().left - mainUIOffset.left + desiredLeftPush;
        $mainEl.css({top:positionTop, left:positionLeft});
    };
    const clickCloseEvent = "click.messageclose";
    let bindEvents = function(){
        $closeButton.on(clickCloseEvent, hide);
    }
    let unbindEvents = function(){
        $closeButton.off(clickCloseEvent, hide);
    }
    let show = function(){
        $mainEl.removeClass(hiddenClass);
        bindEvents()
    }
    let hide = function(e){
        e.preventDefault();
        $mainEl.addClass(hiddenClass);
        unbindEvents();
    }
    let showMessage = function(newMessage){
        setMessage(newMessage);
        show();
    }
    let init = function(){
        setPopupPosition();
    }
    init();
    return{showMessage:showMessage};

};
function getBookmarkChangePopup (pubSub, selector, $jQpositionElement){
    let $wholeUI = $(".yjt-html");
    var selector = selector || "#bookmark-edit-section";
    let $mainEl = $(selector);
    let $positionElement = $jQpositionElement || $wholeUI.find("#table-section");
    let $closeButton = $mainEl.find(".bookmark-edit-close-button");
    let $updateButton = $mainEl.find("#bookmark-update");
    let $createButton = $mainEl.find("#saveBookmark");
    let $timeEl = $mainEl.find("#time-text");
    let $popupTitle = $mainEl.find("#popup-title");
    let $descriptionEl = $mainEl.find("#description-text");
    let $messageEl = $mainEl.find("#edit-result-message")
    let oldTime = 0;
    let bookmark = {};
    let mode = "create";
    let setOldTime = function(time){
        oldTime = time;
    }
    let setMode = function(newMode){
        mode = newMode;
    }
    let setBookmark = function(newBookmark){
        bookmark = newBookmark;
    } 
    let getBookmarkFromForm = function(){
        return {
            time: hhmmssToSeconds($.trim($timeEl.val())),
            description: $.trim($descriptionEl.val()) || ""
        }
    }
    let setForm = function(){
        $descriptionEl.val(bookmark.description);
        $timeEl.val(hhmmss(bookmark.time));
    }
    let displayMessageInForm = function(message){
        $messageEl.text(message);
        $messageEl.removeClass(hiddenClass);
    }
    let hideMessage = function(){$messageEl.addClass(hiddenClass);}
    let updateBookmark = function(e){
        displayMessageInForm("Updating bookmark...");
        setBookmark(getBookmarkFromForm());
        pubSub.emit(bookmarks.eventNames.bookmarkUpdateRequestedFromPage, {"oldTime":oldTime, "bookmark":bookmark});
    }
    let createBookmark = function(e){
        displayMessageInForm("Creating bookmark...");
        setBookmark(getBookmarkFromForm());
        pubSub.emit(bookmarks.eventNames.bookmarkCreateRequestedFromPage, {"bookmark":bookmark});
    }
    const clickCloseEvent = "click.bookmarkeditclose";
    const clickUpdateEvent = "click.updatebookmark";
    const clickCreateEvent = "click.createbookmark";
    let changeHTMLBasedOnMode = function(){
        if(mode == "edit"){
            $popupTitle.text("Edit Bookmark");
            $updateButton.removeClass(hiddenClass);
            $createButton.addClass(hiddenClass);
        }else if(mode == "create"){
            $popupTitle.text("Create Bookmark");
            $updateButton.addClass(hiddenClass);
            $createButton.removeClass(hiddenClass);
        }
    }
    let eventList = new jQEventList();
    let pubSubEventList = new PubSubEventList();
    let setUpEvents = function(){
        eventList.addEventToList($closeButton, clickCloseEvent, hide);
        eventList.addEventToList($updateButton, clickUpdateEvent, updateBookmark);
        eventList.addEventToList($createButton, clickCreateEvent, createBookmark);
        pubSubEventList.addEventToList("showCreateBookmarkForm", show);
        pubSubEventList.addEventToList("showUpdateBookmarkForm", show);
        pubSubEventList.addEventToList("bookmarkCreated", updateAndHide);
        pubSubEventList.addEventToList("bookmarkUpdated", updateAndHide);
        pubSubEventList.addEventToList("bookmarkError", function(data){displayMessageInForm(data.message)});
        pubSubEventList.bindEventsToPubSub(pubSub);
    };
    let setAllFromData = function(eventData){
        setOldTime(eventData["oldTime"]);
        setBookmark(eventData["bookmark"]);
        setMode(eventData["mode"]);
    };
    let show = function(eventData){
        setAllFromData(eventData);
        setForm();
        hideMessage();
        changeHTMLBasedOnMode();
        eventList.bindEvents();
        $mainEl.removeClass(hiddenClass);
    }
    let updateAndHide = function(e){
        requestBookmarks();
        hide(e);
    }
    let hide = function(e){
        eventList.unbindEvents();
        pubSubEventList.unbindEventsInPubSub(pubSub);
        $mainEl.addClass(hiddenClass);
    }
    let init = function(){
        setUpEvents();
    }
    init();
    return{show:show, setOldTime:setOldTime, setBookmark:setBookmark, setMode:setMode};

};
var displayMessageWithPopup = function(message){
    let messagePopup = getMessagePopup();
    messagePopup.showMessage(message);
}