// ==UserScript==
// @name         KSL Sponsored Article Remover
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Remove sponsored articles from KSL.com
// @author       You
// @match        https://www.ksl.com/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=ksl.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...
    const cbk = (ml, obs) => {
        console.log(`cbk`);
        // console.log({ ml });
        // console.log({ obs });
        const sponsoredContent = loadMoreContainer.querySelectorAll('.sponsored');
        console.log({ sponsoredContent });

        if (sponsoredContent) {
            sponsoredContent.forEach(sponsored => {
                const sponsoredContainer = sponsored.closest('.queue_story');
                console.log({ sponsoredContainer });
                if (sponsoredContainer) {
                    sponsoredContainer.remove();
                }
            });
        }
    };

    const sponsoredContent = document.querySelectorAll('.sponsored');
    if (sponsoredContent) {
        sponsoredContent.forEach(sponsored => {
            const sponsoredContainer = sponsored.closest('.queue');
            if (sponsoredContainer) {
                sponsoredContainer.remove();
            }
        });
    }

    const loadMoreContainer = document.querySelector('#loadMoreBtnContainer');
    console.log({ loadMoreContainer });
    const config = { attributes: false, childList: true, subtree: true };
    const obs = new MutationObserver(cbk);
    obs.observe(loadMoreContainer, config);
})();
