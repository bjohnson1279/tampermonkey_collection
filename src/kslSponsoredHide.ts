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

    // ⚡ Bolt: Replace O(N) MutationObserver DOM traversal with O(1) injected stylesheet using CSS :has()
    // The browser's native CSS engine evaluates this instantly in C++ for both static and dynamically added elements,
    // eliminating JS-to-C++ crossing overhead and avoiding forced layout reflows on infinite scroll.
    const style = document.createElement('style');
    style.textContent = `.queue:has(.sponsored), .queue_story:has(.sponsored) { display: none !important; }`;
    (document.head || document.documentElement).appendChild(style);
})();
