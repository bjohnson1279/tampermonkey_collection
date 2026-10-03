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
    private readonly STYLE_ID = 'yt-ad-remover-styles';
    private styleElement: HTMLStyleElement | null = null;

    constructor() {
        this.initialize();
    }

    private initialize(): void {
        // ⚡ Bolt: Replace O(N) DOM querySelectorAll loops and MutationObserver traversal for static ad containers with a single O(1) injected stylesheet using CSS :has()
        // The browser's native CSS engine evaluates this instantly in C++ for both static and dynamically added elements,
        // eliminating JS-to-C++ crossing overhead and avoiding forced layout reflows on infinite scroll.
        if (!document.getElementById(this.STYLE_ID)) {
            this.styleElement = document.createElement('style');
            this.styleElement.id = this.STYLE_ID;
            this.styleElement.textContent = `ytd-rich-item-renderer:has(.ytd-ad-slot-renderer), ytd-video-renderer:has(.ytd-ad-slot-renderer) { display: none !important; }`;
            (document.head || document.documentElement).appendChild(this.styleElement);
        }
    }

    public destroy(): void {
        if (this.styleElement && this.styleElement.parentNode) {
            this.styleElement.parentNode.removeChild(this.styleElement);
            this.styleElement = null;
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
