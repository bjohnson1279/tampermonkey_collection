const engines = {
    'bing.com': { queryParam: 'q', url: 'https://www.bing.com' },
    'google.com': { queryParam: 'q', url: 'https://www.google.com' },
    'duckduckgo.com': { queryParam: 'q', url: 'https://duckduckgo.com' },
    'yahoo.com': { queryParam: 'p', url: 'https://www.yahoo.com' },
};

function oldWay(hostname) {
    let engine;
    let matchedDomain;
    const entries = Object.entries(engines);
    for (let i = 0, len = entries.length; i < len; i++) {
        const [domain, config] = entries[i];
        if (hostname === domain || hostname.endsWith('.' + domain)) {
            engine = config;
            matchedDomain = domain;
            break;
        }
    }
    return engine;
}

function newWay(hostname) {
    let engine;
    let matchedDomain;
    const domains = Object.keys(engines);
    for (let i = 0, len = domains.length; i < len; i++) {
        const domain = domains[i];
        if (hostname === domain || hostname.endsWith('.' + domain)) {
            engine = engines[domain];
            matchedDomain = domain;
            break;
        }
    }
    return engine;
}

console.time('old');
for(let i=0; i<100000; i++) {
    oldWay("www.google.com");
    oldWay("example.com");
}
console.timeEnd('old');

console.time('new');
for(let i=0; i<100000; i++) {
    newWay("www.google.com");
    newWay("example.com");
}
console.timeEnd('new');
