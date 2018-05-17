var getURLIDSourceSettingsObject = function(urlRegex, urlIDLength, urlRegexMatchNumber, bookmarkPrefix){
    return{
        urlRegex: urlRegex,
        urlIDLength: urlIDLength,
        urlRegexMatchNumber: urlRegexMatchNumber,
        bookmarkPrefix:bookmarkPrefix
    }
};

/*
settings:
-urlRegex - regex to use on url for matching.
-urlIDLength - length of the id within the URL.
-urlRegexMatchNumber - regex match index number to return if valid
 as the ID when the matching happens.
-bookmarkPrefix - prefix for the bookmark key.
*/
var getURLIDSource = function(settings){
    var getVideoIDFromURL = function (url) {
        url = url || currentTabURL;
        var regExp = settings.urlRegex;
        var match = url.match(regExp);
        if (match && match[settings.urlRegexMatchNumber].length == settings.urlIDLength) {
            return match[settings.urlRegexMatchNumber];
        } else {
            return undefined;
        }
    };
    var bookmarkSuffix = "bookmarks";
    var videoInfoSuffix = "info";
    var videoDataSuffix = "data";
    var pageMatches = function(url){
        url = url || currentTabURL;
        return typeof getVideoIDFromURL(url) !== "undefined";
    };
    var getIDWithPrefixAndSuffix = function(videoID, prefix, suffix){
        var videoID = videoID || getVideoIDFromURL(currentTabURL);
        videoID = videoID.toString();
        return `${prefix}-${videoID}-${suffix}`;
    }
    var startsWithPrefixAndEndsWithSuffixWithDashes = function(testString, prefix, suffix){
        return testString.startsWith(`${prefix}-`) && testString.endsWith(`-${suffix}`);
    };
    var getBookmarkKey = function(videoID){
        return getIDWithPrefixAndSuffix(videoID, settings.bookmarkPrefix, bookmarkSuffix);
    };
    var getVideoInfoKey = function(videoID){
        return getIDWithPrefixAndSuffix(videoID, settings.bookmarkPrefix, videoInfoSuffix);
    };
    var getVideoDataKey = function(videoID){
        return getIDWithPrefixAndSuffix(videoID, settings.bookmarkPrefix, videoDataSuffix);
    };
    var getVideoTitle = function(){
        return $(".title .style-scope.ytd-video-primary-info-renderer").text();
    };
    var isValidBookmarkKey = function(bookmarkKey){
        return startsWithPrefixAndEndsWithSuffixWithDashes(bookmarkKey, settings.bookmarkPrefix, bookmarkSuffix);
    };
    var isValidVideoInfoKey = function(videoInfoKey){
        return startsWithPrefixAndEndsWithSuffixWithDashes(videoInfoKey, settings.bookmarkPrefix, videoInfoSuffix);
    };
    var isValidVideoDataKey = function(videoDataKey){
        return startsWithPrefixAndEndsWithSuffixWithDashes(videoDataKey, settings.bookmarkPrefix, videoDataSuffix);
    };
    var removeSeveralStrings = function(originalString,removeStringArray){
        let changedString = originalString;
        for (let index = 0; index < removeStringArray.length; index++) {
            const stringToRemove = removeStringArray[index];
            changedString = changedString.replace(stringToRemove, "");
        }
        return changedString;
    };
    var getVideoIDFromStorageKey = function(bookmarkKey){
        let videoIDExtract = bookmarkKey;
        if(isValidBookmarkKey(videoIDExtract)){
            videoIDExtract = removeSeveralStrings(videoIDExtract, [`${settings.bookmarkPrefix}-`, `-${bookmarkSuffix}`]);
            return videoIDExtract;
        }
        else if(isValidVideoInfoKey(videoIDExtract)){
            videoIDExtract = removeSeveralStrings(videoIDExtract, [`${settings.bookmarkPrefix}-`, `-${videoInfoSuffix}`]);
            return videoIDExtract;
        }
        else if(isValidVideoDataKey(videoIDExtract)){
            videoIDExtract = removeSeveralStrings(videoIDExtract, [`${settings.bookmarkPrefix}-`, `-${videoDataSuffix}`]);
            return videoIDExtract;
        }
        return undefined;
    }
    return{
        pageMatches:pageMatches,
        getBookmarkKey:getBookmarkKey,
        getVideoInfoKey:getVideoInfoKey,
        getVideoID:getVideoIDFromURL,
        getVideoTitle:getVideoTitle,
        isValidBookmarkKey:isValidBookmarkKey,
        isValidVideoInfoKey:isValidVideoInfoKey,
        getVideoIDFromStorageKey:getVideoIDFromStorageKey,
        getVideoDataKey:getVideoDataKey,
        isValidVideoDataKey:isValidVideoDataKey,
    };
};

var getYoutubeIDSource = function(){return getURLIDSource(
    getURLIDSourceSettingsObject(
        /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/,
        11, 2, "youtube"
    ));
};