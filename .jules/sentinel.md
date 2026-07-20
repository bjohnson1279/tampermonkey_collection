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

## 2024-05-18 - [Fetch Interceptor TOCTOU via Getters]
**Vulnerability:** The `fetch` interceptor extracted the URL from `req.url` to check against an adblock list, but then passed the original `req` object to the native `fetch`. A malicious object with a getter for `url` could return a safe URL during the check and an ad URL when native `fetch` evaluated it.
**Learning:** Checking a property on an object and then passing the object to a native API creates a Time-Of-Check to Time-Of-Use (TOCTOU) vulnerability because the getter is evaluated twice.
**Prevention:** Unconditionally overwrite `args[0]` with the extracted primitive URL string ONLY for POJOs. Native `Request` objects are immune to this TOCTOU vector as their internal URL slot is immutable once constructed, and overwriting `args[0]` when `args[0]` is a `Request` would drop the original request's properties.

## 2024-07-03 - [Path/Query Confusion in Hostname Matching]
**Vulnerability:** In `src/searchEngineFilter.ts`, the script matched the target search engine domain using `window.location.href.includes(domain)`. This allowed a malicious or unrelated site with a URL like `https://attacker.com/?q=blacklist_word&bing.com` to trigger the script's logic, leading to unintended behavior (redirects). Additionally, the script logged potentially sensitive user search queries to the console.
**Learning:** Checking the entire `href` for a domain substring is a classic path/query confusion vulnerability. Any part of the URL (path, query, hash) can contain the domain string.
**Prevention:** Always use `window.location.hostname` (or `URL.hostname`) to verify the domain or origin before executing sensitive script logic. Avoid logging sensitive user input like search queries to the console in production scripts.

## 2026-07-10 - [User Identifier Exposure in Console Logs]
**Vulnerability:** Usernames of blocked users were being logged to the console using `console.log` when hiding their comments in `kslCommentsHide.ts`.
**Learning:** Logging sensitive user input or identifiers (like usernames, even of blocked users) to the console in production browser scripts exposes Personally Identifiable Information (PII) to anyone with access to the developer console or telemetry tools capturing console output.
**Prevention:** Never log user identifiers or sensitive data to the browser console in production environments. Remove debug statements that expose this information before deploying.

## 2025-07-02 - [TOCTOU via Duck-Typing Evasion in Request Interception]
**Vulnerability:** The adblocker interceptors in `ytAdBlock2.ts` used duck typing (`'url' in req`) to extract URLs, which allowed malicious POJOs with dynamic getters to evade blocking. A POJO could return a safe URL during the `shouldBlock` check but an ad URL when the native API later accessed the property.
**Learning:** Checking for properties via duck typing in interceptors and leaving the object unmodified enables a Time-Of-Check to Time-Of-Use (TOCTOU) vulnerability if the property getter is dynamic.
**Prevention:** Use WebIDL brand checking (e.g., `Object.getOwnPropertyDescriptor(Request.prototype, 'url')?.get?.call(req)`) to securely identify native `Request` and `URL` objects. For any non-native object, immediately evaluate and replace the argument with the coerced string URL to eliminate the time gap.

## 2024-07-06 - [Fetch Evasion via TOCTOU in POJO getters]
**Vulnerability:** The fetch monkeypatch in `src/ytAdBlock2.ts` used simple duck typing (`'url' in req`) to identify Request objects. This allowed malicious POJOs to spoof properties to evade checks via dynamic getters, leading to a Time-Of-Check to Time-Of-Use (TOCTOU) vulnerability where the ad URL passed the `shouldBlock` filter but hit the native fetch intact.
**Learning:** Simple duck typing on object properties is easily spoofable by getters. Moreover, intercepting native `Request` objects and replacing them with coerced strings destroys other request metadata (like `method` or `body`). Native `Request` objects are immune to TOCTOU for `url` since their internal slot is immutable.
**Prevention:** Use WebIDL brand-checking (e.g., `Object.getOwnPropertyDescriptor(Request.prototype, 'url')?.get?.call(req)`) to securely and reliably identify Native `Request` objects across all JavaScript realms. Only overwrite `args[0]` with the safe URL string if the object is a POJO.

## 2024-07-15 - [Hostname Confusion in Search Engine Filter]
**Vulnerability:** Subdomain and prefix spoofing vulnerability found in `src/searchEngineFilter.ts` where `hostname.includes(domain)` was used to match search engines.
**Learning:** Using `.includes()` on a hostname allows malicious domains like `notgoogle.com` or `google.com.attacker.com` to falsely match the target domain, potentially triggering unintended script logic or exposing sensitive user search queries.
**Prevention:** Always use exact matching (`hostname === domain`) or proper suffix matching (`hostname.endsWith('.' + domain)`) when validating hostnames against a list of trusted domains.

## 2026-07-14 - [Tracking Evasion via sendBeacon]
**Vulnerability:** YouTube AdBlocker (`ytAdBlock2`) intercepted `fetch` and `XMLHttpRequest`, but left `navigator.sendBeacon` unprotected. This allowed tracking and ad analytics requests (like those hitting `/api/stats/ads`) to bypass the network filter, exposing the user to tracking and potentially triggering secondary ad mechanisms.
**Learning:** Modern web applications often use `navigator.sendBeacon` for analytics and telemetry because it guarantees request delivery even during page unload. Adblockers that only hook `fetch` and `XHR` are blind to these requests.
**Prevention:** When building network interceptors for privacy or adblocking, always secure all outbound network APIs, including `navigator.sendBeacon`. Apply the same WebIDL/TOCTOU preventions as used in `fetch` and `XHR`.

## 2024-07-20 - [Network Filter Evasion via Relative URLs]
**Vulnerability:** Adblocker/tracker blocking logic using fetch interception was vulnerable to evasion when requests were made using relative URLs (e.g., `fetch('/api/stats/ads')`). The URL was tested directly against a regex that expected full domain matches (like `youtube.com\/api\/stats`), causing relative URLs to silently bypass the filter.
**Learning:** Network APIs like `fetch` and `XMLHttpRequest` accept relative URLs, which the browser automatically resolves against the current origin. Network filters relying on full URL patterns will fail to block these unless the relative URLs are resolved first.
**Prevention:** When intercepting network requests to evaluate against a URL blocklist (e.g., via regex), always normalize the input URL to an absolute URL (e.g., `new URL(url, window.location.href).href`) before testing. Use a `try/catch` block to safely fallback to the original URL if parsing fails.

## 2024-07-28 - [Network Filter Evasion via WebSocket]
**Vulnerability:** Trackers can bypass `fetch`, `XMLHttpRequest`, and `navigator.sendBeacon` interceptors by using `WebSocket` connections for telemetry and ads, allowing them to evade network filters entirely.
**Learning:** `WebSocket` is another network API that must be secured in privacy and adblocking extensions to prevent evasion. Like other network hooks, it is also vulnerable to TOCTOU and cross-realm object spoofing.
**Prevention:** When building network interceptors for privacy or adblocking, always secure `WebSocket` connections. Apply the same WebIDL brand-checking and TOCTOU preventions as used in `fetch` and `XHR` when evaluating the connection URL.
