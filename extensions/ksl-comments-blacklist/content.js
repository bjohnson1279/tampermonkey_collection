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
        for (let i = 0, len = mutationsList.length; i < len; i++) {
            const mutation = mutationsList[i];
            for (let j = 0, nodeLen = mutation.addedNodes.length; j < nodeLen; j++) {
                const node = mutation.addedNodes[j];
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const el = node;
                    if (el.classList.contains('CommentsList__item')) {
                        processComment(el);
                    }
                    if (el.firstElementChild) {
                        const nestedComments = el.getElementsByClassName('CommentsList__item');
                        for (let k = 0, len = nestedComments.length; k < len; k++) {
                            processComment(nestedComments[k]);
                        }
                    }
                }
            }
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
            for (let i = 0, len = allComments.length; i < len; i++) {
                processComment(allComments[i]);
            }
        }
    }
    catch (error) {
        console.error('Error initializing comment observer:', error instanceof Error ? error.message : String(error));
    }
})();
//# sourceMappingURL=kslCommentsHide.js.map