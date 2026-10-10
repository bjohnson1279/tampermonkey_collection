const testUrl = "https://example.com/page?foo=bar&baz=qux&a=1&b=2&c=3&d=4";
const u = new URL(testUrl);
const params = new URLSearchParams(u.search);

console.time('Object.fromEntries');
for(let i=0; i<100000; i++) {
  const result = Object.fromEntries(params);
}
console.timeEnd('Object.fromEntries');

console.time('for-of-entries');
for(let i=0; i<100000; i++) {
  const result = Object.create(null);
  for (const [key, value] of params.entries()) {
      result[key] = value;
  }
}
console.timeEnd('for-of-entries');

console.time('for-of-params');
for(let i=0; i<100000; i++) {
  const result = Object.create(null);
  for (const [key, value] of params) {
      result[key] = value;
  }
}
console.timeEnd('for-of-params');
