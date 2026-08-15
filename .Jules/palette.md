## 2024-05-24 - Prevent Layout Shifts on Button State Changes
**Learning:** When updating the text of a button that contains nested elements (like a `<kbd>` tag for a keyboard shortcut), assigning to `.textContent` destroys all child elements, causing abrupt layout shifts and loss of contextual hints.
**Action:** Always use `.innerHTML` to update text alongside nested elements like `<kbd>`, and wrap the dynamic text in a `<span>` to ensure styling and flexbox layouts remain consistent across state changes.

## 2026-08-09 - Accessible Toast Notifications
**Learning:** Emojis injected directly into toast notification text nodes are read aloud by screen readers (e.g., "Prohibited sign Search term blocked"), creating a clunky and confusing audible experience.
**Action:** Always separate icons/emojis from text by wrapping them in an `<span aria-hidden="true">` tag and using flexbox (`display: flex; align-items: center; gap: 8px`) to maintain visual alignment without compromising screen reader clarity.

## 2024-08-15 - Match Native UI for Aesthetics and Accessibility
**Learning:** When injecting custom UI components (like toggle buttons) into a host application, using arbitrary small padding often results in touch targets that fail WCAG minimum size guidelines (44x44px or native equivalent).
**Action:** Always inspect the host application's native UI design tokens (e.g., YouTube's 36px pill buttons with 18px border radius) and replicate their dimensions and padding to simultaneously achieve aesthetic harmonization and resolve touch target accessibility issues.
