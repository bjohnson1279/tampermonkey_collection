// ==UserScript==
// @name         Bing Ad Blocker
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Remove Bing Ads From News Feed
// @author       Brent Johnson
// @match        https://www.bing.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bing.com
// @grant        none
// ==/UserScript==

(function (): void {
    'use strict';

    const slideContainer: HTMLElement | null = document.querySelector('.tob_calcontainer');

    if (slideContainer) {
        // ⚡ Bolt: Replace O(N) internal DOM traversals inside the loop with a single O(1) pass
        // using a descendant CSS selector, significantly reducing main thread parsing overhead.
        const ads: NodeListOf<HTMLElement> = slideContainer.querySelectorAll('.tobitem .b_adSlug');

        ads.forEach((ad: HTMLElement) => {
            const box = ad.closest('.tobitem');
            if (box) {
                box.remove();
            }
        });
    }
})();
