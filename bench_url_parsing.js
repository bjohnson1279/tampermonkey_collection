const url = "https://youtube.com/api/stats/ads?a=1&b=2";
const href = "https://www.youtube.com/watch?v=123";
const pattern = /doubleclick\.net|youtube\.com\/api\/stats\/ads/;

function oldWay(urlStr) {
    try {
        const absoluteUrl = new URL(urlStr, href).href;
        return pattern.test(absoluteUrl);
    } catch {
        return pattern.test(urlStr);
    }
}

function newWay(urlStr) {
    if (pattern.test(urlStr)) return true;
    if (urlStr.indexOf('://') !== -1) return false;
    try {
        const absoluteUrl = new URL(urlStr, href).href;
        return pattern.test(absoluteUrl);
    } catch {
        return false;
    }
}

console.time('old');
for(let i=0; i<100000; i++) {
    oldWay(url);
    oldWay("/api/stats/ads");
    oldWay("https://google.com");
}
console.timeEnd('old');

console.time('new');
for(let i=0; i<100000; i++) {
    newWay(url);
    newWay("/api/stats/ads");
    newWay("https://google.com");
}
console.timeEnd('new');
