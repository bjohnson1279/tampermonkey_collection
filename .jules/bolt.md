## 2024-06-27 - Unnecessary Attribute Observation in MutationObservers
**Learning:** Using `attributes: true` in `MutationObserver` configurations when the callback only processes `childList` additions causes significant performance degradation on highly dynamic pages (like YouTube) due to firing on every attribute change (e.g., hover states, dynamic inline styles).
**Action:** Always verify if `attributes: true` is strictly necessary. If only watching for new nodes, set `attributes: false` to prevent the browser from queuing thousands of useless macrotasks.
