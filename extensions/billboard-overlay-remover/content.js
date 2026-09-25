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
    const style = document.createElement('style');
    style.textContent = `${adSelectors.join(', ')} { display: none !important; }`;
    (document.head || document.documentElement).appendChild(style);
    const chartOverlay = document.getElementsByClassName('chart-piano-overlay__attachment-point')[0];
    if (!chartOverlay) {
        return;
    }
    const config = {
        attributes: false,
        childList: true,
        subtree: true,
    };
    const chartItems = document.getElementsByClassName('chart-list-item');
    const handleMutations = (mutationsList) => {
        for (let i = 0, len = mutationsList.length; i < len; i++) {
            const mutation = mutationsList[i];
            if (mutation.target instanceof Node) {
                mutation.target.remove();
            }
        }
        for (let i = 0, len = chartItems.length; i < len; i++) {
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