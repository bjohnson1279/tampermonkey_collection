// ==UserScript==
// @name         KSL Comments Blacklist
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Filter comments by obnoxious KSL users
// @author       Brent Johnson
// @match        https://www.ksl.com/article/*
// @grant        none
// ==/UserScript==

interface CommentElement extends Element {
    style: CSSStyleDeclaration;
}

(function (): void {
    'use strict';

    const container = document.querySelector<HTMLElement>('#commentsContainer');
    if (!container) {
        return;
    }

    // ⚡ Bolt: Disable attributes to prevent unnecessary callbacks on every attribute change
    const config: MutationObserverInit = {
        attributes: false,
        childList: true,
        subtree: true,
    };

    // ⚡ Bolt: Extract array allocations out of high-frequency observer loops
    // and convert to Set to improve lookup to O(1)
    // Add usernames to the array below to hide their comments
    const blockedUsers = new Set<string>([]);

    const processComment = (comment: HTMLElement): void => {
        const usernameElement = comment.querySelector<HTMLElement>('.CommentsList__userName');
        if (!usernameElement?.textContent) return;

        const username = usernameElement.textContent.trim();

        if (blockedUsers.has(username)) {
            console.log(`Hiding comment from user: ${username}`);
            (comment as CommentElement).style.display = 'none';
        }
    };

    const handleMutations: MutationCallback = (mutationsList: MutationRecord[]): void => {
        // ⚡ Bolt: Only process added nodes instead of re-querying the entire DOM list on every mutation
        // This avoids O(N²) scaling as more comments are loaded dynamically
        for (const mutation of mutationsList) {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const el = node as HTMLElement;
                    if (el.classList.contains('CommentsList__item')) {
                        processComment(el);
                    }
                    if (el.firstElementChild) {
                        // ⚡ Bolt: Fast path for leaf nodes - avoid querySelectorAll parsing overhead if no children exist
                        const nestedComments =
                            el.querySelectorAll<HTMLElement>('.CommentsList__item');
                        nestedComments.forEach(processComment);
                    }
                }
            });
        }
    };

    try {
        const observer = new MutationObserver(handleMutations);
        observer.observe(container, config);

        // Initial check in case comments are already loaded
        const commentsList = container.querySelector<HTMLElement>('.CommentsList__root');
        if (commentsList) {
            const allComments = commentsList.querySelectorAll<HTMLElement>('.CommentsList__item');
            allComments.forEach(processComment);
        }
    } catch (error) {
        console.error('Error initializing comment observer:', error);
    }
})();
