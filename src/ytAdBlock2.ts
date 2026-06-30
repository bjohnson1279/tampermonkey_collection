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

(function () {
    'use strict';

    //----------------------------------------
    // Persistent state
    //----------------------------------------
    let enabled: boolean = true;
    try {
        const stored = localStorage.getItem('ytAdblockEnabled');
        if (stored !== null) {
            enabled = JSON.parse(stored) ?? true;
        }
    } catch (e) {
        console.warn('Failed to parse ytAdblockEnabled from localStorage', e);
        enabled = true;
    }

    function saveState(): void {
        localStorage.setItem('ytAdblockEnabled', JSON.stringify(enabled));
    }

    //----------------------------------------
    // Block ad/tracking requests
    //----------------------------------------
    const blockedPatterns: string[] = [
        'doubleclick.net',
        'youtube.com/api/stats/ads',
        'youtube.com/api/stats/atr',
        'youtube.com/get_midroll',
        'youtube.com/pagead',
        'ytimg.com/ads/',
    ];

    function shouldBlock(url: string): boolean {
        return enabled && blockedPatterns.some((pattern) => url.includes(pattern));
    }

    // Patch fetch()
    const origFetch = window.fetch;
    window.fetch = (async (...args: Parameters<typeof window.fetch>): Promise<Response> => {
        const req = args[0];
        // 🛡️ Sentinel: Use duck typing for Request/URL objects to prevent cross-realm (iframe) adblock evasion
        // where `instanceof` fails and `.toString()` returns "[object Request]"
        const url: string =
            req && typeof req === 'object' && 'url' in req && typeof (req as any).url === 'string'
                ? (req as any).url
                : req &&
                    typeof req === 'object' &&
                    'href' in req &&
                    typeof (req as any).href === 'string'
                  ? (req as any).href
                  : req?.toString() || '';
        if (shouldBlock(url)) {
            return new Response('', { status: 204 });
        }
        return origFetch(...args);
    }) as typeof window.fetch;

    // Patch XMLHttpRequest
    const origOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (
        this: XMLHttpRequest,
        method: string,
        url: string | URL,
        async?: boolean,
        username?: string | null,
        password?: string | null
    ): void {
        // 🛡️ Sentinel: Use duck typing for URL objects to prevent cross-realm adblock evasion
        const urlStr =
            url && typeof url === 'object' && 'href' in url && typeof (url as any).href === 'string'
                ? (url as any).href
                : url?.toString() || '';
        if (shouldBlock(urlStr)) {
            this.abort();
            return;
        }
        return origOpen.apply(this, [method, url as string, async ?? true, username, password]);
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
        'ytd-companion-slot-renderer',
    ];

    const combinedAdSelector = adSelectors.join(',');

    const adObserver = new MutationObserver((mutations) => {
        if (!enabled) return;
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const el = node as HTMLElement;
                    if (el.matches && el.matches(combinedAdSelector)) {
                        el.remove();
                    } else if (el.firstElementChild && el.querySelectorAll) {
                        // ⚡ Bolt: Fast path for leaf nodes - avoid querySelectorAll parsing overhead if no children exist
                        el.querySelectorAll(combinedAdSelector).forEach((e) => e.remove());

                        // Remove "Promoted" sidebar/homepage videos
                        el.querySelectorAll('#dismissible ytd-badge-supported-renderer').forEach(
                            (badge) => {
                                if (
                                    ((badge as HTMLElement).textContent || '')
                                        .toLowerCase()
                                        .includes('promoted')
                                ) {
                                    badge
                                        .closest('ytd-video-renderer,ytd-compact-video-renderer')
                                        ?.remove();
                                }
                            }
                        );
                    }
                }
            });
        });
    });

    // Initial scan to remove ads already in the DOM before observer kicks in
    function removeInitialAds(): void {
        if (!enabled) return;
        document.querySelectorAll(combinedAdSelector).forEach((el) => el.remove());
        document.querySelectorAll('#dismissible ytd-badge-supported-renderer').forEach((badge) => {
            if (((badge as HTMLElement).textContent || '').toLowerCase().includes('promoted')) {
                badge.closest('ytd-video-renderer,ytd-compact-video-renderer')?.remove();
            }
        });
    }

    removeInitialAds();

    if (document.documentElement) {
        adObserver.observe(document.documentElement, { childList: true, subtree: true });
    }

    //----------------------------------------
    // Skip video ads
    //----------------------------------------
    function skipVideoAds(): void {
        if (!enabled) return;

        const video: HTMLVideoElement | null = document.querySelector('video');
        if (!video) return;

        if (document.querySelector('.ad-showing')) {
            if (Number.isFinite(video.duration)) {
                video.currentTime = video.duration;
            }
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
        btn.id = 'adblock-toggle';
        btn.textContent = `AdBlock: ${enabled ? 'ON' : 'OFF'}`;
        btn.setAttribute('aria-label', `Toggle AdBlock (Currently ${enabled ? 'ON' : 'OFF'})`);
        btn.setAttribute('aria-pressed', enabled.toString());
        btn.setAttribute('title', 'Toggle AdBlock (Shift+A)');
        btn.setAttribute('aria-keyshortcuts', 'Shift+A');
        btn.setAttribute('aria-live', 'polite');
        styleButtonStatic(btn);
        styleButtonDynamic(btn);

        btn.addEventListener('click', toggleAdblock);

        // Add hover and focus styles for accessibility
        btn.addEventListener('mouseover', () => (btn.style.opacity = '0.8'));
        btn.addEventListener('mouseout', () => (btn.style.opacity = '1'));
        btn.addEventListener('focus', () => {
            btn.style.outline = '2px solid currentColor';
            btn.style.outlineOffset = '2px';
        });
        btn.addEventListener('blur', () => {
            btn.style.outline = 'none';
            btn.style.outlineOffset = '0px';
        });

        logo.parentElement?.insertBefore(btn, logo.nextSibling);
    }

    function styleButtonStatic(btn: HTMLButtonElement): void {
        btn.style.cssText = `
            margin-left: 12px;
            padding: 4px 8px;
            font-size: 12px;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            transition: opacity 0.2s, outline 0.2s, background-color 0.2s;
            outline: none;
        `;
    }

    function styleButtonDynamic(btn: HTMLButtonElement): void {
        btn.style.backgroundColor = enabled ? '#cc0000' : '#444';
    }

    //----------------------------------------
    // Toggle logic (shared for button + hotkey)
    //----------------------------------------
    function toggleAdblock(): void {
        enabled = !enabled;
        saveState();

        const btn: HTMLElement | null = document.querySelector('#adblock-toggle');
        if (btn) {
            btn.textContent = `AdBlock: ${enabled ? 'ON' : 'OFF'}`;
            btn.setAttribute('aria-label', `Toggle AdBlock (Currently ${enabled ? 'ON' : 'OFF'})`);
            btn.setAttribute('aria-pressed', enabled.toString());
            styleButtonDynamic(btn as HTMLButtonElement);
        }

        console.log(`YouTube AdBlock is now ${enabled ? 'ENABLED' : 'DISABLED'}`);
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
        skipVideoAds();
    }, 500);
})();
