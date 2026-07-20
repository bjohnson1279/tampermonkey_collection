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

## 2024-10-25 - Prevent global keyboard shortcuts inside text inputs

**Learning:** Global keyboard shortcuts (like `Shift+A`) can be incredibly frustrating if they trigger while a user is typing normally into an input, textarea, or contenteditable element (like a search bar or comment field).
**Action:** When adding global keyboard shortcuts, always check the `e.target` of the keydown event. Ensure it is not an `<input>`, `<textarea>`, or an element with `isContentEditable` before executing the shortcut action.

## 2026-07-07 - [Invisible Focus Rings with currentColor]

**Learning:** Using `currentColor` for focus rings (e.g. `outline: 2px solid currentColor`) can cause accessibility failures (WCAG 2.4.7 Focus Visible) when the element's text color perfectly matches its dynamically themed container background. For example, a button with white text on a dynamically themed dark-or-light header will have a white focus ring, rendering it invisible in light mode.
**Action:** When styling injected components over third-party, dynamically-themed layouts (like YouTube), avoid `currentColor` for focus outlines unless the element has its own isolated background. Instead, use the site's native high-contrast CSS variables (e.g., `var(--yt-spec-text-primary)`) with a fallback (e.g. `CanvasText`) to ensure contrast across all themes.

## 2026-07-08 - Custom Focus Styles Specificity

**Learning:** When applying custom styles via an injected `<style>` block (e.g. for accessibility), setting an inline style of `outline: none;` directly on the element (e.g., via `element.style.cssText`) will override the injected stylesheet's `:focus-visible` rule due to CSS specificity rules, leaving keyboard users with an entirely invisible focus ring.
**Action:** Place the `outline: none;` reset rule inside the injected `<style>` block alongside the custom `:focus-visible` rule to ensure the CSS cascading rules evaluate the pseudo-class state correctly without being overridden by inline properties.

## 2024-11-12 - Custom Focus Styles Specificity

**Learning:** When applying custom `:focus-visible` styles via an injected `<style>` block (e.g. for accessibility), setting an inline style of `outline: none;` directly on the element (e.g., via `element.style.cssText`) will override the injected stylesheet's `:focus-visible` rule due to CSS specificity rules, leaving keyboard users with an entirely invisible focus ring.
**Action:** Place the `outline: none;` reset rule inside the injected `<style>` block alongside the custom `:focus-visible` rule to ensure the CSS cascading rules evaluate the pseudo-class state correctly without being overridden by inline properties.

## 2024-11-12 - Empty states and persistent shortcuts on action buttons

**Learning:** When a page-level action button is injected (like a "Copy JSON" button for scraped data), it fails UX expectations if it allows interaction when no data is actually present on the page. Also, if a button uses its `title` to provide keyboard shortcut hints (like `(Shift+C)`), resetting the title after a temporary feedback state without restoring the hint removes crucial accessibility cues.
**Action:** Always implement a clear empty state (e.g., changing text to "No Data" and setting `disabled=true`) when injected actions rely on page data that may be missing. Ensure that state restoration logic (e.g. `setTimeout` for temporary feedback) perfectly mirrors the original initialization state, including shortcut hints in tooltips.

## 2024-11-20 - Disabled states vs Feedback states

**Learning:** When using `disabled=true` on a button temporarily to prevent duplicate submissions during an async action (like a copy to clipboard success feedback message), applying generic `:disabled` CSS rules (`opacity: 0.7`, `cursor: not-allowed`) will make the success message look faded out, forbidden, or broken. Furthermore, failing to update the `aria-label` during this feedback state means screen readers will announce stale action text instead of the success message.
**Action:** When a button is disabled specifically for async feedback, add a custom attribute like `data-feedback="true"` to opt-out of generic `:disabled` opacity/cursor styles, and explicitly update both the `aria-label` and `title` to match the feedback state.

## 2024-11-20 - Default Button Color Contrast Accessibility

**Learning:** Common default button colors (like Bootstrap's default blue `#007bff`) often fail WCAG AA contrast guidelines (4.5:1) when paired with white text, which can make them difficult to read for users with visual impairments.
**Action:** Always verify color contrast on primary action buttons, even if using standard design system colors. Use darker shades (like `#0056b3` or Bootstrap 5's darker variants) to ensure compliant readability.

## 2024-11-28 - Actionable tooltips for toggle states

**Learning:** Static tooltips on toggle buttons (e.g., "Toggle Feature") provide less clarity than dynamic, actionable tooltips. Updating the title attribute to reflect the action that will occur upon clicking (e.g., "Disable Feature" when currently ON) significantly improves user confidence and reduces cognitive load for sighted mouse users.
**Action:** Always use actionable, dynamic tooltips for toggle states instead of generic "Toggle" text, ensuring the tooltip explicitly describes the result of the interaction based on the current state.

## 2024-05-30 - Explicit loading states for Clipboard API

**Learning:** The `navigator.clipboard.writeText()` API is asynchronous and can sometimes pause to prompt the user for clipboard permissions. Without an explicit loading state, the button appears frozen and unresponsive during this pause, leading to confusion.
**Action:** Always implement an explicit loading state (e.g., updating button text to "⏳ Copying...") immediately before awaiting the Clipboard API.

## 2024-11-29 - Use aria-disabled to prevent focus loss on async buttons

**Learning:** When a button disables itself (`disabled=true`) upon clicking (e.g., during an async operation like copying to clipboard), it loses focus. This causes screen readers to unexpectedly drop focus to the `<body>`, disorienting keyboard and assistive technology users.
**Action:** Instead of the native `disabled` attribute, use `aria-disabled="true"` to communicate the disabled state semantically without removing focusability. Ensure the click handler explicitly ignores clicks when `aria-disabled="true"` is set, and update the associated CSS pseudo-classes (`:disabled`, `:not(:disabled)`) to match the aria attribute.

## 2024-11-29 - Dynamic Item Counts in Actions

**Learning:** Adding dynamic item counts (e.g., "(5 episodes)") to action buttons like "Copy JSON" gives users immediate, helpful context about the scope of the action they are about to take, reducing cognitive load and preventing surprises.
**Action:** When injecting buttons that perform actions on a collection of scraped or parsed data, dynamically update the button text to include the count of items being acted upon.

## 2024-11-29 - Visual Status Icons on Toggle Buttons

**Learning:** Text-heavy toggle buttons (e.g., "AdBlock: ON") require users to read and process the text to understand the current state, increasing cognitive load. Adding stateful status icons (e.g., "🛡️" for ON, "⚠️" for OFF) provides immediate visual recognition, allowing users to parse the state at a glance.
**Action:** When creating text-based toggle buttons, incorporate distinct, semantically appropriate icons that change based on the active state to improve quick visual parsing and add a touch of delight.

## 2026-07-18 - Dynamic Item Counts in ARIA Labels

**Learning:** When a button's visual text is updated to include dynamic context (like an item count), using a static `aria-label` causes screen readers to completely miss this crucial context, as `aria-label` overrides the element's text content.
**Action:** Always ensure that any dynamic, contextual data added to visual text is also reflected in the element's `aria-label` so that assistive technology users receive the same level of detail.

## 2024-05-24 - Prevent text selection on custom UI buttons
**Learning:** When injecting custom interactive elements (like buttons) into existing pages, rapid clicking or double-clicking can inadvertently select the button's text, which breaks the native UI feel and feels unpolished.
**Action:** Always apply `user-select: none` (and `-webkit-user-select: none` for compatibility) to custom injected buttons to ensure they behave like native application controls.

## 2024-05-24 - Prevent text selection on custom UI buttons
**Learning:** When injecting custom interactive elements (like buttons) into existing pages, rapid clicking or double-clicking can inadvertently select the button's text, which breaks the native UI feel and feels unpolished.
**Action:** Always apply `user-select: none` (and `-webkit-user-select: none` for compatibility) to custom injected buttons to ensure they behave like native application controls.
## 2024-06-25 - Relying purely on color for status (WCAG 1.4.1)
**Learning:** Indicating a correct or active status solely by changing text color (e.g., `color: green`) violates WCAG 1.4.1 (Use of Color), as colorblind users may not perceive the difference. Additionally, default color keywords like "green" often fail contrast requirements.
**Action:** When updating styling for a state change, always introduce a non-color visual indicator. Examples include adding a shape/emoji (like a checkmark ✅ via `::before`), changing the font-weight, or adding an underline. Always use a specific hex/rgb value that meets AA contrast guidelines rather than raw color keywords.
