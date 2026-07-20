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

            // ⚡ Bolt: Replace Object.entries().find() with a for...in loop to avoid
            // O(N) array allocation and callback overhead on every search query.
            let engine: SearchEngineConfig | undefined;
            for (const domain in searchEngines) {
                if (hostname === domain || hostname.endsWith('.' + domain)) {
                    engine = searchEngines[domain];
                    break;
                }
            }

            if (!engine) {
                return;
            }

            const query: string | null = params.get(engine.queryParam);

            if (query) {
                const searchQuery: string = query.replace(/\+/g, ' ');

                if (blacklistRegex && blacklistRegex.test(searchQuery)) {
                    window.location.href = engine.url;
                }
            }
        } catch (error) {
            // 🛡️ Sentinel: Removed error object from console.error to prevent stack trace exposure
            console.error(
                'Error processing search:',
                error instanceof Error ? error.message : String(error)
            );
        }
    };

    // Run the search processing
    processSearch();
})();
