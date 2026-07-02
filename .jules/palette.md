## 2024-05-18 - Keyboard shortcut accessibility and hover state improvements
**Learning:** Adding `aria-keyshortcuts` when you define an explicit `title` indicating a keyboard shortcut ensures screen readers properly read both the action and the shortcut. Furthermore, keyboard focus outline styles ensure the accessibility of interactive elements that are usually only targeted by mouse hover styles.
**Action:** Always provide explicit keyboard focus styles for buttons and use `aria-keyshortcuts` if defining a keyboard shortcut in `title`.

## 2024-06-30 - Inline interaction styles and state updates
**Learning:** Setting `style.cssText` during state updates clears out all inline styles, which easily wipes out dynamic JavaScript-driven interaction styles (like those applied in `mouseover` or `focus` event listeners). This causes severe accessibility issues by rendering focus states invisible to keyboard users after an interaction.
**Action:** When creating components that rely on JavaScript for hover/focus state styles, use individual style property assignments (like `style.backgroundColor`) instead of overriding `style.cssText` when changing component state.

## 2024-07-28 - Avoid aria-label state redundancy and direct aria-live on buttons
**Learning:** Including state in an `aria-label` (e.g., "Toggle (Currently ON)") when a button already uses `aria-pressed="true/false"` causes screen readers to redundantly announce the state twice. Additionally, placing `aria-live` directly on an interactive button can create inconsistent announcements across different screen readers, especially when toggled via keyboard shortcuts.
**Action:** Keep `aria-label` static when using `aria-pressed`, and use a separate, visually hidden `aria-live="polite"` element appended to the DOM for announcing state changes triggered by external events like hotkeys.

## 2024-08-01 - Avoid JS event listeners for CSS pseudo-classes
**Learning:** When styling custom injected UI elements in Tampermonkey scripts, avoid using JavaScript event listeners to simulate CSS pseudo-classes (`:hover`, `:focus`, `:active`) as it is an unmaintainable anti-pattern.
**Action:** Instead, safely inject a `<style>` block dynamically (e.g., via `document.createElement('style')`) into the DOM to handle pseudo-class styling natively.

## 2024-08-01 - Prevent duplicate rendering of UI elements
**Learning:** When dynamically injecting UI elements into the DOM in Tampermonkey scripts, failing to check if the element already exists can lead to duplicate rendering when scripts re-execute or target nodes mutate.
**Action:** Always wrap the appending logic in an idempotency check (e.g., `if (!document.getElementById('element-id'))`) to prevent duplicate rendering.
