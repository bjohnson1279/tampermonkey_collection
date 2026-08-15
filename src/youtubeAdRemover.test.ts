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
            getElementsByClassName: jest.fn().mockReturnValue([]),
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
            expect(global.document.getElementsByClassName).toHaveBeenCalledWith(
                'ytd-ad-slot-renderer'
            );
        });

        describe('Fallback Querying', () => {
            it('should query ad items and process them when no addedNodes are provided', () => {
                const contents = { id: 'contents' };
                (global.document.querySelector as jest.Mock).mockReturnValue(contents);

                (global as any).MutationObserver = class {
                    observe = jest.fn();
                    disconnect = jest.fn();
                };

                const mockContentDiv1 = {
                    remove: jest.fn(),
                    contains: jest.fn().mockReturnValue(true),
                };

                const mockVideoItem1 = {
                    remove: jest.fn(),
                    querySelector: jest.fn().mockImplementation((selector) => {
                        if (selector === '#content, #dismissible') return mockContentDiv1;
                        return null;
                    }),
                };

                const mockAdItem1 = {
                    remove: jest.fn(),
                    closest: jest.fn().mockImplementation((selector) => {
                        if (selector === 'ytd-rich-item-renderer, ytd-video-renderer')
                            return mockVideoItem1;
                        return null;
                    }),
                };

                (global.document.getElementsByClassName as jest.Mock).mockReturnValue([
                    mockAdItem1,
                ]);

                adRemover = new ytModule.YouTubeAdRemover();
                // initialize triggers removeAds() internally

                expect(global.document.getElementsByClassName).toHaveBeenCalledWith(
                    'ytd-ad-slot-renderer'
                );

                expect(mockAdItem1.remove).not.toHaveBeenCalled();
                expect(mockContentDiv1.remove).not.toHaveBeenCalled();
                expect(mockVideoItem1.remove).toHaveBeenCalled();
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
                    contains: jest.fn().mockReturnValue(true),
                };

                const mockVideoNode = {
                    nodeType: (global as any).Node.ELEMENT_NODE,
                    matches: jest.fn().mockReturnValue(true),
                    getElementsByClassName: jest.fn().mockImplementation((className) => {
                        if (className === 'ytd-ad-slot-renderer') return [mockAdItem];
                        return [];
                    }),
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
                expect(mockVideoNode.getElementsByClassName).toHaveBeenCalledWith(
                    'ytd-ad-slot-renderer'
                );
                expect(mockAdItem.remove).not.toHaveBeenCalled();
                expect(mockContentDiv.remove).not.toHaveBeenCalled();
                expect(mockVideoNode.remove).toHaveBeenCalled();
            });

            it('should process children of addedNodes if they are elements (bolt fast path)', () => {
                const mockContentDiv = {
                    remove: jest.fn(),
                    contains: jest.fn().mockReturnValue(true),
                };

                const mockVideoItem = {
                    remove: jest.fn(),
                };

                const mockAdItem = {
                    remove: jest.fn(),
                    closest: jest.fn().mockImplementation((selector) => {
                        if (selector === 'ytd-rich-item-renderer, ytd-video-renderer')
                            return mockVideoItem;
                        return null;
                    }),
                };

                const mockContainerNode = {
                    nodeType: (global as any).Node.ELEMENT_NODE,
                    matches: jest.fn().mockReturnValue(false),
                    firstElementChild: true, // Simulate having children
                    getElementsByClassName: jest.fn().mockReturnValue([mockAdItem]),
                };

                const mockTextNode = {
                    nodeType: (global as any).Node.TEXT_NODE,
                };

                const mockEmptyContainer = {
                    nodeType: (global as any).Node.ELEMENT_NODE,
                    matches: jest.fn().mockReturnValue(false),
                    firstElementChild: null, // Simulate no children
                    getElementsByClassName: jest.fn(),
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

                // Container with children should trigger getElementsByClassName
                expect(mockContainerNode.getElementsByClassName).toHaveBeenCalledWith(
                    'ytd-ad-slot-renderer'
                );
                expect(mockAdItem.remove).not.toHaveBeenCalled();
                expect(mockContentDiv.remove).not.toHaveBeenCalled();
                expect(mockVideoItem.remove).toHaveBeenCalled();

                // Text node is ignored
                // Empty container avoids parsing call (bolt path)
                expect(mockEmptyContainer.getElementsByClassName).not.toHaveBeenCalled();
            });
        });
    });
});
