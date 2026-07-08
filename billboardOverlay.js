// ==UserScript==
// @name         Billboard Chart Remove Overlay
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Prevent Overlay on Billboard Charts
// @author       Brent Johnson
// @match        https://www.billboard.com/charts/*
// @icon         https://www.google.com/s2/favicons?domain=billboard.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...
    // ⚡ Bolt: Use a combined selector to reduce multiple O(N) DOM traversals to a single O(1) traversal
    const adSelectors = '.ad-container, .ad-holder, .ad_desktop_placeholder, .ad_desktop_wrapper, .ad_desktop, .ad_clarity';
    document.querySelectorAll(adSelectors).forEach(ad => ad.remove());

    const chartOverlay = document.querySelector('.chart-piano-overlay__attachment-point');
    // ⚡ Bolt: Disable attributes to prevent unnecessary callbacks on every attribute change
    const config = { attributes: false, childList: true, subtree: true };
    const callback = (mutationsList, observer) => {
        mutationsList.forEach(mutation => {
            mutation.target.remove();
        });

        const chartItems = document.querySelectorAll('.chart-list-item');
        chartItems.forEach(charItem => {
            charItem.visible = true;
            charItem.height = 102;
            charItem.classList.remove('hidden');
        });
    }

    const observer = new MutationObserver(callback);
    observer.observe(chartOverlay, config);
})();
