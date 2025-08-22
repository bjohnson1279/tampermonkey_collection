// ==UserScript==
// @name     Search Blacklist
// @version  1.1
// @description Blacklist search terms to redirect back to search home page. Refactored for modern JS.
// @grant    none
// ==/UserScript==

(function() {
    'use strict';

    const blacklist = ['asdf']; // Add terms to blacklist here

    const searchEngines = {
        'bing.com': { queryParam: 'q', url: 'https://www.bing.com' },
        'google.com': { queryParam: 'q', url: 'https://www.google.com' },
        'duckduckgo.com': { queryParam: 'q', url: 'https://duckduckgo.com' },
        'yahoo.com': { queryParam: 'p', url: 'https://www.yahoo.com' }
    };

    const href = window.location.href;
    const params = new URLSearchParams(window.location.search);

    for (const domain in searchEngines) {
        if (href.includes(domain)) {
            console.log(`Search engine detected: ${domain}`);
            const engine = searchEngines[domain];
            const query = params.get(engine.queryParam);

            if (query) {
                const searchQuery = query.replaceAll('+', ' ');
                console.log(`Search query: "${searchQuery}"`);

                const isBlacklisted = blacklist.some(phrase => searchQuery.includes(phrase));

                if (isBlacklisted) {
                    console.log("Query contains a blacklisted phrase. Redirecting...");
                    window.location.href = engine.url;
                }
            }
            break; // Found the matching search engine, no need to check others
        }
    }
})();
