// ==UserScript==
// @name         KSL Sponsored Article Remover
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Remove sponsored articles from KSL.com
// @author       Brent Johnson
// @match        https://www.ksl.com/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=ksl.com
// @grant        none
// ==/UserScript==

interface SponsoredElement extends HTMLElement {
    closest(selectors: string): HTMLElement | null;
}

(function (): void {
    'use strict';

    // Function to remove sponsored content
    const removeSponsoredContent = (): void => {
        const sponsoredElements = document.querySelectorAll<SponsoredElement>('.sponsored');
        console.log(`Found ${sponsoredElements.length} sponsored elements`);

        sponsoredElements.forEach((sponsored: SponsoredElement): void => {
            // Try to find the closest parent container to remove
            const sponsoredContainer = sponsored.closest('.queue, .queue_story');
            if (sponsoredContainer) {
                console.log('Removing sponsored content');
                sponsoredContainer.remove();
            }
        });
    };

    // Initial removal of sponsored content
    removeSponsoredContent();

    // Set up mutation observer to handle dynamically loaded content
    const loadMoreContainer = document.querySelector<HTMLElement>('#loadMoreBtnContainer');
    if (!loadMoreContainer) {
        console.log('Load more container not found');
        return;
    }

    const config: MutationObserverInit = {
        attributes: false,
        childList: true,
        subtree: true
    };

    const handleMutations: MutationCallback = (mutationsList: MutationRecord[]): void => {
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
    } catch (error) {
        console.error('Error initializing mutation observer:', error);
    }
})();
