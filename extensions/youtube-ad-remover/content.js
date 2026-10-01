"use strict";
class YouTubeAdRemover {
    constructor() {
        this.initialize();
    }
    initialize() {
        const style = document.createElement('style');
        style.textContent = `ytd-rich-item-renderer:has(.ytd-ad-slot-renderer), ytd-video-renderer:has(.ytd-ad-slot-renderer) { display: none !important; }`;
        (document.head || document.documentElement).appendChild(style);
    }
    destroy() {
    }
}
function initAdRemover() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            new YouTubeAdRemover();
        });
    }
    else {
        new YouTubeAdRemover();
    }
}
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    initAdRemover();
}
if (typeof exports !== 'undefined') {
    exports.YouTubeAdRemover = YouTubeAdRemover;
    exports.initAdRemover = initAdRemover;
}
//# sourceMappingURL=youtubeAdRemover.js.map