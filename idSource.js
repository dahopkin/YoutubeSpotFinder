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
    var pageMatches = function(url){
        url = url || currentTabURL;
        return typeof getVideoIDFromURL(url) !== "undefined";
    };
    var getIDWithPrefixAndSuffix = function(videoID, prefix, suffix){
        var videoID = videoID || getVideoIDFromURL(currentTabURL);
        videoID = videoID.toString();
        return `${prefix}-${videoID}-${suffix}`;
    }
    var beginsWithPrefixAndEndsWithSuffixWithDashes = function(testString, prefix, suffix){
        return testString.beginsWith(`${prefix}-`) && testString.endsWith(`-${suffix}`);
    };
    var getBookmarkKey = function(videoID){
        return getIDWithPrefixAndSuffix(videoID, settings.bookmarkPrefix, bookmarkSuffix);
    };
    var getVideoInfoKey = function(videoID){
        return getIDWithPrefixAndSuffix(videoID, settings.bookmarkPrefix, videoInfoSuffix);
    };
    var getVideoTitle = function(){
        return $(".title .style-scope.ytd-video-primary-info-renderer").text();
    };
    var isValidBookmarkKey = function(bookmarkKey){
        return beginsWithPrefixAndEndsWithSuffixWithDashes(bookmarkKey, settings.bookmarkPrefix, bookmarkSuffix);
    }
    var isValidVideoInfoKey = function(videoInfoKey){
        return beginsWithPrefixAndEndsWithSuffixWithDashes(videoInfoKey, settings.bookmarkPrefix, videoInfoSuffix);
    }
    return{
        pageMatches:pageMatches,
        getBookmarkKey:getBookmarkKey,
        getVideoInfoKey:getVideoInfoKey,
        getVideoID:getVideoIDFromURL,
        getVideoTitle:getVideoTitle,
        isValidBookmarkKey:isValidBookmarkKey,
        isValidVideoInfoKey:isValidVideoInfoKey
    };
};