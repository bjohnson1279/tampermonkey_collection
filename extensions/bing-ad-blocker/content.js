"use strict";
(function () {
    'use strict';
    const slideContainer = document.getElementsByClassName('tob_calcontainer')[0];
    if (slideContainer) {
        const ads = slideContainer.getElementsByClassName('b_adSlug');
        for (let i = ads.length - 1; i >= 0; i--) {
            const ad = ads[i];
            const box = ad.closest('.tobitem');
            if (box) {
                box.remove();
            }
        }
    }
})();
//# sourceMappingURL=bingAdBlocker.js.map