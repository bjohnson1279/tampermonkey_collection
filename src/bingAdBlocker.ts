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

    // ⚡ Bolt: Replace querySelector('.class') with getElementsByClassName('class')[0] for O(1) live collection lookup instead of O(N) tree traversal
    const slideContainer = document.getElementsByClassName('tob_calcontainer')[0] as
        HTMLElement | undefined;

    if (slideContainer) {
        // ⚡ Bolt: Replace querySelectorAll with getElementsByClassName for O(1) live collection lookup
        // ⚡ Bolt: Use a backward standard for loop for HTMLCollection to avoid unnecessary Array allocation
        const ads = slideContainer.getElementsByClassName('b_adSlug');
        for (let i = ads.length - 1; i >= 0; i--) {
            const ad = ads[i];
            const box: HTMLElement | null = ad.closest('.tobitem');
            if (box) {
                box.remove();
            }
        }
    }
})();
