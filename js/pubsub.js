class PubSub {
    constructor(){
        this.events = {};
    }
    
    on(eventName, fn) {
        this.events[eventName] = this.events[eventName] || [];
        this.events[eventName].push(fn);
    }
    off(eventName, fn) {
        if (this.events[eventName]) {
            for (var i = 0; i < this.events[eventName].length; i++) {
                if (this.events[eventName][i] === fn) {
                    this.events[eventName].splice(i, 1);
                    break;
                }
            };
        }
    }
    emit(eventName, data) {
        if (this.events[eventName]) {
            this.events[eventName].forEach(function (fn) {
                fn(data);
            });
        }
    }
};
//helper class to store a specific list of events to bind/unbind from a pubsub object.
class PubSubEventList{
    constructor(){
        this.eventList = [];
    }
    bindEventsToPubSub(pubSub){
        for (let index = 0; index < this.eventList.length; index++) {
            const currentListElement = this.eventList[index];
            pubSub.on(currentListElement.eventName, currentListElement.event);
        }
        //return pubSub;
    }
    unbindEventsInPubSub(pubSub){
        for (let index = 0; index < this.eventList.length; index++) {
            const currentListElement = this.eventList[index];
            pubSub.off(currentListElement.eventName, currentListElement.event);
        }
        //return pubSub;
    }
    addEventToList(eventName, eventFunction){
        this.eventList.push({
            "eventName":eventName, 
            "event":eventFunction, 
        });
    }
}