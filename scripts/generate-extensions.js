const fs = require('fs');
const path = require('path');

// Extension configuration
const extensions = [
  {
    name: 'Bing Ad Blocker',
    id: 'bing-ad-blocker',
    description: 'Remove Bing Ads From News Feed',
    matches: ['https://www.bing.com/*'],
    contentScript: 'bingAdBlocker.js'
  },
  {
    name: 'YouTube Ad Remover',
    id: 'youtube-ad-remover',
    description: 'Remove ads from YouTube',
    matches: ['https://www.youtube.com/*'],
    contentScript: 'youtubeAdRemover.js'
  },
  {
    name: 'Bing Quiz Clicker',
    id: 'bing-quiz-clicker',
    description: 'Automatically click through Bing Entertainment Quiz',
    matches: ['https://www.bing.com/search?*'],
    contentScript: 'bingQuizClicker.js'
  },
  {
    name: 'TVDB Scraper',
    id: 'tvdb-scraper',
    description: 'Parse TV show data from TVDB',
    matches: ['https://thetvdb.com/series/*/allseasons/*'],
    contentScript: 'tvdbScraper.js'
  },
  {
    name: 'KSL Comments Blacklist',
    id: 'ksl-comments-blacklist',
    description: 'Filter comments by users on KSL',
    matches: ['https://www.ksl.com/article/*'],
    contentScript: 'kslCommentsHide.js'
  },
  {
    name: 'KSL Sponsored Remover',
    id: 'ksl-sponsored-remover',
    description: 'Remove sponsored content from KSL',
    matches: ['https://www.ksl.com/'],
    contentScript: 'kslSponsoredHide.js'
  },
  {
    name: 'Search Blacklist',
    id: 'search-blacklist',
    description: 'Block specific search terms',
    matches: [
      'https://www.bing.com/*',
      'https://www.google.com/*',
      'https://duckduckgo.com/*',
      'https://www.yahoo.com/*'
    ],
    contentScript: 'searchEngineFilter.js'
  },
  {
    name: 'Billboard Overlay Remover',
    id: 'billboard-overlay-remover',
    description: 'Remove overlays from Billboard charts',
    matches: ['https://www.billboard.com/charts/*'],
    contentScript: 'billboardOverlay.js'
  }
];

// Create directories and files for each extension
extensions.forEach(ext => {
  const extDir = path.join(__dirname, '..', 'extensions', ext.id);
  const iconsDir = path.join(extDir, 'icons');
  
  // Create directories
  [extDir, iconsDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // Create manifest.json
  const manifest = {
    manifest_version: 3,
    name: ext.name,
    version: '0.1.0',
    description: ext.description,
    author: 'Brent Johnson',
    icons: {
      '16': 'icons/icon-16.svg',
      '48': 'icons/icon-48.svg',
      '128': 'icons/icon-128.svg'
    },
    action: {
      default_icon: {
        '16': 'icons/icon-16.svg',
        '48': 'icons/icon-48.svg',
        '128': 'icons/icon-128.svg'
      },
      default_title: ext.name,
      default_popup: 'popup.html'
    },
    content_scripts: [
      {
        matches: ext.matches,
        js: ['content.js'],
        run_at: 'document_idle'
      }
    ],
    permissions: ['storage'],
    host_permissions: ext.matches
  };

  // Write manifest.json
  fs.writeFileSync(
    path.join(extDir, 'manifest.json'),
    JSON.stringify(manifest, null, 2)
  );

  // Copy content script
  const contentScriptPath = path.join(__dirname, '..', 'dist', ext.contentScript);
  if (fs.existsSync(contentScriptPath)) {
    fs.copyFileSync(contentScriptPath, path.join(extDir, 'content.js'));
  } else {
    console.warn(`Content script not found: ${contentScriptPath}`);
  }

  // Copy popup files
  const popupHtml = `<!DOCTYPE html>
<html>
<head>
  <title>${ext.name}</title>
  <style>
    body {
      width: 200px;
      padding: 10px;
      font-family: Arial, sans-serif;
    }
    h1 {
      font-size: 16px;
      color: #106ebe;
      margin: 0 0 10px 0;
    }
    p {
      font-size: 14px;
      margin: 5px 0;
    }
    .status {
      font-weight: bold;
      color: #0a0;
    }
  </style>
</head>
<body>
  <h1>${ext.name}</h1>
  <p>Status: <span id="status" class="status">Active</span></p>
  <p>${ext.description}</p>
  
  <script src="popup.js"></script>
</body>
</html>`;

  fs.writeFileSync(path.join(extDir, 'popup.html'), popupHtml);

  // Create default popup.js
  const popupJs = `// Update status in popup
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get(['isActive'], (result) => {
    const isActive = result.isActive !== false; // Default to true
    const statusElement = document.getElementById('status');
    if (statusElement) {
      statusElement.textContent = isActive ? 'Active' : 'Inactive';
      statusElement.style.color = isActive ? '#0a0' : '#a00';
    }
  });
});

document.addEventListener('click', (e) => {
  if (e.target && e.target.id === 'toggleButton') {
    chrome.storage.sync.get(['isActive'], (result) => {
      const newStatus = !(result.isActive !== false);
      chrome.storage.sync.set({ isActive: newStatus }, () => {
        const statusElement = document.getElementById('status');
        if (statusElement) {
          statusElement.textContent = newStatus ? 'Active' : 'Inactive';
          statusElement.style.color = newStatus ? '#0a0' : '#a00';
        }
        // Send message to content script to update its state
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
          if (tabs[0].id) {
            chrome.tabs.sendMessage(tabs[0].id, {action: 'toggle', isActive: newStatus});
          }
        });
      });
    });
  }
});`;

  fs.writeFileSync(path.join(extDir, 'popup.js'), popupJs);

  console.log(`Created extension: ${ext.name}`);
});

console.log('\nExtensions generated successfully!');
console.log('Next steps:');
console.log('1. Add icon files (icon-16.svg, icon-48.svg, icon-128.svg) to each extension\'s icons/ directory');
console.log('2. Load the extensions in Chrome/Edge by going to chrome://extensions/');
console.log('3. Enable "Developer mode" and click "Load unpacked" to load each extension');
