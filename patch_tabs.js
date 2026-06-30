const fs = require('fs');

let content = fs.readFileSync('index.html', 'utf8');

// 1. Replace tabs
content = content.replace(
  `<div class="tab" onclick="switchAdminTab('reports',this)">Reports</div>\n    <div class="tab" onclick="switchAdminTab('forecasts',this)">Forecasts</div>`,
  `<div class="tab" onclick="switchAdminTab('analytics',this)">Analytics</div>`
);

// 2. Replace tab contents
content = content.replace(
  `<div id="at-reports" class="ct" style="display:none"><div id="reports-content"></div></div>\n  <div id="at-forecasts" class="ct" style="display:none"><div id="forecasts-content" style="padding:16px 0"></div></div>`,
  `<div id="at-analytics" class="ct" style="display:none">\n    <div style="padding:40px 20px;text-align:center;color:var(--mu)">\n      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom:15px;opacity:0.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.29 7 12 12 20.71 7"></polyline><line x1="12" y1="22" x2="12" y2="12"></line></svg>\n      <h3 style="font-size:18px;color:#fff;margin-bottom:8px">Analytics Engine Pending</h3>\n      <p style="font-size:14px;max-width:400px;margin:0 auto;line-height:1.5">The comprehensive Business Intelligence and Predictive Forecasting module will be deployed here by Antigravity.</p>\n    </div>\n  </div>`
);

// 3. Replace switchAdminTab logic
content = content.replace(
  `['orders','collections','reports','forecasts','manage'].forEach(t=>document.getElementById('at-'+t).style.display=t===tab?'block':'none');\n  if(tab==='collections')loadCollections();\n  if(tab==='reports')loadReports();\n  if(tab==='forecasts')loadForecasts();\n  if(tab==='manage')loadManage();`,
  `['orders','collections','analytics','manage'].forEach(t=>document.getElementById('at-'+t).style.display=t===tab?'block':'none');\n  if(tab==='collections')loadCollections();\n  if(tab==='manage')loadManage();`
);

fs.writeFileSync('index.html', content);
console.log('Patch complete.');
