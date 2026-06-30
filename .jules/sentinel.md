## 2024-06-27 - [Prototype Pollution via Query Params]
**Vulnerability:** Prototype pollution vulnerability found in `src/getQueryString.ts` during query string parameter parsing using `URLSearchParams`.
**Learning:** Object initialization `{}` alongside unrestrained assignment `result[key] = value` allowed dangerous query parameters like `?__proto__=polluted` to modify the generic object prototype, impacting subsequent script actions.
**Prevention:** Always initialize objects expected to store untrusted data (like parsed query parameters) using `Object.create(null)` instead of `{}`. Additionally, filter out specifically dangerous keys (`__proto__`, `constructor`, `prototype`) explicitly if doing assignment from external inputs.

## 2024-06-29 - [Fetch Evasion via Request Objects]
**Vulnerability:** Adblocker/tracker blocking logic using fetch interception was vulnerable to evasion when fetch is called with a `Request` or `URL` object instead of a string URL.
**Learning:** The interceptor used `args[0]?.toString()` which results in `"[object Request]"` instead of the actual URL, completely bypassing blocklists that match on url strings.
**Prevention:** When hooking `fetch` or `XMLHttpRequest`, always normalize the argument type by checking `instanceof Request` or `instanceof URL` and extract the `.url` or `.href` properties respectively before applying security filtering.
## 2025-06-30 - Tampermonkey Cross-Realm Adblock Evasion
**Vulnerability:** YouTube AdBlocker (`ytAdBlock2`) used `req instanceof Request` or `req instanceof URL` in `fetch` and `XMLHttpRequest` monkeypatches to extract URLs. This fails when the `Request` or `URL` object originates from a different realm (like an iframe or web worker). The fallback was `req?.toString()`, which returns `"[object Request]"`. This allowed requests with ad URLs to bypass the `shouldBlock` filter.
**Learning:** `instanceof` checks fail across Javascript realms because each realm has its own global objects (e.g., `window.Request !== iframe.contentWindow.Request`).
**Prevention:** Use duck typing (checking for properties like `typeof req === 'object' && 'url' in req`) instead of `instanceof` when extracting data from objects that might cross boundaries, especially in browser extensions and Tampermonkey scripts that interact with complex, multi-realm applications like YouTube.
