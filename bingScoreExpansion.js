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
    console.log({ scoreCards });
    scoreCards.forEach(card => {
        card.style.display = "block";
    });

    const schedule = document.querySelector(".spl-schedule");
    console.log({ schedule });
    if (schedule) {
        const scheduleHiddenRows = schedule.querySelectorAll(".b_hide");
        scheduleHiddenRows.forEach(row => {
            row.style.display = "table-row";
        });
    }

    const standings = document.querySelector(".spl-standingTbl");
    console.log({ standings });
    if (standings) {
        const standingsHiddenRows = standings.querySelectorAll(".b_hide");
        standingsHiddenRows.forEach(row => {
            row.style.display = "table-row";
        });
    }

    const filContent = document.querySelector(".tfil-content");
    console.log({ filContent });
    if (filContent) {
        const contentHiddenRows = filContent.querySelectorAll(".b_hide");
        contentHiddenRows.forEach(row => {
            row.style.display = "table-row";
        });
    }
})();
