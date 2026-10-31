/**
 * @jest-environment jsdom
 */
describe('ytAdBlock2', () => {
    let originalFetch: typeof window.fetch;
    let originalXHR: typeof window.XMLHttpRequest;
    let originalSendBeacon: typeof navigator.sendBeacon;

    beforeEach(() => {
        document.body.innerHTML = '<div id="logo"></div>';

        // Mock Request and URL
        class MockRequest {
            url: string;
            constructor(input: string | { url: string }, init?: RequestInit) {
                this.url = typeof input === 'string' ? input : input?.url || '';
            }
        }
        Object.defineProperty(window, 'Request', {
            value: MockRequest,
            configurable: true,
            writable: true,
        });

        const store: Record<string, string> = {
            ytAdblockEnabled: '0',
        };
        Object.defineProperty(window, 'localStorage', {
            value: {
                getItem: jest.fn((key) => store[key] || null),
                setItem: jest.fn((key, value) => {
                    store[key] = value.toString();
                }),
            },
            configurable: true,
            writable: true,
        });

        originalFetch = window.fetch;
        originalXHR = window.XMLHttpRequest;
        originalSendBeacon = navigator.sendBeacon;

        window.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200 } as any);
        (navigator as any).sendBeacon = jest.fn().mockReturnValue(true);

        jest.useFakeTimers();
    });

    afterEach(() => {
        window.fetch = originalFetch;
        window.XMLHttpRequest = originalXHR;
        (navigator as any).sendBeacon = originalSendBeacon;
        jest.useRealTimers();
        jest.resetModules();
    });

    describe('Security and Persistence', () => {
        it('should ignore non-boolean parsed values and default to true', async () => {
            require('./ytAdBlock2.ts');
            jest.advanceTimersByTime(500);
            await Promise.resolve();
            const btn = document.getElementById('adblock-toggle');
            expect(btn).not.toBeNull();
            expect(btn?.textContent).toContain('ON');
        });

        it('should fail securely if localStorage.setItem throws an error on toggle', async () => {
            require('./ytAdBlock2.ts');
            jest.advanceTimersByTime(500);
            await Promise.resolve();

            const btn = document.getElementById('adblock-toggle');
            expect(btn).not.toBeNull();

            (window.localStorage.setItem as jest.Mock).mockImplementationOnce(() => {
                throw new Error('QuotaExceededError');
            });

            const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

            btn?.click();

            expect(btn?.textContent).toContain('OFF');
            expect(warnSpy).toHaveBeenCalledWith(
                'Failed to save ytAdblockEnabled to localStorage',
                'QuotaExceededError'
            );

            warnSpy.mockRestore();
        });

        it('should prevent TOCTOU evasion and WebIDL spoofing in WebSocket interceptor', async () => {
            class MockWebSocket {
                url: string;
                constructor(url: string | URL, protocols?: string | string[]) {
                    this.url = url.toString();
                }
            }
            Object.defineProperty(window, 'WebSocket', {
                value: MockWebSocket,
                configurable: true,
                writable: true,
            });

            require('./ytAdBlock2.ts');
            jest.advanceTimersByTime(500);
            await Promise.resolve();

            const spoofedDuckUrl = {
                href: 'https://youtube.com/api/stats/ads',
                toString() {
                    return 'https://safe.com';
                },
            };

            const ws1 = new window.WebSocket(spoofedDuckUrl as any);
            expect(ws1.url).toBe('https://safe.com');

            const nativeUrl = new window.URL('https://youtube.com/api/stats/ads');
            nativeUrl.toString = () => 'https://safe.com';

            expect(() => {
                new window.WebSocket(nativeUrl);
            }).toThrow("Failed to construct 'WebSocket': The URL is invalid.");

            expect(() => {
                new window.WebSocket('https://youtube.com/pagead/test');
            }).toThrow(
                "Failed to construct 'WebSocket': The URL 'https://youtube.com/pagead/test' is invalid."
            );

            const safeWs = new window.WebSocket('https://example.com/socket');
            expect(safeWs.url).toBe('https://example.com/socket');
        });
    });

    describe('Network Interception', () => {
        it('should block ad fetch requests and allow non-ad fetch requests', async () => {
            require('./ytAdBlock2.ts');

            await expect(
                window.fetch('https://googleads.g.doubleclick.net/pagead/ads')
            ).rejects.toThrow('Failed to fetch');

            const safeRes = await window.fetch('https://www.youtube.com/watch?v=123');
            expect(safeRes).toBeDefined();

            const adUrlObj = new URL('https://youtube.com/api/stats/ads');
            await expect(window.fetch(adUrlObj as any)).rejects.toThrow('Failed to fetch');

            const pojoRequest = {
                url: 'https://youtube.com/get_midroll?video_id=123',
                toString() {
                    return 'https://youtube.com/get_midroll?video_id=123';
                },
            };
            await expect(window.fetch(pojoRequest as any)).rejects.toThrow('Failed to fetch');
        });

        it('should block ad XMLHttpRequest open calls and allow non-ad requests', () => {
            require('./ytAdBlock2.ts');

            const xhr = new XMLHttpRequest();

            expect(() => {
                xhr.open('GET', 'https://youtube.com/api/stats/ads');
            }).toThrow("Failed to execute 'open' on 'XMLHttpRequest': Invalid URL");

            const adUrlObj = new URL('https://youtube.com/pagead/test');
            expect(() => {
                xhr.open('GET', adUrlObj);
            }).toThrow("Failed to execute 'open' on 'XMLHttpRequest': Invalid URL");

            expect(() => {
                xhr.open('GET', 'https://www.youtube.com/feed/subscriptions');
            }).not.toThrow();
        });

        it('should block ad sendBeacon calls and allow non-ad beacons', () => {
            require('./ytAdBlock2.ts');

            const blockedResult = navigator.sendBeacon('https://youtube.com/api/stats/atr');
            expect(blockedResult).toBe(false);

            const adUrlObj = new URL('https://youtube.com/api/stats/atr?v=1');
            const blockedResultUrl = navigator.sendBeacon(adUrlObj);
            expect(blockedResultUrl).toBe(false);

            const allowedResult = navigator.sendBeacon('https://www.youtube.com/api/stats/qoe');
            expect(allowedResult).toBe(true);
        });
    });

    describe('Video Ad Skipping and Hotkeys', () => {
        it('should fast-forward video duration when ad is showing', () => {
            const video = document.createElement('video');
            Object.defineProperty(video, 'duration', { value: 30, writable: true });
            video.currentTime = 0;
            document.body.appendChild(video);

            const adMarker = document.createElement('div');
            adMarker.className = 'ad-showing';
            document.body.appendChild(adMarker);

            require('./ytAdBlock2.ts');

            jest.advanceTimersByTime(500);

            expect(video.currentTime).toBe(30);
        });

        it('should trigger click on skip button if present with video', () => {
            const video = document.createElement('video');
            document.body.appendChild(video);

            const skipBtn = document.createElement('button');
            skipBtn.className = 'ytp-ad-skip-button';
            const clickSpy = jest.spyOn(skipBtn, 'click');
            document.body.appendChild(skipBtn);

            require('./ytAdBlock2.ts');

            jest.advanceTimersByTime(500);

            expect(clickSpy).toHaveBeenCalled();
        });

        it('should toggle adblock when Shift+A keyboard shortcut is pressed outside of inputs', () => {
            require('./ytAdBlock2.ts');
            jest.advanceTimersByTime(500);

            const btn = document.getElementById('adblock-toggle');
            expect(btn?.textContent).toContain('ON');

            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', shiftKey: true }));
            expect(btn?.textContent).toContain('OFF');

            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'A', shiftKey: true }));
            expect(btn?.textContent).toContain('ON');
        });

        it('should ignore Shift+A keyboard shortcut when typing inside input elements', () => {
            require('./ytAdBlock2.ts');
            jest.advanceTimersByTime(500);

            const btn = document.getElementById('adblock-toggle');
            expect(btn?.textContent).toContain('ON');

            const input = document.createElement('input');
            document.body.appendChild(input);

            input.dispatchEvent(
                new KeyboardEvent('keydown', { key: 'a', shiftKey: true, bubbles: true })
            );
            expect(btn?.textContent).toContain('ON');
        });
    });
});
