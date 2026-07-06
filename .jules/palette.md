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

## 2024-05-24 - Injecting `<style>` Blocks for Pseudo-classes

**Learning:** Using JavaScript event listeners (`mouseover`, `focus`, `mousedown`) to simulate CSS pseudo-classes (`:hover`, `:focus`, `:active`) on dynamically injected elements creates an unmaintainable anti-pattern. It leads to buggy accessible behaviors (e.g., `:focus-visible` semantics cannot easily be replicated in JS, leading to sticky focus outlines after mouse clicks).
**Action:** When styling custom injected UI elements, safely inject a `<style>` block dynamically (e.g., via `document.createElement('style')`) into the DOM to handle pseudo-class styling natively. This ensures proper browser accessibility support and removes redundant JS overhead.

## 2024-08-01 - Interactive Element Async Feedback Disabled States

**Learning:** When displaying asynchronous text feedback directly inside a button (e.g., changing "Copy" to "Copied!" for 2 seconds), failing to programmatically disable the button (`btn.disabled = true`) allows rapid successive clicks that can trigger race conditions with the timeout resets, causing confusing text flickering and invalidating the feedback state. Furthermore, native `:active` CSS transformations must be scoped to `:not(:disabled)` to prevent visually implying the button is interactive while it is disabled.
**Action:** Always apply `disabled = true` to buttons during async/timeout feedback states, manage the `clearTimeout` properly on consecutive calls, and ensure `:active` CSS states do not apply to `:disabled` elements.

## 2024-08-16 - Dynamic tooltips and AA Contrast on Feedback Buttons

**Learning:** When displaying asynchronous text feedback directly inside a button, standard alert colors (like Bootstrap's `#28a745` success green) often fail WCAG AA contrast requirements when used with white text. Furthermore, leaving the default action tooltip (e.g., "Copy JSON to clipboard") on the button during its disabled feedback state provides confusing information to screen reader and mouse users hovering over the button.
**Action:** Always verify contrast ratios for dynamic feedback states (using darker shades like `#146c43` for success green). Additionally, dynamically update the `title` attribute to explain the current state (e.g., "Successfully copied") when disabling the button for feedback, and restore the original `title` when the feedback times out and the button becomes interactive again.
