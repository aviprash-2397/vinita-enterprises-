const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');
const idRegex = /id="([a-zA-Z0-9_-]+)"/g;
const ids = [];
let match;
while ((match = idRegex.exec(content)) !== null) {
  ids.push(match[1]);
}
const duplicateIds = ids.filter((item, index) => ids.indexOf(item) !== index);
if(duplicateIds.length > 0) {
  console.log('Duplicate IDs found:', [...new Set(duplicateIds)]);
} else {
  console.log('No duplicate IDs.');
}
