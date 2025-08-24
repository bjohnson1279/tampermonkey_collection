// ==UserScript==
// @name         YouTube Ad Remover
// @namespace    http://tampermonkey.net/
// @version      2025-05-21
// @description  Remove Ads from YouTube
// @author       Brent Johnson
// @match        https://www.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    window.addEventListener('load', () => {
        setTimeout(() => {
            const targetNode = document.querySelector('#contents');

            // Add a check to be safe
            if (targetNode) {
                // Callback function to execute when mutations are observed
                const callback = function(mutationsList, observer) {
                    for(const mutation of mutationsList) {
                        if (mutation.type === 'childList') {
                            const ytItems = targetNode.getElementsByTagName('ytd-rich-item-renderer');
                            const ytItemsArray = [...ytItems];

                            ytItemsArray.length > 0 && ytItemsArray.forEach(videoItem => {
                                const contentDiv = videoItem.querySelector("#content");
                                const adItem = contentDiv.querySelector('.ytd-ad-slot-renderer');
                                if (adItem) {
                                    adItem.remove();
                                    contentDiv.remove();
                                    videoItem.remove();
                                }
                            });
                        }
                    }
                };

                // Create an observer instance linked to the callback function
                const observer = new MutationObserver(callback);

                // Configuration for the observer
                const config = {
                    attributes: true, // Watch for attribute changes
                    childList: true, // Watch for additions/removals of children
                    subtree: true // Extend observation to all descendants
                };

                // Start observing the target node for configured mutations
                observer.observe(targetNode, config);
            } else {
                console.error("Could not find the target node: #contents");
            }
        }, 2000);
    });
})();
