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

    // ⚡ Bolt: Replace O(N) DOM traversal and element mutation with O(1) injected stylesheet using CSS :has()
    // This shifts evaluation entirely to the browser's optimized native C++ CSS engine and handles infinite scroll natively.
    const style = document.createElement('style');
    style.textContent = `.tobitem:has(.b_adSlug) { display: none !important; }`;
    (document.head || document.documentElement).appendChild(style);
})();
