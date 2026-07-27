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
        Object.defineProperty(window, 'Request', { value: MockRequest });

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
});
