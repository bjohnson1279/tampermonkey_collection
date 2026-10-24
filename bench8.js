const testUrl = "https://example.com/page?foo=bar&baz=qux&a=1&b=2&c=3&d=4";
const urlObj = new URL(testUrl);
const params = new URLSearchParams(urlObj.search);

console.time('for-of map entries');
for(let i=0; i<100000; i++) {
  const result = Object.create(null);
  for (const [key, value] of params.entries()) {
      if (
          key === '__proto__' ||
          key === 'constructor' ||
          key === 'prototype' ||
          key === '__defineGetter__' ||
          key === '__defineSetter__' ||
          key === '__lookupGetter__' ||
          key === '__lookupSetter__'
      ) {
          continue;
      }
      result[key] = value;
  }
}
console.timeEnd('for-of map entries');

console.time('Object.fromEntries');
for(let i=0; i<100000; i++) {
  const result = Object.fromEntries(params);
  // manual delete
  const badKeys = ['__proto__', 'constructor', 'prototype', '__defineGetter__', '__defineSetter__', '__lookupGetter__', '__lookupSetter__'];
  for (let j=0; j<badKeys.length; j++) {
    delete result[badKeys[j]];
  }
}
console.timeEnd('Object.fromEntries');
