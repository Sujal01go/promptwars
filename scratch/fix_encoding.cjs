const fs = require('fs');
const path = require('path');

const files = [
  path.join(__dirname, 'src', 'constants.js'),
  path.join(__dirname, 'src', 'App.jsx')
];

const fixes = [
  { from: /ðŸ‡¬ðŸ‡§/g, to: '🇬🇧' },
  { from: /ðŸ‡®ðŸ‡³/g, to: '🇮🇳' },
  { from: /ðŸŒ /g, to: '🌐' },
  { from: /â–¼/g, to: '▼' },
  { from: /âœ✓/g, to: '✓' },
  { from: /âœ“/g, to: '✓' },
  { from: /âœ✧/g, to: '✧' },
  { from: /ðŸ ›ï¸/g, to: '🏛️' },
  { from: /ðŸ ¦/g, to: '🏛️' },
  { from: /ðŸ‘‘/g, to: '👑' },
  { from: /ðŸ—³ï¸/g, to: '🗳️' },
  { from: /ðŸ ¢/g, to: '🏛️' },
  { from: /ðŸ—ºï¸/g, to: '🗺️' },
  { from: /ðŸ“‹/g, to: '📋' },
  { from: /ðŸ“£/g, to: '📢' },
  { from: /âš¡/g, to: '⚡' },
  { from: /ðŸ“Š/g, to: '📊' },
  { from: /ï¼‹/g, to: '+' },
  { from: /â€“/g, to: '—' },
  { from: /â€”/g, to: '—' },
  { from: /â€¢/g, to: '•' },
  { from: /â”€/g, to: '─' },
  { from: /â€¦/g, to: '…' }
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  fixes.forEach(fix => {
    content = content.replace(fix.from, fix.to);
  });
  fs.writeFileSync(file, content, 'utf8');
  console.log(`Fixed ${file}`);
});
