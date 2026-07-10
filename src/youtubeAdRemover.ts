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
    private readonly AD_SELECTOR = '.ytd-ad-slot-renderer';
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
            const callback: MutationCallback = (mutationsList, observer) => {
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

    private processVideoItem(videoItem: Element): void {
        // Find the content div that might contain ads
        const contentDiv = videoItem.querySelector('#content, #dismissible');
        if (!contentDiv) return;

        // Check for ad elements
        const adItem = contentDiv.querySelector(this.AD_SELECTOR);
        if (adItem) {
            adItem.remove();
            contentDiv.remove();
            videoItem.remove();
        }
    }

    private removeAds(addedNodes?: NodeList | Node[]): void {
        if (!addedNodes) {
            // Fallback for initial check or if no specific nodes are provided
            // Find all video items
            const videoItems = document.querySelectorAll(
                'ytd-rich-item-renderer, ytd-video-renderer'
            );
            videoItems.forEach((videoItem) => this.processVideoItem(videoItem));
        } else {
            // Process only the added nodes to improve performance
            addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const element = node as Element;

                    if (element.matches('ytd-rich-item-renderer, ytd-video-renderer')) {
                        this.processVideoItem(element);
                    } else if (element.firstElementChild) {
                        // ⚡ Bolt: Fast path for leaf nodes - avoid querySelectorAll parsing overhead if no children exist
                        const videoItems = element.querySelectorAll(
                            'ytd-rich-item-renderer, ytd-video-renderer'
                        );
                        videoItems.forEach((videoItem) => this.processVideoItem(videoItem));
                    }
                }
            });
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

initAdRemover();
