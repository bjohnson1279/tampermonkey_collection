/**
 * @jest-environment jsdom
 */

import { scrapeTVDBData } from './tvdbScraper';

describe('scrapeTVDBData', () => {
    beforeEach(() => {
        // Reset the document body before each test
        document.body.innerHTML = '';
        // Clear mocks
        jest.clearAllMocks();
    });

    it('should extract episode data successfully', () => {
        // Mock TVDB HTML structure
        document.body.innerHTML = `
            <div class="list-group">
                <div class="list-group-item">
                    <div class="list-group-item-heading">
                        <span class="episode-label">S01E01</span>
                        <a href="/some/link">Pilot</a>
                    </div>
                    <div class="list-group-item-text">
                        A great start to the show.
                    </div>
                    <ul class="list-inline">
                        <li>October 1, 2023</li>
                    </ul>
                </div>
                <div class="list-group-item">
                    <div class="list-group-item-heading">
                        <span class="episode-label">S01E02</span>
                        <a href="/some/link2">The Next Step</a>
                    </div>
                    <div class="list-group-item-text">
                        Continuing the journey.
                    </div>
                    <ul class="list-inline">
                        <li>October 8, 2023</li>
                    </ul>
                </div>
            </div>
        `;

        const episodes = scrapeTVDBData();

        expect(episodes).toHaveLength(2);

        expect(episodes[0]).toEqual({
            season: '01',
            episode: '01',
            title: 'Pilot',
            release: '2023-10-01',
            description: 'A great start to the show.',
        });

        expect(episodes[1]).toEqual({
            season: '01',
            episode: '02',
            title: 'The Next Step',
            release: '2023-10-08',
            description: 'Continuing the journey.',
        });
    });

    it('should handle empty list-group containers', () => {
        document.body.innerHTML = '<div class="list-group"></div>';

        const episodes = scrapeTVDBData();

        expect(episodes).toEqual([]);
    });

    it('should handle missing fields gracefully', () => {
        // Mock TVDB HTML structure with missing heading
        document.body.innerHTML = `
            <div class="list-group">
                <div class="list-group-item">
                    <!-- Missing heading -->
                </div>
                <div class="list-group-item">
                    <div class="list-group-item-heading">
                        <!-- Missing episode label and link -->
                    </div>
                </div>
            </div>
        `;

        const episodes = scrapeTVDBData();

        // First item is skipped because heading is missing
        expect(episodes).toHaveLength(1);

        expect(episodes[0]).toEqual({
            season: '',
            episode: '',
            title: '',
            release: '',
            description: '',
        });
    });

    it('should clean up network prefixes from dates', () => {
        document.body.innerHTML = `
            <div class="list-group">
                <div class="list-group-item">
                    <div class="list-group-item-heading">
                        <span class="episode-label">S01E01</span>
                    </div>
                    <ul class="list-inline">
                        <li>ABC October 1, 2023</li>
                    </ul>
                </div>
            </div>
        `;

        const episodes = scrapeTVDBData();
        expect(episodes[0].release).toBe('2023-10-01');
    });

    it('should inject copy JSON button and show empty state when no data', () => {
        document.body.innerHTML = '<div class="list-group"></div>';

        scrapeTVDBData();

        const btn = document.getElementById('tvdb-copy-json-btn') as HTMLButtonElement;
        expect(btn).not.toBeNull();
        expect(btn?.textContent).toContain('📋');
        expect(btn?.textContent).toContain('No Data');
        expect(btn?.getAttribute('aria-label')).toBe('No episodes data found');
        expect(btn?.getAttribute('aria-disabled')).toBe('true');
        expect(btn?.querySelector('kbd')).toBeNull();
        expect(btn?.getAttribute('aria-keyshortcuts')).toBeNull();
    });

    it('should inject copy JSON button with correct state when data exists', () => {
        document.body.innerHTML = `
            <div class="list-group">
                <div class="list-group-item">
                    <div class="list-group-item-heading">
                        <span class="episode-label">S01E01</span>
                        <a href="/some/link">Pilot</a>
                    </div>
                </div>
            </div>
        `;

        scrapeTVDBData();

        const btn = document.getElementById('tvdb-copy-json-btn') as HTMLButtonElement;
        expect(btn).not.toBeNull();
        expect(btn?.textContent).toContain('📋');
        expect(btn?.textContent).toContain('Copy JSON (1 episode)');
        expect(btn?.textContent).toContain('Shift+C');
        expect(btn?.querySelector('kbd')).not.toBeNull();
        expect(btn?.getAttribute('aria-keyshortcuts')).toBe('Shift+C');
        expect(btn?.getAttribute('aria-label')).toBe('Copy 1 episode data to clipboard');
        expect(btn?.getAttribute('aria-disabled')).toBeNull();
    });

    it('should not inject multiple copy JSON buttons', () => {
        document.body.innerHTML = '<div class="list-group"></div>';

        scrapeTVDBData();
        scrapeTVDBData(); // Call again

        const btns = document.querySelectorAll('#tvdb-copy-json-btn');
        expect(btns.length).toBe(1);
    });

    it('should handle clipboard write failure gracefully', async () => {
        document.body.innerHTML = `
            <div class="list-group">
                <div class="list-group-item">
                    <div class="list-group-item-heading">
                        <span class="episode-label">S01E01</span>
                        <a href="/some/link">Pilot</a>
                    </div>
                </div>
            </div>
        `;

        Object.assign(navigator, {
            clipboard: {
                writeText: jest.fn().mockRejectedValue(new Error('Clipboard error')),
            },
        });

        scrapeTVDBData();

        const btn = document.getElementById('tvdb-copy-json-btn') as HTMLButtonElement;
        const announcer = document.querySelector('[aria-live="polite"]') as HTMLDivElement;

        btn.click();
        await new Promise(process.nextTick);

        expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);
        expect(btn.textContent).toContain('❌');
        expect(btn.textContent).toContain('Error');
        expect(btn.style.backgroundColor).toBe('rgb(176, 42, 55)'); // #b02a37
        expect(btn.getAttribute('title')).toBe('Failed to copy');
        expect(announcer.textContent).toBe('Failed to copy');
        expect(announcer.getAttribute('aria-atomic')).toBe('true');
        expect(btn.querySelector('kbd')).toBeNull();
    });

    it('should restore dynamic aria-label after copy timeout', async () => {
        jest.useFakeTimers();

        const originalClipboard = navigator.clipboard;
        Object.defineProperty(navigator, 'clipboard', {
            value: {
                writeText: jest.fn().mockResolvedValue(undefined),
            },
            configurable: true,
        });

        document.body.innerHTML = `
            <div class="list-group">
                <div class="list-group-item">
                    <div class="list-group-item-heading">
                        <span class="episode-label">S01E01</span>
                        <a href="/some/link">Pilot</a>
                    </div>
                </div>
            </div>
        `;

        scrapeTVDBData();
        const btn = document.getElementById('tvdb-copy-json-btn') as HTMLButtonElement;
        expect(btn?.getAttribute('aria-label')).toBe('Copy 1 episode data to clipboard');

        btn.click();
        await Promise.resolve();
        jest.runAllTimers();
        expect(btn?.getAttribute('aria-label')).toBe('Copy 1 episode data to clipboard');

        jest.useRealTimers();
        Object.defineProperty(navigator, 'clipboard', {
            value: originalClipboard,
            configurable: true,
        });
    });

    it('should handle successful copy interaction and update UI accordingly', async () => {
        jest.useFakeTimers();

        const originalClipboard = navigator.clipboard;
        const writeTextMock = jest.fn().mockResolvedValue(undefined);
        Object.defineProperty(navigator, 'clipboard', {
            value: {
                writeText: writeTextMock,
            },
            configurable: true,
        });

        document.body.innerHTML = `
            <div class="list-group">
                <div class="list-group-item">
                    <div class="list-group-item-heading">
                        <span class="episode-label">S01E01</span>
                        <a href="/some/link">Pilot</a>
                    </div>
                </div>
                <div class="list-group-item">
                    <div class="list-group-item-heading">
                        <span class="episode-label">S01E02</span>
                        <a href="/some/link2">Second</a>
                    </div>
                </div>
            </div>
        `;

        scrapeTVDBData();
        const btn = document.getElementById('tvdb-copy-json-btn') as HTMLButtonElement;
        const announcer = document.querySelector('[aria-live="polite"]') as HTMLDivElement;

        expect(btn.textContent).toContain('Copy JSON (2 episodes)');

        btn.click();
        expect(btn.textContent).toContain('Copying...');
        expect(announcer.textContent).toBe('Copying to clipboard...');

        await Promise.resolve();

        expect(writeTextMock).toHaveBeenCalledTimes(1);
        expect(btn.textContent).toContain('✅');
        expect(btn.textContent).toContain('Copied!');
        expect(btn.style.backgroundColor).toBe('rgb(20, 108, 67)'); // #146c43
        expect(btn.getAttribute('title')).toBe('Successfully copied');
        expect(announcer.textContent).toBe('Copied to clipboard');

        jest.advanceTimersByTime(2000);

        expect(btn.textContent).toContain('Copy JSON (2 episodes)');
        expect(btn.style.backgroundColor).toBe('rgb(0, 86, 179)'); // #0056b3
        expect(btn.getAttribute('title')).toBe('Copy JSON to clipboard (Shift+C)');
        expect(btn.getAttribute('aria-keyshortcuts')).toBe('Shift+C');
        expect(announcer.textContent).toBe('');
        expect(btn.getAttribute('aria-disabled')).toBeNull();

        jest.useRealTimers();
        Object.defineProperty(navigator, 'clipboard', {
            value: originalClipboard,
            configurable: true,
        });
    });

    it('should not initiate copy if button has aria-disabled="true"', () => {
        document.body.innerHTML = '<div class="list-group"></div>';

        const writeTextMock = jest.fn();
        Object.assign(navigator, {
            clipboard: {
                writeText: writeTextMock,
            },
        });

        scrapeTVDBData();
        const btn = document.getElementById('tvdb-copy-json-btn') as HTMLButtonElement;
        expect(btn.getAttribute('aria-disabled')).toBe('true');

        btn.click();

        expect(writeTextMock).not.toHaveBeenCalled();
        expect(btn.textContent).toContain('No Data');
    });

    it('should trigger button click via Shift+C keyboard shortcut when not typing in inputs', () => {
        document.body.innerHTML = `
            <div class="list-group">
                <div class="list-group-item">
                    <div class="list-group-item-heading">
                        <span class="episode-label">S01E01</span>
                        <a href="/some/link">Pilot</a>
                    </div>
                </div>
            </div>
        `;

        scrapeTVDBData();
        const btn = document.getElementById('tvdb-copy-json-btn') as HTMLButtonElement;
        const clickSpy = jest.spyOn(btn, 'click');

        // Normal Shift+c
        const eventLower = new KeyboardEvent('keydown', {
            key: 'c',
            shiftKey: true,
            bubbles: true,
            cancelable: true,
        });
        document.dispatchEvent(eventLower);
        expect(clickSpy).toHaveBeenCalledTimes(1);

        // Shift+C uppercase
        const eventUpper = new KeyboardEvent('keydown', {
            key: 'C',
            shiftKey: true,
            bubbles: true,
            cancelable: true,
        });
        document.dispatchEvent(eventUpper);
        expect(clickSpy).toHaveBeenCalledTimes(2);

        // Should ignore if modifiers are pressed
        const ctrlEvent = new KeyboardEvent('keydown', {
            key: 'c',
            shiftKey: true,
            ctrlKey: true,
            bubbles: true,
        });
        document.dispatchEvent(ctrlEvent);
        expect(clickSpy).toHaveBeenCalledTimes(2);

        const metaEvent = new KeyboardEvent('keydown', {
            key: 'c',
            shiftKey: true,
            metaKey: true,
            bubbles: true,
        });
        document.dispatchEvent(metaEvent);
        expect(clickSpy).toHaveBeenCalledTimes(2);

        const altEvent = new KeyboardEvent('keydown', {
            key: 'c',
            shiftKey: true,
            altKey: true,
            bubbles: true,
        });
        document.dispatchEvent(altEvent);
        expect(clickSpy).toHaveBeenCalledTimes(2);

        // Should ignore if different key is pressed
        const otherKeyEvent = new KeyboardEvent('keydown', {
            key: 'x',
            shiftKey: true,
            bubbles: true,
        });
        document.dispatchEvent(otherKeyEvent);
        expect(clickSpy).toHaveBeenCalledTimes(2);
    });

    it('should ignore Shift+C keyboard shortcut when typing inside input, textarea, or contentEditable', () => {
        document.body.innerHTML = `
            <div class="list-group">
                <div class="list-group-item">
                    <div class="list-group-item-heading">
                        <span class="episode-label">S01E01</span>
                        <a href="/some/link">Pilot</a>
                    </div>
                </div>
            </div>
            <input id="test-input" type="text" />
            <textarea id="test-textarea"></textarea>
            <div id="test-editable" contenteditable="true"></div>
        `;

        scrapeTVDBData();
        const btn = document.getElementById('tvdb-copy-json-btn') as HTMLButtonElement;
        const clickSpy = jest.spyOn(btn, 'click');

        const input = document.getElementById('test-input') as HTMLInputElement;
        const textarea = document.getElementById('test-textarea') as HTMLTextAreaElement;
        const editable = document.getElementById('test-editable') as HTMLDivElement;
        // In JSDOM, contentEditable attribute doesn't automatically reflect isContentEditable property
        Object.defineProperty(editable, 'isContentEditable', { value: true, configurable: true });

        input.dispatchEvent(
            new KeyboardEvent('keydown', {
                key: 'c',
                shiftKey: true,
                bubbles: true,
            })
        );
        expect(clickSpy).not.toHaveBeenCalled();

        textarea.dispatchEvent(
            new KeyboardEvent('keydown', {
                key: 'c',
                shiftKey: true,
                bubbles: true,
            })
        );
        expect(clickSpy).not.toHaveBeenCalled();

        editable.dispatchEvent(
            new KeyboardEvent('keydown', {
                key: 'c',
                shiftKey: true,
                bubbles: true,
            })
        );
        expect(clickSpy).not.toHaveBeenCalled();
    });

    it('should handle invalid date string gracefully', () => {
        document.body.innerHTML = `
            <div class="list-group">
                <div class="list-group-item">
                    <div class="list-group-item-heading">
                        <span class="episode-label">S01E01</span>
                    </div>
                    <ul class="list-inline">
                        <li>Invalid Date String</li>
                    </ul>
                </div>
            </div>
        `;

        const episodes = scrapeTVDBData();
        expect(episodes[0].release).toBe('');
    });

    it('should catch and log error if date parsing throws an exception', () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        document.body.innerHTML = `
            <div class="list-group">
                <div class="list-group-item">
                    <div class="list-group-item-heading">
                        <span class="episode-label">S01E01</span>
                    </div>
                    <ul class="list-inline">
                        <li>October 1, 2023</li>
                    </ul>
                </div>
            </div>
        `;

        const originalDate = global.Date;
        // Mock Date constructor to throw
        const mockDate = function (dateString?: string) {
            if (dateString) {
                throw new Error('Date parsing failed');
            }
            return new originalDate();
        } as unknown as DateConstructor;
        mockDate.prototype = originalDate.prototype;
        global.Date = mockDate;

        const episodes = scrapeTVDBData();

        expect(episodes[0].release).toBe('');
        expect(consoleSpy).toHaveBeenCalledWith('Error parsing date:', 'Date parsing failed');

        global.Date = originalDate;
        consoleSpy.mockRestore();
    });
});
