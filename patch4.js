const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

content = content.replace(
  '  </div>`;\n}\n\nfunction renderCollectionsList(rows){',
  '  </div>${smHtml}`;\n}\n\nfunction openSalesmanColModal(sm) {\n  document.getElementById(\'modal-title\').textContent = sm.name + \' - Collections\';\n  const items = sm.items.sort((a,b) => new Date(b.date) - new Date(a.date));\n  let html = items.map(i => `<div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--border)">\n    <div>\n      <div style="font-weight:600;font-size:14px">${esc(i.retailer)}</div>\n      <div style="font-size:12px;color:var(--mu);margin-top:2px;text-transform:capitalize">${esc(i.mode)} · ${fmtDateShort(i.date)}</div>\n    </div>\n    <div style="font-weight:700;color:${i.type===\'cash\'?\'#22c55e\':\'#f43f5e\'}">${fmtMoney(i.amount)}</div>\n  </div>`).join(\'\');\n  if(!html) html = \'<div class="no-data">No data</div>\';\n  document.getElementById(\'modal-body\').innerHTML = `<div style="padding:16px">${html}</div>`;\n  document.getElementById(\'modal\').classList.add(\'show\');\n}\n\nfunction renderCollectionsList(rows){'
);

fs.writeFileSync('index.html', content);
