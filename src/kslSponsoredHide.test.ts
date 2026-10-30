describe('kslSponsoredHide', () => {
    let originalDocument: any;

    beforeEach(() => {
        originalDocument = (global as any).document;
    });

    afterEach(() => {
        jest.resetModules();
        (global as any).document = originalDocument;
    });

    it('should inject style element into document.head when document.head is present', () => {
        const styleMock = { textContent: '' };
        const headMock = { appendChild: jest.fn() };
        (global as any).document = {
            createElement: jest.fn().mockImplementation((tag) => {
                if (tag === 'style') return styleMock;
                return {};
            }),
            head: headMock,
            documentElement: {},
        };

        require('./kslSponsoredHide');

        expect(global.document.createElement).toHaveBeenCalledWith('style');
        expect(styleMock.textContent).toBe(
            '.queue:has(.sponsored), .queue_story:has(.sponsored) { display: none !important; }'
        );
        expect(headMock.appendChild).toHaveBeenCalledWith(styleMock);
    });

    it('should fallback to appending style element to document.documentElement when document.head is null', () => {
        const styleMock = { textContent: '' };
        const docElemMock = { appendChild: jest.fn() };
        (global as any).document = {
            createElement: jest.fn().mockImplementation((tag) => {
                if (tag === 'style') return styleMock;
                return {};
            }),
            head: null,
            documentElement: docElemMock,
        };

        require('./kslSponsoredHide');

        expect(docElemMock.appendChild).toHaveBeenCalledWith(styleMock);
    });
});
