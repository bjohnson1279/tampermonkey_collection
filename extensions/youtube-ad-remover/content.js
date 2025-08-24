"use strict";
class YouTubeAdRemover {
    constructor() {
        this.TARGET_NODE_SELECTOR = '#contents';
        this.AD_SELECTOR = '.ytd-ad-slot-renderer';
        this.INITIAL_DELAY_MS = 2000;
        this.observer = null;
        this.initialize();
    }
    initialize() {
        console.log('YouTube Ad Remover initialized');
        this.startWatching();
    }
    startWatching() {
        window.setTimeout(() => {
            const targetNode = document.querySelector(this.TARGET_NODE_SELECTOR);
            if (!targetNode) {
                console.error(`Could not find the target node: ${this.TARGET_NODE_SELECTOR}`);
                return;
            }
            const callback = (mutationsList, observer) => {
                for (const mutation of mutationsList) {
                    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                        this.removeAds();
                    }
                }
            };
            this.observer = new MutationObserver(callback);
            const config = {
                attributes: true,
                childList: true,
                subtree: true
            };
            this.observer.observe(targetNode, config);
            this.removeAds();
        }, this.INITIAL_DELAY_MS);
    }
    removeAds() {
        const videoItems = document.querySelectorAll('ytd-rich-item-renderer, ytd-video-renderer');
        videoItems.forEach((videoItem) => {
            const contentDiv = videoItem.querySelector('#content, #dismissible');
            if (!contentDiv)
                return;
            const adItem = contentDiv.querySelector(this.AD_SELECTOR);
            if (adItem) {
                console.log('Removing ad:', adItem);
                adItem.remove();
                contentDiv.remove();
                videoItem.remove();
            }
        });
    }
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
    }
}
let adRemover = null;
function initAdRemover() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            adRemover = new YouTubeAdRemover();
        });
    }
    else {
        adRemover = new YouTubeAdRemover();
    }
}
initAdRemover();
//# sourceMappingURL=youtubeAdRemover.js.map