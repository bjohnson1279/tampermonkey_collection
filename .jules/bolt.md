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

## 2024-07-28 - Regex matching vs Array.some + includes for URL interception
**Learning:** Intercepting high-volume network events (like replacing `fetch` and `XMLHttpRequest`) requires extremely fast checks to avoid blocking the main thread during heavy page loads. Using an array of patterns and executing `Array.some(p => url.includes(p))` is O(N) strings checked per URL and is noticeably slower (roughly ~5x based on profiling) than testing against a single compiled Regular Expression.
**Action:** When evaluating URLs against a static list of strings/patterns in high-frequency network intercepts, concatenate them into a single Regular Expression pattern and use `regex.test(url)` for significantly improved performance.

## 2024-07-28 - Regex matching vs .toLowerCase().includes() for text checks
**Learning:** Checking for string presence via `.toLowerCase().includes()` inside high-frequency `MutationObserver` callbacks (like checking DOM text nodes) causes unnecessary string allocations and is noticeably slower than a pre-compiled regex check (e.g. `/pattern/i.test(text)`). In performance testing, a regex check is about ~6x faster than `toLowerCase().includes()`.
**Action:** Always use pre-compiled regex with the `i` flag instead of calling `.toLowerCase().includes()` when evaluating text content inside `MutationObserver` or `setInterval` loops.

## 2024-07-28 - Extract array allocations and use O(1) Sets in high-frequency loops
**Learning:** Initializing arrays and using `.includes()` inside `.forEach()` loops or `MutationObserver` callbacks causes O(N) memory allocations per mutation and O(M) lookup times for every iterated element, which can degrade performance significantly on dynamic pages where many elements are added.
**Action:** Always extract configuration arrays (like blacklists) globally outside of observer callbacks, and convert them to `Set` objects for O(1) `.has()` lookups to prevent redundant allocations and speed up presence checks.

## 2024-11-20 - Set over Array for O(1) lookups in high-frequency callbacks
**Learning:** Initializing an array inside a high-frequency `MutationObserver` callback or loop causes redundant O(N) memory allocations every time the callback fires. Furthermore, using `Array.includes()` inside the loop means O(N) lookups per element evaluated.
**Action:** Always extract loop-invariant structures outside the observer callback. Use `Set` instead of `Array` to achieve O(1) lookups with `Set.has()`, significantly reducing overhead and garbage collection.

## 2024-11-20 - Prevent O(N²) scaling inside MutationObservers with full-tree queries
**Learning:** Querying the entire DOM tree (e.g. `querySelectorAll('.CommentsList__item')`) inside a `MutationObserver` on every `childList` mutation causes O(N²) behavior, re-evaluating existing nodes exponentially as the container grows.
**Action:** Always iterate through `mutation.addedNodes` exclusively in `MutationObserver` callbacks instead of re-querying the whole container. Combined with leaf node checks (`firstElementChild`), this scales gracefully at O(1) relative to total container size.
