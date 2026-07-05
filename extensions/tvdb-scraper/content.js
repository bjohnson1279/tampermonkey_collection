"use strict";
(function () {
    'use strict';
    const episodesData = [];
    const episodeListContainers = document.querySelectorAll('.list-group');
    episodeListContainers.forEach((season) => {
        const episodes = season.querySelectorAll('.list-group-item');
        episodes.forEach((ep) => {
            const heading = ep.querySelector('.list-group-item-heading');
            if (!heading)
                return;
            const epLabelElement = heading.querySelector('.episode-label');
            const epLabel = epLabelElement?.textContent?.trim() || '';
            const matches = epLabel.match(/\d+/g) || [];
            const titleLink = heading.querySelector('a');
            const epTitle = titleLink?.textContent?.trim() || '';
            const itemTextElement = ep.querySelector('.list-group-item-text');
            const itemText = itemTextElement?.textContent?.trim() || '';
            let itemDate = '';
            const listInline = ep.querySelectorAll('.list-inline');
            listInline.forEach((listItem) => {
                const dateText = listItem.textContent
                    ?.replace(/ABC|CBS|FOX|NBC|PBS|History|H2|\(US\)|A&E/gi, '')
                    .trim() || '';
                try {
                    const date = new Date(dateText);
                    if (!isNaN(date.getTime())) {
                        itemDate = date.toISOString().split('T')[0];
                    }
                }
                catch (e) {
                    console.error('Error parsing date:', e);
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
            #tvdb-copy-json-btn { position: fixed; bottom: 24px; right: 24px; z-index: 9999; background: #007bff; color: white; border: none; border-radius: 8px; padding: 12px 20px; font: 600 14px system-ui, sans-serif; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: all 0.2s; }
            #tvdb-copy-json-btn:hover { opacity: 0.9; }
            #tvdb-copy-json-btn:focus-visible { outline: 3px solid #0056b3; outline-offset: 2px; }
            #tvdb-copy-json-btn:active { transform: scale(0.95); }
        `;
        document.head.appendChild(style);
        const btn = document.createElement('button');
        btn.id = 'tvdb-copy-json-btn';
        btn.textContent = '📋 Copy JSON';
        btn.setAttribute('aria-label', 'Copy episodes data to clipboard');
        const announcer = document.createElement('div');
        announcer.setAttribute('aria-live', 'polite');
        announcer.style.cssText =
            'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);border:0;';
        btn.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(JSON.stringify(episodesData, null, 2));
                btn.textContent = '✅ Copied!';
                btn.style.background = '#28a745';
                announcer.textContent = 'Copied to clipboard';
            }
            catch (err) {
                btn.textContent = '❌ Error';
                btn.style.background = '#dc3545';
                announcer.textContent = 'Failed to copy';
            }
            setTimeout(() => {
                btn.textContent = '📋 Copy JSON';
                btn.style.background = '#007bff';
                announcer.textContent = '';
            }, 2000);
        });
        document.body.append(announcer, btn);
    }
    return episodesData;
})();
//# sourceMappingURL=tvdbScraper.js.map