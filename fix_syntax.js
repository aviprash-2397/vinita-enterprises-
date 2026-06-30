const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');
content = content.replace(
  "el.innerHTML='<div class=\"empty\"><div class=\"ei\">${ico('cash',24)}</div><div class=\"empty-title\">No collections found</div></div>';",
  "el.innerHTML=`<div class=\"empty\"><div class=\"ei\">${ico('cash',24)}</div><div class=\"empty-title\">No collections found</div></div>`;"
);
fs.writeFileSync('index.html', content);
