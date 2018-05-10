$(function () {
    
    $("#export-bookmarks").on("click.export", function(){
        //export code (with modifications) comes from:
        //https://stackoverflow.com/questions/23160600/chrome-extension-local-storage-how-to-export
        try {
            chrome.storage.sync.get(null, function(items) { // null implies all items
                // Convert object to a string.
                var result = JSON.stringify(items);
            
                // Save as file
                var url = 'data:application/json;base64,' + btoa(result);
                chrome.downloads.download({
                    url: url,
                    filename: 'ysp-bookmarks.json'
                });
            });
                
            } catch (error) {
                console.log("error saving");
                alert(JSON.stringify(error));
                return true;
            }
    });
});