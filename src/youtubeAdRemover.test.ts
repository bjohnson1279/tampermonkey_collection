// We use require to avoid TS module import errors and conflicts
const ytModule = require('./youtubeAdRemover');

describe('YouTubeAdRemover', () => {
    let adRemover: any;

    beforeEach(() => {
        // Mock global window and document since jest environment is "node"
        (global as any).window = {
            setTimeout: jest.fn(),
        };

        const documentMock = {
            readyState: 'complete',
            addEventListener: jest.fn(),
            querySelector: jest.fn(),
            querySelectorAll: jest.fn().mockReturnValue([]),
            createElement: jest.fn().mockImplementation((tag) => ({ tag, appendChild: jest.fn() })),
            body: {
                innerHTML: '',
                appendChild: jest.fn(),
            },
        };
        (global as any).document = documentMock;

        jest.clearAllMocks();

        // Setup global DOM API mocks
        (global as any).Node = {
            ELEMENT_NODE: 1,
            TEXT_NODE: 3,
        };

        // Mock window.setTimeout to execute synchronously
        (global.window as any).setTimeout.mockImplementation((callback: Function) => {
            callback();
            return 1 as any;
        });

        // Mock console.error
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        if (adRemover) {
            adRemover.destroy();
        }
        jest.restoreAllMocks();
        delete (global as any).window;
        delete (global as any).document;
        delete (global as any).MutationObserver;
    });

    describe('Initialization and Teardown', () => {
        it('should log error and abort gracefully if target node (#contents) is not found', () => {
            (global.document.querySelector as jest.Mock).mockReturnValue(null);

            adRemover = new ytModule.YouTubeAdRemover();
            expect(console.error).toHaveBeenCalledWith('Could not find the target node: #contents');
            expect((adRemover as any).observer).toBeNull();
        });

        it('should start MutationObserver on #contents and perform initial check when initialized', () => {
            const contents = { id: 'contents' };
            (global.document.querySelector as jest.Mock).mockReturnValue(contents);

            const observeSpy = jest.fn();
            (global as any).MutationObserver = class {
                observe = observeSpy;
                disconnect = jest.fn();
            };

            adRemover = new ytModule.YouTubeAdRemover();

            expect(observeSpy).toHaveBeenCalledWith(contents, {
                attributes: false,
                childList: true,
                subtree: true,
            });
            // verify initial check is called
            expect(global.document.querySelectorAll).toHaveBeenCalledWith(
                'ytd-rich-item-renderer, ytd-video-renderer'
            );
        });

        describe('Fallback Querying', () => {
            it('should query video items and process them when no addedNodes are provided', () => {
                const contents = { id: 'contents' };
                (global.document.querySelector as jest.Mock).mockReturnValue(contents);

                (global as any).MutationObserver = class {
                    observe = jest.fn();
                    disconnect = jest.fn();
                };

                const mockAdItem = { remove: jest.fn() };
                const mockContentDiv = {
                    remove: jest.fn(),
                    querySelector: jest.fn().mockImplementation((selector) => {
                        if (selector === '.ytd-ad-slot-renderer') return mockAdItem;
                        return null;
                    }),
                };

                const mockVideoItem1 = {
                    remove: jest.fn(),
                    querySelector: jest.fn().mockImplementation((selector) => {
                        if (selector === '#content, #dismissible') return mockContentDiv;
                        return null;
                    }),
                };

                const mockVideoItem2 = {
                    remove: jest.fn(),
                    querySelector: jest.fn().mockImplementation((selector) => {
                        if (selector === '#content, #dismissible') return null; // No content div
                        return null;
                    }),
                };

                (global.document.querySelectorAll as jest.Mock).mockReturnValue([
                    mockVideoItem1,
                    mockVideoItem2,
                ]);

                adRemover = new ytModule.YouTubeAdRemover();
                // initialize triggers removeAds() internally

                expect(global.document.querySelectorAll).toHaveBeenCalledWith(
                    'ytd-rich-item-renderer, ytd-video-renderer'
                );

                // Verify processVideoItem logic on item 1 (has ad)
                expect(mockVideoItem1.querySelector).toHaveBeenCalledWith('#content, #dismissible');
                expect(mockContentDiv.querySelector).toHaveBeenCalledWith('.ytd-ad-slot-renderer');
                expect(mockAdItem.remove).toHaveBeenCalled();
                expect(mockContentDiv.remove).toHaveBeenCalled();
                expect(mockVideoItem1.remove).toHaveBeenCalled();

                // Verify processVideoItem logic on item 2 (no content div)
                expect(mockVideoItem2.querySelector).toHaveBeenCalledWith('#content, #dismissible');
                expect(mockVideoItem2.remove).not.toHaveBeenCalled();
            });
        });

        describe('AddedNodes Processing', () => {
            let observeCallback: MutationCallback;

            beforeEach(() => {
                const contents = { id: 'contents' };
                (global.document.querySelector as jest.Mock).mockReturnValue(contents);

                (global as any).MutationObserver = class {
                    observe = jest.fn();
                    disconnect = jest.fn();
                    constructor(callback: MutationCallback) {
                        observeCallback = callback;
                    }
                };
                adRemover = new ytModule.YouTubeAdRemover();
            });

            it('should process addedNodes that match the video renderer selectors directly', () => {
                const mockAdItem = { remove: jest.fn() };
                const mockContentDiv = {
                    remove: jest.fn(),
                    querySelector: jest.fn().mockImplementation((selector) => {
                        if (selector === '.ytd-ad-slot-renderer') return mockAdItem;
                        return null;
                    }),
                };

                const mockVideoNode = {
                    nodeType: (global as any).Node.ELEMENT_NODE,
                    matches: jest.fn().mockReturnValue(true),
                    querySelector: jest.fn().mockReturnValue(mockContentDiv),
                    remove: jest.fn(),
                };

                // Trigger mutation
                observeCallback(
                    [{ type: 'childList', addedNodes: [mockVideoNode as any] }] as any,
                    {} as any
                );

                expect(mockVideoNode.matches).toHaveBeenCalledWith(
                    'ytd-rich-item-renderer, ytd-video-renderer'
                );
                expect(mockVideoNode.querySelector).toHaveBeenCalledWith('#content, #dismissible');
                expect(mockAdItem.remove).toHaveBeenCalled();
                expect(mockContentDiv.remove).toHaveBeenCalled();
                expect(mockVideoNode.remove).toHaveBeenCalled();
            });

            it('should process children of addedNodes if they are elements (bolt fast path)', () => {
                const mockAdItem = { remove: jest.fn() };
                const mockContentDiv = {
                    remove: jest.fn(),
                    querySelector: jest.fn().mockImplementation((selector) => {
                        if (selector === '.ytd-ad-slot-renderer') return mockAdItem;
                        return null;
                    }),
                };

                const mockChildVideo = {
                    querySelector: jest.fn().mockReturnValue(mockContentDiv),
                    remove: jest.fn(),
                };

                const mockContainerNode = {
                    nodeType: (global as any).Node.ELEMENT_NODE,
                    matches: jest.fn().mockReturnValue(false),
                    firstElementChild: true, // Simulate having children
                    querySelectorAll: jest.fn().mockReturnValue([mockChildVideo]),
                };

                const mockTextNode = {
                    nodeType: (global as any).Node.TEXT_NODE,
                };

                const mockEmptyContainer = {
                    nodeType: (global as any).Node.ELEMENT_NODE,
                    matches: jest.fn().mockReturnValue(false),
                    firstElementChild: null, // Simulate no children
                    querySelectorAll: jest.fn(),
                };

                // Trigger mutation
                observeCallback(
                    [
                        {
                            type: 'childList',
                            addedNodes: [
                                mockContainerNode,
                                mockTextNode,
                                mockEmptyContainer,
                            ] as any,
                        },
                    ] as any,
                    {} as any
                );

                // Container with children should trigger querySelectorAll
                expect(mockContainerNode.querySelectorAll).toHaveBeenCalledWith(
                    'ytd-rich-item-renderer, ytd-video-renderer'
                );
                expect(mockChildVideo.querySelector).toHaveBeenCalledWith('#content, #dismissible');
                expect(mockChildVideo.remove).toHaveBeenCalled();

                // Text node is ignored
                // Empty container avoids querySelectorAll call (bolt path)
                expect(mockEmptyContainer.querySelectorAll).not.toHaveBeenCalled();
            });
        });
    });
});
