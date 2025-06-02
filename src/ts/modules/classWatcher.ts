import {capitalizeFirstLetter} from "@utils";

export class ClassWatcher {
    eventType: string;
    targetNode: HTMLElement;
    classToWatch: "string";
    classAddedCallback: Function;
    classRemovedCallback?: Function | null;
    observer: null | MutationObserver;
    lastClassState: boolean | null;
    observerSettings: {
        attributes?: boolean,
        childList?: boolean,
        characterData?: boolean,
        subtree?: boolean,
    }


    constructor(eventType, targetNode, classToWatch, classAddedCallback, classRemovedCallback = null) {
        this.eventType = eventType;
        this.targetNode = targetNode
        this.classToWatch = classToWatch
        this.classAddedCallback = classAddedCallback
        this.classRemovedCallback = classRemovedCallback ? classRemovedCallback : null
        this.observer = null
        this.lastClassState = targetNode.classList.contains(this.classToWatch);
        this.observerSettings = {
            attributes: true
        }

        if (eventType === 'tag') {
            this.observerSettings['childList'] = true;
            this.observerSettings['characterData'] = false;
            this.observerSettings['subtree'] = true;
        }

        this.init()
    }

    init() {
        this.observer = new MutationObserver(this['mutationCallback' + capitalizeFirstLetter(this.eventType)].bind(this))
        this.observe()
    }

    observe() {
        if (this.observer) {
            this.observer.observe(this.targetNode, this.observerSettings)
        }
    }

    disconnect() {
        if (this.observer)
        this.observer.disconnect()
    }

    mutationCallbackTag(mutationsList) {
        if (this.targetNode.querySelector(".nice-select")) {
            this.classAddedCallback()
            this.disconnect()
        }
    }

    mutationCallbackClass(mutationsList){
        for(let mutation of mutationsList) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                let currentClassState = mutation.target.classList.contains(this.classToWatch)
                if(this.lastClassState !== currentClassState) {
                    this.lastClassState = currentClassState
                    if(currentClassState) {
                        this.classAddedCallback()
                    }
                    else {
                        if (this.classRemovedCallback) {
                            this.classRemovedCallback()
                        }
                    }
                }
            }
        }
    }
}
