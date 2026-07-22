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
        expect(btn?.textContent).toBe('📋 No Data');
        expect(btn?.getAttribute('aria-label')).toBe('No episodes data found');
        expect(btn?.getAttribute('aria-disabled')).toBe('true');
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
        expect(btn?.textContent).toBe('📋 Copy JSON (1 episode)');
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
    it('should restore dynamic aria-label after copy timeout', async () => {
        jest.useFakeTimers();

        // Assign mock to navigator.clipboard.writeText
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
        expect(btn.textContent).toBe('❌ Error');
        expect(btn.style.backgroundColor).toBe('rgb(176, 42, 55)'); // #b02a37
        expect(btn.getAttribute('title')).toBe('Failed to copy');
        expect(announcer.textContent).toBe('Failed to copy');


        // Assert initial dynamic label
        expect(btn?.getAttribute('aria-label')).toBe('Copy 1 episode data to clipboard');


        // We have async logic in our component: `await navigator.clipboard.writeText(...)`
        // We need to wait for microtasks so the `await` resumes, THEN run the timers.
        await Promise.resolve();

        // Fast-forward past the microtask queue and setTimeout
        jest.runAllTimers();

        // Assert label was restored correctly to the dynamic count instead of a static default

        jest.useRealTimers();
        Object.defineProperty(navigator, 'clipboard', {
            value: originalClipboard,
            configurable: true,
    });
});
