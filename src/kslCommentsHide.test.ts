/**
 * @jest-environment jsdom
 */

describe('KSL Comments Hide', () => {
    let mockObserver: MutationObserver;
    let TestExports: any;

    beforeEach(() => {
        // Clear require cache and global to ensure isolated test runs
        jest.resetModules();
        delete (global as any).__kslTestExports;
        document.body.innerHTML = '';

        // Import module, which attaches exports to global.__kslTestExports
        require('./kslCommentsHide');
        TestExports = (global as any).__kslTestExports;
        TestExports.blockedUsers.clear();
    });

    describe('processComment', () => {
        it('should hide comment from a blocked user', () => {
            const comment = document.createElement('div');
            const usernameEl = document.createElement('div');
            usernameEl.className = 'CommentsList__userName';
            usernameEl.textContent = ' TrollUser ';
            comment.appendChild(usernameEl);

            TestExports.blockedUsers.add('TrollUser');
            TestExports.processComment(comment);

            expect(comment.style.display).toBe('none');
        });

        it('should not hide comment from a non-blocked user', () => {
            const comment = document.createElement('div');
            const usernameEl = document.createElement('div');
            usernameEl.className = 'CommentsList__userName';
            usernameEl.textContent = ' NiceUser ';
            comment.appendChild(usernameEl);

            TestExports.blockedUsers.add('TrollUser');
            TestExports.processComment(comment);

            expect(comment.style.display).not.toBe('none');
        });

        it('should handle comment without username element safely', () => {
            const comment = document.createElement('div');
            expect(() => TestExports.processComment(comment)).not.toThrow();
            expect(comment.style.display).not.toBe('none');
        });
    });

    describe('handleMutations', () => {
        beforeEach(() => {
            mockObserver = {} as MutationObserver;
            TestExports.blockedUsers.add('TrollUser');
        });

        it('should process added node if it is a CommentsList__item', () => {
            const node = document.createElement('div');
            node.className = 'CommentsList__item';
            const usernameEl = document.createElement('div');
            usernameEl.className = 'CommentsList__userName';
            usernameEl.textContent = 'TrollUser';
            node.appendChild(usernameEl);

            const mutationsList: MutationRecord[] = [
                {
                    addedNodes: [node] as unknown as NodeList,
                    type: 'childList',
                    target: document.body,
                    removedNodes: [] as unknown as NodeList,
                    previousSibling: null,
                    nextSibling: null,
                    attributeName: null,
                    attributeNamespace: null,
                    oldValue: null,
                },
            ];

            TestExports.handleMutations(mutationsList, mockObserver);

            expect(node.style.display).toBe('none');
        });

        it('should process nested CommentsList__item elements within an added node', () => {
            const parentNode = document.createElement('div');
            parentNode.className = 'SomeWrapper';

            const nestedComment = document.createElement('div');
            nestedComment.className = 'CommentsList__item';
            const usernameEl = document.createElement('div');
            usernameEl.className = 'CommentsList__userName';
            usernameEl.textContent = 'TrollUser';
            nestedComment.appendChild(usernameEl);

            parentNode.appendChild(nestedComment);

            const mutationsList: MutationRecord[] = [
                {
                    addedNodes: [parentNode] as unknown as NodeList,
                    type: 'childList',
                    target: document.body,
                    removedNodes: [] as unknown as NodeList,
                    previousSibling: null,
                    nextSibling: null,
                    attributeName: null,
                    attributeNamespace: null,
                    oldValue: null,
                },
            ];

            TestExports.handleMutations(mutationsList, mockObserver);

            expect(nestedComment.style.display).toBe('none');
        });

        it('should ignore text nodes safely', () => {
            const textNode = document.createTextNode('Just some text');

            const mutationsList: MutationRecord[] = [
                {
                    addedNodes: [textNode] as unknown as NodeList,
                    type: 'childList',
                    target: document.body,
                    removedNodes: [] as unknown as NodeList,
                    previousSibling: null,
                    nextSibling: null,
                    attributeName: null,
                    attributeNamespace: null,
                    oldValue: null,
                },
            ];

            expect(() => TestExports.handleMutations(mutationsList, mockObserver)).not.toThrow();
        });
    });
});
