"use strict";
(function () {
    'use strict';
    const slideContainer = document.querySelector('.tob_calcontainer');
    if (slideContainer) {
        const ads = slideContainer.querySelectorAll('.tobitem .b_adSlug');
        ads.forEach((ad) => {
            const box = ad.closest('.tobitem');
            if (box) {
                box.remove();
            }
        });
    }
})();
//# sourceMappingURL=bingAdBlocker.js.map