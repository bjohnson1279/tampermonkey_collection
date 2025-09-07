// ==UserScript==
// @name         YouTube Total Ad Cleaner + Persistent Toggle + Hotkey
// @namespace    https://yourdomain.example
// @version      1.6
// @description  Block and skip YouTube ads (video, shorts, sidebar, homepage, network requests) with persistent toggle button + keyboard shortcut
// @author       You
// @match        https://www.youtube.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    //----------------------------------------
    // Persistent state
    //----------------------------------------
    let enabled = JSON.parse(localStorage.getItem("ytAdblockEnabled")) ?? true;

    function saveState() {
        localStorage.setItem("ytAdblockEnabled", JSON.stringify(enabled));
    }

    //----------------------------------------
    // Block ad/tracking requests
    //----------------------------------------
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

    // Patch fetch()
    const origFetch = window.fetch;
    window.fetch = async (...args) => {
        const url = args[0]?.toString() || "";
        if (shouldBlock(url)) {
            console.log("Blocked fetch:", url);
            return new Response("", { status: 204 });
        }
        return origFetch(...args);
    };

    // Patch XMLHttpRequest
    const origOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, ...rest) {
        if (shouldBlock(url)) {
            console.log("Blocked XHR:", url);
            this.abort();
            return;
        }
        return origOpen.call(this, method, url, ...rest);
    };

    //----------------------------------------
    // DOM cleanup for ad containers
    //----------------------------------------
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
        if (!enabled) return;

        adSelectors.forEach(sel => {
            document.querySelectorAll(sel).forEach(el => el.remove());
        });

        // Remove "Promoted" sidebar/homepage videos
        document.querySelectorAll('#dismissible ytd-badge-supported-renderer')
            .forEach(badge => {
                if (badge.innerText.toLowerCase().includes("promoted")) {
                    badge.closest('ytd-video-renderer,ytd-compact-video-renderer')?.remove();
                }
            });
    }

    //----------------------------------------
    // Skip video ads
    //----------------------------------------
    function skipVideoAds() {
        if (!enabled) return;

        const video = document.querySelector('video');
        if (!video) return;

        if (document.querySelector('.ad-showing')) {
            video.currentTime = video.duration;
        }

        const skipBtn = document.querySelector('.ytp-ad-skip-button');
        if (skipBtn) skipBtn.click();
    }

    //----------------------------------------
    // Toggle button UI
    //----------------------------------------
    function addToggleButton() {
        if (document.querySelector('#adblock-toggle')) return;

        const logo = document.querySelector('#logo');
        if (!logo) return;

        const btn = document.createElement('button');
        btn.id = "adblock-toggle";
        btn.textContent = `AdBlock: ${enabled ? "ON" : "OFF"}`;
        styleButton(btn);

        btn.addEventListener('click', toggleAdblock);
        logo.parentElement.insertBefore(btn, logo.nextSibling);
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

    //----------------------------------------
    // Toggle logic (shared for button + hotkey)
    //----------------------------------------
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

    //----------------------------------------
    // Keyboard shortcut (Shift+A)
    //----------------------------------------
    document.addEventListener('keydown', (e) => {
        if (e.shiftKey && e.key.toLowerCase() === 'a') {
            toggleAdblock();
        }
    });

    //----------------------------------------
    // Run loop
    //----------------------------------------
    setInterval(() => {
        addToggleButton();
        removeAds();
        skipVideoAds();
    }, 500);

})();