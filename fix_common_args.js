const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// Replace all instances where commonOptions is passed to render functions with common
content = content.replace(/, commonOptions\)/g, ', common)');

fs.writeFileSync('index.html', content);
console.log('Fixed commonOptions reference to common');
