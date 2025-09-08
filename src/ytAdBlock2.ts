// filepath: yt-adblock-ts/yt-adblock-ts/src/ytAdBlock2.ts
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
    let enabled: boolean = JSON.parse(localStorage.getItem("ytAdblockEnabled") || "true") ?? true;

    function saveState(): void {
        localStorage.setItem("ytAdblockEnabled", JSON.stringify(enabled));
    }

    //----------------------------------------
    // Block ad/tracking requests
    //----------------------------------------
    const blockedPatterns: string[] = [
        "doubleclick.net",
        "youtube.com/api/stats/ads",
        "youtube.com/api/stats/atr",
        "youtube.com/get_midroll",
        "youtube.com/pagead",
        "ytimg.com/ads/",
    ];

    function shouldBlock(url: string): boolean {
        return enabled && blockedPatterns.some(pattern => url.includes(pattern));
    }

    // Patch fetch()
    const origFetch = window.fetch;
    window.fetch = (async (...args: Parameters<typeof window.fetch>): Promise<Response> => {
        const url: string = args[0]?.toString() || "";
        if (shouldBlock(url)) {
            console.log("Blocked fetch:", url);
            return new Response("", { status: 204 });
        }
        return origFetch(...args);
    }) as typeof window.fetch;

    // Patch XMLHttpRequest
    const origOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(this: XMLHttpRequest, method: string, url: string, async?: boolean, username?: string | null, password?: string | null): void {
        if (shouldBlock(url)) {
            console.log("Blocked XHR:", url);
        this.abort();
        return;
        }
        return origOpen.apply(this, [method, url, async ?? true, username, password]);
    };

    //----------------------------------------
    // DOM cleanup for ad containers
    //----------------------------------------
    const adSelectors: string[] = [
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

    function removeAds(): void {
        if (!enabled) return;

        adSelectors.forEach(sel => {
            document.querySelectorAll(sel).forEach(el => el.remove());
        });

        // Remove "Promoted" sidebar/homepage videos
        document.querySelectorAll('#dismissible ytd-badge-supported-renderer')
            .forEach(badge => {
                if ((badge as HTMLElement).innerText.toLowerCase().includes("promoted")) {
                    badge.closest('ytd-video-renderer,ytd-compact-video-renderer')?.remove();
                }
            });
    }

    //----------------------------------------
    // Skip video ads
    //----------------------------------------
    function skipVideoAds(): void {
        if (!enabled) return;

        const video: HTMLVideoElement | null = document.querySelector('video');
        if (!video) return;

        if (document.querySelector('.ad-showing')) {
            video.currentTime = video.duration;
        }

        const skipBtn: HTMLElement | null = document.querySelector('.ytp-ad-skip-button');
        if (skipBtn) skipBtn.click();
    }

    //----------------------------------------
    // Toggle button UI
    //----------------------------------------
    function addToggleButton(): void {
        if (document.querySelector('#adblock-toggle')) return;

        const logo: HTMLElement | null = document.querySelector('#logo');
        if (!logo) return;

        const btn: HTMLButtonElement = document.createElement('button');
        btn.id = "adblock-toggle";
        btn.textContent = `AdBlock: ${enabled ? "ON" : "OFF"}`;
        styleButton(btn);

        btn.addEventListener('click', toggleAdblock);
        logo.parentElement?.insertBefore(btn, logo.nextSibling);
    }

    function styleButton(btn: HTMLButtonElement): void {
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
    function toggleAdblock(): void {
        enabled = !enabled;
        saveState();

        const btn: HTMLElement | null = document.querySelector('#adblock-toggle');
        if (btn) {
            btn.textContent = `AdBlock: ${enabled ? "ON" : "OFF"}`;
            styleButton(btn as HTMLButtonElement);
        }

        console.log(`YouTube AdBlock is now ${enabled ? "ENABLED" : "DISABLED"}`);
    }

    //----------------------------------------
    // Keyboard shortcut (Shift+A)
    //----------------------------------------
    document.addEventListener('keydown', (e: KeyboardEvent) => {
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