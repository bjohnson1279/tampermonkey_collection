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
            let matchedDomain: string | undefined;
            for (const domain in searchEngines) {
                if (hostname === domain || hostname.endsWith('.' + domain)) {
                    engine = searchEngines[domain];
                    matchedDomain = domain;
                    break;
                }
            }

            if (!engine || !matchedDomain) {
                return;
            }

            const query: string | null = params.get(engine.queryParam);

            if (query) {
                const searchQuery: string = query.replace(/\+/g, ' ');

                if (blacklistRegex && blacklistRegex.test(searchQuery)) {
                    const parsedUrl = new URL(engine.url, window.location.href);
                    if (
                        parsedUrl.protocol === 'https:' &&
                        (parsedUrl.hostname === matchedDomain ||
                            parsedUrl.hostname.endsWith('.' + matchedDomain))
                    ) {
                        // 🎨 Palette: Add accessible toast notification before sudden redirect
                        const toast = document.createElement('div');
                        toast.setAttribute('role', 'alert');
                        toast.setAttribute('aria-live', 'assertive');
                        toast.style.cssText = `
                            position: fixed;
                            top: 20px;
                            left: 50%;
                            transform: translate(-50%, -10px);
                            opacity: 0;
                            background-color: #b02a37;
                            color: white;
                            padding: 12px 24px;
                            border-radius: 8px;
                            font-family: system-ui, sans-serif;
                            font-size: 14px;
                            font-weight: 500;
                            z-index: 2147483647;
                            box-shadow: 0 4px 12px rgba(0,0,0,0.25);
                            text-align: center;
                            transition: opacity 0.3s ease-out, transform 0.3s ease-out;
                            display: flex;
                            align-items: center;
                            gap: 8px;
                        `;
                        toast.innerHTML =
                            '<span aria-hidden="true">🚫</span> <span>Search term blocked. Redirecting to home...</span>';
                        document.body.appendChild(toast);

                        // Trigger reflow to ensure the CSS transition plays
                        void toast.offsetHeight;
                        toast.style.opacity = '1';
                        toast.style.transform = 'translate(-50%, 0)';

                        setTimeout(() => {
                            // 🛡️ Sentinel: Use window.location.replace() to prevent back-button traps and improve privacy
                            window.location.replace(parsedUrl.href);
                        }, 2500);
                    }
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
