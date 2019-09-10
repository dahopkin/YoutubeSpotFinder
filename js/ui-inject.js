
$(function () {

    $(document).on("click.rewind", ".rewind-button", function(e){
        e.preventDefault();
        var time = $(this).data("time");
        pubSub.emit("rewind", {seconds:time})
    });
    $(document).on("click.fastForward", ".fastForward-button", function(e){
        e.preventDefault();
        var time = $(this).data("time");
        pubSub.emit("fastForward", {seconds:time})
    });
    $(document).on("click.percentage", ".percentage-button", function(e){
        e.preventDefault();
        var percentage = $(this).data("percentage");
        pubSub.emit("goToPercentage", {percentage:percentage})
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