"use strict";
(function () {
    'use strict';
    const episodesData = [];
    const episodeListContainers = document.querySelectorAll(".list-group");
    episodeListContainers.forEach((season) => {
        const episodes = season.querySelectorAll(".list-group-item");
        episodes.forEach((ep) => {
            const heading = ep.querySelector(".list-group-item-heading");
            if (!heading)
                return;
            const epLabelElement = heading.querySelector(".episode-label");
            const epLabel = epLabelElement?.textContent?.trim() || "";
            const matches = epLabel.match(/\d+/g) || [];
            const titleLink = heading.querySelector("a");
            const epTitle = titleLink?.textContent?.trim() || "";
            const itemTextElement = ep.querySelector(".list-group-item-text");
            const itemText = itemTextElement?.textContent?.trim() || "";
            let itemDate = "";
            const listInline = ep.querySelectorAll(".list-inline");
            listInline.forEach((listItem) => {
                const dateText = listItem.textContent
                    ?.replace(/ABC|CBS|FOX|NBC|PBS|History|H2|\(US\)|A&E/gi, "")
                    .trim() || "";
                try {
                    const date = new Date(dateText);
                    if (!isNaN(date.getTime())) {
                        itemDate = date.toISOString().split("T")[0];
                    }
                }
                catch (e) {
                    console.error("Error parsing date:", e);
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
    console.log(JSON.stringify(episodesData, null, 2));
})();
//# sourceMappingURL=tvdbScraper.js.map