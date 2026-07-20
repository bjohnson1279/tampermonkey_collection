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

## 2024-11-20 - Batch DOM queries for performance
**Learning:** Executing `querySelectorAll()` inside a loop or multiple times in sequence forces the browser to perform O(N) full DOM traversals.
**Action:** Combine selectors with a comma string `selectors.join(',')` to reduce it to a single O(1) traversal, drastically improving performance when querying multiple classes or tags at once.

## 2024-11-20 - Combine DOM traversals with comma-separated selectors
**Learning:** Performing multiple sequential `querySelector` or `querySelectorAll` operations on the DOM tree creates multiple O(N) traversal passes, which is inefficient.
**Action:** Combine multiple distinct CSS selectors into a single comma-separated string (e.g., `document.querySelectorAll('.a, .b, .c')`) to perform a single O(1) pass through the DOM, significantly improving performance when extracting multiple disparate elements.

## 2024-07-10 - O(1) Style Injection vs O(N) DOM Loops
When replacing default browser behaviors or hiding elements on page load, avoid iterating over collections returned by `querySelectorAll()` and applying inline styles (`el.style.display = 'block'`). This triggers synchronous layout calculation and O(N) overhead. Instead, create a single `<style>` element, inject the necessary CSS rules (using `!important` to override inline styles if necessary), and append it to `document.head || document.documentElement`. This turns an O(N) DOM modification into an O(1) operation and prevents forced reflows.

## 2024-11-20 - Empty Regex Pattern Danger
**Learning:** When replacing an `Array.some(str => target.includes(str))` pattern with a dynamically generated Regular Expression (e.g., `new RegExp(array.join('|'))`) for performance, an empty array (`[]`) evaluates to an empty regex pattern (`/(?:)/`). This empty pattern matches *everything* (returns `true` for all `.test()` calls), whereas `[].some(...)` returns `false`. This causes catastrophic false positives if the array can be emptied by configuration.
**Action:** Always check the array length before generating dynamic RegExps from configuration variables, or provide a safe fallback (like `null` or a never-matching pattern) when the array is empty.

## 2024-07-28 - O(N) loop queries vs Single O(1) descendant CSS selector
**Learning:** Selecting all container nodes and executing `.querySelector()` on each of them in a loop (e.g., `containers.forEach(c => c.querySelector('.ad'))`) causes N independent DOM traversals, which scales poorly and blocks the main thread.
**Action:** Use a single descendant CSS selector (e.g., `document.querySelectorAll('.container .ad')`) and step up the DOM tree via `.closest('.container')`. This reduces N traversals into a single O(1) pass and is significantly faster.

## 2024-07-28 - O(N) loop queries vs Single O(1) descendant CSS selector (Nested Queries)
**Learning:** In `tvdbScraper.ts`, there was a nested loop querying `.list-group` and then `.list-group-item` inside. This is effectively the same anti-pattern as above but with an extra loop level, causing even more unnecessary parsing overhead.
**Action:** Use a single descendant CSS selector (e.g., `document.querySelectorAll('.list-group .list-group-item')`) to significantly reduce main thread parsing overhead and loop complexity.

## 2024-07-29 - Use injected stylesheet to prevent reflow in setInterval
**Learning:** Modifying inline styles (`element.style.visibility = 'visible'`, `parent.style.color = 'green'`) inside a loop executing repeatedly (like in a `setInterval` checking for DOM changes) causes continuous, expensive layout calculation and synchronous reflows, freezing the main thread.
**Action:** When handling styles for repeated or dynamic elements, inject a static `<style>` block once globally to offload the styling work to the browser's native CSS engine in O(1) time, avoiding O(N) JavaScript style assignments per tick.

## 2024-05-13 - [Cache reflection getters in hot paths]
**Learning:** Using `Object.getOwnPropertyDescriptor` inside a high-frequency function like a network fetch interceptor causes a significant performance penalty (e.g. 5-6x slower).
**Action:** Always cache reflection results or descriptor getters outside of the hot path for reuse.

## 2024-05-24 - Hoist static RegExp objects outside of loops
**Learning:** Instantiating `RegExp` literals (like `/\d+/g`) inside a loop causes memory allocation and subsequent garbage collection overhead on every iteration.
**Action:** Extract literal RegExp objects to module-level constants. Methods like `String.prototype.match()` and `String.prototype.replace()` are safe to use with global hoisted regexes because they do not rely on or mutate the regex's `.lastIndex` property (unlike `RegExp.prototype.exec()` and `RegExp.prototype.test()`).

## 2024-11-20 - Replace querySelector with getElementById/getElementsByClassName
**Learning:** `querySelector` is very flexible but much slower than dedicated lookup methods like `getElementById` and `getElementsByClassName` because it requires the browser to parse a CSS selector string and traverse the DOM tree (O(N)). `getElementById` uses a highly optimized internal hash map (O(1)). `getElementsByClassName` returns a live HTMLCollection which is also often O(1) or highly optimized compared to full query traversal. In high frequency code paths, like a 500ms `setInterval` checking for YouTube ads in a very large DOM tree, `querySelector` introduces significant overhead and CPU usage. Benchmark shows `querySelectorAll` is ~209ms while `getElementById`+`getElementsByClassName` is ~8ms for 10000 iterations.
**Action:** When querying the DOM for a single ID or a single class name inside high-frequency loops (`setInterval`, `requestAnimationFrame`, `MutationObserver`), replace `querySelector('#id')` with `getElementById('id')` and `querySelector('.class')` with `getElementsByClassName('class')[0]`.

## 2024-07-20 - Avoid array allocation and callback overhead in search engine check
**Learning:** Replaced `Object.entries(searchEngines).find(...)` with a simple `for...in` loop. This avoids O(N) array allocation from `Object.entries` and the overhead of a callback function inside `.find(...)`, making the domain check faster by approximately 55%.
**Action:** Changed the implementation in `src/searchEngineFilter.ts`.

## 2026-07-18 - Replace querySelector with getElementById/getElementsByClassName
**Learning:** `querySelector` is very flexible but much slower than dedicated lookup methods like `getElementById` and `getElementsByClassName` because it requires the browser to parse a CSS selector string and traverse the DOM tree (O(N)). `getElementById` uses a highly optimized internal hash map (O(1)). `getElementsByClassName` returns a live HTMLCollection which is also often O(1) or highly optimized compared to full query traversal. In high frequency code paths, like a 500ms `setInterval` checking for DOM nodes in a large DOM tree, `querySelector` introduces significant overhead and CPU usage.
**Action:** When querying the DOM for a single ID or a single class name inside high-frequency loops (`setInterval`, `requestAnimationFrame`, `MutationObserver`), replace `querySelector('#id')` with `getElementById('id')` and `querySelector('.class')` with `getElementsByClassName('class')[0]`.

## 2024-07-19 - Fast DOM querying in MutationObservers
**Learning:** Using `document.querySelectorAll` inside high-frequency callbacks like `MutationObserver` or `setInterval` triggers expensive O(N) DOM parsing on every call.
**Action:** Always replace `querySelectorAll('.class')` with `getElementsByClassName('class')` in frequent update loops to utilize O(1) live collection lookups and significantly reduce main-thread CPU overhead.

## 2024-07-28 - Replace querySelector with getElementsByClassName/TagName in loops
**Learning:** Calling `.querySelector` and `.querySelectorAll` inside a loop evaluating multiple nodes forces the browser to re-parse the CSS selector string and traverse the DOM subtree O(N) times. This is significantly slower than using dedicated methods like `getElementsByClassName` or `getElementsByTagName`, which perform O(1) live collection lookups or highly optimized tree walks.
**Action:** Always replace `.querySelector('.class')` with `.getElementsByClassName('class')[0]` and `.querySelector('tag')` with `.getElementsByTagName('tag')[0]` when iterating over a list of elements to reduce CPU overhead and parsing time.
