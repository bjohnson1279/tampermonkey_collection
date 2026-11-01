// We use require to avoid TS module import errors and conflicts
const ytModule = require('./youtubeAdRemover');

describe('YouTubeAdRemover', () => {
    let adRemover: any;

    beforeEach(() => {
        // Mock global document
        const documentMock = {
            readyState: 'complete',
            addEventListener: jest.fn(),
            getElementById: jest.fn().mockReturnValue(null),
            createElement: jest.fn().mockImplementation((tag) => ({
                tag,
                id: '',
                textContent: '',
                parentNode: { removeChild: jest.fn() },
            })),
            head: {
                appendChild: jest.fn(),
            },
            documentElement: {
                appendChild: jest.fn(),
            },
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
        it('should inject a style element to hide ads using CSS :has()', () => {
            const createElementSpy = global.document.createElement as jest.Mock;
            const appendChildSpy = global.document.head.appendChild;

            adRemover = new ytModule.YouTubeAdRemover();

            expect(createElementSpy).toHaveBeenCalledWith('style');
            const styleElement = createElementSpy.mock.results[0].value;
            expect(styleElement.id).toBe('yt-ad-remover-styles');
            expect(styleElement.textContent).toBe(
                'ytd-rich-item-renderer:has(.ytd-ad-slot-renderer), ytd-video-renderer:has(.ytd-ad-slot-renderer) { display: none !important; }'
            );
            expect(appendChildSpy).toHaveBeenCalledWith(styleElement);
        });

        it('should not inject the style element twice if it already exists', () => {
            const createElementSpy = global.document.createElement;
            (global.document.getElementById as jest.Mock).mockReturnValue({}); // Mock that it already exists

            adRemover = new ytModule.YouTubeAdRemover();

            expect(createElementSpy).not.toHaveBeenCalled();
        });

        it('should fallback to documentElement if document.head is falsy', () => {
            (global as any).document.head = null;
            const appendChildSpy = (global as any).document.documentElement.appendChild;

            adRemover = new ytModule.YouTubeAdRemover();

            const createElementSpy = global.document.createElement as jest.Mock;
            const styleElement = createElementSpy.mock.results[0].value;
            expect(appendChildSpy).toHaveBeenCalledWith(styleElement);
        });
    });

    describe('Teardown', () => {
        it('should remove the style element when destroyed', () => {
            adRemover = new ytModule.YouTubeAdRemover();
            const styleElement = (global.document.createElement as jest.Mock).mock.results[0].value;
            const removeChildSpy = styleElement.parentNode.removeChild;

            adRemover.destroy();

            expect(removeChildSpy).toHaveBeenCalledWith(styleElement);
            expect(adRemover.styleElement).toBeNull();
        });

        it('should handle destroy safely when styleElement has no parentNode', () => {
            adRemover = new ytModule.YouTubeAdRemover();
            const styleElement = (global.document.createElement as jest.Mock).mock.results[0].value;
            styleElement.parentNode = null;

            expect(() => adRemover.destroy()).not.toThrow();
        });

        it('should handle multiple destroy calls safely', () => {
            adRemover = new ytModule.YouTubeAdRemover();
            adRemover.destroy();
            expect(() => adRemover.destroy()).not.toThrow();
        });
    });

    describe('initAdRemover', () => {
        it('should instantiate immediately when document.readyState is not loading', () => {
            (global as any).document.readyState = 'interactive';
            const createElementSpy = global.document.createElement as jest.Mock;

            ytModule.initAdRemover();

            expect(createElementSpy).toHaveBeenCalledWith('style');
        });

        it('should listen for DOMContentLoaded when document.readyState is loading and instantiate when event fires', () => {
            (global as any).document.readyState = 'loading';
            let eventHandler: (() => void) | undefined;
            (global as any).document.addEventListener.mockImplementation(
                (event: string, handler: () => void) => {
                    if (event === 'DOMContentLoaded') {
                        eventHandler = handler;
                    }
                }
            );

            ytModule.initAdRemover();

            expect(global.document.addEventListener).toHaveBeenCalledWith(
                'DOMContentLoaded',
                expect.any(Function)
            );
            expect(global.document.createElement).not.toHaveBeenCalled();

            expect(eventHandler).toBeDefined();
            eventHandler!();

            expect(global.document.createElement).toHaveBeenCalledWith('style');
        });
    });
});
