## 2024-05-24 - Prevent Layout Shifts on Button State Changes
**Learning:** When updating the text of a button that contains nested elements (like a `<kbd>` tag for a keyboard shortcut), assigning to `.textContent` destroys all child elements, causing abrupt layout shifts and loss of contextual hints.
**Action:** Always use `.innerHTML` to update text alongside nested elements like `<kbd>`, and wrap the dynamic text in a `<span>` to ensure styling and flexbox layouts remain consistent across state changes.
