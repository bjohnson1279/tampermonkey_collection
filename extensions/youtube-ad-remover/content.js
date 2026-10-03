"use strict";
class YouTubeAdRemover {
    constructor() {
        this.STYLE_ID = 'yt-ad-remover-styles';
        this.styleElement = null;
        this.initialize();
    }
    initialize() {
        if (!document.getElementById(this.STYLE_ID)) {
            this.styleElement = document.createElement('style');
            this.styleElement.id = this.STYLE_ID;
            this.styleElement.textContent = `ytd-rich-item-renderer:has(.ytd-ad-slot-renderer), ytd-video-renderer:has(.ytd-ad-slot-renderer) { display: none !important; }`;
            (document.head || document.documentElement).appendChild(this.styleElement);
        }
    }
    destroy() {
        if (this.styleElement && this.styleElement.parentNode) {
            this.styleElement.parentNode.removeChild(this.styleElement);
            this.styleElement = null;
        }
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