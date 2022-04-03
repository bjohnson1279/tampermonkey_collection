// ==UserScript==
// @name     Search Blacklist
// @version  1
// @grant    none
// ==/UserScript==

// Blacklisting search terms to redirect back to search home page

// Credit - https://www.w3docs.com/snippets/javascript/how-to-get-query-string-values-in-javascript.html
const getQueryParams = (url) => {
  let qParams = {};
  // create a binding tag to use a property called search
  let anchor = document.createElement('a');
  // assign the href URL of the anchor tag
  anchor.href = url;
  // search property returns URL query string
  let qStrings = anchor.search.substring(1);
  let params = qStrings.split('&');
  for (let i = 0; i < params.length; i++) {
    let pair = params[i].split('=');
      qParams[pair[0]] = decodeURIComponent(pair[1]);
    }
    return qParams;
};

const href = window.location.href;
const params = getQueryParams(href);
let blacklist = ['asdf'];

console.log({ href });
console.log({ params });

if (href.includes('bing.com')) {
  console.log('Bing');
  if (params.q) {
    const bSearch = params.q.replaceAll('+', ' ');
    console.log({ bSearch });
    const bResults = blacklist.filter(phrase => bSearch.includes(phrase));
    console.log({ bResults });
    if (bResults.length > 0) {
      	window.location.href = 'https://www.bing.com';
    }
  }
} else if (href.includes('google.com')) {
  console.log('Google');
  if (params.q) {
    const gSearch = params.q.replaceAll('+', ' ');
    console.log({ gSearch });
    const gResults = blacklist.filter(phrase => gSearch.includes(phrase));
    console.log({ gResults });
    if (gResults.length > 0) {
      	window.location.href = 'https://www.google.com';
    }
  }
} else if (href.includes('duckduckgo.com')) {
  console.log('DuckDuckGo');
  if (params.q) {
    const dSearch = params.q.replaceAll('+', ' ');
    console.log({ dSearch });
    const dResults = blacklist.filter(phrase => dSearch.includes(phrase));
    console.log({ dResults });
    if (dResults.length > 0) {
      window.location.href = 'https://duckduckgo.com';
    }
  }
} else if (href.includes('yahoo.com')) {
  console.log('Yahoo.com');
  if (params.p) {
    const ySearch = params.p.replaceAll('+', ' ');
    console.log({ ySearch });
    const yResults = blacklist.filter(phrase => ySearch.includes(phrase));
    console.log({ yResults });
    if (yResults.length > 0) {
    	window.location.href = 'https://www.yahoo.com';
    }
  }
}
