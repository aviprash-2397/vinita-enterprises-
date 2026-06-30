const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// 1. Add "Collections" button in Salesman home top right header
const search1 = `<button class="hd-btn" onclick="gotoPage('pg-order-history')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:4px"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/></svg>History</button>`;
const replace1 = `<button class="hd-btn" style="margin-right:8px" onclick="loadSalesmanCollections()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:4px"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 10v.01M18 14v.01"/></svg>Collect</button>\n    <button class="hd-btn" onclick="gotoPage('pg-order-history')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:4px"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/></svg>History</button>`;

if(content.includes(search1)) {
  content = content.replace(search1, replace1);
} else {
  console.log("Could not find search1");
}

// 2. Add pg-salesman-collections UI
const search2 = `<div id="pg-select-retailer" class="pg">`;
const replace2 = `<div id="pg-salesman-collections" class="pg">
  <div class="hd">
    <button class="hd-back" onclick="gotoPage('pg-salesman-home')">←</button>
    <div class="hd-title"><div>My Collections</div><div class="hd-sub">Summary & History</div></div>
  </div>
  <div class="ct">
    <div id="sm-col-stats" class="sg" style="margin-bottom:16px"></div>
    <div class="filter-label">Date</div>
    <div class="fc" id="sm-col-date-filters">
      <div class="chip active" data-key="today" onclick="filterSmCollectionsByDate('today',this)">Today</div>
      <div class="chip" data-key="yesterday" onclick="filterSmCollectionsByDate('yesterday',this)">Yesterday</div>
      <div class="chip" data-key="thisWeek" onclick="filterSmCollectionsByDate('thisWeek',this)">This Week</div>
      <div class="chip" data-key="last7" onclick="filterSmCollectionsByDate('last7',this)">Last 7 Days</div>
      <div class="chip" data-key="thisMonth" onclick="filterSmCollectionsByDate('thisMonth',this)">This Month</div>
      <div class="chip" data-key="all" onclick="filterSmCollectionsByDate('all',this)">All Time</div>
    </div>
    <div id="sm-col-summary"></div>
    <div id="sm-collections-list"></div>
  </div>
</div>

<div id="pg-select-retailer" class="pg">`;

if(content.includes(search2)) {
  content = content.replace(search2, replace2);
} else {
  console.log("Could not find search2");
}

// 3. Add JS functions for Salesman Collections
const search3 = `function filterCollectionsByDate(key,el){`;
const replace3 = `// --- SALESMAN COLLECTIONS ---
async function loadSalesmanCollections(){
  gotoPage('pg-salesman-collections');
  document.getElementById('sm-collections-list').innerHTML=skeletonList();
  
  // Fetch collections
  const p1 = db.from('collections')
    .select('*, retailers(name,area)')
    .eq('salesman_id', S.salesman.id)
    .order('collected_at',{ascending:false});
    
  // Fetch credit orders
  const p2 = db.from('orders')
    .select('*, retailers(name), order_items(quantity,rate)')
    .eq('salesman_id', S.salesman.id)
    .eq('status', 'delivered')
    .eq('payment_term', 'credit');
    
  const [resCol, resOrd] = await Promise.all([p1, p2]);
  
  S.smCollections = resCol.data || [];
  S.smCreditOrders = resOrd.data || [];
  
  // Overall Cash Stats
  const today=toYMD(new Date());
  const wkStart=(()=>{const m=new Date();const dow=m.getDay()||7;m.setDate(m.getDate()-(dow-1));m.setHours(0,0,0,0);return m;})();
  const moStart=new Date(new Date().getFullYear(),new Date().getMonth(),1);
  const tot={today:0,week:0,month:0,all:0};
  S.smCollections.forEach(c=>{
    const d=new Date(c.collected_at);const amt=Number(c.amount||0);
    tot.all+=amt;
    if(d>=moStart)tot.month+=amt;
    if(d>=wkStart)tot.week+=amt;
    if(toYMD(d)===today)tot.today+=amt;
  });
  
  document.getElementById('sm-col-stats').innerHTML=\`
    <div class="sc"><div class="sc-icon">\${ico('cash',16)}</div><div class="sv" style="font-size:22px">\${fmtMoneyCompact(tot.today)}</div><div class="sl">Today</div></div>
    <div class="sc"><div class="sc-icon">\${ico('chart',16)}</div><div class="sv" style="font-size:22px">\${fmtMoneyCompact(tot.week)}</div><div class="sl">This Week</div></div>
    <div class="sc"><div class="sc-icon">\${ico('dollar',16)}</div><div class="sv" style="font-size:22px">\${fmtMoneyCompact(tot.month)}</div><div class="sl">This Month</div></div>
  \`;
  applySmCollectionFilters();
}

function filterSmCollectionsByDate(key,el){
  document.querySelectorAll('#sm-col-date-filters .chip').forEach(c=>c.classList.remove('active'));
  if(el)el.classList.add('active');
  S.smColDateFilter=key;
  applySmCollectionFilters();
}

function applySmCollectionFilters(){
  const range=getDateRange(S.smColDateFilter||'today');
  
  // Filter cash
  let cashArr=S.smCollections.filter(c=>{
    if(!range.from&&!range.to)return true;
    const d=toYMD(new Date(c.collected_at));
    if(range.from&&d<range.from)return false;
    if(range.to&&d>range.to)return false;
    return true;
  });
  
  // Filter credit
  let creditArr=S.smCreditOrders.filter(o=>{
    if(!range.from&&!range.to)return true;
    const d=toYMD(new Date(o.delivery_date||o.order_date));
    if(range.from&&d<range.from)return false;
    if(range.to&&d>range.to)return false;
    return true;
  });

  const totCash = cashArr.reduce((s,c)=>s+Number(c.amount||0),0);
  const totCredit = creditArr.reduce((s,o)=>{
    const ot=(o.order_items||[]).reduce((ss,i)=>ss+(i.quantity*(i.rate||0)),0);
    return s+ot;
  },0);

  document.getElementById('sm-col-summary').innerHTML=\`<div class="date-summary">
    <div class="ds-left">
      <div class="ds-range">\${esc(range.label)}</div>
      <div class="ds-revenue" style="font-size:20px">\${fmtMoney(totCash+totCredit)}</div>
      <div style="font-size:12px;color:var(--mu);margin-top:6px;font-weight:500">
        <span style="margin-right:12px"><span style="color:#22c55e">Cash/UPI:</span> \${fmtMoney(totCash)}</span>
        <span><span style="color:#f43f5e">Credit:</span> \${fmtMoney(totCredit)}</span>
      </div>
    </div>
  </div>\`;
  
  // Merge items for list
  const listItems = [];
  cashArr.forEach(c=>{
    listItems.push({type:'cash', retailer:c.retailers?.name, amount:Number(c.amount), mode:c.mode, date:c.collected_at});
  });
  creditArr.forEach(o=>{
    const ot=(o.order_items||[]).reduce((ss,i)=>ss+(i.quantity*(i.rate||0)),0);
    listItems.push({type:'credit', retailer:o.retailers?.name, amount:ot, mode:'Credit ('+o.credit_period_days+'d)', date:o.delivery_date||o.order_date});
  });
  
  listItems.sort((a,b)=>new Date(b.date)-new Date(a.date));
  
  const el=document.getElementById('sm-collections-list');
  if(!listItems.length){
    el.innerHTML='<div class="empty"><div class="ei">\${ico('cash',24)}</div><div class="empty-title">No collections found</div></div>';
    return;
  }
  
  el.innerHTML = listItems.map(i => \`<div class="oc">
    <div class="oh" style="margin-bottom:0">
      <div>
        <div style="font-weight:600;font-size:14px;color:var(--tx)">\${esc(i.retailer)}</div>
        <div class="om" style="margin-top:2px;text-transform:capitalize">\${esc(i.mode)} · \${fmtDateShort(i.date)}</div>
      </div>
      <div style="font-weight:700;color:\${i.type==='cash'?'#22c55e':'#f43f5e'}">\${fmtMoney(i.amount)}</div>
    </div>
  </div>\`).join('');
}

function filterCollectionsByDate(key,el){`;

if(content.includes(search3)) {
  content = content.replace(search3, replace3);
} else {
  console.log("Could not find search3");
}

fs.writeFileSync('index.html', content);
console.log('Patch5 complete.');
