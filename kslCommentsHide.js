// ==UserScript==
// @name         KSL Comments Blacklist
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Filter comments by obnoxious KSL users
// @author       Brent Johnson
// @match        https://www.ksl.com/article/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    const container = document.querySelector('#commentsContainer');
    // ⚡ Bolt: Disable attributes to prevent unnecessary callbacks on every attribute change
    const config = { attributes: false, childList: true, subtree: true };

    // ⚡ Bolt: Extract array allocations out of high-frequency observer loops
    // and convert to Set to improve lookup to O(1)
    // Add usernames to the array below to hide their comments
    const blockedUsers = new Set([]);

    const processComment = (comment) => {
        const usernameElement = comment.querySelector('.CommentsList__userName');
        if (!usernameElement?.textContent) return;

        const username = usernameElement.textContent.trim();

        if (blockedUsers.has(username)) {
            console.log(`User ${username} comment removed`);
            comment.style.display = 'none';
        }
    };

    const cbk = (ml) => {
        // ⚡ Bolt: Only process added nodes instead of re-querying the entire DOM list on every mutation
        // This avoids O(N²) scaling as more comments are loaded dynamically
        for (const mutation of ml) {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    if (node.classList.contains('CommentsList__item')) {
                        processComment(node);
                    }
                    if (node.firstElementChild) {
                        // ⚡ Bolt: Fast path for leaf nodes - avoid querySelectorAll parsing overhead if no children exist
                        const nestedComments = node.querySelectorAll('.CommentsList__item');
                        nestedComments.forEach(processComment);
                    }
                }
            });
        }
    };

    const obs = new MutationObserver(cbk);
    obs.observe(container, config);

    // Initial check in case comments are already loaded
    const cList = container.querySelector('.CommentsList__root');
    if (cList) {
        const allComments = cList.querySelectorAll('.CommentsList__item');
        allComments.forEach(processComment);
    }
})();
