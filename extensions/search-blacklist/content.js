"use strict";
(function () {
    'use strict';
    const blacklist = ['asdf'];
    const blacklistRegex = blacklist.length > 0
        ? new RegExp(blacklist
            .map((phrase) => phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
            .join('|'), 'i')
        : null;
    const searchEngines = {
        'bing.com': { queryParam: 'q', url: 'https://www.bing.com' },
        'google.com': { queryParam: 'q', url: 'https://www.google.com' },
        'duckduckgo.com': { queryParam: 'q', url: 'https://duckduckgo.com' },
        'yahoo.com': { queryParam: 'p', url: 'https://www.yahoo.com' },
    };
    const processSearch = () => {
        try {
            const hostname = window.location.hostname;
            const params = new URLSearchParams(window.location.search);
            let engine;
            let matchedDomain;
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
            const query = params.get(engine.queryParam);
            if (query) {
                const searchQuery = query.replace(/\+/g, ' ');
                if (blacklistRegex && blacklistRegex.test(searchQuery)) {
                    const parsedUrl = new URL(engine.url, window.location.href);
                    if (parsedUrl.protocol === 'https:' &&
                        (parsedUrl.hostname === matchedDomain ||
                            parsedUrl.hostname.endsWith('.' + matchedDomain))) {
                        const toast = document.createElement('div');
                        toast.setAttribute('role', 'alert');
                        toast.setAttribute('aria-live', 'assertive');
                        toast.style.cssText = `
                            position: fixed;
                            top: 20px;
                            left: 50%;
                            transform: translateX(-50%);
                            background-color: #333;
                            color: white;
                            padding: 12px 24px;
                            border-radius: 8px;
                            font-family: system-ui, sans-serif;
                            font-size: 14px;
                            font-weight: 500;
                            z-index: 2147483647;
                            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                            text-align: center;
                        `;
                        toast.textContent = 'Search term blocked. Redirecting to home...';
                        document.body.appendChild(toast);
                        setTimeout(() => {
                            window.location.href = parsedUrl.href;
                        }, 2500);
                    }
                }
            }
        }
        catch (error) {
            console.error('Error processing search:', error instanceof Error ? error.message : String(error));
        }
    };
    processSearch();
})();
//# sourceMappingURL=searchEngineFilter.js.map