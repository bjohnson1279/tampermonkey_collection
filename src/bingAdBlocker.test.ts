/** @jest-environment jsdom */

describe('Bing Ad Blocker', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
        jest.resetModules();
    });

    it('should handle missing slide container without errors', () => {
        // Run the IIFE
        expect(() => {
            require('./bingAdBlocker');
        }).not.toThrow();
    });

    it('should inject a style element into the head', () => {
        require('./bingAdBlocker');
        const styles = Array.from(document.head.getElementsByTagName('style'));
        const hasAdBlockStyle = styles.some((style) =>
            style.textContent?.includes('.tobitem:has(.b_adSlug) { display: none !important; }')
        );
        expect(hasAdBlockStyle).toBe(true);
    });

    it('should inject a style element into the documentElement if head is missing', () => {
        // Remove document.head to test fallback
        Object.defineProperty(document, 'head', { value: null, configurable: true });

        require('./bingAdBlocker');
        const styles = Array.from(document.documentElement.getElementsByTagName('style'));
        const hasAdBlockStyle = styles.some((style) =>
            style.textContent?.includes('.tobitem:has(.b_adSlug) { display: none !important; }')
        );
        expect(hasAdBlockStyle).toBe(true);
    });
});
