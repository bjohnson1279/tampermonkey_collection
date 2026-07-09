// ==UserScript==
// @name         Bing Scores Expansion
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Expands all hidden score cards and tables on Bing search results
// @author       Brent Johnson
// @match        https://www.bing.com/search*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bing.com
// @grant        none
// ==/UserScript==

(function (): void {
    'use strict';

    // Show all score cards
    const scoreCards = document.querySelectorAll<HTMLElement>('.spl-card');
    scoreCards.forEach((card: HTMLElement): void => {
        card.style.display = 'block';
    });

    // ⚡ Bolt: Combine multiple O(N) DOM traversals into a single O(1) pass using a comma-separated selector
    // Expand schedule, standings, and filter content sections
    const hiddenRows = document.querySelectorAll<HTMLElement>(
        '.spl-schedule .b_hide, .spl-standingTbl .b_hide, .tfil-content .b_hide'
    );
    hiddenRows.forEach((row: HTMLElement): void => {
        row.style.display = 'table-row';
    });
})();
