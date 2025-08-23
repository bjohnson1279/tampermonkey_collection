"use strict";
(function () {
    'use strict';
    const container = document.querySelector('#commentsContainer');
    if (!container) {
        console.log('Comments container not found');
        return;
    }
    const config = {
        attributes: true,
        childList: true,
        subtree: true
    };
    const handleMutations = (mutationsList, observer) => {
        const commentsList = container.querySelector('.CommentsList__root');
        if (!commentsList)
            return;
        const allComments = commentsList.querySelectorAll('.CommentsList__item');
        allComments.forEach((comment) => {
            const usernameElement = comment.querySelector('.CommentsList__userName');
            if (!usernameElement?.textContent)
                return;
            const username = usernameElement.textContent.trim();
            const blockedUsers = [];
            if (blockedUsers.includes(username)) {
                console.log(`Hiding comment from user: ${username}`);
                comment.style.display = 'none';
            }
        });
    };
    try {
        const observer = new MutationObserver(handleMutations);
        observer.observe(container, config);
        handleMutations([], observer);
    }
    catch (error) {
        console.error('Error initializing comment observer:', error);
    }
})();
//# sourceMappingURL=kslCommentsHide.js.map