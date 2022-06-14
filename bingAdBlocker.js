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

(function() {
    'use strict';

    const slideContainer = document.querySelector(".tob_calcontainer");

    if (slideContainer) {
        const boxes = slideContainer.querySelectorAll(".tobitem");

        if (boxes.length > 0) {
            boxes.forEach(box => {
                const ad = box.querySelector(".b_adSlug");
                if (ad) {
                    box.remove();
                }
            });
        }
    }
})();
