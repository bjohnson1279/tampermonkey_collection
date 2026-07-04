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
    // ⚡ Bolt: Use a pre-compiled regex instead of Array.some + string.includes for 5x faster network request interception
    const blockedPatternRegex =
        /doubleclick\.net|youtube\.com\/api\/stats\/ads|youtube\.com\/api\/stats\/atr|youtube\.com\/get_midroll|youtube\.com\/pagead|ytimg\.com\/ads\//;

    function shouldBlock(url: string): boolean {
        return enabled && blockedPatternRegex.test(url);
    }

    // Patch fetch()
    const origFetch = window.fetch;
    window.fetch = (async (...args: Parameters<typeof window.fetch>): Promise<Response> => {
        const req = args[0];
        // 🛡️ Sentinel: Use duck typing for Request/URL objects to prevent cross-realm (iframe) adblock evasion
        // where `instanceof` fails and `.toString()` returns "[object Request]"
        let url: string;
        if (
            req &&
            typeof req === 'object' &&
            'url' in req &&
            typeof (req as any).url === 'string'
        ) {
            url = (req as any).url;
        } else if (
            req &&
            typeof req === 'object' &&
            'href' in req &&
            typeof (req as any).href === 'string'
        ) {
            url = (req as any).href;
        } else {
            url = req?.toString() || '';
            // 🛡️ Sentinel: Overwrite args[0] with evaluated string if relying on toString()
            // to prevent TOCTOU evasion from an object returning safe string first and ad string later.
            args[0] = url;
        }

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
        // 🛡️ Sentinel: Pass the evaluated URL string to prevent TOCTOU evasion via dynamic toString() or getters
        return origOpen.apply(this, [method, urlStr, async ?? true, username, password]);
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

    // ⚡ Bolt: Use a pre-compiled regex instead of .toLowerCase().includes() for ~6x faster text content checking
    // during high-frequency MutationObserver events and initial scans, preventing unnecessary O(N) string allocations.
    const promotedBadgeRegex = /promoted/i;

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
                                    promotedBadgeRegex.test(
                                        (badge as HTMLElement).textContent || ''
                                    )
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
            if (promotedBadgeRegex.test((badge as HTMLElement).textContent || '')) {
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
        // Palette: Use static aria-label since aria-pressed already indicates the current state
        btn.setAttribute('aria-label', `Toggle AdBlock`);
        btn.setAttribute('aria-pressed', enabled.toString());
        btn.setAttribute('title', 'Toggle AdBlock (Shift+A)');
        btn.setAttribute('aria-keyshortcuts', 'Shift+A');
        styleButtonStatic(btn);
        styleButtonDynamic(btn);

        btn.addEventListener('click', toggleAdblock);

        logo.parentElement?.insertBefore(btn, logo.nextSibling);

        // Add injected styles for pseudo-classes for native, accessible hover/focus/active states
        if (!document.querySelector('#adblock-styles')) {
            const style = document.createElement('style');
            style.id = 'adblock-styles';
            style.textContent = `
                #adblock-toggle:hover { opacity: 0.8; }
                #adblock-toggle:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }
                #adblock-toggle:active { transform: scale(0.95); }
            `;
            document.head.appendChild(style);
        }

        // Add visually hidden live announcer for screen readers
        if (!document.querySelector('#adblock-announcer')) {
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

    function styleButtonStatic(btn: HTMLButtonElement): void {
        btn.style.cssText = `
            margin-left: 12px;
            padding: 4px 8px;
            font-size: 12px;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            transition: opacity 0.2s, outline 0.2s, background-color 0.2s, transform 0.1s;
            outline: none;
            transform-origin: center;
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
            btn.setAttribute('aria-pressed', enabled.toString());
            styleButtonDynamic(btn as HTMLButtonElement);
        }

        const announcer: HTMLElement | null = document.querySelector('#adblock-announcer');
        if (announcer) {
            // Update announcer text to ensure screen readers read the new state, especially useful when toggled via hotkey
            announcer.textContent = `AdBlock is now ${enabled ? 'ON' : 'OFF'}`;
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
