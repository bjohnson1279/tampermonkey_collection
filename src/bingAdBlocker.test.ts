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

    it('should not remove .tobitem elements if they do not contain .b_adSlug', () => {
        document.body.innerHTML = `
            <div class="tob_calcontainer">
                <div class="tobitem" id="item1">
                    <div class="content">Valid Content</div>
                </div>
                <div class="tobitem" id="item2">
                    <div class="content">Another Valid Content</div>
                </div>
            </div>
        `;

        require('./bingAdBlocker');

        const items = document.querySelectorAll('.tobitem');
        expect(items.length).toBe(2);
        expect(document.getElementById('item1')).not.toBeNull();
        expect(document.getElementById('item2')).not.toBeNull();
    });

    it('should remove .tobitem elements that contain .b_adSlug', () => {
        document.body.innerHTML = `
            <div class="tob_calcontainer">
                <div class="tobitem" id="item1">
                    <div class="content">Valid Content</div>
                </div>
                <div class="tobitem" id="item2">
                    <div class="b_adSlug">Ad Content</div>
                </div>
                <div class="tobitem" id="item3">
                    <div class="b_adSlug">Another Ad</div>
                </div>
                <div class="tobitem" id="item4">
                    <div class="content">Valid Content 2</div>
                </div>
            </div>
        `;

        require('./bingAdBlocker');

        const items = document.querySelectorAll('.tobitem');
        expect(items.length).toBe(2);
        expect(document.getElementById('item1')).not.toBeNull();
        expect(document.getElementById('item2')).toBeNull();
        expect(document.getElementById('item3')).toBeNull();
        expect(document.getElementById('item4')).not.toBeNull();
    });
});
