const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// The file now has:
// const theme = { mode: 'dark' };
// const theme = { mode: 'dark' };
// We will replace both with a single one.

content = content.replace("const theme = { mode: 'dark' };\n  const theme = { mode: 'dark' };", "const theme = { mode: 'dark' };");

fs.writeFileSync('index.html', content);
