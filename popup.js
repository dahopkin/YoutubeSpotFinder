$(function () {
    function sendActionAsMessageFromCurrentTab(actionToSend, callback) {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action: actionToSend, url:tabs[0].url }, callback);
        });
    }
    function setPageDom(appInfo){
        setBinarySearchDom(appInfo.binarySearchStatusInfo);
        setBookmarkDom(appInfo.bookmarkInfo);
    }
    function setBinarySearchDom(binarySearchStatusInfo){
        if(binarySearchStatusInfo){
            if(binarySearchStatusInfo.isRunning){
                $("#startOrStop").val("Stop").removeClass("btn-red").addClass("btn-red-inverse");
                $("#goLeft, #goRight").prop("disabled",false).removeClass("btn-disabled");
            } else{
                $("#startOrStop").val("Start").removeClass("btn-red-inverse").addClass("btn-red");
                $("#goLeft, #goRight").prop("disabled",true).addClass("btn-disabled");
            }
        }
        
    }
    
    function getTableContentsFromBookmarks(bookmarkInfo){
        var currentBookmark, html, time, formattedTime, description;
        for (var i = 0; i < bookmarkInfo.length; i++) {
            currentBookmark = bookmarkInfo[i];
            if(i === 0){
                html += "<tr><th>Time (hh:mm:ss)</th><th>Description</th><th>Actions</th><tr>";    
            }
            time = currentBookmark.time;
            description = currentBookmark.description == "" ? "No Description" : currentBookmark.description;
            formattedTime = hhmmss(currentBookmark.time);
            html += "<tr><td><a class='time-link' data-time="+time+">"+formattedTime+"</a></td><td>"+description+"</td><td><button data-time="+time+" class='delete-button btn btn-medium btn-circle btn-primary'>X</button></td><tr>";
            //Do something
        }
        return html;
    }
    function setBookmarkDom(bookmarkInfo){
        $('#description').val("");
        $('#time').text('');
        $('#bookmark-table').html(getTableContentsFromBookmarks(bookmarkInfo));
    }
    $('#goTo1-4').click(function () {
        sendActionAsMessageFromCurrentTab("goTo1-4")
    });
    $('#goTo2-4').click(function () {
        sendActionAsMessageFromCurrentTab("goTo2-4")
    });
    $('#goTo3-4').click(function () {
        sendActionAsMessageFromCurrentTab("goTo3-4")
    });
    $('#goTo30').click(function () {
        sendActionAsMessageFromCurrentTab("goTo30")
    });
    $('#startOrStop').click(function () {
        sendActionAsMessageFromCurrentTab("startOrStop", setPageDom)
    });
    $('#goLeft').click(function () {
        sendActionAsMessageFromCurrentTab("goLeft", setPageDom)
    });
    $('#goRight').click(function () {
        sendActionAsMessageFromCurrentTab("goRight", setPageDom)
    });
    $(document).on("click.send", ".time-link", function(e){
        e.preventDefault();
        var time = $(this).data("time");
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action: "goToTime", url:tabs[0].url, time:time }, setPageDom);
        });
    });
    $(document).on("click.delete", ".delete-button", function(e){
        e.preventDefault();
        if (confirm("Are you sure you want to delete this bookmark?")) {
            var time = $(this).data("time");
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, { action: "deleteBookmark", url: tabs[0].url, time: time }, setPageDom);
            });
        }
        
    });
    $('#saveBookmark').click(function(){
        sendActionAsMessageFromCurrentTab("saveDefaultBookmark", setPageDom)
    })
    
    sendActionAsMessageFromCurrentTab("start", setPageDom);
});