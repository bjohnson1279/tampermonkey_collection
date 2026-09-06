"use strict";
(function () {
    'use strict';
    const removeSponsoredContent = () => {
        const sponsoredElements = document.getElementsByClassName('sponsored');
        for (let i = sponsoredElements.length - 1; i >= 0; i--) {
            const sponsored = sponsoredElements[i];
            let parent = sponsored.parentElement;
            while (parent) {
                if (parent.classList.contains('queue') ||
                    parent.classList.contains('queue_story')) {
                    parent.remove();
                    break;
                }
                parent = parent.parentElement;
            }
        }
    };
    removeSponsoredContent();
    const loadMoreContainer = document.getElementById('loadMoreBtnContainer');
    if (!loadMoreContainer) {
        return;
    }
    const config = {
        attributes: false,
        childList: true,
        subtree: true,
    };
    const processNode = (el) => {
        if (el.classList.contains('sponsored')) {
            let parent = el.parentElement;
            while (parent) {
                if (parent.classList.contains('queue') ||
                    parent.classList.contains('queue_story')) {
                    parent.remove();
                    break;
                }
                parent = parent.parentElement;
            }
        }
        else if (el.firstElementChild) {
            const sponsoredElements = el.getElementsByClassName('sponsored');
            for (let i = sponsoredElements.length - 1; i >= 0; i--) {
                const sponsored = sponsoredElements[i];
                let parent = sponsored.parentElement;
                while (parent) {
                    if (parent.classList.contains('queue') ||
                        parent.classList.contains('queue_story')) {
                        parent.remove();
                        break;
                    }
                    parent = parent.parentElement;
                }
            }
        }
    };
    const handleMutations = (mutationsList) => {
        for (let i = 0, len = mutationsList.length; i < len; i++) {
            const mutation = mutationsList[i];
            for (let j = 0, nodeLen = mutation.addedNodes.length; j < nodeLen; j++) {
                const node = mutation.addedNodes[j];
                if (node.nodeType === Node.ELEMENT_NODE) {
                    processNode(node);
                }
            }
        }
    };
    try {
        const observer = new MutationObserver(handleMutations);
        observer.observe(loadMoreContainer, config);
    }
    catch (error) {
        console.error('Error initializing mutation observer:', error instanceof Error ? error.message : String(error));
    }
})();
//# sourceMappingURL=kslSponsoredHide.js.map