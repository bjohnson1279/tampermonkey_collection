// ==UserScript==
// @name         TVDB Scraper
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Parses HTML data on TVDB's All Seasons page into a JSON string output by the console
// @author       Brent Johnson
// @match        https://thetvdb.com/series/*/allseasons/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=thetvdb.com
// @grant        none
// ==/UserScript==

export interface Episode {
    season: string;
    episode: string;
    title: string;
    release: string;
    description: string;
}

export function scrapeTVDBData(): Episode[] {
    'use strict';

    const episodesData: Episode[] = [];
    // ⚡ Bolt: Replace O(N) independent DOM traversals inside the container loop with a single O(1) pass
    // using a descendant CSS selector to significantly reduce main thread parsing overhead.
    const episodes = document.querySelectorAll<HTMLElement>('.list-group .list-group-item');

    episodes.forEach((ep: HTMLElement): void => {
        const heading = ep.querySelector<HTMLElement>('.list-group-item-heading');
        if (!heading) return;

        const epLabelElement = heading.querySelector<HTMLElement>('.episode-label');
        const epLabel = epLabelElement?.textContent?.trim() || '';
        const matches = epLabel.match(/\d+/g) || [];

        const titleLink = heading.querySelector<HTMLAnchorElement>('a');
        const epTitle = titleLink?.textContent?.trim() || '';

        const itemTextElement = ep.querySelector<HTMLElement>('.list-group-item-text');
        const itemText = itemTextElement?.textContent?.trim() || '';

        let itemDate = '';
        const listInline = ep.querySelectorAll<HTMLElement>('.list-inline');

        listInline.forEach((listItem: HTMLElement): void => {
            const dateText =
                listItem.textContent
                    ?.replace(/ABC|CBS|FOX|NBC|PBS|History|H2|\(US\)|A&E/gi, '')
                    .trim() || '';

            try {
                const date = new Date(dateText);
                if (!isNaN(date.getTime())) {
                    itemDate = date.toISOString().split('T')[0];
                }
            } catch (e) {
                console.error('Error parsing date:', e);
            }
        });

        const episode: Episode = {
            season: matches[0] || '',
            episode: matches[1] || '',
            title: epTitle,
            release: itemDate,
            description: itemText,
        };

        episodesData.push(episode);
    });

    if (!document.getElementById('tvdb-copy-json-btn')) {
        const style = document.createElement('style');
        style.textContent = `
            #tvdb-copy-json-btn { outline: none; position: fixed; bottom: 24px; right: 24px; z-index: 9999; background: #0056b3; color: white; border: none; border-radius: 8px; padding: 12px 20px; font: 600 14px system-ui, sans-serif; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: all 0.2s; }
            #tvdb-copy-json-btn:hover:not([aria-disabled="true"]) { opacity: 0.9; }
            #tvdb-copy-json-btn:focus-visible { outline: 3px solid #0056b3; outline-offset: 2px; }
            #tvdb-copy-json-btn:not([aria-disabled="true"]):active { transform: scale(0.95); }
            #tvdb-copy-json-btn[aria-disabled="true"]:not([data-feedback="true"]) { cursor: not-allowed; opacity: 0.7; }
            #tvdb-copy-json-btn[data-feedback="true"] { cursor: default; }
        `;
        document.head.appendChild(style);

        const btn = document.createElement('button');
        btn.id = 'tvdb-copy-json-btn';

        const hasData = episodesData.length > 0;
        btn.textContent = hasData
            ? `📋 Copy JSON (${episodesData.length} episode${episodesData.length === 1 ? '' : 's'})`
            : '📋 No Data';
        if (!hasData) btn.setAttribute('aria-disabled', 'true');
        btn.setAttribute(
            'aria-label',
            hasData ? 'Copy episodes data to clipboard' : 'No episodes data found'
        );
        btn.setAttribute(
            'title',
            hasData ? 'Copy JSON to clipboard (Shift+C)' : 'No episodes found to copy'
        );
        if (hasData) {
            btn.setAttribute('aria-keyshortcuts', 'Shift+C');
        }

        const announcer = document.createElement('div');
        announcer.setAttribute('aria-live', 'polite');
        announcer.style.cssText =
            'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);border:0;';

        let timeoutId: number;

        btn.addEventListener('click', async () => {
            if (btn.getAttribute('aria-disabled') === 'true') return;
            clearTimeout(timeoutId);
            btn.setAttribute('aria-disabled', 'true');
            btn.setAttribute('data-feedback', 'true');

            btn.textContent = '⏳ Copying...';
            btn.setAttribute('title', 'Copying to clipboard...');
            btn.setAttribute('aria-label', 'Copying to clipboard...');
            announcer.textContent = 'Copying to clipboard...';

            try {
                await navigator.clipboard.writeText(JSON.stringify(episodesData, null, 2));
                btn.textContent = '✅ Copied!';
                btn.style.backgroundColor = '#146c43';
                btn.setAttribute('title', 'Successfully copied');
                btn.setAttribute('aria-label', 'Successfully copied');
                announcer.textContent = 'Copied to clipboard';
            } catch {
                btn.textContent = '❌ Error';
                btn.style.backgroundColor = '#b02a37';
                btn.setAttribute('title', 'Failed to copy');
                btn.setAttribute('aria-label', 'Failed to copy');
                announcer.textContent = 'Failed to copy';
            }
            timeoutId = window.setTimeout(() => {
                btn.textContent = `📋 Copy JSON (${episodesData.length} episode${episodesData.length === 1 ? '' : 's'})`;
                btn.style.backgroundColor = '#0056b3';
                btn.setAttribute('title', 'Copy JSON to clipboard (Shift+C)');
                btn.setAttribute('aria-label', 'Copy episodes data to clipboard');
                btn.removeAttribute('data-feedback');
                announcer.textContent = '';
                btn.removeAttribute('aria-disabled');
            }, 2000);
        });

        document.body.append(announcer, btn);

        document.addEventListener('keydown', (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            const isInput =
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.isContentEditable;

            if (!isInput && e.shiftKey && e.key.toLowerCase() === 'c') {
                btn.click();
            }
        });
    }

    return episodesData;
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    scrapeTVDBData();
}
