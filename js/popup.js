$(function () {
    
    $("#view-bookmarks").on("click.view",function(){
        let allBookmarksURL = chrome.runtime.getURL('../html/all-bookmarks.html')
        chrome.tabs.create({url: allBookmarksURL});
        return false;
      } );
});