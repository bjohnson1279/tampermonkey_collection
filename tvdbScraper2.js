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

(function() {
    'use strict';

    const episodesData = [];
    const episodeListContainers = document.querySelectorAll(".list-group");

    episodeListContainers.forEach(season => {
        const episodes = season.querySelectorAll(".list-group-item");
        episodes.forEach(ep => {
            const heading = ep.querySelector(".list-group-item-heading");
            const epLabel = heading.querySelector(".episode-label").innerText;
            const matches = epLabel.match(/\d+/g) || [];
            const epTitle = heading.querySelector("a").innerText || "";
            const itemText = ep.querySelector(".list-group-item-text")?.innerText || "";

            let itemDate = "";
            const listInline = ep.querySelectorAll(".list-inline");

            listInline.forEach(listItem => {
                let dateText = listItem.innerText.replace(/ABC|CBS|FOX|NBC|PBS|History|H2|\(US\)|A&E/gi, "").trim();
                try {
                    itemDate = new Date(dateText).toISOString().split("T")[0];
                } catch (e) {
                    itemDate = "";
                }
            });

            const episode = {
                season: matches[0] || "",
                episode: matches[1] || "",
                title: epTitle,
                release: itemDate,
                description: itemText
            };

            episodesData.push(episode);
        });
    });

    console.log(episodesData);
})();