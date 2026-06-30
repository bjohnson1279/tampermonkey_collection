// ==UserScript==
// @name         YouTube Total Ad Cleaner + Persistent Toggle + Hotkey
// @namespace    https://yourdomain.example
// @version      1.6
// @description  Block and skip YouTube ads (video, shorts, sidebar, homepage, network requests) with persistent toggle button + keyboard shortcut
// @author       You
// @match        https://www.youtube.com/*
// @grant        none
// ==/UserScript==

"use strict";
(function () {
    'use strict';
    let enabled = true;
    try {
        enabled = JSON.parse(localStorage.getItem('ytAdblockEnabled') || 'true') ?? true;
    }
    catch (e) {
        console.warn('Invalid ytAdblockEnabled state in localStorage, defaulting to true');
        enabled = true;
    }
    function saveState() {
        localStorage.setItem('ytAdblockEnabled', JSON.stringify(enabled));
    }
    const blockedPatterns = [
        'doubleclick.net',
        'youtube.com/api/stats/ads',
        'youtube.com/api/stats/atr',
        'youtube.com/get_midroll',
        'youtube.com/pagead',
        'ytimg.com/ads/',
    ];
    function shouldBlock(url) {
        return enabled && blockedPatterns.some((pattern) => url.includes(pattern));
    }
    const origFetch = window.fetch;
    window.fetch = (async (...args) => {
        const req = args[0];
        const url = req instanceof Request
            ? req.url
            : req instanceof URL
                ? req.href
                : req?.toString() || '';
        if (shouldBlock(url)) {
            return new Response('', { status: 204 });
        }
        return origFetch(...args);
    });
    const origOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url, async, username, password) {
        const urlStr = url instanceof URL ? url.href : url?.toString() || '';
        if (shouldBlock(urlStr)) {
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
        'ytd-companion-slot-renderer',
    ];
    const combinedAdSelector = adSelectors.join(',');
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
                            if ((badge.textContent || '')
                                .toLowerCase()
                                .includes('promoted')) {
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
            if ((badge.textContent || '').toLowerCase().includes('promoted')) {
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
        const video = document.querySelector('video');
        if (!video)
            return;
        if (document.querySelector('.ad-showing')) {
            if (Number.isFinite(video.duration)) {
                video.currentTime = video.duration;
            }
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
        btn.id = 'adblock-toggle';
        btn.textContent = `AdBlock: ${enabled ? 'ON' : 'OFF'}`;
        btn.setAttribute('aria-label', `Toggle AdBlock (Currently ${enabled ? 'ON' : 'OFF'})`);
        btn.setAttribute('aria-pressed', enabled.toString());
        btn.setAttribute('title', 'Toggle AdBlock (Shift+A)');
        btn.setAttribute('aria-keyshortcuts', 'Shift+A');
        styleButton(btn);
        btn.addEventListener('click', toggleAdblock);
        btn.addEventListener('mouseover', () => (btn.style.opacity = '0.8'));
        btn.addEventListener('mouseout', () => (btn.style.opacity = '1'));
        btn.addEventListener('focus', () => (btn.style.outline = '2px solid white'));
        btn.addEventListener('blur', () => (btn.style.outline = 'none'));
        logo.parentElement?.insertBefore(btn, logo.nextSibling);
    }
    function styleButton(btn) {
        btn.style.cssText = `
            margin-left: 12px;
            padding: 4px 8px;
            font-size: 12px;
            background: ${enabled ? '#cc0000' : '#444'};
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            transition: opacity 0.2s, outline 0.2s;
            outline: none;
        `;
    }
    function toggleAdblock() {
        enabled = !enabled;
        saveState();
        const btn = document.querySelector('#adblock-toggle');
        if (btn) {
            btn.textContent = `AdBlock: ${enabled ? 'ON' : 'OFF'}`;
            btn.setAttribute('aria-label', `Toggle AdBlock (Currently ${enabled ? 'ON' : 'OFF'})`);
            btn.setAttribute('aria-pressed', enabled.toString());
            styleButton(btn);
        }
        console.log(`YouTube AdBlock is now ${enabled ? 'ENABLED' : 'DISABLED'}`);
    }
    document.addEventListener('keydown', (e) => {
        if (e.shiftKey && e.key.toLowerCase() === 'a') {
            toggleAdblock();
        }
    });
    setInterval(() => {
        addToggleButton();
        skipVideoAds();
    }, 500);
})();
//# sourceMappingURL=ytAdBlock2.js.map