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
    document.querySelectorAll('.ad-container').forEach(ad => ad.remove());
    document.querySelectorAll('.ad-holder').forEach(ad => ad.remove());
    document.querySelectorAll('.ad_desktop_placeholder').forEach(ad => ad.remove());
    document.querySelectorAll('.ad_desktop_wrapper').forEach(ad => ad.remove());
    document.querySelectorAll('.ad_desktop').forEach(ad => ad.remove());
    document.querySelectorAll('.ad_clarity').forEach(ad => ad.remove());

    const chartOverlay = document.querySelector('.chart-piano-overlay__attachment-point');
    const config = { attributes: true, childList: true, subtree: true };
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
