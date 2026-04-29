const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'App.jsx');
let lines = fs.readFileSync(filePath, 'utf8').split('\n');

// Line 364 (index 363)
lines[363] = '                <span>🌐</span>';
// Line 366 (index 365)
lines[365] = '                <span style={{ fontSize: ' + "'0.6rem'" + ', opacity: 0.7 }}>▼</span>';

// Guide Tab Section
for (let i = 700; i < 900; i++) {
  if (lines[i]) {
    lines[i] = lines[i].replace(/ðŸ ›ï¸/g, '🏛️')
                     .replace(/ðŸ ¦/g, '🏛️')
                     .replace(/ðŸ‘‘/g, '👑')
                     .replace(/ðŸ—³ï¸/g, '🗳️')
                     .replace(/ðŸ ¢/g, '🏛️')
                     .replace(/ðŸ—ºï¸/g, '🗺️')
                     .replace(/ðŸ“‹/g, '📋')
                     .replace(/ðŸ“£/g, '📢')
                     .replace(/âš¡/g, '⚡')
                     .replace(/ðŸ“Š/g, '📊')
                     .replace(/â€“/g, '—')
                     .replace(/â€”/g, '—')
                     .replace(/ï¼‹/g, '+');
  }
}

// Global fixes
for (let i = 0; i < lines.length; i++) {
  lines[i] = lines[i].replace(/âœ“/g, '✓')
                     .replace(/â€”/g, '—')
                     .replace(/â€¢/g, '•');
}

fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
console.log('Fixed App.jsx');
