/**
 * @jest-environment jsdom
 */
describe('ytAdBlock2 Security Fix', () => {
    beforeEach(() => {
        document.body.innerHTML = '<div id="logo"></div>';

        // Mock Request and URL
        class MockRequest {
            url: string;
            constructor(url: string) {
                this.url = url;
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
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.resetModules();
    });

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

        // Mock setItem to throw QuotaExceededError
        (window.localStorage.setItem as jest.Mock).mockImplementationOnce(() => {
            throw new Error('QuotaExceededError');
        });

        // Spy on console.warn to check for secure error handling without crashing
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

        // Trigger the toggle
        btn?.click();

        // UI should still update to OFF despite localStorage failure
        expect(btn?.textContent).toContain('OFF');
        expect(warnSpy).toHaveBeenCalledWith(
            'Failed to save ytAdblockEnabled to localStorage',
            'QuotaExceededError'
        );

        warnSpy.mockRestore();
    });

    it('should prevent TOCTOU evasion and WebIDL spoofing in WebSocket interceptor', async () => {
        // We mock WebSocket since it doesn't exist natively in JSDOM
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

        // 1. Duck-typing bypass attempt (looks like a URL, but isn't native)
        const spoofedDuckUrl = {
            href: 'https://youtube.com/api/stats/ads',
            toString() {
                // Return safe URL on check, malicious on use
                return 'https://safe.com';
            },
        };

        // This should pass the blocked logic safely to the target but construct with the safe URL since it evaluates toString and overwrites
        const ws1 = new window.WebSocket(spoofedDuckUrl as any);
        expect(ws1.url).toBe('https://safe.com');

        // 2. WebIDL bypass attempt with actual URL
        const nativeUrl = new window.URL('https://youtube.com/api/stats/ads');
        // Simulate a cross-realm or malicious override of toString
        nativeUrl.toString = () => 'https://safe.com';

        // This should throw because WebIDL check sees the true href ('https://youtube.com/api/stats/ads') and correctly intercepts it, blocking the connection
        expect(() => {
            new window.WebSocket(nativeUrl);
        }).toThrow('WebSocket connection blocked by AdBlocker.');
    });
});
