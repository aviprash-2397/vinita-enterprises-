const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// --- 1. Revamp at-analytics HTML ---
const oldHtmlStart = '<div id="at-analytics" class="ct" style="display:none; padding-bottom:100px;">';
// We will replace the entire at-analytics container up to the start of at-manage
const htmlRegex = /<div id="at-analytics" class="ct" style="display:none; padding-bottom:100px;">[\s\S]*?(?=<div id="at-manage" class="ct" style="display:none">)/;

const newAnalyticsHtml = `<div id="at-analytics" class="ct" style="display:none; padding-bottom:100px; background:var(--bg);">
  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
    <div style="font-size:24px; font-weight:800; background: -webkit-linear-gradient(45deg, #FF8A00, #E52E71); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Analytics & Insights</div>
    <button class="btn" style="background:#2C3E50; color:#fff; border:none; box-shadow:0 4px 15px rgba(0,0,0,0.2); font-weight:600;" onclick="openForecastModal()">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align:-2px; margin-right:4px;"><path d="M2 12h4l3-9 5 18 3-9h5"/></svg>
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

  <div id="analytics-loading" style="display:none; color:var(--or); font-weight:600; padding:20px; text-align:center; background:#1e1e1e; border-radius:12px; margin-bottom:20px;">
    Loading Deep Analytics...
  </div>
  
  <div id="analytics-error" style="display:none; color:#FF4C4C; font-weight:600; padding:20px; text-align:center; background:#2A1111; border-radius:12px; margin-bottom:20px;"></div>

  <div id="analytics-dashboard-content" style="display:none;">
    <!-- Trends / Line Graph -->
    <div class="rcard" style="display:block; padding:20px; margin-bottom:20px; background:#1C1C1E; border:1px solid #2C2C2E; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
      <div style="font-size:16px; font-weight:700; margin-bottom:10px; color:#fff; display:flex; align-items:center; gap:8px;">
        <div style="width:12px; height:12px; border-radius:50%; background:#00E396;"></div>
        Sales Velocity & Trends
      </div>
      <div id="chart-line-trends"></div>
    </div>

    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap:20px; margin-bottom:20px;">
      <!-- Payment Modes / Donut -->
      <div class="rcard" style="display:block; padding:20px; background:#1C1C1E; border:1px solid #2C2C2E; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
        <div style="font-size:16px; font-weight:700; margin-bottom:10px; color:#fff;">Capital Flow (Payment Modes)</div>
        <div id="chart-donut-payment"></div>
      </div>
      
      <!-- Top Salesmen / Bar -->
      <div class="rcard" style="display:block; padding:20px; background:#1C1C1E; border:1px solid #2C2C2E; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
        <div style="font-size:16px; font-weight:700; margin-bottom:10px; color:#fff;">Top Performers</div>
        <div id="chart-bar-salesmen"></div>
      </div>
    </div>

    <!-- Treemap -->
    <div class="rcard" style="display:block; padding:20px; margin-bottom:20px; background:#1C1C1E; border:1px solid #2C2C2E; box-shadow: 0 10px 30px rgba(0,0,0,0.3); overflow-x:auto;">
      <div style="font-size:16px; font-weight:700; margin-bottom:10px; color:#fff;">Brand Penetration (Treemap)</div>
      <div id="chart-treemap-company" style="min-width:400px;"></div>
    </div>

    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap:20px; margin-bottom:20px;">
        <!-- Heatmap -->
        <div class="rcard" style="display:block; padding:20px; background:#1C1C1E; border:1px solid #2C2C2E; box-shadow: 0 10px 30px rgba(0,0,0,0.3); overflow-x:auto;">
        <div style="font-size:16px; font-weight:700; margin-bottom:10px; color:#fff;">Area Demand Heatmap</div>
        <div id="chart-heatmap-products" style="min-width:400px;"></div>
        </div>

        <!-- Scatter Plot -->
        <div class="rcard" style="display:block; padding:20px; background:#1C1C1E; border:1px solid #2C2C2E; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
        <div style="font-size:16px; font-weight:700; margin-bottom:10px; color:#fff;">Order Size vs Credit Cycle</div>
        <div id="chart-scatter-credit"></div>
        </div>
    </div>

    <!-- Histogram -->
    <div class="rcard" style="display:block; padding:20px; margin-bottom:20px; background:#1C1C1E; border:1px solid #2C2C2E; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
      <div style="font-size:16px; font-weight:700; margin-bottom:10px; color:#fff;">Revenue Distribution</div>
      <div id="chart-hist-orders"></div>
    </div>
  </div>
</div>
`;

content = content.replace(htmlRegex, newAnalyticsHtml);

// Add Forecast Modal HTML to the end of the body, before scripts
const forecastModalHtml = `
<div id="forecast-modal" class="modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:9999; align-items:center; justify-content:center; padding:20px; box-sizing:border-box;">
  <div style="background:#1C1C1E; border-radius:24px; padding:32px; width:100%; max-width:700px; box-shadow:0 20px 60px rgba(0,0,0,0.6); position:relative; border:1px solid #333; max-height:90vh; overflow-y:auto;">
    <button onclick="document.getElementById('forecast-modal').style.display='none'" style="position:absolute; top:20px; right:20px; background:none; border:none; color:#aaa; font-size:24px; cursor:pointer;">×</button>
    <div style="font-size:28px; font-weight:800; margin-bottom:8px; background: -webkit-linear-gradient(45deg, #00E396, #008FFB); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Predictive Demand Forecast</div>
    <div style="color:var(--mu); margin-bottom:24px; font-size:14px;">Select parameters to generate an AI-driven projection for the next 30 days based on historical velocity.</div>
    
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:24px;">
        <div>
            <label style="display:block; font-size:12px; font-weight:700; color:#888; text-transform:uppercase; margin-bottom:8px;">Retailer / Party</label>
            <select id="forecast-party" style="width:100%; padding:12px; border-radius:12px; background:#2C2C2E; color:#fff; border:1px solid #444; outline:none; font-size:14px;">
                <option value="all">All Retailers</option>
            </select>
        </div>
        <div>
            <label style="display:block; font-size:12px; font-weight:700; color:#888; text-transform:uppercase; margin-bottom:8px;">Area / Region</label>
            <select id="forecast-area" style="width:100%; padding:12px; border-radius:12px; background:#2C2C2E; color:#fff; border:1px solid #444; outline:none; font-size:14px;">
                <option value="all">All Areas</option>
            </select>
        </div>
    </div>

    <button onclick="runForecast()" class="btn btn-or" style="width:100%; padding:14px; font-size:16px; border-radius:12px; font-weight:700; margin-bottom:24px; box-shadow:0 8px 25px rgba(255, 138, 0, 0.4);">Generate Projection</button>
    
    <div id="forecast-loading" style="display:none; text-align:center; padding:40px; color:#00E396; font-weight:600;">Processing historical matrices...</div>
    
    <div id="forecast-results" style="display:none;">
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:20px;">
            <div style="background:#2C2C2E; padding:16px; border-radius:16px; text-align:center;">
                <div style="font-size:12px; color:#aaa; text-transform:uppercase; letter-spacing:0.05em; font-weight:700;">Expected Vol. (30d)</div>
                <div id="forecast-val" style="font-size:32px; font-weight:800; color:#00E396; margin-top:4px;">?0</div>
            </div>
            <div style="background:#2C2C2E; padding:16px; border-radius:16px; text-align:center;">
                <div style="font-size:12px; color:#aaa; text-transform:uppercase; letter-spacing:0.05em; font-weight:700;">Growth Trend</div>
                <div id="forecast-trend" style="font-size:32px; font-weight:800; color:#FEB019; margin-top:4px;">+0%</div>
            </div>
        </div>
        <div id="chart-forecast-detailed" style="background:#222; border-radius:16px; padding:10px;"></div>
    </div>
  </div>
</div>
`;

// Insert modal before the first script tag
content = content.replace('<script src="https://cdn.jsdelivr.net', forecastModalHtml + '\n<script src="https://cdn.jsdelivr.net');


fs.writeFileSync('index.html', content);
console.log('Revamped HTML layout.');
