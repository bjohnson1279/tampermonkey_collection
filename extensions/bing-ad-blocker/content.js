"use strict";
(function () {
    'use strict';
    const style = document.createElement('style');
    style.textContent = `.tobitem:has(.b_adSlug) { display: none !important; }`;
    (document.head || document.documentElement).appendChild(style);
})();
//# sourceMappingURL=bingAdBlocker.js.map