const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// Change const commonOptions = { ... } to const common = { ... }
content = content.replace("const commonOptions = {", "const common = {");

fs.writeFileSync('index.html', content);
