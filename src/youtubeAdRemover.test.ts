// We use require to avoid TS module import errors and conflicts
const ytModule = require('./youtubeAdRemover');

describe('YouTubeAdRemover', () => {
    let adRemover: any;
    let mockHeadAppendChild: jest.Mock;
    let mockDocumentElementAppendChild: jest.Mock;

    beforeEach(() => {
        mockHeadAppendChild = jest.fn();
        mockDocumentElementAppendChild = jest.fn();

        const documentMock = {
            readyState: 'complete',
            addEventListener: jest.fn(),
            createElement: jest.fn().mockImplementation((tag) => ({ tag })),
            head: { appendChild: mockHeadAppendChild },
            documentElement: { appendChild: mockDocumentElementAppendChild },
        };
        (global as any).document = documentMock;

        jest.clearAllMocks();
    });

    afterEach(() => {
        if (adRemover) {
            adRemover.destroy();
        }
        jest.restoreAllMocks();
        delete (global as any).document;
    });

    describe('Initialization', () => {
        it('should inject a style element into document.head to hide ads using CSS :has()', () => {
            adRemover = new ytModule.YouTubeAdRemover();

            expect(global.document.createElement).toHaveBeenCalledWith('style');
            const callArgs = mockHeadAppendChild.mock.calls[0];
            expect(callArgs).toBeDefined();
            const appendedElement = callArgs[0];
            expect(appendedElement.tag).toBe('style');
            expect(appendedElement.textContent).toBe(
                'ytd-rich-item-renderer:has(.ytd-ad-slot-renderer), ytd-video-renderer:has(.ytd-ad-slot-renderer) { display: none !important; }'
            );
        });

        it('should fallback to document.documentElement if document.head is not available', () => {
            const documentMock = {
                readyState: 'complete',
                addEventListener: jest.fn(),
                createElement: jest.fn().mockImplementation((tag) => ({ tag })),
                head: null,
                documentElement: { appendChild: mockDocumentElementAppendChild },
            };
            (global as any).document = documentMock;

            adRemover = new ytModule.YouTubeAdRemover();

            expect(mockHeadAppendChild).not.toHaveBeenCalled();
            const callArgs = mockDocumentElementAppendChild.mock.calls[0];
            expect(callArgs).toBeDefined();
            const appendedElement = callArgs[0];
            expect(appendedElement.tag).toBe('style');
            expect(appendedElement.textContent).toBe(
                'ytd-rich-item-renderer:has(.ytd-ad-slot-renderer), ytd-video-renderer:has(.ytd-ad-slot-renderer) { display: none !important; }'
            );
        });
    });
});
