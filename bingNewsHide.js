// ==UserScript==
// @name         Bing News Search Hide
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Blacklist sources on Bing news search
// @author       Brent Johnson
// @match        https://www.bing.com/news/search*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...
    const newsCards = document.querySelectorAll('.news-card');
    const filterSources = ['BGR on MSN.com']; // Sources to remove
    newsCards.forEach(card => {
        const source = card.querySelector('.source');
        filterSources.forEach(src => {
            if (source.innerText.includes(src)) {
                console.log(`Removing card from ${src}`);
                card.style.display = 'none';
            }
        });
    });

})();