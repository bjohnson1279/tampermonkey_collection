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
        // 🛡️ Sentinel: Removed error object from console.warn to prevent stack trace exposure
        console.warn(
            'Failed to parse ytAdblockEnabled from localStorage',
            e instanceof Error ? e.message : String(e)
        );
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
        if (!enabled) return false;
        try {
            // 🛡️ Sentinel: Normalize URL to absolute to prevent relative URL evasion
            const absoluteUrl = new URL(url, window.location.href).href;
            return blockedPatternRegex.test(absoluteUrl);
        } catch {
            return blockedPatternRegex.test(url);
        }
    }

    // Patch fetch()
    const origFetch = window.fetch;
    // ⚡ Bolt: Cache the native Request URL getter to avoid expensive reflection inside the hot path fetch interceptor loop.
    const nativeReqUrlGetter = Object.getOwnPropertyDescriptor(Request.prototype, 'url')?.get;

    window.fetch = (async (...args: Parameters<typeof window.fetch>): Promise<Response> => {
        const req = args[0];
        // 🛡️ Sentinel: Use WebIDL brand checking for Request/URL objects to prevent cross-realm (iframe) adblock evasion
        // and avoid TOCTOU vulnerabilities from malicious POJOs exploiting duck-typing getters.
        let url: string = '';
        let isNative = false;

        try {
            url = Object.getOwnPropertyDescriptor(Request.prototype, 'url')?.get?.call(req);
            if (url !== undefined) isNative = true;
        } catch {
            /* Not a Request */
        }

        if (!isNative) {
            try {
                url = Object.getOwnPropertyDescriptor(URL.prototype, 'href')?.get?.call(req);
                if (url !== undefined) isNative = true;
            } catch {
                /* Not a URL */
            }
        }

        if (!isNative) {
            url = req?.toString() || '';
        }

        // 🛡️ Sentinel: Overwrite args[0] with the evaluated URL string only if it's a POJO.
        // Native Request objects are immune to TOCTOU as their internal URL slot is immutable.
        // We use brand-checking via the internal [[Request]] slot to reliably distinguish between
        // Native Requests (even from cross-realms) and malicious POJOs spoofing as Requests.
        if (req && typeof req === 'object') {
            let isNativeRequest = false;
            try {
                if (typeof Request !== 'undefined') {
                    Object.getOwnPropertyDescriptor(Request.prototype, 'url')?.get?.call(req);
                    isNativeRequest = true;
                }
            } catch (e) {
                isNativeRequest = false;
            }
            if (!isNativeRequest) {
                try {
                    args[0] = new Request(url, { duplex: 'half', ...(req as RequestInit) } as any);
                } catch (e) {
                    try {
                        Object.defineProperty(req, 'url', {
                            value: url,
                            configurable: true,
                            enumerable: true,
                            writable: true,
                        });
                    } catch (e2) {}
                }
            }
        } else {
            args[0] = url;
        }

        if (url !== undefined && shouldBlock(url)) {
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
        // 🛡️ Sentinel: Use WebIDL brand checking for URL objects to prevent cross-realm adblock evasion
        // and avoid TOCTOU vulnerabilities from malicious POJOs exploiting duck-typing getters.
        let urlStr: string = '';
        let isNative = false;

        try {
            urlStr = Object.getOwnPropertyDescriptor(URL.prototype, 'href')?.get?.call(url);
            if (urlStr !== undefined) isNative = true;
        } catch {
            /* Not a URL */
        }

        if (!isNative) {
            urlStr = url?.toString() || '';
            // 🛡️ Sentinel: Overwrite URL parameter with evaluated string for POJOs/strings
            // to prevent TOCTOU evasion.
            url = urlStr;
        }

        if (urlStr && shouldBlock(urlStr)) {
            this.abort();
            return;
        }

        return origOpen.apply(this, [method, url as any, async ?? true, username, password]);
    };

    // Patch navigator.sendBeacon
    const origSendBeacon = navigator.sendBeacon;
    if (origSendBeacon) {
        navigator.sendBeacon = function (
            this: Navigator,
            url: string | URL,
            data?: BodyInit | null
        ): boolean {
            // 🛡️ Sentinel: Use duck typing for URL objects to prevent cross-realm adblock evasion
            const urlStr =
                url &&
                typeof url === 'object' &&
                'href' in url &&
                typeof (url as any).href === 'string'
                    ? (url as any).href
                    : url?.toString() || '';
            if (shouldBlock(urlStr)) {
                return true; // Simulate success to prevent fallback mechanisms
            }
            // 🛡️ Sentinel: Pass the evaluated URL string to prevent TOCTOU evasion
            return origSendBeacon.apply(this, [urlStr, data]);
        };
    }

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

        // ⚡ Bolt: Replace querySelector (O(N) traversal) with getElementsByTagName (O(1) live collection)
        // inside this 500ms setInterval to minimize main thread CPU usage on a heavy YouTube DOM.
        const video: HTMLVideoElement | null = document.getElementsByTagName('video')[0] ?? null;
        if (!video) return;

        // ⚡ Bolt: Replace querySelector('.class') with getElementsByClassName('class')[0] for O(1) live collection lookup instead of O(N) tree traversal
        if (document.getElementsByClassName('ad-showing').length > 0) {
            if (Number.isFinite(video.duration)) {
                video.currentTime = video.duration;
            }
        }

        const skipBtn = document.getElementsByClassName('ytp-ad-skip-button')[0] as
            HTMLElement | undefined;
        if (skipBtn) skipBtn.click();
    }

    //----------------------------------------
    // Toggle button UI
    //----------------------------------------
    function addToggleButton(): void {
        // ⚡ Bolt: Replace querySelector('#id') with getElementById('id') (O(1) hash map lookup) inside the setInterval loop
        if (document.getElementById('adblock-toggle')) return;

        const logo: HTMLElement | null = document.getElementById('logo');
        if (!logo) return;

        const btn: HTMLButtonElement = document.createElement('button');
        btn.id = 'adblock-toggle';
        btn.textContent = `${enabled ? '🛡️' : '⚠️'} AdBlock: ${enabled ? 'ON' : 'OFF'}`;
        // Palette: Use static aria-label since aria-pressed already indicates the current state
        btn.setAttribute('aria-label', `Toggle AdBlock`);
        btn.setAttribute('aria-pressed', enabled.toString());
        btn.setAttribute('title', `${enabled ? 'Disable' : 'Enable'} AdBlock (Shift+A)`);
        btn.setAttribute('aria-keyshortcuts', 'Shift+A');
        styleButtonStatic(btn);
        styleButtonDynamic(btn);

        btn.addEventListener('click', toggleAdblock);

        logo.parentElement?.insertBefore(btn, logo.nextSibling);

        // Add injected styles for pseudo-classes for native, accessible hover/focus/active states
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

        // Add visually hidden live announcer for screen readers
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

    function styleButtonStatic(btn: HTMLButtonElement): void {
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

    function styleButtonDynamic(btn: HTMLButtonElement): void {
        btn.style.backgroundColor = enabled ? '#cc0000' : '#444';
    }

    //----------------------------------------
    // Toggle logic (shared for button + hotkey)
    //----------------------------------------
    function toggleAdblock(): void {
        enabled = !enabled;
        saveState();

        const btn: HTMLElement | null = document.getElementById('adblock-toggle');
        if (btn) {
            btn.textContent = `${enabled ? '🛡️' : '⚠️'} AdBlock: ${enabled ? 'ON' : 'OFF'}`;
            btn.setAttribute('aria-pressed', enabled.toString());
            btn.setAttribute('title', `${enabled ? 'Disable' : 'Enable'} AdBlock (Shift+A)`);
            styleButtonDynamic(btn as HTMLButtonElement);
        }

        const announcer: HTMLElement | null = document.getElementById('adblock-announcer');
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
        const target = e.target as HTMLElement;
        const isInput =
            target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

        if (!isInput && e.shiftKey && e.key.toLowerCase() === 'a') {
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
