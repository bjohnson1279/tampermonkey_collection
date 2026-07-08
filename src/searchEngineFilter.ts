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
    const lowercaseBlacklist: string[] = blacklist.map((phrase: string) => phrase.toLowerCase());

    const searchEngines: SearchEngines = {
        'bing.com': { queryParam: 'q', url: 'https://www.bing.com' },
        'google.com': { queryParam: 'q', url: 'https://www.google.com' },
        'duckduckgo.com': { queryParam: 'q', url: 'https://duckduckgo.com' },
        'yahoo.com': { queryParam: 'p', url: 'https://www.yahoo.com' },
    };

    const processSearch = (): void => {
        try {
            // 🛡️ Sentinel: Use hostname instead of href to prevent path/query confusion evasion
            const hostname: string = window.location.hostname;
            const params: URLSearchParams = new URLSearchParams(window.location.search);

            // Find the matching search engine configuration
            const engineEntry = Object.entries(searchEngines).find(([domain]) =>
                hostname.includes(domain)
            );

            if (!engineEntry) {
                return;
            }

            const [, engine] = engineEntry;

            const query: string | null = params.get(engine.queryParam);

            if (query) {
                const searchQuery: string = query.replace(/\+/g, ' ');

                const searchQueryLower = searchQuery.toLowerCase();
                const isBlacklisted: boolean = lowercaseBlacklist.some((phrase: string): boolean =>
                    searchQueryLower.includes(phrase)
                );

                if (isBlacklisted) {
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
