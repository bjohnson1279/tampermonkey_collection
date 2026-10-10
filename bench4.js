console.time('Object.fromEntries with iteration');
const testUrl = "https://example.com/page?foo=bar&baz=qux&a=1&b=2&c=3&d=4";
const u = new URL(testUrl);
const params = new URLSearchParams(u.search);

for(let i=0; i<100000; i++) {
  const result = Object.fromEntries(params);
  // simulate checks
  for (const key in result) {
      if (
          key === '__proto__' ||
          key === 'constructor' ||
          key === 'prototype' ||
          key === '__defineGetter__' ||
          key === '__defineSetter__' ||
          key === '__lookupGetter__' ||
          key === '__lookupSetter__'
      ) {
          delete result[key];
      }
  }
}
console.timeEnd('Object.fromEntries with iteration');
