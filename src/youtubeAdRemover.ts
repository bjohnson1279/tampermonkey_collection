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
    constructor() {
        this.initialize();
    }

    private initialize(): void {
        // ⚡ Bolt: Replace O(N) MutationObserver DOM traversal with O(1) injected stylesheet using CSS :has()
        // The browser's native CSS engine evaluates this instantly in C++ for both static and dynamically added elements,
        // eliminating JS-to-C++ crossing overhead and avoiding forced layout reflows on infinite scroll.
        const style = document.createElement('style');
        style.textContent = `ytd-rich-item-renderer:has(.ytd-ad-slot-renderer), ytd-video-renderer:has(.ytd-ad-slot-renderer) { display: none !important; }`;
        (document.head || document.documentElement).appendChild(style);
    }

    public destroy(): void {
        // No longer needed
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
