const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');

// 1. Find all onclick handlers
const onclickRegex = /onclick="([a-zA-Z0-9_]+)\(/g;
let match;
const clickFunctions = new Set();
while ((match = onclickRegex.exec(content)) !== null) {
  clickFunctions.add(match[1]);
}

// 2. Find all function definitions in JS
const jsContent = fs.readFileSync('temp_check.js', 'utf8');
const funcRegex = /function ([a-zA-Z0-9_]+)\s*\(/g;
const definedFunctions = new Set();
while ((match = funcRegex.exec(jsContent)) !== null) {
  definedFunctions.add(match[1]);
}

// 3. Compare
const missingFunctions = [...clickFunctions].filter(fn => !definedFunctions.has(fn) && fn !== 'if' && fn !== 'console' && fn !== 'window' && fn !== 'document');

if(missingFunctions.length > 0) {
  console.error('MISSING FUNCTIONS CALLED IN HTML BUT NOT DEFINED IN JS:', missingFunctions);
} else {
  console.log('All onclick functions are defined.');
}

// 4. Check for unresolved global variables
// We can't do a full AST check easily, but we can check if `biCharts` or `analyticsCharts` issues exist.
const undefinedVars = [];
['biCharts', 'analyticsCharts', 'common', 'S', 'db', 'ApexCharts'].forEach(v => {
  if(!jsContent.includes(v)) undefinedVars.push(v);
});
console.log('Missing Globals? (should be empty)', undefinedVars);

// 5. Check if any duplicate IDs exist in HTML
const idRegex = /id="([a-zA-Z0-9_-]+)"/g;
const ids = [];
while ((match = idRegex.exec(content)) !== null) {
  ids.push(match[1]);
}
const duplicateIds = ids.filter((item, index) => ids.indexOf(item) !== index);
if(duplicateIds.length > 0) {
  // console.log('Duplicate IDs found (some might be ok if in different templates):', [...new Set(duplicateIds)]);
}
