"use strict";
(function () {
    'use strict';
    const removeSponsoredContent = () => {
        const sponsoredElements = document.querySelectorAll('.sponsored');
        console.log(`Found ${sponsoredElements.length} sponsored elements`);
        sponsoredElements.forEach((sponsored) => {
            const sponsoredContainer = sponsored.closest('.queue, .queue_story');
            if (sponsoredContainer) {
                console.log('Removing sponsored content');
                sponsoredContainer.remove();
            }
        });
    };
    removeSponsoredContent();
    const loadMoreContainer = document.querySelector('#loadMoreBtnContainer');
    if (!loadMoreContainer) {
        console.log('Load more container not found');
        return;
    }
    const config = {
        attributes: false,
        childList: true,
        subtree: true
    };
    const handleMutations = (mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                removeSponsoredContent();
                break;
            }
        }
    };
    try {
        const observer = new MutationObserver(handleMutations);
        observer.observe(loadMoreContainer, config);
        console.log('MutationObserver started');
    }
    catch (error) {
        console.error('Error initializing mutation observer:', error);
    }
})();
//# sourceMappingURL=kslSponsoredHide.js.map