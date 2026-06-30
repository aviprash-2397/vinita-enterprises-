const fs = require('fs');

let htmlContent = fs.readFileSync('index.html', 'utf8');

const newAnalyticsHtml = `  <div id="at-analytics" class="ct" style="display:none; padding-bottom:100px; background:#0B0E14; position:relative; overflow:hidden;">
  <!-- Deep Space World Map Background SVG -->
  <div style="position:absolute; top:0; left:0; right:0; bottom:0; opacity:0.04; pointer-events:none; background-image:url('data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 1000 500\\'><path fill=\\'%23FFFFFF\\' d=\\'M200 150 Q 250 100 300 150 T 400 150 T 500 150 T 600 150 T 700 150 T 800 150\\' stroke=\\'%23FFFFFF\\' stroke-width=\\'2\\' fill-opacity=\\'0.1\\'/></svg>'); background-size:cover; background-position:center; z-index:0;"></div>
  
  <div style="position:relative; z-index:1;">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
      <div style="font-size:28px; font-weight:800; background: -webkit-linear-gradient(45deg, #00F2FE, #4FACFE); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing:-0.5px;">Analytics & Insights</div>
      <button class="btn" style="background:rgba(0,242,254,0.1); color:#00F2FE; border:1px solid rgba(0,242,254,0.3); border-radius:30px; box-shadow:0 0 15px rgba(0,242,254,0.1); font-weight:600; padding:8px 20px; transition:all 0.3s;" onclick="openForecastModal()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align:-2px; margin-right:6px;"><path d="M2 12h4l3-9 5 18 3-9h5"/></svg>
        Predict Demand
      </button>
    </div>
    
    <div class="filter-label" style="color:var(--mu); font-weight:600; text-transform:uppercase; letter-spacing:0.05em; font-size:11px;">Timeframe</div>
    <div class="fc" id="analytics-date-filters" style="margin-bottom:24px">
      <div class="chip" data-key="today" onclick="filterAnalytics('today',this)">Today</div>
      <div class="chip" data-key="thisWeek" onclick="filterAnalytics('thisWeek',this)">This Week</div>
      <div class="chip active" data-key="thisMonth" onclick="filterAnalytics('thisMonth',this)">This Month</div>
      <div class="chip" data-key="lastMonth" onclick="filterAnalytics('lastMonth',this)">Last Month</div>
    </div>

    <div id="analytics-loading" style="display:none; color:#00F2FE; font-weight:600; padding:20px; text-align:center; background:rgba(11,14,20,0.8); backdrop-filter:blur(10px); border-radius:12px; margin-bottom:20px; border:1px solid rgba(0,242,254,0.2); box-shadow:0 0 20px rgba(0,242,254,0.1);">
      <div style="display:inline-block; width:20px; height:20px; border:2px solid #00F2FE; border-top-color:transparent; border-radius:50%; animation:spin 1s linear infinite; vertical-align:middle; margin-right:10px;"></div>
      Loading Deep Analytics...
    </div>
    
    <div id="analytics-error" style="display:none; color:#FF2A85; font-weight:600; padding:20px; text-align:center; background:rgba(255,42,133,0.1); border-radius:12px; margin-bottom:20px; border:1px solid rgba(255,42,133,0.3);"></div>

    <div id="analytics-dashboard-content" style="display:none;">
      
      <!-- Top Row: Radial Statistic Graphs -->
      <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:20px; margin-bottom:24px;" class="radial-stats-grid">
        <!-- Radial 1 -->
        <div class="chart-card glass-panel">
          <div class="chart-title glass-title">Statistic Graph<br><span style="font-size:10px; color:#A0AEC0; font-weight:400;">Delivery Success Rate</span></div>
          <div id="chart-radial-1" style="min-height:120px; display:flex; justify-content:center; align-items:center;"></div>
        </div>
        <!-- Radial 2 -->
        <div class="chart-card glass-panel">
          <div class="chart-title glass-title">Statistic Graph<br><span style="font-size:10px; color:#A0AEC0; font-weight:400;">Payment Collection</span></div>
          <div id="chart-radial-2" style="min-height:120px; display:flex; justify-content:center; align-items:center;"></div>
        </div>
        <!-- Radial 3 -->
        <div class="chart-card glass-panel">
          <div class="chart-title glass-title">Statistic Graph<br><span style="font-size:10px; color:#A0AEC0; font-weight:400;">Active Retailers</span></div>
          <div id="chart-radial-3" style="min-height:120px; display:flex; justify-content:center; align-items:center;"></div>
        </div>
        <!-- Radial 4 -->
        <div class="chart-card glass-panel">
          <div class="chart-title glass-title">Statistic Graph<br><span style="font-size:10px; color:#A0AEC0; font-weight:400;">Monthly Target Hit</span></div>
          <div id="chart-radial-4" style="min-height:120px; display:flex; justify-content:center; align-items:center;"></div>
        </div>
      </div>

      <!-- Main Area Chart: Trends -->
      <div class="chart-card glass-panel" style="margin-bottom:24px; padding:24px;">
        <div class="chart-title glass-title" style="margin-bottom:10px;">
          <div style="width:12px; height:12px; border-radius:50%; background:#FF2A85; box-shadow:0 0 10px #FF2A85;"></div>
          Sales Velocity & Revenue Trends
        </div>
        <div id="chart-line-trends"></div>
      </div>

      <div style="display:grid; grid-template-columns: 1.5fr 1fr; gap:24px; margin-bottom:24px;" class="analytics-row-2">
        <!-- Node Graph replacement (Scatter/Bubble) -->
        <div class="chart-card glass-panel" style="padding:24px;">
          <div class="chart-title glass-title"><div style="width:10px; height:10px; border-radius:50%; background:#00F2FE; box-shadow:0 0 10px #00F2FE;"></div>Network Topology (Order Size vs Credit Cycle)</div>
          <div id="chart-scatter-credit" style="min-height:300px;"></div>
        </div>
        <!-- Treemap / Heatmap Hybrid -->
        <div class="chart-card glass-panel" style="padding:24px; overflow-x:auto;">
          <div class="chart-title glass-title"><div style="width:10px; height:10px; border-radius:50%; background:#8E2DE2; box-shadow:0 0 10px #8E2DE2;"></div>Brand Penetration</div>
          <div id="chart-treemap-company" style="min-width:300px;"></div>
        </div>
      </div>

      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap:24px; margin-bottom:24px;">
        <!-- Heatmap -->
        <div class="chart-card glass-panel" style="padding:24px; overflow-x:auto;">
          <div class="chart-title glass-title"><div style="width:10px; height:10px; border-radius:50%; background:#4FACFE; box-shadow:0 0 10px #4FACFE;"></div>Regional Policy Heatmap</div>
          <div id="chart-heatmap-products" style="min-width:300px;"></div>
        </div>
        <!-- Bar Chart -->
        <div class="chart-card glass-panel" style="padding:24px;">
          <div class="chart-title glass-title"><div style="width:10px; height:10px; border-radius:50%; background:#00E396; box-shadow:0 0 10px #00E396;"></div>Top Performers (Salesmen)</div>
          <div id="chart-bar-salesmen"></div>
        </div>
      </div>

      <!-- Histogram -->
      <div class="chart-card glass-panel" style="padding:24px; margin-bottom:24px;">
        <div class="chart-title glass-title"><div style="width:10px; height:10px; border-radius:50%; background:#FEB019; box-shadow:0 0 10px #FEB019;"></div>Revenue Distribution (Hist)</div>
        <div id="chart-hist-orders"></div>
      </div>
    </div>
  </div>
</div>`;

htmlContent = htmlContent.replace(/<div id="at-analytics"[\s\S]*?<!-- Histogram -->[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/, newAnalyticsHtml);

// Add custom CSS for glassmorphism
const cssInject = `
  <style>
    /* Analytics Redesign Styles */
    .glass-panel {
      background: rgba(20, 25, 45, 0.45) !important;
      backdrop-filter: blur(15px);
      -webkit-backdrop-filter: blur(15px);
      border: 1px solid rgba(255, 255, 255, 0.08) !important;
      box-shadow: 0 15px 35px rgba(0,0,0,0.4) !important;
      border-radius: 16px !important;
    }
    .glass-title {
      color: #FFF !important;
      font-weight: 700 !important;
      font-size: 14px !important;
      letter-spacing: 0.02em;
    }
    .apexcharts-tooltip {
      background: rgba(15, 20, 35, 0.9) !important;
      backdrop-filter: blur(8px) !important;
      border: 1px solid rgba(0, 242, 254, 0.3) !important;
      box-shadow: 0 4px 20px rgba(0,0,0,0.5) !important;
      color: #fff !important;
    }
    .apexcharts-tooltip-title {
      background: rgba(0,0,0,0.3) !important;
      border-bottom: 1px solid rgba(255,255,255,0.05) !important;
    }
    .apexcharts-text tspan {
      font-family: 'Inter', sans-serif !important;
    }
    @media(max-width: 800px){
      .radial-stats-grid { grid-template-columns: 1fr 1fr !important; }
      .analytics-row-2 { grid-template-columns: 1fr !important; }
    }
  </style>
`;
htmlContent = htmlContent.replace('</head>', cssInject + '</head>');

fs.writeFileSync('index.html', htmlContent, 'utf8');
console.log('HTML Patched successfully.');
