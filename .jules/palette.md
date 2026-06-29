## 2024-05-18 - Keyboard shortcut accessibility and hover state improvements
**Learning:** Adding `aria-keyshortcuts` when you define an explicit `title` indicating a keyboard shortcut ensures screen readers properly read both the action and the shortcut. Furthermore, keyboard focus outline styles ensure the accessibility of interactive elements that are usually only targeted by mouse hover styles.
**Action:** Always provide explicit keyboard focus styles for buttons and use `aria-keyshortcuts` if defining a keyboard shortcut in `title`.
