// ==UserScript==
// @name         Billboard Chart Remove Overlay
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Prevent Overlay on Billboard Charts
// @author       Brent Johnson
// @match        https://www.billboard.com/charts/*
// @icon         https://www.google.com/s2/favicons?domain=billboard.com
// @grant        none
// ==/UserScript==

interface ExtendedHTMLElement extends HTMLElement {
    visible?: boolean;
    height?: number;
}

(function (): void {
    'use strict';

    // Remove various ad containers
    const adSelectors = [
        'ad-container',
        'ad-holder',
        'ad_desktop_placeholder',
        'ad_desktop_wrapper',
        'ad_desktop',
        'ad_clarity',
    ];

    // ⚡ Bolt: Replace O(N) querySelectorAll with O(1) live collection lookups via getElementsByClassName
    for (let j = 0; j < adSelectors.length; j++) {
        const ads = document.getElementsByClassName(adSelectors[j]);
        // ⚡ Bolt: Use a backward standard for loop for HTMLCollection to avoid unnecessary Array allocation
        for (let i = ads.length - 1; i >= 0; i--) {
            ads[i].remove();
        }
    }

    // Set up mutation observer for the chart overlay
    // ⚡ Bolt: Replace querySelector('.class') with getElementsByClassName('class')[0] for O(1) live collection lookup instead of O(N) tree traversal
    const chartOverlay = document.getElementsByClassName(
        'chart-piano-overlay__attachment-point'
    )[0];
    if (!chartOverlay) {
        return;
    }

    // ⚡ Bolt: Disable attributes to prevent unnecessary callbacks on every attribute change
    const config: MutationObserverInit = {
        attributes: false,
        childList: true,
        subtree: true,
    };

    const handleMutations: MutationCallback = (mutationsList: MutationRecord[]): void => {
        for (let i = 0; i < mutationsList.length; i++) {
            const mutation = mutationsList[i];
            if (mutation.target instanceof Node) {
                (mutation.target as HTMLElement).remove();
            }
        }

        // Update chart items
        // ⚡ Bolt: Replace querySelectorAll('.class') with getElementsByClassName('class') for O(1) live collection lookup instead of O(N) tree traversal inside the MutationObserver
        const chartItems = document.getElementsByClassName('chart-list-item');
        for (let i = 0; i < chartItems.length; i++) {
            const chartItem = chartItems[i] as ExtendedHTMLElement;
            chartItem.visible = true;
            chartItem.height = 102;
            chartItem.classList.remove('hidden');
        }
    };

    try {
        const observer = new MutationObserver(handleMutations);
        observer.observe(chartOverlay, config);
    } catch (error) {
        // 🛡️ Sentinel: Removed error object from console.error to prevent stack trace exposure
        console.error(
            'Error initializing Billboard overlay observer:',
            error instanceof Error ? error.message : String(error)
        );
    }
})();
