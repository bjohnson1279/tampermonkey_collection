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
        console.log('YouTube Ad Remover initialized');
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
                        this.removeAds();
                    }
                }
            };

            // Create an observer instance linked to the callback function
            this.observer = new MutationObserver(callback);

            // Configuration for the observer
            const config: MutationObserverInit = {
                attributes: true, // Watch for attribute changes
                childList: true, // Watch for additions/removals of children
                subtree: true // Extend observation to all descendants
            };

            // Start observing the target node for configured mutations
            this.observer.observe(targetNode, config);
            
            // Initial check
            this.removeAds();
            
        }, this.INITIAL_DELAY_MS);
    }

    private removeAds(): void {
        // Find all video items
        const videoItems = document.querySelectorAll('ytd-rich-item-renderer, ytd-video-renderer');
        
        videoItems.forEach((videoItem) => {
            // Find the content div that might contain ads
            const contentDiv = videoItem.querySelector('#content, #dismissible');
            if (!contentDiv) return;

            // Check for ad elements
            const adItem = contentDiv.querySelector(this.AD_SELECTOR);
            if (adItem) {
                console.log('Removing ad:', adItem);
                adItem.remove();
                contentDiv.remove();
                videoItem.remove();
            }
        });
    }

    public destroy(): void {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
    }
}

// Initialize the ad remover when the page is fully loaded
let adRemover: YouTubeAdRemover | null = null;

function initAdRemover() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            adRemover = new YouTubeAdRemover();
        });
    } else {
        adRemover = new YouTubeAdRemover();
    }
}

initAdRemover();
