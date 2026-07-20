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

// ⚡ Bolt: Hoist static RegExp objects outside the loop to prevent repeated allocation and garbage collection overhead
const EPISODE_NUM_REGEX = /\d+/g;
const NETWORK_CLEANUP_REGEX = /ABC|CBS|FOX|NBC|PBS|History|H2|\(US\)|A&E/gi;

function scrapeTVDBData() {
    'use strict';

    const episodesData = [];
    const episodeListContainers = document.querySelectorAll('.list-group');

    episodeListContainers.forEach((season) => {
        const episodes = season.querySelectorAll('.list-group-item');
        episodes.forEach((ep) => {
            const heading = ep.querySelector('.list-group-item-heading');
            const epLabel = heading.querySelector('.episode-label').innerText;
            const matches = epLabel.match(EPISODE_NUM_REGEX) || [];
            const epTitle = heading.querySelector('a').innerText || '';
            const itemText = ep.querySelector('.list-group-item-text')?.innerText || '';

            let itemDate = '';
            const listInline = ep.querySelectorAll('.list-inline');

            listInline.forEach((listItem) => {
                let dateText = listItem.innerText.replace(NETWORK_CLEANUP_REGEX, '').trim();
                try {
                    itemDate = new Date(dateText).toISOString().split('T')[0];
                } catch {
                    itemDate = '';
                }
            });

            const episode = {
                season: matches[0] || '',
                episode: matches[1] || '',
                title: epTitle,
                release: itemDate,
                description: itemText,
            };

            episodesData.push(episode);
        });
    });

    if (!document.getElementById('tvdb-copy-json-btn')) {
        const style = document.createElement('style');
        style.textContent = `
            #tvdb-copy-json-btn { outline: none; position: fixed; bottom: 24px; right: 24px; z-index: 9999; background: #007bff; color: white; border: none; border-radius: 8px; padding: 12px 20px; font: 600 14px system-ui, sans-serif; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: all 0.2s; }
            #tvdb-copy-json-btn:hover { opacity: 0.9; }
            #tvdb-copy-json-btn:focus-visible { outline: 3px solid #0056b3; outline-offset: 2px; }
            #tvdb-copy-json-btn:not(:disabled):active { transform: scale(0.95); }
            #tvdb-copy-json-btn:disabled { cursor: not-allowed; opacity: 0.7; }
        `;
        document.head.appendChild(style);

        const btn = document.createElement('button');
        btn.id = 'tvdb-copy-json-btn';
        btn.textContent = '📋 Copy JSON';
        btn.setAttribute('aria-label', 'Copy episodes data to clipboard');
        btn.setAttribute('title', 'Copy JSON to clipboard (Shift+C)');
        btn.setAttribute('aria-keyshortcuts', 'Shift+C');

        const announcer = document.createElement('div');
        announcer.setAttribute('aria-live', 'polite');
        announcer.style.cssText =
            'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);border:0;';

        let timeoutId;

        btn.addEventListener('click', async () => {
            if (btn.disabled) return;
            clearTimeout(timeoutId);
            btn.disabled = true;

            try {
                await navigator.clipboard.writeText(JSON.stringify(episodesData, null, 2));
                btn.textContent = '✅ Copied!';
                btn.style.backgroundColor = '#146c43';
                btn.setAttribute('title', 'Successfully copied');
                announcer.textContent = 'Copied to clipboard';
            } catch {
                btn.textContent = '❌ Error';
                btn.style.backgroundColor = '#b02a37';
                btn.setAttribute('title', 'Failed to copy');
                announcer.textContent = 'Failed to copy';
            }
            timeoutId = setTimeout(() => {
                btn.textContent = '📋 Copy JSON';
                btn.style.backgroundColor = '#007bff';
                btn.setAttribute('title', 'Copy JSON to clipboard');
                announcer.textContent = '';
                btn.disabled = false;
            }, 2000);
        });

        document.body.append(announcer, btn);

        document.addEventListener('keydown', (e) => {
            const target = e.target;
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
