// ==UserScript==
// @name     Search Blacklist
// @version  1.1
// @description Blacklist search terms to redirect back to search home page. Refactored for modern TypeScript.
// @grant    none
// ==/UserScript==

interface SearchEngineConfig {
    queryParam: string;
    url: string;
}

interface SearchEngines {
    [key: string]: SearchEngineConfig;
}

(function (): void {
    'use strict';

    const blacklist: string[] = ['asdf']; // Add terms to blacklist here

    const searchEngines: SearchEngines = {
        'bing.com': { queryParam: 'q', url: 'https://www.bing.com' },
        'google.com': { queryParam: 'q', url: 'https://www.google.com' },
        'duckduckgo.com': { queryParam: 'q', url: 'https://duckduckgo.com' },
        'yahoo.com': { queryParam: 'p', url: 'https://www.yahoo.com' }
    };

    const processSearch = (): void => {
        try {
            const href: string = window.location.href;
            const params: URLSearchParams = new URLSearchParams(window.location.search);
            
            // Find the matching search engine configuration
            const engineEntry = Object.entries(searchEngines).find(([domain]) => href.includes(domain));
            
            if (!engineEntry) {
                console.log('No matching search engine found');
                return;
            }

            const [domain, engine] = engineEntry;
            console.log(`Search engine detected: ${domain}`);
            
            const query: string | null = params.get(engine.queryParam);

            if (query) {
                const searchQuery: string = query.replace(/\+/g, ' ');
                console.log(`Search query: "${searchQuery}"`);

                const isBlacklisted: boolean = blacklist.some(
                    (phrase: string): boolean => searchQuery.toLowerCase().includes(phrase.toLowerCase())
                );

                if (isBlacklisted) {
                    console.log("Query contains a blacklisted phrase. Redirecting...");
                    window.location.href = engine.url;
                }
            }
        } catch (error) {
            console.error('Error processing search:', error);
        }
    };

    // Run the search processing
    processSearch();
})();
