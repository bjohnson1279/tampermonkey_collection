// ==UserScript==
// @name     Get URL Query String
// @version  1.1
// @description Refactored to use URLSearchParams for modern and reliable query string parsing.
// @grant    none
// ==/UserScript==

const getQueryParams = (url) => {
  const urlObj = new URL(url);
  return Object.fromEntries(new URLSearchParams(urlObj.search));
};

console.log(getQueryParams(window.location.href));
