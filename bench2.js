const regex = /doubleclick\.net/;
const href = "https://www.youtube.com/watch?v=123";
const safeUrls = [
  "https://youtube.com/api/stats/watchtime",
  "https://google.com/foo",
  "/api/stats/watchtime",
  "//youtube.com/test",
];

function shouldBlockOld(url) {
    try {
        const absoluteUrl = new URL(url, href).href;
        return regex.test(absoluteUrl);
    } catch {
        return regex.test(url);
    }
}

function shouldBlockNew(url) {
    if (regex.test(url)) return true;
    if (url.startsWith('http://') || url.startsWith('https://')) return false;
    try {
        const absoluteUrl = new URL(url, href).href;
        return regex.test(absoluteUrl);
    } catch {
        return false;
    }
}

console.time('old');
for(let i=0; i<100000; i++) {
  shouldBlockOld(safeUrls[0]);
  shouldBlockOld(safeUrls[1]);
  shouldBlockOld(safeUrls[2]);
  shouldBlockOld(safeUrls[3]);
}
console.timeEnd('old');

console.time('new');
for(let i=0; i<100000; i++) {
  shouldBlockNew(safeUrls[0]);
  shouldBlockNew(safeUrls[1]);
  shouldBlockNew(safeUrls[2]);
  shouldBlockNew(safeUrls[3]);
}
console.timeEnd('new');
