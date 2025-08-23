# Browser Extensions

This directory contains browser extensions converted from Tampermonkey scripts.

## Structure

Each extension has its own directory with the following structure:
```
extensions/
  ├── extension-name/
  │   ├── manifest.json
  │   ├── content.js
  │   └── icons/
  │       └── icon-48.png
```

## Building Extensions

1. Run `npm run build` to compile TypeScript to JavaScript
2. Copy the compiled JS file to the respective extension directory as `content.js`
3. Load the extension in your browser in developer mode

## Loading in Browser

1. Open Chrome/Edge and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked" and select the extension directory
