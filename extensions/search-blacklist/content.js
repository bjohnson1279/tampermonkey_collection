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
                            ${window.matchMedia('(prefers-reduced-motion: reduce)').matches ? '' : 'transition: opacity 0.3s ease-out, transform 0.3s ease-out;'}
                            display: flex;
                            align-items: center;
                            gap: 8px;
                        `;
                        toast.innerHTML =
                            '<span aria-hidden="true">🚫</span> <span>Search term blocked. Redirecting to home...</span>';
                        document.body.appendChild(toast);
                        void toast.offsetHeight;
                        toast.style.opacity = '1';
                        toast.style.transform = 'translate(-50%, 0)';
                        setTimeout(() => {
                            window.location.replace(parsedUrl.href);
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