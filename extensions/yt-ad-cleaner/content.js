"use strict";
(function () {
    'use strict';
    let enabled = JSON.parse(localStorage.getItem("ytAdblockEnabled") || "true") ?? true;
    function saveState() {
        localStorage.setItem("ytAdblockEnabled", JSON.stringify(enabled));
    }
    const blockedPatterns = [
        "doubleclick.net",
        "youtube.com/api/stats/ads",
        "youtube.com/api/stats/atr",
        "youtube.com/get_midroll",
        "youtube.com/pagead",
        "ytimg.com/ads/",
    ];
    function shouldBlock(url) {
        return enabled && blockedPatterns.some(pattern => url.includes(pattern));
    }
    const origFetch = window.fetch;
    window.fetch = (async (...args) => {
        const url = args[0]?.toString() || "";
        if (shouldBlock(url)) {
            console.log("Blocked fetch:", url);
            return new Response("", { status: 204 });
        }
        return origFetch(...args);
    });
    const origOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url, async, username, password) {
        if (shouldBlock(url)) {
            console.log("Blocked XHR:", url);
            this.abort();
            return;
        }
        return origOpen.apply(this, [method, url, async ?? true, username, password]);
    };
    const adSelectors = [
        'ytd-promoted-sparkles-text-search-renderer',
        'ytd-display-ad-renderer',
        'ytd-promoted-video-renderer',
        'ytd-ad-slot-renderer',
        'ytd-in-feed-ad-layout-renderer',
        'ytd-action-companion-ad-renderer',
        '#player-ads',
        'ytd-compact-promoted-video-renderer',
        'ytd-promoted-sparkles-web-renderer',
        'ytd-reel-player-overlay-renderer',
        'ytd-reel-ad-renderer',
        'ytd-reel-shelf-renderer[is-shorts]',
        'ytd-merch-shelf-renderer',
        'ytd-rich-shelf-renderer',
        'ytd-video-masthead-ad-advertiser-info-renderer',
        'ytd-video-masthead-ad-primary-video-renderer',
        'ytd-banner-promo-renderer',
        'ytd-carousel-ad-renderer',
        'ytd-companion-slot-renderer'
    ];
    function removeAds() {
        if (!enabled)
            return;
        adSelectors.forEach(sel => {
            document.querySelectorAll(sel).forEach(el => el.remove());
        });
        document.querySelectorAll('#dismissible ytd-badge-supported-renderer')
            .forEach(badge => {
            if (badge.innerText.toLowerCase().includes("promoted")) {
                badge.closest('ytd-video-renderer,ytd-compact-video-renderer')?.remove();
            }
        });
    }
    function skipVideoAds() {
        if (!enabled)
            return;
        const video = document.querySelector('video');
        if (!video)
            return;
        if (document.querySelector('.ad-showing')) {
            video.currentTime = video.duration;
        }
        const skipBtn = document.querySelector('.ytp-ad-skip-button');
        if (skipBtn)
            skipBtn.click();
    }
    function addToggleButton() {
        if (document.querySelector('#adblock-toggle'))
            return;
        const logo = document.querySelector('#logo');
        if (!logo)
            return;
        const btn = document.createElement('button');
        btn.id = "adblock-toggle";
        btn.textContent = `AdBlock: ${enabled ? "ON" : "OFF"}`;
        styleButton(btn);
        btn.addEventListener('click', toggleAdblock);
        logo.parentElement?.insertBefore(btn, logo.nextSibling);
    }
    function styleButton(btn) {
        btn.style.cssText = `
            margin-left: 12px;
            padding: 4px 8px;
            font-size: 12px;
            background: ${enabled ? "#cc0000" : "#444"};
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        `;
    }
    function toggleAdblock() {
        enabled = !enabled;
        saveState();
        const btn = document.querySelector('#adblock-toggle');
        if (btn) {
            btn.textContent = `AdBlock: ${enabled ? "ON" : "OFF"}`;
            styleButton(btn);
        }
        console.log(`YouTube AdBlock is now ${enabled ? "ENABLED" : "DISABLED"}`);
    }
    document.addEventListener('keydown', (e) => {
        if (e.shiftKey && e.key.toLowerCase() === 'a') {
            toggleAdblock();
        }
    });
    setInterval(() => {
        addToggleButton();
        removeAds();
        skipVideoAds();
    }, 500);
})();
//# sourceMappingURL=ytAdBlock2.js.map