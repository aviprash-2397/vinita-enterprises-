const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// Replace all instances of i.quantity*(i.rate||0) with parseFloat(i.quantity||0)*parseFloat(i.rate||0)
content = content.replace(/i\.quantity\*\(\(i\.rate\|\|0\)\)/g, '(parseFloat(i.quantity)||0)*(parseFloat(i.rate)||0)');
content = content.replace(/i\.quantity\s*\*\s*\(i\.rate\|\|0\)/g, '(parseFloat(i.quantity)||0)*(parseFloat(i.rate)||0)');

fs.writeFileSync('index.html', content);
console.log('Sanitized math in charts');
