describe('billboardOverlay', () => {
    let originalDocument: any;
    let consoleErrorSpy: jest.SpyInstance;

    let originalNode: any;

    beforeEach(() => {
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        originalDocument = (global as any).document;
        originalNode = (global as any).Node;
        (global as any).Node = class Node {};
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
        jest.resetModules();
        (global as any).document = originalDocument;
        (global as any).Node = originalNode;
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
            getElementsByClassName: jest.fn().mockReturnValue([]),
        };

        require('./billboardOverlay');

        expect(global.document.createElement).toHaveBeenCalledWith('style');
        expect(styleMock.textContent).toBe(
            '.ad-container, .ad-holder, .ad_desktop_placeholder, .ad_desktop_wrapper, .ad_desktop, .ad_clarity { display: none !important; }'
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
            getElementsByClassName: jest.fn().mockReturnValue([]),
        };

        require('./billboardOverlay');

        expect(docElemMock.appendChild).toHaveBeenCalledWith(styleMock);
    });

    it('should return early when chartOverlay is not found', () => {
        const observeMock = jest.fn();
        (global as any).MutationObserver = jest.fn().mockImplementation(() => ({
            observe: observeMock,
        }));

        (global as any).document = {
            createElement: jest.fn().mockReturnValue({}),
            head: { appendChild: jest.fn() },
            getElementsByClassName: jest.fn().mockReturnValue([]),
        };

        require('./billboardOverlay');

        expect(global.MutationObserver).not.toHaveBeenCalled();
    });

    it('should setup MutationObserver and process mutation callbacks and chart items', () => {
        let mutationCallback: any;
        const observeMock = jest.fn();
        (global as any).MutationObserver = jest.fn().mockImplementation((cb) => {
            mutationCallback = cb;
            return { observe: observeMock };
        });

        const overlayMock = { id: 'overlay' };
        const mockTargetNode = Object.create(Node.prototype);
        mockTargetNode.remove = jest.fn();
        const mockChartItem = {
            visible: false,
            height: 0,
            classList: {
                remove: jest.fn(),
            },
        };

        const getElementsByClassNameSpy = jest.fn().mockImplementation((className) => {
            if (className === 'chart-piano-overlay__attachment-point') return [overlayMock];
            if (className === 'chart-list-item') return [mockChartItem];
            return [];
        });

        (global as any).document = {
            createElement: jest.fn().mockReturnValue({}),
            head: { appendChild: jest.fn() },
            getElementsByClassName: getElementsByClassNameSpy,
        };

        require('./billboardOverlay');

        expect(global.MutationObserver).toHaveBeenCalled();
        expect(observeMock).toHaveBeenCalledWith(overlayMock, {
            attributes: false,
            childList: true,
            subtree: true,
        });

        const mutations = [{ target: mockTargetNode }];
        mutationCallback(mutations);

        expect(mockTargetNode.remove).toHaveBeenCalled();
        expect(mockChartItem.visible).toBe(true);
        expect(mockChartItem.height).toBe(102);
        expect(mockChartItem.classList.remove).toHaveBeenCalledWith('hidden');
    });

    it('should handle non-Node targets gracefully in mutation callback', () => {
        let mutationCallback: any;
        (global as any).MutationObserver = jest.fn().mockImplementation((cb) => {
            mutationCallback = cb;
            return { observe: jest.fn() };
        });

        (global as any).document = {
            createElement: jest.fn().mockReturnValue({}),
            head: { appendChild: jest.fn() },
            getElementsByClassName: jest.fn().mockImplementation((className) => {
                if (className === 'chart-piano-overlay__attachment-point') return [{}];
                return [];
            }),
        };

        require('./billboardOverlay');

        const mutations = [{ target: 'not a node' }];
        expect(() => mutationCallback(mutations)).not.toThrow();
    });

    it('should catch and log errors during MutationObserver initialization', () => {
        (global as any).MutationObserver = jest.fn().mockImplementation(() => {
            throw new Error('Observer error');
        });

        (global as any).document = {
            createElement: jest.fn().mockReturnValue({}),
            head: { appendChild: jest.fn() },
            getElementsByClassName: jest.fn().mockReturnValue([{}]),
        };

        require('./billboardOverlay');

        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Error initializing Billboard overlay observer:',
            'Observer error'
        );
    });
});
