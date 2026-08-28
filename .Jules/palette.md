## 2026-08-26 - Responsive Icon-Only FAB Touch Targets
**Learning:** When making floating action buttons responsive by hiding their text labels on mobile devices, you must ensure the remaining icon maintains a minimum 44x44px touch target (WCAG 2.5.5) and is re-centered, otherwise the button becomes inaccessible.
**Action:** Always test mobile breakpoints on FABs to verify touch target dimensions and centering when text elements are hidden. Furthermore, while screen readers will read the aria-label of the parent button, using a visually-hidden class (like sr-only) for the text label is often safer than display:none to guarantee screen readers always have an accessible name available.

## YYYY-MM-DD - Accessible Text Hiding
**Learning:** When hiding button text on mobile to save space, using display: none removes the text from the accessibility tree. Instead, use visually hidden CSS (position: absolute, clip, etc.) so screen readers can still read the text.
**Action:** Always prefer visually-hidden CSS patterns over display: none when hiding informative text for responsive layouts.
