const dom = {
    length: 100,
    elements: Array(100).fill().map((_, i) => ({
        textContent: i % 2 === 0 ? 'promoted' : 'normal',
        closest: () => ({ remove: () => {} })
    }))
};

const regex = /promoted/i;
const stringInc = 'promoted';

function testRegex() {
    for (let k = dom.length - 1; k >= 0; k--) {
        const adNode = dom.elements[k];
        if (regex.test(adNode.textContent || '')) {
            const parent = adNode.closest('YTD-VIDEO-RENDERER, YTD-COMPACT-VIDEO-RENDERER');
            if (parent) {
                parent.remove();
            }
        }
    }
}

function testIncludes() {
    for (let k = dom.length - 1; k >= 0; k--) {
        const adNode = dom.elements[k];
        if (adNode.textContent && adNode.textContent.toLowerCase().includes(stringInc)) {
            const parent = adNode.closest('YTD-VIDEO-RENDERER, YTD-COMPACT-VIDEO-RENDERER');
            if (parent) {
                parent.remove();
            }
        }
    }
}

console.time('regex.test');
for(let i=0; i<10000; i++) {
    testRegex();
}
console.timeEnd('regex.test');

console.time('string.includes');
for(let i=0; i<10000; i++) {
    testIncludes();
}
console.timeEnd('string.includes');
