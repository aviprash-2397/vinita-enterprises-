const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// Replace the problematic query in loadAnalytics
content = content.replace(
  "order_items(quantity,rate,products(name,sku,category,companies(name)))",
  "order_items(quantity,rate,products(name,sku))"
);

// Also replace in loadAdminOrders just in case the same crash happens there!
content = content.replace(
  "order_items(quantity,bonus_quantity,rate,products(name,sku,mrp,pack_size,category,companies(name)))",
  "order_items(quantity,bonus_quantity,rate,products(name,sku))"
);

// Add error logging so we can see what went wrong in console next time
content = content.replace(
  "if(resOrders.error) { el.innerHTML='Error loading analytics'; return; }",
  "if(resOrders.error) { el.innerHTML='Error loading analytics: '+resOrders.error.message; console.error(resOrders.error); return; }"
);

fs.writeFileSync('index.html', content);
