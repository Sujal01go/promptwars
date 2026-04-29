const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'App.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Fix MapChart prop
content = content.replace('<MapChart STATE_RULINGS={STATE_RULINGS} />', '<MapChart stateRulings={STATE_RULINGS} />');

// Fix Rules icon crash
const rulesIconSearch = 'const Icon = rule.icon;';
const rulesIconReplace = 'const Icon = rule.icon || AlertCircle;';
content = content.replace(rulesIconSearch, rulesIconReplace);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed App.jsx navigation and icon crashes');
