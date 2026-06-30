const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// The HTML for Analytics
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

// Replace at-reports with at-analytics
content = content.replace(/<div id="at-reports"[^>]*>[\s\S]*?<\/div>\s*<\/div>/, analyticsHtml);
// Erase at-forecasts entirely
content = content.replace(/<div id="at-forecasts"[^>]*>[\s\S]*?<\/div>\s*<\/div>/, '');

// Also ensure we didn't leave the old JS tabs (I see the user says they see BI Analytics and Forecast).
// I will just replace the specific tab lines.
content = content.replace(/<div class="tab" onclick="switchAdminTab\('reports',this\)">Reports<\/div>/, '<div class="tab" onclick="switchAdminTab(\'analytics\',this)">Analytics</div>');
content = content.replace(/<div class="tab" onclick="switchAdminTab\('forecasts',this\)">Forecasts<\/div>/, '');

// Switch logic
content = content.replace(/if\(tab==='reports'\)loadReports\(\);/g, "if(tab==='analytics')loadAnalytics();");
content = content.replace(/if\(tab==='forecasts'\)loadForecasts\(\);/g, "");
content = content.replace(/'reports','forecasts'/g, "'analytics'");
content = content.replace(/,'reports','forecasts'/g, ",'analytics'");

fs.writeFileSync('index.html', content);
