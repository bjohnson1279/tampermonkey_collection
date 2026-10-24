const mutationsList = Array(50).fill().map(() => ({
    addedNodes: Array(10).fill().map((_, i) => ({
        nodeType: 1,
        classList: { contains: () => true },
        firstElementChild: {},
        getElementsByClassName: () => Array(5).fill({ textContent: "user" + i })
    }))
}));

console.time('for loops');
for(let i=0; i<10000; i++) {
    for (let j = 0, len = mutationsList.length; j < len; j++) {
        const mutation = mutationsList[j];
        for (let k = 0, nodeLen = mutation.addedNodes.length; k < nodeLen; k++) {
            const node = mutation.addedNodes[k];
            if (node.nodeType === 1) {
                if (node.firstElementChild) {
                    const nested = node.getElementsByClassName('CommentsList__item');
                    for (let m = 0, nLen = nested.length; m < nLen; m++) {
                        const el = nested[m];
                    }
                }
            }
        }
    }
}
console.timeEnd('for loops');

console.time('forEach Array.from');
for(let i=0; i<10000; i++) {
    mutationsList.forEach(mutation => {
        Array.from(mutation.addedNodes).forEach(node => {
            if (node.nodeType === 1) {
                if (node.firstElementChild) {
                    const nested = node.getElementsByClassName('CommentsList__item');
                    Array.from(nested).forEach(el => {

                    });
                }
            }
        });
    });
}
console.timeEnd('forEach Array.from');
