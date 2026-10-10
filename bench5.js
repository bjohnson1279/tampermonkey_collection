const dom = {
    length: 100,
    elements: Array(100).fill().map((_, i) => ({ textContent: i % 2 === 0 ? 'promoted' : 'normal' }))
};
const re = /promoted/i;
const stringInc = 'promoted';

console.time('regex.test');
for(let i=0; i<100000; i++) {
    for(let j=0; j<dom.length; j++) {
        const t = dom.elements[j].textContent;
        re.test(t);
    }
}
console.timeEnd('regex.test');

console.time('string.includes');
for(let i=0; i<100000; i++) {
    for(let j=0; j<dom.length; j++) {
        const t = dom.elements[j].textContent;
        t.toLowerCase().includes(stringInc);
    }
}
console.timeEnd('string.includes');
