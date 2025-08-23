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
        console.log('Comments container not found');
        return;
    }

    const config: MutationObserverInit = {
        attributes: true,
        childList: true,
        subtree: true
    };

    const handleMutations: MutationCallback = (mutationsList: MutationRecord[], observer: MutationObserver): void => {
        const commentsList = container.querySelector<HTMLElement>('.CommentsList__root');
        if (!commentsList) return;

        const allComments = commentsList.querySelectorAll<HTMLElement>('.CommentsList__item');
        allComments.forEach((comment: HTMLElement): void => {
            const usernameElement = comment.querySelector<HTMLElement>('.CommentsList__userName');
            if (!usernameElement?.textContent) return;

            const username = usernameElement.textContent.trim();
            
            // Add usernames to the array below to hide their comments
            const blockedUsers: string[] = [];
            
            if (blockedUsers.includes(username)) {
                console.log(`Hiding comment from user: ${username}`);
                (comment as CommentElement).style.display = 'none';
            }
        });
    };

    try {
        const observer = new MutationObserver(handleMutations);
        observer.observe(container, config);
        
        // Initial check in case comments are already loaded
        handleMutations([], observer);
    } catch (error) {
        console.error('Error initializing comment observer:', error);
    }
})();
