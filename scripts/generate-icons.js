const fs = require('fs');
const path = require('path');

// Extension IDs to generate icons for
const extensionIds = [
  'bing-ad-blocker',
  'youtube-ad-remover',
  'tvdb-scraper',
  'ksl-comments-blacklist',
  'ksl-sponsored-remover',
  'search-blacklist',
  'billboard-overlay-remover',
  'bing-quiz-clicker'
];

// Colors for different extensions
const colors = [
  '#4285F4', // Blue
  '#EA4335', // Red
  '#FBBC05', // Yellow
  '#34A853', // Green
  '#673AB7', // Purple
  '#FF5722'  // Deep Orange
];

// Create SVG icon with text
function createSvgIcon(initials, color, size = 128) {
  const fontSize = Math.round(size * 0.4);
  const yPos = size * 0.6;
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="${color}" />
  <text x="50%" y="${yPos}" 
        font-family="Arial, sans-serif" 
        font-size="${fontSize}" 
        font-weight="bold" 
        fill="#FFFFFF" 
        text-anchor="middle" 
        dominant-baseline="middle">
    ${initials}
  </text>
</svg>`;
}

// Generate icons for all extensions
extensionIds.forEach((id, index) => {
  const extName = id.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
  
  const iconsDir = path.join(__dirname, '..', 'extensions', id, 'icons');
  
  // Create icons directory if it doesn't exist
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }
  
  // Get first letter of each word (max 2 letters)
  const initials = extName
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
  
  // Generate icons in different sizes
  const sizes = [16, 48, 128];
  sizes.forEach(size => {
    const svgContent = createSvgIcon(initials, colors[index % colors.length], size);
    fs.writeFileSync(path.join(iconsDir, `icon-${size}.svg`), svgContent);
  });
  
  console.log(`Generated icons for: ${extName}`);
});

console.log('\nAll icons generated successfully!');
console.log('Icons have been created as SVG files in each extension\'s icons/ directory.');
