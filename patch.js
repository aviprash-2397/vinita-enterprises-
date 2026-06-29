const fs = require('fs');

let content = fs.readFileSync('index.html', 'utf8');

const oldRender = /function renderAdminOrders\(orders\)\{.*?el\.innerHTML=sortedDates\.map\(date=>\{.*?\}\)\.join\(''\);\}/s;
const newRender = `function renderAdminOrders(orders){
  const el=document.getElementById('admin-orders-list');
  try {
    if(!orders.length){el.innerHTML='<div class="empty"><div class="ei"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/></svg></div><div class="empty-title">No orders found</div><div class="empty-sub">Try a different filter, date range, or search.</div></div>';return;}
    const showGroups=['thisWeek','last7','thisMonth','lastMonth','all','custom'].includes(S.dateFilter);
    const cardHtml=o=>{
      const tot=Math.round((o.order_items||[]).reduce((s,i)=>s+(i.quantity*(i.rate||0)),0));
      const status=(o.status||'placed').toLowerCase().trim();
      const checked=S.selectedOrders&&S.selectedOrders.has(o.id)?'checked':'';
      return\`<div class="oc" style="cursor:pointer">
        <input type="checkbox" class="oc-check" \${checked} onclick="event.stopPropagation();toggleOrderSelect('\${o.id}')" aria-label="Select order">
        <div onclick="openOrderDetail('\${o.id}')">
        <div class="oh">
          <div><div class="on">\${fmtOrd(o.order_number)}</div><div class="om">\${ico('user',13)} <span style="vertical-align:1px">\${esc(o.salesmen?.name||'-')}</span>   \${ico('shop',13)} <span style="vertical-align:1px">\${esc(o.retailers?.name||'-')}</span></div>\${!showGroups?\`<div class="om">\${fmtDate(o.order_date)}\${o.delivery_date?'  Deliver: '+fmtDateShort(o.delivery_date):''}</div>\`:\`\${o.delivery_date?'<div class="om">Deliver by '+fmtDateShort(o.delivery_date)+'</div>':''}\`}</div>
          <span class="badge b-\${status}">\${statusLabel(status)}</span>
        </div>
        \${(o.order_items||[]).slice(0,2).map(i=>{let t=\`\${i.quantity} pcs\`;if(i.bonus_quantity>0)t+=\` <span style="color:var(--or);font-size:11px">(+\${i.bonus_quantity} free)</span>\`;return\`<div class="oi-row"><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">\${esc(i.products?.name||'')}</span><span style="flex-shrink:0">\${t} @ ₹\${i.rate||0}</span></div>\`;}).join('')}
        \${(o.order_items||[]).length>2?\`<div style="font-size:12px;color:var(--mu);margin-top:2px;font-weight:500">+ \${o.order_items.length-2} more</div>\`:-''}
        <div style="font-size:15px;font-weight:700;margin:10px 0 4px;letter-spacing:-0.015em">Total: <span style="color:var(--or)">\${fmtMoney(tot)}</span></div>
        <div class="of">
          <span class="badge b-\${o.payment_term}">\${esc(o.payment_term)}\${o.payment_term==='credit'?' ('+o.credit_period_days+'d)':''}</span>
          <span class="badge b-\${(o.payments?.[0]?.status||'unpaid').toLowerCase().trim()}">\${o.payments?.[0]?.status==='paid'?'Paid':'Unpaid'}</span>
          <span style="font-size:11.5px;color:var(--mu);margin-left:auto;font-weight:600">Tap to manage ›</span>
        </div></div></div>\`;
    };
    if(!showGroups){el.innerHTML=orders.map(cardHtml).join('');return;}
    const groups={};
    orders.forEach(o=>{const k=normalizeOrderDate(o.order_date)||'unknown';(groups[k]=groups[k]||[]).push(o);});
    const sortedDates=Object.keys(groups).sort((a,b)=>b.localeCompare(a));
    el.innerHTML=sortedDates.map(date=>{
      const g=groups[date];
      let dayTitle=date;
      if(date!=='unknown'){
        const d=new Date(date);
        if(!isNaN(d)){
          const diff=Math.floor((startOfDay(new Date())-startOfDay(d))/86400000);
          if(diff===0)dayTitle='Today';
          else if(diff===1)dayTitle='Yesterday';
          else dayTitle=d.toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'});
        }
      }
      return \`<div class="date-header" style="padding:10px 15px;background:var(--bg);color:var(--mu);font-size:12.5px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;position:sticky;top:0;z-index:10;border-bottom:1px solid var(--border)">\${esc(dayTitle)} <span style="font-weight:500;text-transform:none;opacity:0.8">(\${g.length} order\${g.length!==1?'s':''})</span></div>\${g.map(cardHtml).join('')}\`;
    }).join('');
  } catch(e) {
    el.innerHTML = '<div class="err-bar">Render error: ' + esc(e.message) + '</div>';
    console.error(e);
  }
}`;

content = content.replace(oldRender, newRender);
fs.writeFileSync('index.html', content);
