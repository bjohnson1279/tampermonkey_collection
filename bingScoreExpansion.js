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

    const scoreCards = document.querySelectorAll('.spl-card');
    console.log({ scoreCards });
    scoreCards.forEach((card) => {
        card.style.display = 'block';
    });

    // ⚡ Bolt: Combine multiple O(N) DOM traversals into a single O(1) pass using a comma-separated selector
    // Expand schedule, standings, and filter content sections
    const hiddenRows = document.querySelectorAll(
        '.spl-schedule .b_hide, .spl-standingTbl .b_hide, .tfil-content .b_hide'
    );
    hiddenRows.forEach((row) => {
        row.style.display = 'table-row';
    });
})();
