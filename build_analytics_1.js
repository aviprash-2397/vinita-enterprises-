const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const analyticsHtml = `<div id="at-analytics" class="ct" style="display:none; padding-bottom:100px;">
  <div style="font-size:22px; font-weight:700; margin-bottom:16px;">Analytics Engine</div>
  <div class="filter-label">Date Range</div>
  <div class="fc" id="analytics-date-filters" style="margin-bottom:20px">
    <div class="chip" data-key="today" onclick="filterAnalytics('today',this)">Today</div>
    <div class="chip" data-key="thisWeek" onclick="filterAnalytics('thisWeek',this)">This Week</div>
    <div class="chip" data-key="last7" onclick="filterAnalytics('last7',this)">Last 7 Days</div>
    <div class="chip" data-key="thisMonth" onclick="filterAnalytics('thisMonth',this)">This Month</div>
    <div class="chip active" data-key="all" onclick="filterAnalytics('all',this)">All Time</div>
  </div>

  <!-- Trends / Line Graph -->
  <div class="rcard" style="display:block; padding:16px; margin-bottom:16px; cursor:default; background:var(--surface);">
    <div style="font-size:16px; font-weight:600; margin-bottom:10px;">Sales & Forecast Trends</div>
    <div id="chart-line-trends"></div>
  </div>

  <div style="display:grid; grid-template-columns: 1fr; gap:16px; margin-bottom:16px;">
    <!-- Payment Modes / Donut -->
    <div class="rcard" style="display:block; padding:16px; cursor:default; background:var(--surface);">
      <div style="font-size:16px; font-weight:600; margin-bottom:10px;">Payment Modes</div>
      <div id="chart-donut-payment"></div>
    </div>
    
    <!-- Top Salesmen / Bar -->
    <div class="rcard" style="display:block; padding:16px; cursor:default; background:var(--surface);">
      <div style="font-size:16px; font-weight:600; margin-bottom:10px;">Top Salesmen (by Area)</div>
      <div id="chart-bar-salesmen"></div>
    </div>
  </div>

  <!-- Treemap -->
  <div class="rcard" style="display:block; padding:16px; margin-bottom:16px; cursor:default; background:var(--surface); overflow-x:auto;">
    <div style="font-size:16px; font-weight:600; margin-bottom:10px;">Company Share (Treemap)</div>
    <div id="chart-treemap-company" style="min-width:400px;"></div>
  </div>

  <!-- Heatmap -->
  <div class="rcard" style="display:block; padding:16px; margin-bottom:16px; cursor:default; background:var(--surface); overflow-x:auto;">
    <div style="font-size:16px; font-weight:600; margin-bottom:10px;">Product Demand Heatmap</div>
    <div id="chart-heatmap-products" style="min-width:500px;"></div>
  </div>

  <!-- Scatter Plot -->
  <div class="rcard" style="display:block; padding:16px; margin-bottom:16px; cursor:default; background:var(--surface);">
    <div style="font-size:16px; font-weight:600; margin-bottom:10px;">Order Size vs Credit Period</div>
    <div id="chart-scatter-credit"></div>
  </div>

  <!-- Histogram -->
  <div class="rcard" style="display:block; padding:16px; margin-bottom:16px; cursor:default; background:var(--surface);">
    <div style="font-size:16px; font-weight:600; margin-bottom:10px;">Order Size Distribution</div>
    <div id="chart-hist-orders"></div>
  </div>
</div>`;

// Replace old HTML tabs
if(content.includes('<div id="at-reports" class="ct" style="display:none"><div id="reports-content"></div></div>')) {
  const tSearch = '<div id="at-reports" class="ct" style="display:none"><div id="reports-content"></div></div>\n  <div id="at-forecasts" class="ct" style="display:none"><div id="forecasts-content" style="padding:16px 0"></div></div>';
  content = content.replace(tSearch, analyticsHtml);
} else {
  // If it's already there or slightly different
  console.log("HTML tabs not found exactly, using regex");
  content = content.replace(/<div id="at-reports"[\s\S]*?at-forecasts"[\s\S]*?<\/div>\s*<\/div>/, analyticsHtml);
}

// Replace the tab buttons
const tabBtnSearch = `<div class="tab" onclick="switchAdminTab('reports',this)">Reports</div>
    <div class="tab" onclick="switchAdminTab('forecasts',this)">Forecasts</div>`;
if(content.includes(tabBtnSearch)) {
  content = content.replace(tabBtnSearch, `<div class="tab" onclick="switchAdminTab('analytics',this)">Analytics</div>`);
}

// Replace switchAdminTab logic
const swSearch = `['orders','collections','reports','forecasts','manage'].forEach(t=>document.getElementById('at-'+t).style.display=t===tab?'block':'none');
  if(tab==='collections')loadCollections();
  if(tab==='reports')loadReports();
  if(tab==='forecasts')loadForecasts();
  if(tab==='manage')loadManage();`;
const swReplace = `['orders','collections','analytics','manage'].forEach(t=>document.getElementById('at-'+t).style.display=t===tab?'block':'none');
  if(tab==='collections')loadCollections();
  if(tab==='analytics')loadAnalytics();
  if(tab==='manage')loadManage();`;

if(content.includes(swSearch)) {
  content = content.replace(swSearch, swReplace);
}

fs.writeFileSync('index.html', content);
console.log('HTML layout injected');
