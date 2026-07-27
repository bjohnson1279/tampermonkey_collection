/**
 * @jest-environment jsdom
 */

describe('Bing Score Expansion', () => {
    let originalHead: HTMLHeadElement | null;
    let originalDocumentElement: HTMLElement;

    beforeEach(() => {
        // Clear out the DOM before each test
        document.documentElement.innerHTML = '<head></head><body></body>';
        originalHead = document.head;
        originalDocumentElement = document.documentElement;
    });

    afterEach(() => {
        jest.resetModules();
        // Restore the DOM
        document.documentElement.innerHTML = '<head></head><body></body>';
        Object.defineProperty(document, 'head', {
            value: originalHead,
            configurable: true,
        });
    });

    it('should append a style element to document.head if it exists', () => {
        // Require the file to execute the IIFE
        require('./bingScoreExpansion');

        const styleTags = document.head.querySelectorAll('style');
        expect(styleTags.length).toBe(1);

        const styleText = styleTags[0].textContent;
        expect(styleText).toContain('.spl-card { display: block !important; }');
        expect(styleText).toContain(
            '.spl-schedule .b_hide, .spl-standingTbl .b_hide, .tfil-content .b_hide { display: table-row !important; }'
        );
    });

    it('should append a style element to document.documentElement if document.head is missing', () => {
        // Mock document.head to be null
        Object.defineProperty(document, 'head', {
            value: null,
            configurable: true,
        });

        // Require the file to execute the IIFE
        require('./bingScoreExpansion');

        // Ensure the style tag was appended to documentElement since head is null
        const styleTags = document.documentElement.querySelectorAll('style');
        expect(styleTags.length).toBe(1);

        const styleText = styleTags[0].textContent;
        expect(styleText).toContain('.spl-card { display: block !important; }');
        expect(styleText).toContain(
            '.spl-schedule .b_hide, .spl-standingTbl .b_hide, .tfil-content .b_hide { display: table-row !important; }'
        );
    });
});
