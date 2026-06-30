## 2024-05-18 - Keyboard shortcut accessibility and hover state improvements
**Learning:** Adding `aria-keyshortcuts` when you define an explicit `title` indicating a keyboard shortcut ensures screen readers properly read both the action and the shortcut. Furthermore, keyboard focus outline styles ensure the accessibility of interactive elements that are usually only targeted by mouse hover styles.
**Action:** Always provide explicit keyboard focus styles for buttons and use `aria-keyshortcuts` if defining a keyboard shortcut in `title`.

## 2024-06-30 - Inline interaction styles and state updates
**Learning:** Setting `style.cssText` during state updates clears out all inline styles, which easily wipes out dynamic JavaScript-driven interaction styles (like those applied in `mouseover` or `focus` event listeners). This causes severe accessibility issues by rendering focus states invisible to keyboard users after an interaction.
**Action:** When creating components that rely on JavaScript for hover/focus state styles, use individual style property assignments (like `style.backgroundColor`) instead of overriding `style.cssText` when changing component state.
