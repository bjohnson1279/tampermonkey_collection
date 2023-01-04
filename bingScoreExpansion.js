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

(function() {
    'use strict';

    const scoreCards = document.querySelectorAll(".spl-card");
    scoreCards.forEach(card => {
        card.style.display = "block";
    });

    const hiddenRows = document.querySelectorAll(".b_hide");
    hiddenRows.forEach(row => {
        row.style.display = "table-row";
    });
})();
