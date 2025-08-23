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

interface Episode {
    season: string;
    episode: string;
    title: string;
    release: string;
    description: string;
}

(function (): void {
    'use strict';

    const episodesData: Episode[] = [];
    const episodeListContainers = document.querySelectorAll<HTMLElement>(".list-group");

    episodeListContainers.forEach((season: HTMLElement): void => {
        const episodes = season.querySelectorAll<HTMLElement>(".list-group-item");
        
        episodes.forEach((ep: HTMLElement): void => {
            const heading = ep.querySelector<HTMLElement>(".list-group-item-heading");
            if (!heading) return;

            const epLabelElement = heading.querySelector<HTMLElement>(".episode-label");
            const epLabel = epLabelElement?.textContent?.trim() || "";
            const matches = epLabel.match(/\d+/g) || [];
            
            const titleLink = heading.querySelector<HTMLAnchorElement>("a");
            const epTitle = titleLink?.textContent?.trim() || "";
            
            const itemTextElement = ep.querySelector<HTMLElement>(".list-group-item-text");
            const itemText = itemTextElement?.textContent?.trim() || "";

            let itemDate = "";
            const listInline = ep.querySelectorAll<HTMLElement>(".list-inline");

            listInline.forEach((listItem: HTMLElement): void => {
                const dateText = listItem.textContent
                    ?.replace(/ABC|CBS|FOX|NBC|PBS|History|H2|\(US\)|A&E/gi, "")
                    .trim() || "";
                
                try {
                    const date = new Date(dateText);
                    if (!isNaN(date.getTime())) {
                        itemDate = date.toISOString().split("T")[0];
                    }
                } catch (e) {
                    console.error("Error parsing date:", e);
                }
            });

            const episode: Episode = {
                season: matches[0] || "",
                episode: matches[1] || "",
                title: epTitle,
                release: itemDate,
                description: itemText
            };

            episodesData.push(episode);
        });
    });

    console.log(JSON.stringify(episodesData, null, 2));
})();
