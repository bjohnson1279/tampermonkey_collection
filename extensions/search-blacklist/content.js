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
            const engineEntry = Object.entries(searchEngines).find(([domain]) => hostname === domain || hostname.endsWith('.' + domain));
            if (!engineEntry) {
                return;
            }
            const [, engine] = engineEntry;
            const query = params.get(engine.queryParam);
            if (query) {
                const searchQuery = query.replace(/\+/g, ' ');
                if (blacklistRegex && blacklistRegex.test(searchQuery)) {
                    window.location.href = engine.url;
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