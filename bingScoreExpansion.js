// ==UserScript==
// @name         Bing Scores Expansion
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.bing.com/search*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bing.com
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // ⚡ Bolt: Replace O(N) DOM mutations with O(1) injected stylesheet
    // Avoids forced reflows and loop iteration entirely
    const style = document.createElement('style');
    style.textContent = `
        /* Show all score cards */
        .spl-card { display: block !important; }
        /* Expand schedule, standings, and filter content sections */
        .spl-schedule .b_hide, .spl-standingTbl .b_hide, .tfil-content .b_hide { display: table-row !important; }
    `;

    // Fallback to documentElement if head is not available yet
    (document.head || document.documentElement).appendChild(style);
})();
