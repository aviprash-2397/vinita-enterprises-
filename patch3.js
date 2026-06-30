const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const searchRegex = /document\.getElementById\('col-summary'\)\.innerHTML=`<div class="date-summary">[\s\S]*?<\/div>\n  <\/div>`;/;

const replaceString = `
  // --- DAILY SALESMAN COLLECTION SUMMARY ---
  // Group collections (cash/upi) by salesman
  const smCash = {};
  rows.forEach(c => {
    if(!c.salesman_id) return;
    if(!smCash[c.salesman_id]) smCash[c.salesman_id] = { name: c.salesmen?.name || 'Unknown', cash: 0, credit: 0, items: [] };
    smCash[c.salesman_id].cash += Number(c.amount || 0);
    smCash[c.salesman_id].items.push({ type: 'cash', retailer: c.retailers?.name, amount: Number(c.amount), mode: c.mode, date: c.collected_at });
  });

  // Group credit from orders (status='delivered', payment_term='credit') for the same date range
  const creditOrders = (S.adminOrders||[]).filter(o => {
    if(o.status !== 'delivered' || o.payment_term !== 'credit') return false;
    if(!range.from && !range.to) return true;
    const d = toYMD(new Date(o.delivery_date || o.order_date));
    if(range.from && d < range.from) return false;
    if(range.to && d > range.to) return false;
    return true;
  });

  creditOrders.forEach(o => {
    const sid = o.salesman_id;
    if(!sid) return;
    if(!smCash[sid]) smCash[sid] = { name: o.salesmen?.name || 'Unknown', cash: 0, credit: 0, items: [] };
    const tot = (o.order_items||[]).reduce((s,i)=>s+(i.quantity*(i.rate||0)),0);
    smCash[sid].credit += tot;
    smCash[sid].items.push({ type: 'credit', retailer: o.retailers?.name, amount: tot, mode: 'Credit ('+o.credit_period_days+'d)', date: o.delivery_date || o.order_date });
  });

  const smList = Object.values(smCash).sort((a,b) => (b.cash+b.credit) - (a.cash+a.credit));
  let smHtml = '';
  if(smList.length) {
    smHtml = '<div style="margin-top:16px;font-size:13px;font-weight:600;color:var(--mu);margin-bottom:8px">Collection by Salesman</div>';
    smHtml += smList.map(sm => \`<div class="sc-card" onclick='openSalesmanColModal(\${JSON.stringify(sm).replace(/'/g, "&apos;")})' style="background:var(--surface);border:1px solid var(--bd);border-radius:12px;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;cursor:pointer">
      <div style="font-weight:600">\${esc(sm.name)}</div>
      <div style="display:flex;gap:12px;font-size:13px">
        <span style="color:#22c55e">Cash/UPI: \${fmtMoneyCompact(sm.cash)}</span>
        <span style="color:#f43f5e">Credit: \${fmtMoneyCompact(sm.credit)}</span>
        <span style="color:var(--mu)">›</span>
      </div>
    </div>\`).join('');
  }

  document.getElementById('col-summary').innerHTML=\`<div class="date-summary">
    <div class="ds-left">
      <div class="ds-range">\${esc(range.label)}</div>
      <div class="ds-revenue">\${fmtMoney(total)}</div>
      \${modeList.length?\`<div style="font-size:11px;color:var(--mu);margin-top:6px;font-weight:500">\${modeList.map(([m,v])=>\`<span style="margin-right:10px"><strong style="color:var(--tx)">\${PAYMENT_MODES.find(p=>p.key===m)?.label||m}:</strong> \${fmtMoneyCompact(v)}</span>\`).join('')}</div>\`:-''}
    </div>
    <div class="ds-right">
      <div class="ds-stat">
        <div class="ds-stat-item"><div class="ds-stat-v">\${count}</div><div class="ds-stat-l">Receipts</div></div>
      </div>
    </div>
  </div>\${smHtml}\`;`;

if(searchRegex.test(content)) {
  content = content.replace(searchRegex, replaceString);
} else {
  console.log("Could not find searchRegex for col-summary");
}

const search2 = "function renderCollectionsList(arr){";
const replace2 = `function openSalesmanColModal(sm) {
  document.getElementById('modal-title').textContent = sm.name + ' - Collections';
  const items = sm.items.sort((a,b) => new Date(b.date) - new Date(a.date));
  let html = items.map(i => \`<div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--border)">
    <div>
      <div style="font-weight:600;font-size:14px">\${esc(i.retailer)}</div>
      <div style="font-size:12px;color:var(--mu);margin-top:2px;text-transform:capitalize">\${esc(i.mode)} · \${fmtDateShort(i.date)}</div>
    </div>
    <div style="font-weight:700;color:\${i.type==='cash'?'#22c55e':'#f43f5e'}">\${fmtMoney(i.amount)}</div>
  </div>\`).join('');
  if(!html) html = '<div class="no-data">No data</div>';
  document.getElementById('modal-body').innerHTML = \`<div style="padding:16px">\${html}</div>\`;
  document.getElementById('modal').classList.add('show');
}

function renderCollectionsList(arr){`;

if(content.includes(search2)) {
  content = content.replace(search2, replace2);
} else {
  console.log("Could not find search2");
}

fs.writeFileSync('index.html', content);
console.log('Patch3 complete.');
