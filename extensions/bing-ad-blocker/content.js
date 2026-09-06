"use strict";
(function () {
    'use strict';
    const slideContainer = document.getElementsByClassName('tob_calcontainer')[0];
    if (slideContainer) {
        const ads = slideContainer.getElementsByClassName('b_adSlug');
        for (let i = ads.length - 1; i >= 0; i--) {
            const ad = ads[i];
            let parent = ad.parentElement;
            while (parent) {
                if (parent.classList.contains('tobitem')) {
                    parent.remove();
                    break;
                }
                parent = parent.parentElement;
            }
        }
    }
})();
//# sourceMappingURL=bingAdBlocker.js.map