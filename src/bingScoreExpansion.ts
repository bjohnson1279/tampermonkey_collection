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
    const scoreCards = document.querySelectorAll<HTMLElement>(".spl-card");
    console.log('Score cards found:', scoreCards.length);
    scoreCards.forEach((card: HTMLElement): void => {
        card.style.display = "block";
    });

    // Expand schedule section
    const schedule = document.querySelector<HTMLElement>(".spl-schedule");
    console.log('Schedule section:', schedule ? 'found' : 'not found');
    if (schedule) {
        const scheduleHiddenRows = schedule.querySelectorAll<HTMLElement>(".b_hide");
        scheduleHiddenRows.forEach((row: HTMLElement): void => {
            row.style.display = "table-row";
        });
    }

    // Expand standings section
    const standings = document.querySelector<HTMLElement>(".spl-standingTbl");
    console.log('Standings section:', standings ? 'found' : 'not found');
    if (standings) {
        const standingsHiddenRows = standings.querySelectorAll<HTMLElement>(".b_hide");
        standingsHiddenRows.forEach((row: HTMLElement): void => {
            row.style.display = "table-row";
        });
    }

    // Expand filter content section
    const filContent = document.querySelector<HTMLElement>(".tfil-content");
    console.log('Filter content section:', filContent ? 'found' : 'not found');
    if (filContent) {
        const contentHiddenRows = filContent.querySelectorAll<HTMLElement>(".b_hide");
        contentHiddenRows.forEach((row: HTMLElement): void => {
            row.style.display = "table-row";
        });
    }
})();
