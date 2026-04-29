const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'App.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Fix Timeline icon crash
const timelineIconSearch = 'const Icon = event.icon;';
const timelineIconReplace = 'const Icon = event.icon || Calendar;';
content = content.replace(timelineIconSearch, timelineIconReplace);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed Election Timeline icon crash');
