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

    // Function to remove sponsored content globally
    const removeSponsoredContent = (): void => {
        const sponsoredElements = document.querySelectorAll<SponsoredElement>('.sponsored');

        sponsoredElements.forEach((sponsored: SponsoredElement): void => {
            // Try to find the closest parent container to remove
            const sponsoredContainer = sponsored.closest('.queue, .queue_story');
            if (sponsoredContainer) {
                sponsoredContainer.remove();
            }
        });
    };

    // Initial removal of sponsored content
    removeSponsoredContent();

    // Set up mutation observer to handle dynamically loaded content
    const loadMoreContainer = document.querySelector<HTMLElement>('#loadMoreBtnContainer');
    if (!loadMoreContainer) {
        return;
    }

    const config: MutationObserverInit = {
        attributes: false,
        childList: true,
        subtree: true,
    };

    const processNode = (el: HTMLElement): void => {
        if (el.classList.contains('sponsored')) {
            const sponsoredContainer = el.closest('.queue, .queue_story');
            if (sponsoredContainer) {
                sponsoredContainer.remove();
            }
        } else if (el.firstElementChild) {
            // ⚡ Bolt: Fast path for leaf nodes - avoid querySelectorAll parsing overhead if no children exist
            const sponsoredElements = el.querySelectorAll<SponsoredElement>('.sponsored');
            sponsoredElements.forEach((sponsored: SponsoredElement): void => {
                const sponsoredContainer = sponsored.closest('.queue, .queue_story');
                if (sponsoredContainer) {
                    sponsoredContainer.remove();
                }
            });
        }
    };

    const handleMutations: MutationCallback = (mutationsList: MutationRecord[]): void => {
        // ⚡ Bolt: Only process added nodes instead of re-querying the entire DOM list on every mutation
        // This avoids O(N²) scaling as more elements are loaded dynamically
        for (const mutation of mutationsList) {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    processNode(node as HTMLElement);
                }
            });
        }
    };

    try {
        const observer = new MutationObserver(handleMutations);
        observer.observe(loadMoreContainer, config);
    } catch (error) {
        // 🛡️ Sentinel: Removed error object from console.error to prevent stack trace exposure
        console.error(
            'Error initializing mutation observer:',
            error instanceof Error ? error.message : String(error)
        );
    }
})();
