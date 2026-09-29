"use strict";
(function () {
    'use strict';
    const style = document.createElement('style');
    style.textContent = `.queue:has(.sponsored), .queue_story:has(.sponsored) { display: none !important; }`;
    (document.head || document.documentElement).appendChild(style);
})();
//# sourceMappingURL=kslSponsoredHide.js.map