const blockedPatternRegex = /doubleclick\.net|youtube\.com\/api\/stats\/ads|youtube\.com\/api\/stats\/atr|youtube\.com\/get_midroll|youtube\.com\/pagead|ytimg\.com\/ads\//;

const urls = [
    "https://doubleclick.net/test",
    "/api/stats/ads",
    "https://youtube.com/api/stats/watchtime",
    "https://google.com/foo",
    "//youtube.com/api/stats/ads",
    "/some/random/path"
];
const locationHref = "https://www.youtube.com/watch?v=123";

function shouldBlockOld(url) {
    try {
        const absoluteUrl = new URL(url, locationHref).href;
        return blockedPatternRegex.test(absoluteUrl);
    } catch {
        return blockedPatternRegex.test(url);
    }
}

function shouldBlockNew(url) {
    if (blockedPatternRegex.test(url)) return true;
    if (url.startsWith('http://') || url.startsWith('https://')) return false;
    try {
        const absoluteUrl = new URL(url, locationHref).href;
        return blockedPatternRegex.test(absoluteUrl);
    } catch {
        return false;
    }
}

console.time('old');
let r1 = 0;
for(let i=0; i<100000; i++) {
  for(let j=0; j<urls.length; j++) {
      if(shouldBlockOld(urls[j])) r1++;
  }
}
console.timeEnd('old');

console.time('new');
let r2 = 0;
for(let i=0; i<100000; i++) {
  for(let j=0; j<urls.length; j++) {
      if(shouldBlockNew(urls[j])) r2++;
  }
}
console.timeEnd('new');

console.log(r1, r2);
