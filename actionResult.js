//the videoPlayer should have an interface including:
//seekToTime - a method to go to a certain time.
//getVideoDuration - a method to get a video's duration.
var getActionResult = function () {
    let errors = {};
    let getErrors = function(){
        return errors;
    };
    let setErrors = function(newErrorsObject) {errors = newErrorsObject;};
    let hasErrors = function(){
        return $.isEmptyObject(errors);
    };
    let actionWasSuccessful = function(){return !hasErrors();};
    let setMessage = function(newMessage){message = newMessage;};
    let addToErrors = function(errorKey, errorMessage){
        errors[errorKey] = errorMessage;
    }
    return {
        actionWasSuccessful: actionWasSuccessful,
        setMessage:setMessage,
        getMessage:getMessage,
        getErrors:getErrors,
        setErrors:setErrors,
        addToErrors:addToErrors,
    };
};