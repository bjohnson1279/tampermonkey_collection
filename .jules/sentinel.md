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

## 2024-07-01 - [TOCTOU via dynamic toString() or getters in request interception]
**Vulnerability:** A Time-Of-Check to Time-Of-Use (TOCTOU) evasion was present in the `fetch` and `XMLHttpRequest.prototype.open` monkey patches in `ytAdBlock2.ts`. The script safely extracted the URL for the `shouldBlock` filter but passed the original object (with potentially dynamic getters or `.toString()` methods) to the native implementations. An attacker could pass a POJO that returns a safe URL during the check and a blocked URL during the native call.
**Learning:** Checking the property of an object and later relying on the native engine to coercively extract that property again allows for a TOCTOU evasion if the property (or `toString()`) is dynamic.
**Prevention:** When intercepting network requests, if you rely on coercing an object to a string (or extracting a property), pass the already-coerced string to the underlying API instead of the original object to eliminate the time gap.

## 2024-07-03 - [Path/Query Confusion in Hostname Matching]
**Vulnerability:** In `src/searchEngineFilter.ts`, the script matched the target search engine domain using `window.location.href.includes(domain)`. This allowed a malicious or unrelated site with a URL like `https://attacker.com/?q=blacklist_word&bing.com` to trigger the script's logic, leading to unintended behavior (redirects). Additionally, the script logged potentially sensitive user search queries to the console.
**Learning:** Checking the entire `href` for a domain substring is a classic path/query confusion vulnerability. Any part of the URL (path, query, hash) can contain the domain string.
**Prevention:** Always use `window.location.hostname` (or `URL.hostname`) to verify the domain or origin before executing sensitive script logic. Avoid logging sensitive user input like search queries to the console in production scripts.

## 2026-07-10 - [User Identifier Exposure in Console Logs]
**Vulnerability:** Usernames of blocked users were being logged to the console using `console.log` when hiding their comments in `kslCommentsHide.ts`.
**Learning:** Logging sensitive user input or identifiers (like usernames, even of blocked users) to the console in production browser scripts exposes Personally Identifiable Information (PII) to anyone with access to the developer console or telemetry tools capturing console output.
**Prevention:** Never log user identifiers or sensitive data to the browser console in production environments. Remove debug statements that expose this information before deploying.
