"use strict";
(function () {
    'use strict';
    const adSelectors = [
        '.ad-container',
        '.ad-holder',
        '.ad_desktop_placeholder',
        '.ad_desktop_wrapper',
        '.ad_desktop',
        '.ad_clarity'
    ];
    document.querySelectorAll(adSelectors.join(',')).forEach((ad) => {
        ad.remove();
    });
    const chartOverlay = document.querySelector('.chart-piano-overlay__attachment-point');
    if (!chartOverlay) {
        return;
    }
    const config = {
        attributes: false,
        childList: true,
        subtree: true
    };
    const handleMutations = (mutationsList) => {
        mutationsList.forEach((mutation) => {
            if (mutation.target instanceof Node) {
                mutation.target.remove();
            }
        });
        const chartItems = document.querySelectorAll('.chart-list-item');
        chartItems.forEach((chartItem) => {
            chartItem.visible = true;
            chartItem.height = 102;
            chartItem.classList.remove('hidden');
        });
    };
    try {
        const observer = new MutationObserver(handleMutations);
        observer.observe(chartOverlay, config);
    }
    catch (error) {
        console.error('Error initializing Billboard overlay observer:', error);
    }
})();
//# sourceMappingURL=billboardOverlay.js.map