"use strict";
(function () {
    'use strict';
    let enabled = true;
    try {
        const stored = localStorage.getItem('ytAdblockEnabled');
        if (stored !== null) {
            const parsed = JSON.parse(stored);
            enabled = typeof parsed === 'boolean' ? parsed : true;
        }
    }
    catch (e) {
        console.warn('Failed to parse ytAdblockEnabled from localStorage', e instanceof Error ? e.message : String(e));
        enabled = true;
    }
    function saveState() {
        try {
            localStorage.setItem('ytAdblockEnabled', JSON.stringify(enabled));
        }
        catch (e) {
            console.warn('Failed to save ytAdblockEnabled to localStorage', e instanceof Error ? e.message : String(e));
        }
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
    const nativeUrlHrefGetter = Object.getOwnPropertyDescriptor(URL.prototype, 'href')?.get;
    window.fetch = (async (...args) => {
        const req = args[0];
        let url = '';
        let isNative = false;
        try {
            url = nativeReqUrlGetter?.call(req);
            if (url !== undefined)
                isNative = true;
        }
        catch {
        }
        if (!isNative) {
            try {
                url = nativeUrlHrefGetter?.call(req);
                if (url !== undefined)
                    isNative = true;
            }
            catch {
            }
        }
        if (!isNative) {
            url = req?.toString() || '';
        }
        if (req && typeof req === 'object') {
            let isNativeRequest = false;
            try {
                if (typeof Request !== 'undefined' && nativeReqUrlGetter) {
                    nativeReqUrlGetter.call(req);
                    isNativeRequest = true;
                }
            }
            catch (e) {
                isNativeRequest = false;
            }
            if (!isNativeRequest) {
                try {
                    args[0] = new Request(url, { duplex: 'half', ...req });
                }
                catch (e) {
                    try {
                        Object.defineProperty(req, 'url', {
                            value: url,
                            configurable: true,
                            enumerable: true,
                            writable: true,
                        });
                    }
                    catch (e2) { }
                }
            }
        }
        else {
            args[0] = url;
        }
        if (url !== undefined && shouldBlock(url)) {
            return new Response('', { status: 204 });
        }
        return origFetch(...args);
    });
    const origOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url, async, username, password) {
        let urlStr = '';
        let isNative = false;
        try {
            urlStr = nativeUrlHrefGetter?.call(url);
            if (urlStr !== undefined)
                isNative = true;
        }
        catch {
        }
        if (!isNative) {
            urlStr = url?.toString() || '';
        }
        url = urlStr;
        if (urlStr && shouldBlock(urlStr)) {
            this.abort();
            return;
        }
        return origOpen.apply(this, [method, url, async ?? true, username, password]);
    };
    const origSendBeacon = navigator.sendBeacon;
    if (origSendBeacon) {
        navigator.sendBeacon = function (url, data) {
            let urlStr = '';
            let isNative = false;
            try {
                urlStr = nativeUrlHrefGetter?.call(url);
                if (urlStr !== undefined)
                    isNative = true;
            }
            catch {
            }
            if (!isNative) {
                urlStr = url?.toString() || '';
            }
            url = urlStr;
            if (urlStr && shouldBlock(urlStr)) {
                return true;
            }
            return origSendBeacon.apply(this, [url, data]);
        };
    }
    const OrigWebSocket = window.WebSocket;
    if (OrigWebSocket) {
        window.WebSocket = new Proxy(OrigWebSocket, {
            construct(target, args) {
                let url = args[0];
                let urlStr = '';
                urlStr = url?.toString() || '';
                args[0] = urlStr;
                if (urlStr && shouldBlock(urlStr)) {
                    throw new Error('WebSocket connection blocked by AdBlocker.');
                }
                return new target(...args);
            },
        });
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
        '#dismissible ytd-badge-supported-renderer',
    ];
    const combinedAdSelector = adSelectors.join(',');
    const promotedBadgeRegex = /promoted/i;
    const adObserver = new MutationObserver((mutations) => {
        if (!enabled)
            return;
        for (let i = 0; i < mutations.length; i++) {
            const mutation = mutations[i];
            for (let j = 0; j < mutation.addedNodes.length; j++) {
                const node = mutation.addedNodes[j];
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const el = node;
                    if (el.matches && el.matches(combinedAdSelector)) {
                        el.remove();
                    }
                    else if (el.firstElementChild && el.querySelectorAll) {
                        const adNodes = el.querySelectorAll(combinedAdSelector);
                        for (let k = 0; k < adNodes.length; k++) {
                            const adNode = adNodes[k];
                            if (adNode.tagName === 'YTD-BADGE-SUPPORTED-RENDERER') {
                                if (promotedBadgeRegex.test(adNode.textContent || '')) {
                                    adNode
                                        .closest('ytd-video-renderer,ytd-compact-video-renderer')
                                        ?.remove();
                                }
                            }
                            else {
                                adNode.remove();
                            }
                        }
                    }
                }
            }
        }
    });
    function removeInitialAds() {
        if (!enabled)
            return;
        const initialAds = document.querySelectorAll(combinedAdSelector);
        for (let i = 0; i < initialAds.length; i++) {
            const adNode = initialAds[i];
            if (adNode.tagName === 'YTD-BADGE-SUPPORTED-RENDERER') {
                if (promotedBadgeRegex.test(adNode.textContent || '')) {
                    adNode.closest('ytd-video-renderer,ytd-compact-video-renderer')?.remove();
                }
            }
            else {
                adNode.remove();
            }
        }
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
    function updateButtonContent(btn, isEnabled) {
        btn.textContent = '';
        const iconSpan = document.createElement('span');
        iconSpan.setAttribute('aria-hidden', 'true');
        iconSpan.textContent = isEnabled ? '🛡️' : '⚠️';
        const textSpan = document.createElement('span');
        textSpan.textContent = `AdBlock: ${isEnabled ? 'ON' : 'OFF'}`;
        const kbd = document.createElement('kbd');
        kbd.setAttribute('aria-hidden', 'true');
        kbd.textContent = 'Shift+A';
        btn.appendChild(iconSpan);
        btn.appendChild(textSpan);
        btn.appendChild(kbd);
    }
    function addToggleButton() {
        if (document.getElementById('adblock-toggle'))
            return;
        const logo = document.getElementById('logo');
        if (!logo)
            return;
        const btn = document.createElement('button');
        btn.id = 'adblock-toggle';
        updateButtonContent(btn, enabled);
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
                #adblock-toggle:hover { filter: brightness(0.85); }
                #adblock-toggle:focus-visible { outline: 2px solid var(--yt-spec-text-primary, CanvasText); outline-offset: 2px; }
                #adblock-toggle:active { transform: scale(0.95); }
                #adblock-toggle kbd { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; background-color: rgba(255, 255, 255, 0.2); border-radius: 4px; padding: 2px 6px; font-size: 11px; font-weight: 500; letter-spacing: 0.5px; border: 1px solid rgba(255, 255, 255, 0.3); }
                @media (prefers-reduced-motion: reduce) {
                    #adblock-toggle { transition: none !important; }
                    #adblock-toast { transition: none !important; }
                }
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
            height: 36px;
            padding: 0 16px;
            font-size: 14px;
            font-family: "Roboto", "Arial", sans-serif;
            font-weight: 500;
            color: white;
            border: none;
            border-radius: 18px;
            cursor: pointer;
            user-select: none;
            -webkit-user-select: none;
            transition: opacity 0.2s, filter 0.2s, outline 0.2s, background-color 0.2s, transform 0.1s;
            transform-origin: center;
            display: flex;
            align-items: center;
            gap: 8px;
        `;
    }
    function styleButtonDynamic(btn) {
        btn.style.backgroundColor = enabled ? '#cc0000' : '#444';
    }
    let toastTimeout;
    function showToast(icon, message, isEnabled) {
        let toast = document.getElementById('adblock-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'adblock-toast';
            toast.setAttribute('aria-hidden', 'true');
            toast.style.cssText = `
                position: fixed;
                bottom: 24px;
                left: 24px;
                background-color: ${isEnabled ? '#cc0000' : '#444'};
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                font-family: "Roboto", "Arial", sans-serif;
                font-size: 14px;
                font-weight: 500;
                z-index: 2147483647;
                box-shadow: 0 4px 12px rgba(0,0,0,0.25);
                opacity: 0;
                transform: translateY(20px);
                transition: opacity 0.3s ease-out, transform 0.3s ease-out, background-color 0.3s;
                pointer-events: none;
                display: flex;
                align-items: center;
                gap: 8px;
            `;
            document.body.appendChild(toast);
        }
        else {
            toast.style.backgroundColor = isEnabled ? '#cc0000' : '#444';
        }
        toast.textContent = '';
        const iconSpan = document.createElement('span');
        iconSpan.setAttribute('aria-hidden', 'true');
        iconSpan.textContent = icon;
        const textSpan = document.createElement('span');
        textSpan.textContent = message;
        toast.appendChild(iconSpan);
        toast.appendChild(textSpan);
        void toast.offsetHeight;
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
        clearTimeout(toastTimeout);
        toastTimeout = window.setTimeout(() => {
            if (toast) {
                toast.style.opacity = '0';
                toast.style.transform = 'translateY(20px)';
            }
        }, 3000);
    }
    function toggleAdblock() {
        enabled = !enabled;
        saveState();
        const btn = document.getElementById('adblock-toggle');
        if (btn) {
            updateButtonContent(btn, enabled);
            btn.setAttribute('aria-pressed', enabled.toString());
            btn.setAttribute('title', `${enabled ? 'Disable' : 'Enable'} AdBlock (Shift+A)`);
            styleButtonDynamic(btn);
        }
        const announcer = document.getElementById('adblock-announcer');
        if (announcer) {
            announcer.textContent = `AdBlock is now ${enabled ? 'ON' : 'OFF'}`;
        }
        showToast(enabled ? '🛡️' : '⚠️', `AdBlock is now ${enabled ? 'ON' : 'OFF'}`, enabled);
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