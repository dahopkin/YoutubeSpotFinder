$(function(){
    let statusDisplayer = (function(){
        let $sectionEl = $("#status-section");
        let $messageEl = $("#status-message");
        let statusClasses = {
            failureClass:"failure-message",
            progressClass:"progress-message",
            successClass:"success-message"
        };
        let toggleStatusClassOnElement = function($jqElement, desiredClass){
            for (const classKey in statusClasses) {
                if (statusClasses.hasOwnProperty(classKey)) {
                    const currentClass = statusClasses[classKey];
                    if(currentClass == desiredClass){$jqElement.addClass(currentClass);}
                    else{$jqElement.removeClass(currentClass);}
                }
            }
        }
        let setMessageOnForm = function(message){
            $messageEl.text(message);
        };
        let hiddenClass = "hidden";
        let show = function(){ $sectionEl.removeClass(hiddenClass);}
        let hide = function(){ $sectionEl.addClass(hiddenClass);}
        let setMessageAndStatusClassOnForm = function(message, statusClass){
            setMessageOnForm(message);
            toggleStatusClassOnElement($sectionEl, statusClass);
        }
        let displayFailureMessage = function(failureMessage){
            setMessageAndStatusClassOnForm(failureMessage, statusClasses.failureClass);
            show();
        };
        let displaySuccessMessage = function(successMessage){
            setMessageAndStatusClassOnForm(successMessage, statusClasses.successClass);
            show();
        };
        let displayProgressMessage = function(progressMessage){
            setMessageAndStatusClassOnForm(progressMessage, statusClasses.progressClass);
            show();
        };
        return{
            displayFailureMessage:displayFailureMessage,
            displaySuccessMessage:displaySuccessMessage,
            displayProgressMessage:displayProgressMessage,
            hide:hide
        };
    }());
    let youtubeIDSource = getYoutubeIDSource();
    let bookmarksModule = getBookmarksModule({},youtubeIDSource);
    //need code for exporting bookmarks
    let dataExport = (function(statusDisplayer){

        let $el = $("#export-bookmarks");
        let exportData = function (event) {
            //export code (with modifications) comes from:
            //https://stackoverflow.com/questions/23160600/chrome-extension-local-storage-how-to-export
            try {
                bookmarksModule.getAllData(function (items) { // null implies all items
                    // Convert object to a string.
                    var result = JSON.stringify(items, null, 2);

                    // Save as file
                    var url = 'data:application/json;base64,' + btoa(result);
                    chrome.downloads.download({
                        url: url,
                        filename: 'ysp-bookmarks.json'
                    });
                });

            } catch (error) {
                statusSection.displayFailureMessage(error);
                return true;
            }
        };
        let init = function(){
            $el.on("click.export", exportData);
        }
        init();
    }(statusDisplayer));
    //need code for importing bookmarks
    let dataImport = (function(statusDisplayer){
        let $el = $("#input");
        let importData = function(event){
            try {
            var jsonFile = event.target.result;
            if(!validators.fileIsJSONFile(jsonFile)){throw new AppError("The import file can only be JSON.")}
            bookmarksModule.importExternalData(jsonFile, function(actionResult){
                if(!actionResult.hasError()){
                    statusDisplayer.displaySuccessMessage(actionResult.message);
                } else{statusDisplayer.displayFailureMessage(actionResult.message);}
            });
            } catch (error) {
                statusDisplayer.displayFailureMessage(error.message)
            }
        };
        let getDataFromFileInput = function(event){
            statusDisplayer.displayProgressMessage("Importing data, please wait...")
            var reader = new FileReader();
            reader.onload = importData;
            reader.readAsText(event.target.files[0]);
        };
        let init = function(){
            $el.on("change", getDataFromFileInput);
        };
        init();
    }(statusDisplayer));
    let dataClear = (function (statusDisplayer) {
        let $el = $("#clear");
        let clearData = function (event) {
            try {
                if (!confirm("Are you sure you want to delete all of your bookmarks?")) { return; }
                bookmarksModule.clearAllStorage(function () {
                    statusDisplayer.displaySuccessMessage("Storage cleared.");
                });
            } catch (error) {
                statusDisplayer.displayFailureMessage(error.message)
            }
        };
        let init = function () {
            $el.on("click", clearData);
        };
        init();
    }(statusDisplayer));
});