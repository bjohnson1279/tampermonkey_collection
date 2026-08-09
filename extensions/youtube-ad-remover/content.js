"use strict";
class YouTubeAdRemover {
    constructor() {
        this.TARGET_NODE_SELECTOR = '#contents';
        this.AD_CLASS = 'ytd-ad-slot-renderer';
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
                for (let i = 0; i < mutationsList.length; i++) {
                    const mutation = mutationsList[i];
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
    removeAds(addedNodes) {
        if (!addedNodes) {
            const adItems = document.getElementsByClassName(this.AD_CLASS);
            for (let i = adItems.length - 1; i >= 0; i--) {
                const adItem = adItems[i];
                const videoItem = adItem.closest('ytd-rich-item-renderer, ytd-video-renderer');
                if (videoItem) {
                    videoItem.remove();
                }
            }
        }
        else {
            for (let i = 0; i < addedNodes.length; i++) {
                const node = addedNodes[i];
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const element = node;
                    if (element.matches('ytd-rich-item-renderer, ytd-video-renderer')) {
                        const adItem = element.getElementsByClassName(this.AD_CLASS)[0];
                        if (adItem) {
                            element.remove();
                        }
                    }
                    else if (element.firstElementChild) {
                        const adItems = element.getElementsByClassName(this.AD_CLASS);
                        for (let i = adItems.length - 1; i >= 0; i--) {
                            const adItem = adItems[i];
                            const videoItem = adItem.closest('ytd-rich-item-renderer, ytd-video-renderer');
                            if (videoItem) {
                                videoItem.remove();
                            }
                        }
                    }
                }
            }
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
    }
    else {
        new YouTubeAdRemover();
    }
}
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    initAdRemover();
}
if (typeof exports !== 'undefined') {
    exports.YouTubeAdRemover = YouTubeAdRemover;
    exports.initAdRemover = initAdRemover;
}
//# sourceMappingURL=youtubeAdRemover.js.map