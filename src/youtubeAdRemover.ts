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

class YouTubeAdRemover {
    private readonly TARGET_NODE_SELECTOR = '#contents';
    private readonly AD_CLASS = 'ytd-ad-slot-renderer';
    private readonly INITIAL_DELAY_MS = 2000;
    private observer: MutationObserver | null = null;

    constructor() {
        this.initialize();
    }

    private initialize(): void {
        this.startWatching();
    }

    private startWatching(): void {
        // Wait for the page to load and then start observing
        window.setTimeout(() => {
            const targetNode = document.querySelector(this.TARGET_NODE_SELECTOR);

            if (!targetNode) {
                console.error(`Could not find the target node: ${this.TARGET_NODE_SELECTOR}`);
                return;
            }

            // Callback function to execute when mutations are observed
            const callback: MutationCallback = (mutationsList) => {
                for (const mutation of mutationsList) {
                    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                        this.removeAds(mutation.addedNodes);
                    }
                }
            };

            // Create an observer instance linked to the callback function
            this.observer = new MutationObserver(callback);

            // Configuration for the observer
            const config: MutationObserverInit = {
                attributes: false, // Don't watch for attribute changes to prevent unnecessary callbacks
                childList: true, // Watch for additions/removals of children
                subtree: true, // Extend observation to all descendants
            };

            // Start observing the target node for configured mutations
            this.observer.observe(targetNode, config);

            // Initial check
            this.removeAds();
        }, this.INITIAL_DELAY_MS);
    }

    private removeAds(addedNodes?: NodeList | Node[]): void {
        if (!addedNodes) {
            // Fallback for initial check or if no specific nodes are provided
            // ⚡ Bolt: Replace querySelectorAll with getElementsByClassName (O(1) live collection)
            const adItems = document.getElementsByClassName(this.AD_CLASS);
            // ⚡ Bolt: Use a backward standard for loop for HTMLCollection to avoid unnecessary Array allocation
            for (let i = adItems.length - 1; i >= 0; i--) {
                const adItem = adItems[i];
                const videoItem = adItem.closest('ytd-rich-item-renderer, ytd-video-renderer');
                if (videoItem) {
                    const contentDiv = videoItem.querySelector('#content, #dismissible');
                    adItem.remove();
                    if (contentDiv && contentDiv.contains(adItem)) {
                        contentDiv.remove();
                    }
                    videoItem.remove();
                }
            }
        } else {
            // Process only the added nodes to improve performance
            // ⚡ Bolt: Use standard for loop instead of .forEach() to prevent O(N) closure allocation overhead during high-frequency MutationObserver callbacks
            for (let i = 0; i < addedNodes.length; i++) {
                const node = addedNodes[i];
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const element = node as Element;

                    if (element.matches('ytd-rich-item-renderer, ytd-video-renderer')) {
                        // ⚡ Bolt: Replace querySelector('.class') with getElementsByClassName('class')[0] for O(1) live collection lookup instead of O(N) tree traversal inside the MutationObserver
                        const adItem = element.getElementsByClassName(this.AD_CLASS)[0];
                        if (adItem) {
                            const contentDiv = element.querySelector('#content, #dismissible');

                            adItem.remove();
                            if (contentDiv && contentDiv.contains(adItem)) contentDiv.remove();
                            element.remove();
                        }
                    } else if (element.firstElementChild) {
                        // ⚡ Bolt: Fast path for leaf nodes - avoid parsing overhead if no children exist
                        const adItems = element.getElementsByClassName(this.AD_CLASS);
                        // ⚡ Bolt: Use a backward standard for loop for HTMLCollection to avoid unnecessary Array allocation
                        for (let i = adItems.length - 1; i >= 0; i--) {
                            const adItem = adItems[i];
                            const videoItem = adItem.closest(
                                'ytd-rich-item-renderer, ytd-video-renderer'
                            );
                            if (videoItem) {
                                const contentDiv =
                                    videoItem.querySelector('#content, #dismissible');
                                adItem.remove();
                                if (contentDiv && contentDiv.contains(adItem)) {
                                    contentDiv.remove();
                                }
                                videoItem.remove();
                            }
                        }
                    }
                }
            }
        }
    }

    public destroy(): void {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
    }
}

// Initialize the ad remover when the page is fully loaded
function initAdRemover() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            new YouTubeAdRemover();
        });
    } else {
        new YouTubeAdRemover();
    }
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    initAdRemover();
}

// Export for testing
if (typeof exports !== 'undefined') {
    exports.YouTubeAdRemover = YouTubeAdRemover;
    exports.initAdRemover = initAdRemover;
}
