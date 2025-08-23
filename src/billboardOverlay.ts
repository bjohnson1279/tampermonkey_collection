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
        '.ad-container',
        '.ad-holder',
        '.ad_desktop_placeholder',
        '.ad_desktop_wrapper',
        '.ad_desktop',
        '.ad_clarity'
    ];

    adSelectors.forEach((selector: string): void => {
        document.querySelectorAll<HTMLElement>(selector).forEach((ad: HTMLElement): void => {
            ad.remove();
        });
    });

    // Set up mutation observer for the chart overlay
    const chartOverlay = document.querySelector<HTMLElement>('.chart-piano-overlay__attachment-point');
    if (!chartOverlay) {
        console.log('Chart overlay not found');
        return;
    }

    const config: MutationObserverInit = {
        attributes: true,
        childList: true,
        subtree: true
    };

    const handleMutations: MutationCallback = (mutationsList: MutationRecord[]): void => {
        mutationsList.forEach((mutation: MutationRecord): void => {
            if (mutation.target instanceof Node) {
                (mutation.target as HTMLElement).remove();
            }
        });

        // Update chart items
        const chartItems = document.querySelectorAll<ExtendedHTMLElement>('.chart-list-item');
        chartItems.forEach((chartItem: ExtendedHTMLElement): void => {
            chartItem.visible = true;
            chartItem.height = 102;
            chartItem.classList.remove('hidden');
        });
    };

    try {
        const observer = new MutationObserver(handleMutations);
        observer.observe(chartOverlay, config);
        console.log('Billboard overlay observer started');
    } catch (error) {
        console.error('Error initializing Billboard overlay observer:', error);
    }
})();
