"use strict";
(function () {
    'use strict';
    let enabled = true;
    try {
        const stored = localStorage.getItem('ytAdblockEnabled');
        if (stored !== null) {
            enabled = JSON.parse(stored) ?? true;
        }
    }
    catch (e) {
        console.warn('Failed to parse ytAdblockEnabled from localStorage', e instanceof Error ? e.message : String(e));
        enabled = true;
    }
    function saveState() {
        localStorage.setItem('ytAdblockEnabled', JSON.stringify(enabled));
    }
    const blockedPatternRegex = /doubleclick\.net|youtube\.com\/api\/stats\/ads|youtube\.com\/api\/stats\/atr|youtube\.com\/get_midroll|youtube\.com\/pagead|ytimg\.com\/ads\//;
    function shouldBlock(url) {
        if (!enabled)
            return false;
        try {
            const absoluteUrl = new URL(url, window.location.href).href;
            return blockedPatternRegex.test(absoluteUrl);
        }
        catch {
            return blockedPatternRegex.test(url);
        }
    }
    const origFetch = window.fetch;
    const nativeReqUrlGetter = Object.getOwnPropertyDescriptor(Request.prototype, 'url')?.get;
    window.fetch = (async (...args) => {
        const req = args[0];
        let url = '';
        let isNativeRequest = false;
        if (req && typeof req === 'object') {
            if (nativeReqUrlGetter) {
                try {
                    url = nativeReqUrlGetter.call(req);
                    isNativeRequest = true;
                }
                catch {
                }
            }
        }
        else {
            url = req?.toString() || '';
        }
        if (req && typeof req === 'object') {
            let isNativeRequest = false;
            try {
                if (typeof Request !== 'undefined') {
                    Object.getOwnPropertyDescriptor(Request.prototype, 'url')?.get?.call(req);
                    isNativeRequest = true;
                }
            }
            catch (e) {
                isNativeRequest = false;
            }
            if (!isNativeRequest) {
                args[0] = url;
            }
        }
        else {
            args[0] = url;
        }
        if (shouldBlock(url)) {
            return new Response('', { status: 204 });
        }
        return origFetch(...args);
    });
    const origOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url, async, username, password) {
        const urlStr = url && typeof url === 'object' && 'href' in url && typeof url.href === 'string'
            ? url.href
            : url?.toString() || '';
        if (shouldBlock(urlStr)) {
            this.abort();
            return;
        }
        return origOpen.apply(this, [method, urlStr, async ?? true, username, password]);
    };
    const origSendBeacon = navigator.sendBeacon;
    if (origSendBeacon) {
        navigator.sendBeacon = function (url, data) {
            const urlStr = url &&
                typeof url === 'object' &&
                'href' in url &&
                typeof url.href === 'string'
                ? url.href
                : url?.toString() || '';
            if (shouldBlock(urlStr)) {
                return true;
            }
            return origSendBeacon.apply(this, [urlStr, data]);
        };
    }
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
        'ytd-companion-slot-renderer',
    ];
    const combinedAdSelector = adSelectors.join(',');
    const promotedBadgeRegex = /promoted/i;
    const adObserver = new MutationObserver((mutations) => {
        if (!enabled)
            return;
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const el = node;
                    if (el.matches && el.matches(combinedAdSelector)) {
                        el.remove();
                    }
                    else if (el.firstElementChild && el.querySelectorAll) {
                        el.querySelectorAll(combinedAdSelector).forEach((e) => e.remove());
                        el.querySelectorAll('#dismissible ytd-badge-supported-renderer').forEach((badge) => {
                            if (promotedBadgeRegex.test(badge.textContent || '')) {
                                badge
                                    .closest('ytd-video-renderer,ytd-compact-video-renderer')
                                    ?.remove();
                            }
                        });
                    }
                }
            });
        });
    });
    function removeInitialAds() {
        if (!enabled)
            return;
        document.querySelectorAll(combinedAdSelector).forEach((el) => el.remove());
        document.querySelectorAll('#dismissible ytd-badge-supported-renderer').forEach((badge) => {
            if (promotedBadgeRegex.test(badge.textContent || '')) {
                badge.closest('ytd-video-renderer,ytd-compact-video-renderer')?.remove();
            }
        });
    }
    removeInitialAds();
    if (document.documentElement) {
        adObserver.observe(document.documentElement, { childList: true, subtree: true });
    }
    function skipVideoAds() {
        if (!enabled)
            return;
        const video = document.getElementsByTagName('video')[0] ?? null;
        if (!video)
            return;
        if (document.getElementsByClassName('ad-showing').length > 0) {
            if (Number.isFinite(video.duration)) {
                video.currentTime = video.duration;
            }
        }
        const skipBtn = document.getElementsByClassName('ytp-ad-skip-button')[0];
        if (skipBtn)
            skipBtn.click();
    }
    function addToggleButton() {
        if (document.getElementById('adblock-toggle'))
            return;
        const logo = document.getElementById('logo');
        if (!logo)
            return;
        const btn = document.createElement('button');
        btn.id = 'adblock-toggle';
        btn.textContent = `${enabled ? '🛡️' : '⚠️'} AdBlock: ${enabled ? 'ON' : 'OFF'}`;
        btn.setAttribute('aria-label', `Toggle AdBlock`);
        btn.setAttribute('aria-pressed', enabled.toString());
        btn.setAttribute('title', `${enabled ? 'Disable' : 'Enable'} AdBlock (Shift+A)`);
        btn.setAttribute('aria-keyshortcuts', 'Shift+A');
        styleButtonStatic(btn);
        styleButtonDynamic(btn);
        btn.addEventListener('click', toggleAdblock);
        logo.parentElement?.insertBefore(btn, logo.nextSibling);
        if (!document.getElementById('adblock-styles')) {
            const style = document.createElement('style');
            style.id = 'adblock-styles';
            style.textContent = `
                #adblock-toggle { outline: none; }
                #adblock-toggle:hover { opacity: 0.8; }
                #adblock-toggle:focus-visible { outline: 2px solid var(--yt-spec-text-primary, CanvasText); outline-offset: 2px; }
                #adblock-toggle:active { transform: scale(0.95); }
            `;
            document.head.appendChild(style);
        }
        if (!document.getElementById('adblock-announcer')) {
            const announcer = document.createElement('div');
            announcer.id = 'adblock-announcer';
            announcer.setAttribute('aria-live', 'polite');
            announcer.style.cssText = `
                position: absolute;
                width: 1px;
                height: 1px;
                padding: 0;
                margin: -1px;
                overflow: hidden;
                clip: rect(0, 0, 0, 0);
                border: 0;
            `;
            document.body.appendChild(announcer);
        }
    }
    function styleButtonStatic(btn) {
        btn.style.cssText = `
            margin-left: 12px;
            padding: 4px 8px;
            font-size: 14px;
            font-family: "Roboto", "Arial", sans-serif;
            font-weight: 500;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            user-select: none;
            -webkit-user-select: none;
            transition: opacity 0.2s, outline 0.2s, background-color 0.2s, transform 0.1s;
            transform-origin: center;
        `;
    }
    function styleButtonDynamic(btn) {
        btn.style.backgroundColor = enabled ? '#cc0000' : '#444';
    }
    function toggleAdblock() {
        enabled = !enabled;
        saveState();
        const btn = document.getElementById('adblock-toggle');
        if (btn) {
            btn.textContent = `${enabled ? '🛡️' : '⚠️'} AdBlock: ${enabled ? 'ON' : 'OFF'}`;
            btn.setAttribute('aria-pressed', enabled.toString());
            btn.setAttribute('title', `${enabled ? 'Disable' : 'Enable'} AdBlock (Shift+A)`);
            styleButtonDynamic(btn);
        }
        const announcer = document.getElementById('adblock-announcer');
        if (announcer) {
            announcer.textContent = `AdBlock is now ${enabled ? 'ON' : 'OFF'}`;
        }
        console.log(`YouTube AdBlock is now ${enabled ? 'ENABLED' : 'DISABLED'}`);
    }
    document.addEventListener('keydown', (e) => {
        const target = e.target;
        const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
        if (!isInput && e.shiftKey && e.key.toLowerCase() === 'a') {
            toggleAdblock();
        }
    });
    setInterval(() => {
        addToggleButton();
        skipVideoAds();
    }, 500);
})();
//# sourceMappingURL=ytAdBlock2.js.map