"use strict";
(function () {
    'use strict';
    const adSelectors = [
        '.ad-container',
        '.ad-holder',
        '.ad_desktop_placeholder',
        '.ad_desktop_wrapper',
        '.ad_desktop',
        '.ad_clarity',
    ];
    const ads = document.querySelectorAll(adSelectors.join(','));
    for (let i = 0; i < ads.length; i++) {
        ads[i].remove();
    }
    const chartOverlay = document.querySelector('.chart-piano-overlay__attachment-point');
    if (!chartOverlay) {
        return;
    }
    const config = {
        attributes: false,
        childList: true,
        subtree: true,
    };
    const handleMutations = (mutationsList) => {
        for (let i = 0; i < mutationsList.length; i++) {
            const mutation = mutationsList[i];
            if (mutation.target instanceof Node) {
                mutation.target.remove();
            }
        }
        const chartItems = document.getElementsByClassName('chart-list-item');
        for (let i = 0; i < chartItems.length; i++) {
            const chartItem = chartItems[i];
            chartItem.visible = true;
            chartItem.height = 102;
            chartItem.classList.remove('hidden');
        }
    };
    try {
        const observer = new MutationObserver(handleMutations);
        observer.observe(chartOverlay, config);
    }
    catch (error) {
        console.error('Error initializing Billboard overlay observer:', error instanceof Error ? error.message : String(error));
    }
})();
//# sourceMappingURL=billboardOverlay.js.map