"use strict";
(function () {
    'use strict';
    const blacklist = ['asdf'];
    const searchEngines = {
        'bing.com': { queryParam: 'q', url: 'https://www.bing.com' },
        'google.com': { queryParam: 'q', url: 'https://www.google.com' },
        'duckduckgo.com': { queryParam: 'q', url: 'https://duckduckgo.com' },
        'yahoo.com': { queryParam: 'p', url: 'https://www.yahoo.com' }
    };
    const processSearch = () => {
        try {
            const href = window.location.href;
            const params = new URLSearchParams(window.location.search);
            const engineEntry = Object.entries(searchEngines).find(([domain]) => href.includes(domain));
            if (!engineEntry) {
                console.log('No matching search engine found');
                return;
            }
            const [domain, engine] = engineEntry;
            console.log(`Search engine detected: ${domain}`);
            const query = params.get(engine.queryParam);
            if (query) {
                const searchQuery = query.replace(/\+/g, ' ');
                console.log(`Search query: "${searchQuery}"`);
                const isBlacklisted = blacklist.some((phrase) => searchQuery.toLowerCase().includes(phrase.toLowerCase()));
                if (isBlacklisted) {
                    console.log("Query contains a blacklisted phrase. Redirecting...");
                    window.location.href = engine.url;
                }
            }
        }
        catch (error) {
            console.error('Error processing search:', error);
        }
    };
    processSearch();
})();
//# sourceMappingURL=searchEngineFilter.js.map