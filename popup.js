$(function () {
    function sendActionAsMessageFromCurrentTab(actionToSend, callback) {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action: actionToSend, url:tabs[0].url }, callback);
        });
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
        sendActionAsMessageFromCurrentTab("startOrStop", setBinarySearchDom)
    });
    $('#goLeft').click(function () {
        sendActionAsMessageFromCurrentTab("goLeft", setBinarySearchDom)
    });
    $('#goRight').click(function () {
        sendActionAsMessageFromCurrentTab("goRight", setBinarySearchDom)
    });
    sendActionAsMessageFromCurrentTab("start", setBinarySearchDom);
});