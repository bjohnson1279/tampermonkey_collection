"use strict";
(function () {
    'use strict';
    const removeSponsoredContent = () => {
        const sponsoredElements = document.querySelectorAll('.sponsored');
        sponsoredElements.forEach((sponsored) => {
            const sponsoredContainer = sponsored.closest('.queue, .queue_story');
            if (sponsoredContainer) {
                sponsoredContainer.remove();
            }
        });
    };
    removeSponsoredContent();
    const loadMoreContainer = document.querySelector('#loadMoreBtnContainer');
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
            const sponsoredContainer = el.closest('.queue, .queue_story');
            if (sponsoredContainer) {
                sponsoredContainer.remove();
            }
        }
        else if (el.firstElementChild) {
            const sponsoredElements = el.querySelectorAll('.sponsored');
            sponsoredElements.forEach((sponsored) => {
                const sponsoredContainer = sponsored.closest('.queue, .queue_story');
                if (sponsoredContainer) {
                    sponsoredContainer.remove();
                }
            });
        }
    };
    const handleMutations = (mutationsList) => {
        for (const mutation of mutationsList) {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    processNode(node);
                }
            });
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