$(function () {
    
    $("#view-bookmarks").on("click.view",function(){
        let allBookmarksURL = chrome.runtime.getURL('../html/all-bookmarks.html')
        chrome.tabs.create({url: allBookmarksURL});
        return false;
      } );
      $("#view-options").on("click.view",function(){
        let optionsURL = chrome.runtime.getURL('../html/options.html')
        chrome.tabs.create({url: optionsURL});
        return false;
      } );
});