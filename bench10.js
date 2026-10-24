const dom = {
    length: 1,
    elements: [{
        duration: 100,
        currentTime: 0
    }]
};
const adShowingElements = { length: 1 };
const skipBtnElements = { length: 1, 0: { click: () => {} } };

function skipVideoAdsOld() {
    const video = dom.elements[0];
    if (!video) return;

    if (adShowingElements.length > 0) {
        if (Number.isFinite(video.duration)) {
            video.currentTime = video.duration;
        }
    }

    const skipBtn = skipBtnElements[0];
    if (skipBtn) skipBtn.click();
}

function skipVideoAdsNew() {
    const isAdShowing = adShowingElements.length > 0;
    const skipBtn = skipBtnElements[0];

    // ⚡ Bolt: Fast-path early return to avoid processing when no ad is showing
    if (!isAdShowing && !skipBtn) return;

    if (isAdShowing) {
        const video = dom.elements[0];
        if (video && Number.isFinite(video.duration)) {
            video.currentTime = video.duration;
        }
    }

    if (skipBtn) skipBtn.click();
}

console.time('old');
for(let i=0; i<1000000; i++) {
    skipVideoAdsOld();
}
console.timeEnd('old');

console.time('new');
for(let i=0; i<1000000; i++) {
    skipVideoAdsNew();
}
console.timeEnd('new');
