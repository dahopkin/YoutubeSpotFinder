$(function () {
    
    $("#view-bookmarks").on("click.view",function(){
        let allBookmarksURL = chrome.runtime.getURL('all-bookmarks.html')
        chrome.tabs.create({url: allBookmarksURL});
        return false;
      } );
});