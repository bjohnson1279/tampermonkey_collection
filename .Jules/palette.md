## YYYY-MM-DD - Responsive Keyboard Shortcuts & Touch Targets
**Learning:** When injecting floating action buttons (FABs) with keyboard shortcut hints (<kbd>), the shortcut text adds visual clutter on mobile devices where physical keyboards are rarely used. Furthermore, default padding often creates touch targets below the WCAG 44x44px minimum for mobile.
**Action:** Always include a mobile CSS media query (@media (max-width: 768px)) to hide <kbd> shortcut hints and explicitly enforce min-height: 44px on interactive elements.
