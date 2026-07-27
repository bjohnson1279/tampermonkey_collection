// ==UserScript==
// @name         Bing News Search Hide
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Blacklist sources on Bing news search
// @author       Brent Johnson
// @match        https://www.bing.com/news/search*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // Your code here...
    const newsCards = document.querySelectorAll('.news-card');
    const filterSources = []; // Sources to remove

    if (filterSources.length > 0) {
        // Escape regex special chars to prevent syntax errors
        const escapedSources = filterSources.map((src) =>
            src.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        );
        // Pre-compile Regular Expression for O(1) matching vs O(M) loop
        const regex = new RegExp(`(${escapedSources.join('|')})`);

        newsCards.forEach((card) => {
            const source = card.querySelector('.source');
            // Use textContent instead of innerText to avoid triggering reflow
            if (source) {
                const match = source.textContent.match(regex);
                if (match) {
                    console.log(`Removing card from ${match[0]}`);
                    card.style.display = 'none';
                }
            }
        });
    }
})();
