$(function () {
    function popupURLAsSeparatePage(url){
      let popupURL = chrome.runtime.getURL(url)
      chrome.tabs.create({url: popupURL});
    }
    $("#view-bookmarks").on("click.view",function(){
        popupURLAsSeparatePage('../html/all-bookmarks.html');
        return false;
      } );
      $("#view-options").on("click.view",function(){
        popupURLAsSeparatePage('../html/options.html');
        return false;
      } );
      $("#view-credits").on("click.view",function(){
        popupURLAsSeparatePage('../html/credits.html');
        return false;
      } );
});