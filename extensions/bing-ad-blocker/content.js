"use strict";
(function () {
    'use strict';
    const slideContainer = document.querySelector(".tob_calcontainer");
    if (slideContainer) {
        const boxes = slideContainer.querySelectorAll(".tobitem");
        if (boxes.length > 0) {
            boxes.forEach((box) => {
                const ad = box.querySelector(".b_adSlug");
                if (ad) {
                    box.remove();
                }
            });
        }
    }
})();
//# sourceMappingURL=bingAdBlocker.js.map