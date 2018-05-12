
$(function () {
    $(document).on("click.percentage", ".percentage-button", function(e){
        e.preventDefault();
        var percentage = $(this).data("percentage");
        videoPlayer.seekToPercentage(percentage);
        setAppInfo(setPageDom);
    });
    $(document).on("click.beforeend", '.before-end-button', function (e) {
        e.preventDefault();
        var secondsBeforeEnd = $(this).data("secondsbeforeend");
        videoPlayer.seekToSecondsBeforeEnd(secondsBeforeEnd);
        setAppInfo(setPageDom);
    });
    
    $(document).on("click.startstop", '#startOrStop',function () {
        binarySearcher.startOrStop();
        setAppInfo(setPageDom);
    });
    $(document).on("click.goleft", '#goLeft',function () {
        binarySearcher.goLeft();
        setAppInfo(setPageDom);
    });
    
    $(document).on("click.goright", '#goRight',function () {
        binarySearcher.goRight();
        setAppInfo(setPageDom);
    });
    $(document).on("click.undo", '#undo',function () {
        binarySearcher.undoLastStep();
        setAppInfo(setPageDom);
    });
    $(document).on("click.send", ".time-link", function(e){
        e.preventDefault();
        var time = $(this).data("time");
        videoPlayer.seekToTime(time);
        setAppInfo(setPageDom);
    });
    $(document).on("click.delete", ".delete-button", function(e){
        e.preventDefault();
        if (confirm("Are you sure you want to delete this bookmarked time?")) {
            var time = $(this).data("time");
            bookmarks.deleteBookmark(time, function(saveResult){
                setAppInfo(setPageDom);
            });
        }
    });
    $(document).on("click.update", ".cancel-button", function (e) {
        setAppInfo(setPageDom);
    });
    const bookmarkEditPopupSelector = "#bookmark-edit-section";
    var setBookmarkEditPopupFromBookmarkData = function(bookmarkData){
        var $descriptionTextBox = $("#description-text");
        var $timeTextBox = $("#time-text");
        $timeTextBox.attr("data-currenttime", bookmarkData.time);
        $descriptionTextBox.val(bookmarkData.description);
        $timeTextBox.val(hhmmss(bookmarkData.time));
    };
    var setBookmarkEditPopupPosition = function(jqEditButtonElement){
        var editButtonPagePosition = jqEditButtonElement.offset().top;
        var editButtonPageParentPosition = jqEditButtonElement.parent().offset().top;
        var popupTopPosition = (editButtonPagePosition - editButtonPageParentPosition) + 75;
        $(bookmarkEditPopupSelector).css({"top": popupTopPosition + "px"})
    };
    var getBookmarkFromAppDataBookmarks = function(time){
        var bookmarkArray = appInfo.bookmarkInfo;
        var bookmarkToReturn = bookmarkArray.filter(bookmark => bookmark.time == time)[0];
        return bookmarkToReturn;
    };
    var showEditPopup = function(){
        $(bookmarkEditPopupSelector).removeClass(hiddenClass);
    };
    
    $(document).on("click.edit", ".edit-button", function (e) {
        e.preventDefault();
        var time = $(this).data("time");
        var bookmarkData = getBookmarkFromAppDataBookmarks(time);
        if(!bookmarkData){ return; }
        setBookmarkEditPopupFromBookmarkData(bookmarkData);
        setBookmarkEditPopupPosition($(this));
        showEditPopup();
    });
    $(document).on("click.update", "#bookmark-update", function (e) {
        e.preventDefault();
        var updateData = {};
        updateData["oldTime"] = $("#time-text").attr("data-currenttime");
        updateData["newTime"] = hhmmssToSeconds($.trim($("#time-text").val()));
        var newDescription = $.trim($("#description-text").val()) || "";
        updateData["newDescription"] = newDescription;
        var updateBookmarkData = {time:updateData.newTime, description:updateData.newDescription};
        bookmarks.updateBookmark(updateData.oldTime, updateBookmarkData, function(saveResult){
            setAppInfo(setPageDom);
            $(bookmarkEditPopupSelector).addClass(hiddenClass);
        });
    });
    
    $(document).on("click.closeedit", ".bookmark-edit-close-button", function (e) {
        e.preventDefault();
        $(bookmarkEditPopupSelector).addClass(hiddenClass);
    });
    $(document).on("click.savebookmark", '#saveBookmark', function(){
        bookmarks.saveDefaultBookmarkAndVideoInfo(function(saveResult){
            setAppInfo(setPageDom);
        });
        
    })

    $(document).on("click.rewind", ".rewind-button", function(e){
        e.preventDefault();
        var time = $(this).data("time");
        videoPlayer.rewind(time);
        setAppInfo(setPageDom);
    });
    $(document).on("click.fastForward", ".fastForward-button", function(e){
        e.preventDefault();
        var time = $(this).data("time");
        videoPlayer.fastForward(time);
        setAppInfo(setPageDom);
    });
    
    $(document).on("click.playpause", '#playOrPause', function () {
        if(videoPlayer.isPlaying()){ videoPlayer.pause(); }
        else{ videoPlayer.play(); }
        setAppInfo(setPageDom);
    });
    var hiddenClass = "hidden";
    var decideBasHelpButtonHTML = function(){
        var showHideObject = {
            "true":{tooltip:"Show instructions.", text:"?"}
            , "false":{tooltip:"Hide instructions.", text:"X"}};
        var $helpNote = $("#bas-help-note");
        var controlSectionIsHidden = $helpNote.hasClass(hiddenClass).toString();
        var $helpButton = $('#bas-help-button');
        $helpButton.html(showHideObject[controlSectionIsHidden]["text"]);
        $helpButton.attr("tooltip", showHideObject[controlSectionIsHidden]["tooltip"]);
    };
    $(document).on("click.togglehelp", '#bas-help-button',function(){
        var $helpNote = $("#bas-help-note");
        $helpNote.toggleClass(hiddenClass);
        decideBasHelpButtonHTML();
    });
    $(document).on("click", "html", function() {
        $('#bas-help-note').addClass(hiddenClass);
        decideBasHelpButtonHTML();
     })
    
    $(document).on("click.showhelp", '#bas-help-section', function(e){
         e.stopPropagation();
     });
     $(document).on("click.closehelp", '#bas-help-close-button',function(){
        var $helpNote = $("#bas-help-note");
        $helpNote.addClass(hiddenClass);
        decideBasHelpButtonHTML();
    });
    $(document).on("click.togglecontrols", '#show-hide-button',function(){
        var showHideObject = {"true":"Show YouTube Spot Finder", "false":"Hide YouTube Spot Finder"};
        var $wrap = $("#wrap");
        $wrap.toggleClass(hiddenClass);
        var controlSectionIsHidden = $wrap.hasClass(hiddenClass).toString();
        $(this).html(showHideObject[controlSectionIsHidden]);
    });
});