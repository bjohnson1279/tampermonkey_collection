// ==UserScript==
// @name     Get URL Query String
// @version  1
// @grant    none
// ==/UserScript==

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

console.log(getQueryParams(window.location.href));
