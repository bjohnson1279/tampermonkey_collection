## 2024-06-27 - [Prototype Pollution via Query Params]
**Vulnerability:** Prototype pollution vulnerability found in `src/getQueryString.ts` during query string parameter parsing using `URLSearchParams`.
**Learning:** Object initialization `{}` alongside unrestrained assignment `result[key] = value` allowed dangerous query parameters like `?__proto__=polluted` to modify the generic object prototype, impacting subsequent script actions.
**Prevention:** Always initialize objects expected to store untrusted data (like parsed query parameters) using `Object.create(null)` instead of `{}`. Additionally, filter out specifically dangerous keys (`__proto__`, `constructor`, `prototype`) explicitly if doing assignment from external inputs.
