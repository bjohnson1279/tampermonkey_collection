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

(function () {
    'use strict';

    const slideContainer = document.querySelector('.tob_calcontainer');

    if (slideContainer) {
        // ⚡ Performance: Use a single query for all ads to avoid O(N) redundant DOM searches
        const ads = slideContainer.querySelectorAll('.tobitem .b_adSlug');
        ads.forEach((ad) => {
            const box = ad.closest('.tobitem');
            if (box) {
                box.remove();
            }
        });
    }
})();
