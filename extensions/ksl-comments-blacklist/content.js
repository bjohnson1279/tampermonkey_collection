"use strict";
const _global = typeof window !== 'undefined' ? window : global;
_global.__kslTestExports = _global.__kslTestExports || {};
(function () {
    'use strict';
    const container = typeof document !== 'undefined' ? document.getElementById('commentsContainer') : null;
    const config = {
        attributes: false,
        childList: true,
        subtree: true,
    };
    _global.__kslTestExports.config = config;
    const blockedUsers = new Set([]);
    _global.__kslTestExports.blockedUsers = blockedUsers;
    const processComment = (comment) => {
        const usernameElement = comment.getElementsByClassName('CommentsList__userName')[0];
        if (!usernameElement?.textContent)
            return;
        const username = usernameElement.textContent.trim();
        if (blockedUsers.has(username)) {
            comment.style.display = 'none';
        }
    };
    _global.__kslTestExports.processComment = processComment;
    const handleMutations = (mutationsList) => {
        for (const mutation of mutationsList) {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const el = node;
                    if (el.classList.contains('CommentsList__item')) {
                        processComment(el);
                    }
                    if (el.firstElementChild) {
                        const nestedComments = el.getElementsByClassName('CommentsList__item');
                        Array.from(nestedComments).forEach((comment) => processComment(comment));
                    }
                }
            });
        }
    };
    _global.__kslTestExports.handleMutations = handleMutations;
    if (!container) {
        return;
    }
    try {
        const observer = new MutationObserver(handleMutations);
        observer.observe(container, config);
        const commentsList = container.getElementsByClassName('CommentsList__root')[0];
        if (commentsList) {
            const allComments = commentsList.getElementsByClassName('CommentsList__item');
            Array.from(allComments).forEach((comment) => processComment(comment));
        }
    }
    catch (error) {
        console.error('Error initializing comment observer:', error instanceof Error ? error.message : String(error));
    }
})();
//# sourceMappingURL=kslCommentsHide.js.map