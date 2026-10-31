# Browser Extensions

This directory contains browser extensions converted from Tampermonkey scripts.

## Structure

Each extension has its own directory with the following structure:

```
extensions/
  ├── extension-name/
  │   ├── manifest.json
  │   ├── content.js
  │   ├── popup.html
  │   ├── popup.js
  │   └── icons/
  │       ├── icon-16.svg
  │       ├── icon-48.svg
  │       └── icon-128.svg
```

## Building Extensions

1. Build all scripts and extensions automatically using pnpm:
    ```bash
    pnpm run generate:all
    ```
    Alternatively, you can compile and generate extensions in separate steps:
    ```bash
    pnpm run build
    pnpm run generate:extensions
    pnpm run generate:icons
    ```
2. The generated extensions will be populated in their respective folders in `extensions/` with compiled scripts, manifests, popup assets, and SVG icons.

## Loading in Browser

1. Open Chrome/Edge and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked" and select the extension directory (e.g. `extensions/bing-ad-blocker`)
