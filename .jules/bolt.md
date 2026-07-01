## 2024-06-27 - Unnecessary Attribute Observation in MutationObservers
**Learning:** Using `attributes: true` in `MutationObserver` configurations when the callback only processes `childList` additions causes significant performance degradation on highly dynamic pages (like YouTube) due to firing on every attribute change (e.g., hover states, dynamic inline styles).
**Action:** Always verify if `attributes: true` is strictly necessary. If only watching for new nodes, set `attributes: false` to prevent the browser from queuing thousands of useless macrotasks.
## 2026-06-27 - [Removed TVDB Scraper debug output]\n\nRemoved heavy console.log(JSON.stringify(...)) logic in tvdbScraper.js/ts to avoid large overhead from JSON serialization and console output for large TV series datasets.
## 2024-06-27 - Performance impact of .innerText in MutationObservers
**Learning:** Using `.innerText` inside high-frequency `MutationObserver` callbacks or `setInterval`s causes layout thrashing because it calculates CSS styling and visibility, forcing the browser to compute a synchronous reflow. In a highly dynamic page like YouTube, this freezes the main thread.
**Action:** Use `.textContent` instead of `.innerText` whenever just looking for string presence or basic values. `.textContent` simply reads the DOM nodes without triggering a reflow.
## 2024-07-27 - querySelectorAll on leaf nodes in MutationObserver
**Learning:** Calling `.querySelectorAll()` on every added node inside a high-frequency `MutationObserver` (e.g., YouTube ad blockers) introduces significant parsing and setup overhead. If a node is just an empty leaf node (which many added nodes are), `querySelectorAll` does a lot of work for nothing.
**Action:** Always check `if (node.firstElementChild)` before running `querySelectorAll` on deeply nested selectors within `MutationObserver` childList loops. This single check avoids massive CPU overhead by early-returning on leaf nodes.
## 2024-05-24 - Avoid redundant string allocations in iterators
**Learning:** Placing `.toLowerCase()` operations on both the target and the iterated items inside `.some()` or `.filter()` causes unnecessary string allocations and processing on every iteration, leading to O(N) redundant allocations.
**Action:** Pre-compute static collections into their desired format globally, and extract loop-invariant operations (like transforming the search query) outside the iterator function.
