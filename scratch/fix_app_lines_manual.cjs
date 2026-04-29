const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'App.jsx');
let lines = fs.readFileSync(filePath, 'utf8').split('\n');

const manualFixes = {
  761: '                  title: "🏛️ India\'s Democratic Foundation",',
  770: '                  title: "🏛️ Parliament of India",',
  780: '                  title: "👑 The President & Vice President",',
  789: '                  title: "🗳️ How the Prime Minister is Elected",',
  798: '                  title: "🏛️ State Governments & Legislatures",',
  808: '                  title: "🗺️ Electoral Constituencies",',
  816: '                  title: "📋 Political Parties & Alliances",',
  825: '                  title: "📢 The Election Commission of India (ECI)",',
  834: '                  title: "⚡ EVMs & the Voting Process",',
  844: '                  title: "📊 Counting & Results",'
};

Object.keys(manualFixes).forEach(lineNum => {
  lines[parseInt(lineNum) - 1] = manualFixes[lineNum];
});

fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
console.log('Applied manual line fixes to App.jsx');
