// ==UserScript==
// @name         YouTube Total Ad Cleaner + Persistent Toggle + Hotkey
// @namespace    https://yourdomain.example
// @version      1.6
// @description  Block and skip YouTube ads (video, shorts, sidebar, homepage, network requests) with persistent toggle button + keyboard shortcut
// @author       You
// @match        https://www.youtube.com/*
// @grant        none
// ==/UserScript==

'use strict';
(function () {
    'use strict';

    //----------------------------------------
    // Persistent state
    //----------------------------------------
    let enabled = true;
    try {
        const stored = localStorage.getItem('ytAdblockEnabled');
        if (stored !== null) {
            const parsed = JSON.parse(stored);
            enabled = parsed ?? true;
        }
    } catch (e) {
        console.warn('Failed to parse ytAdblockEnabled from localStorage', e);
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
    window.fetch = async (...args) => {
        const req = args[0];
        // 🛡️ Sentinel: Use duck typing for Request/URL objects to prevent cross-realm (iframe) adblock evasion
        // where `instanceof` fails and `.toString()` returns "[object Request]"
        let url;
        if (req && typeof req === 'object' && 'url' in req && typeof req.url === 'string') {
            url = req.url;
        } else if (
            req &&
            typeof req === 'object' &&
            'href' in req &&
            typeof req.href === 'string'
        ) {
            url = req.href;
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
    };
    const origOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url, async, username, password) {
        // 🛡️ Sentinel: Use duck typing for URL objects to prevent cross-realm adblock evasion
        const urlStr =
            url && typeof url === 'object' && 'href' in url && typeof url.href === 'string'
                ? url.href
                : url?.toString() || '';
        if (shouldBlock(urlStr)) {
            this.abort();
            return;
        }
        // 🛡️ Sentinel: Pass the evaluated URL string to prevent TOCTOU evasion via dynamic toString() or getters
        return origOpen.apply(this, [method, urlStr, async ?? true, username, password]);
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
        if (!enabled) return;
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const el = node;
                    if (el.matches && el.matches(combinedAdSelector)) {
                        el.remove();
                    } else if (el.firstElementChild && el.querySelectorAll) {
                        el.querySelectorAll(combinedAdSelector).forEach((e) => e.remove());
                        el.querySelectorAll('#dismissible ytd-badge-supported-renderer').forEach(
                            (badge) => {
                                if ((badge.textContent || '').toLowerCase().includes('promoted')) {
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
    function removeInitialAds() {
        if (!enabled) return;
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
        if (!enabled) return;
        const video = document.querySelector('video');
        if (!video) return;
        if (document.querySelector('.ad-showing')) {
            if (Number.isFinite(video.duration)) {
                video.currentTime = video.duration;
            }
        }
        const skipBtn = document.querySelector('.ytp-ad-skip-button');
        if (skipBtn) skipBtn.click();
    }
    function addToggleButton() {
        if (document.querySelector('#adblock-toggle')) return;
        const logo = document.querySelector('#logo');
        if (!logo) return;
        const btn = document.createElement('button');
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
        // Add hover and focus styles for accessibility
        btn.addEventListener('mouseover', () => (btn.style.opacity = '0.8'));
        btn.addEventListener('mouseout', () => {
            btn.style.opacity = '1';
            btn.style.transform = 'scale(1)';
        });
        btn.addEventListener('focus', () => {
            btn.style.outline = '2px solid currentColor';
            btn.style.outlineOffset = '2px';
        });
        btn.addEventListener('blur', () => {
            btn.style.outline = 'none';
            btn.style.outlineOffset = '0px';
            btn.style.transform = 'scale(1)';
        });
        // Add tactile active state scaling
        btn.addEventListener('mousedown', () => (btn.style.transform = 'scale(0.95)'));
        btn.addEventListener('mouseup', () => (btn.style.transform = 'scale(1)'));
        btn.addEventListener('keydown', (e) => {
            if (e.key === ' ' || e.key === 'Enter') {
                btn.style.transform = 'scale(0.95)';
            }
        });
        btn.addEventListener('keyup', (e) => {
            if (e.key === ' ' || e.key === 'Enter') {
                btn.style.transform = 'scale(1)';
            }
        });

        logo.parentElement?.insertBefore(btn, logo.nextSibling);

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

    function styleButtonStatic(btn) {
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

    function styleButtonDynamic(btn) {
        btn.style.backgroundColor = enabled ? '#cc0000' : '#444';
    }

    //----------------------------------------
    // Toggle logic (shared for button + hotkey)
    //----------------------------------------
    function toggleAdblock() {
        enabled = !enabled;
        saveState();
        const btn = document.querySelector('#adblock-toggle');
        if (btn) {
            btn.textContent = `AdBlock: ${enabled ? 'ON' : 'OFF'}`;
            btn.setAttribute('aria-pressed', enabled.toString());
            styleButtonDynamic(btn);
        }

        const announcer = document.querySelector('#adblock-announcer');
        if (announcer) {
            // Update announcer text to ensure screen readers read the new state, especially useful when toggled via hotkey
            announcer.textContent = `AdBlock is now ${enabled ? 'ON' : 'OFF'}`;
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
