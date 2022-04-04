// ==UserScript==
// @name         KSL Comments Blacklist
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Filter comments by obnoxious KSL users
// @author       Brent Johnson
// @match        https://www.ksl.com/article/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    const container = document.querySelector('#commentsContainer');
    const config = { attributes: true, childList: true, subtree: true };

    const cbk = (ml, obs) => {
        const cList = container.querySelector('.CommentsList__root');
        if (cList) {
            const allComments = cList.querySelectorAll('.CommentsList__item');
            allComments.forEach(comment => {
                const username = comment.querySelector('.CommentsList__userName').innerText;

                // Add usernames to the array below to hide their comments
                if ([].includes(username)) {
                    console.log(`User ${username} comment removed`);
                    comment.style.display = 'none';
                }
            });
        }
    };

    const obs = new MutationObserver(cbk);
    obs.observe(container, config);
})();
