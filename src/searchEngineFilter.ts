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
    // ⚡ Bolt: Replace O(N) Array.some() and redundant string allocations with a single
    // pre-compiled Regex for significantly faster URL query checks.
    const blacklistRegex =
        blacklist.length > 0
            ? new RegExp(
                  blacklist
                      .map((phrase) => phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
                      .join('|'),
                  'i'
              )
            : null;

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
            const engineEntry = Object.entries(searchEngines).find(
                ([domain]) => hostname === domain || hostname.endsWith('.' + domain)
            );

            if (!engineEntry) {
                return;
            }

            const [domain, engine] = engineEntry;

            const query: string | null = params.get(engine.queryParam);

            if (query) {
                const searchQuery: string = query.replace(/\+/g, ' ');

                if (blacklistRegex && blacklistRegex.test(searchQuery)) {
                    const parsedUrl = new URL(engine.url, window.location.href);
                    if (
                        parsedUrl.protocol === 'https:' &&
                        (parsedUrl.hostname === domain || parsedUrl.hostname.endsWith('.' + domain))
                    ) {
                        window.location.href = parsedUrl.href;
                    }
                }
            }
        } catch (error) {
            console.error('Error processing search:', error);
        }
    };

    // Run the search processing
    processSearch();
})();
