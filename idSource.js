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
    var getVideoTitle = function(){
        return $(".title .style-scope.ytd-video-primary-info-renderer").text();
    };
    var isValidBookmarkKey = function(bookmarkKey){
        return startsWithPrefixAndEndsWithSuffixWithDashes(bookmarkKey, settings.bookmarkPrefix, bookmarkSuffix);
    }
    var isValidVideoInfoKey = function(videoInfoKey){
        return startsWithPrefixAndEndsWithSuffixWithDashes(videoInfoKey, settings.bookmarkPrefix, videoInfoSuffix);
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

var getYoutubeIDSource = function(){return getURLIDSource(
    getURLIDSourceSettingsObject(
        /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/,
        11, 2, "youtube"
    ));
};