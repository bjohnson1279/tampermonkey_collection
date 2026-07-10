// ==UserScript==
// @name         YouTube Ad Remover
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Remove ads from YouTube
// @author       Brent Johnson
// @match        https://www.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @grant        none
// ==/UserScript==

'use strict';
class YouTubeAdRemover {
    constructor() {
        this.TARGET_NODE_SELECTOR = '#contents';
        this.AD_SELECTOR = '.ytd-ad-slot-renderer';
        this.INITIAL_DELAY_MS = 2000;
        this.observer = null;
        this.initialize();
    }
    initialize() {
        this.startWatching();
    }
    startWatching() {
        window.setTimeout(() => {
            const targetNode = document.querySelector(this.TARGET_NODE_SELECTOR);
            if (!targetNode) {
                console.error(`Could not find the target node: ${this.TARGET_NODE_SELECTOR}`);
                return;
            }
            const callback = (mutationsList) => {
                for (const mutation of mutationsList) {
                    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                        this.removeAds(mutation.addedNodes);
                    }
                }
            };
            this.observer = new MutationObserver(callback);
            const config = {
                attributes: false,
                childList: true,
                subtree: true,
            };
            this.observer.observe(targetNode, config);
            this.removeAds();
        }, this.INITIAL_DELAY_MS);
    }
    processVideoItem(videoItem) {
        const contentDiv = videoItem.querySelector('#content, #dismissible');
        if (!contentDiv) return;
        const adItem = contentDiv.querySelector(this.AD_SELECTOR);
        if (adItem) {
            console.log('Removing ad:', adItem);
            adItem.remove();
            contentDiv.remove();
            videoItem.remove();
        }
    }
    removeAds(addedNodes) {
        if (!addedNodes) {
            const videoItems = document.querySelectorAll(
                'ytd-rich-item-renderer, ytd-video-renderer'
            );
            videoItems.forEach((videoItem) => this.processVideoItem(videoItem));
        } else {
            addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const element = node;
                    if (element.matches('ytd-rich-item-renderer, ytd-video-renderer')) {
                        this.processVideoItem(element);
                    } else if (element.firstElementChild) {
                        const videoItems = element.querySelectorAll(
                            'ytd-rich-item-renderer, ytd-video-renderer'
                        );
                        videoItems.forEach((videoItem) => this.processVideoItem(videoItem));
                    }
                }
            });
        }
    }
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
    }
}
function initAdRemover() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            new YouTubeAdRemover();
        });
    } else {
        new YouTubeAdRemover();
    }
}
initAdRemover();
//# sourceMappingURL=youtubeAdRemover.js.map
