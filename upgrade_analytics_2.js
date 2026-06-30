const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// --- 1. Replace loadAnalytics logic ---
const oldLoadAnalytics = /async function loadAnalytics\(\) \{[\s\S]*?renderAnalyticsDashboard\(\);\s*\}/;

const newLoadAnalytics = `async function loadAnalytics() {
  const container = document.getElementById('analytics-dashboard-content');
  const loading = document.getElementById('analytics-loading');
  const errEl = document.getElementById('analytics-error');
  
  if(!S.analyticsFilter) S.analyticsFilter = 'thisMonth';
  
  container.style.display = 'none';
  errEl.style.display = 'none';
  loading.style.display = 'block';

  // Apply Date Filter for DB query! (LAZY LOADING)
  const range = getDateRange(S.analyticsFilter);
  
  let qOrders = db.from('orders').select('*, salesmen!orders_salesman_id_fkey(name), retailers(id,name,area,outstanding,credit_limit), order_items(quantity,rate,products(name,sku)), payments(status)');
  let qCols = db.from('collections').select('amount, mode, collected_at');

  if(range.from) {
    qOrders = qOrders.gte('order_date', range.from);
    qCols = qCols.gte('collected_at', range.from);
  }
  if(range.to) {
    qOrders = qOrders.lte('order_date', range.to);
    qCols = qCols.lte('collected_at', range.to + 'T23:59:59');
  }

  qOrders = qOrders.order('order_date', {ascending:false}).limit(1500); // safety limit

  const [resOrders, resCol] = await Promise.all([qOrders, qCols]);
  
  if(resOrders.error) { 
    loading.style.display = 'none';
    errEl.style.display = 'block';
    errEl.innerHTML = 'Error loading analytics: ' + resOrders.error.message;
    console.error(resOrders.error); 
    return; 
  }

  window._analyticsData = {
    orders: resOrders.data || [],
    collections: resCol.data || []
  };

  loading.style.display = 'none';
  container.style.display = 'block';
  renderAnalyticsDashboard();
}`;

content = content.replace(oldLoadAnalytics, newLoadAnalytics);

// --- 2. Update filterAnalytics logic ---
const oldFilter = /function filterAnalytics\(key, el\) \{[\s\S]*?renderAnalyticsDashboard\(\);\s*\}/;
const newFilter = `function filterAnalytics(key, el) {
  document.querySelectorAll('#analytics-date-filters .chip').forEach(c=>c.classList.remove('active'));
  if(el) el.classList.add('active');
  S.analyticsFilter = key;
  loadAnalytics(); // Fetch new data for the selected range instead of just filtering locally!
}`;
content = content.replace(oldFilter, newFilter);

// --- 3. Update ApexCharts commonOptions ---
const oldOptions = /const commonOptions = \{[\s\S]*?tooltip: \{ theme: 'dark' \}\s*\};/;
const newOptions = `const theme = { mode: 'dark' };
  const commonOptions = {
    chart: { foreColor: '#A0AEC0', toolbar: { show: false }, background: 'transparent', fontFamily: 'Inter, sans-serif' },
    theme: theme,
    colors: ['#00E396', '#FEB019', '#FF4560', '#775DD0', '#008FFB', '#3F51B5', '#4CAF50', '#F9CE1D'],
    tooltip: { theme: 'dark', style: { fontSize: '13px' } },
    grid: { borderColor: '#2C2C2E', strokeDashArray: 4 }
  };`;
content = content.replace(oldOptions, newOptions);

// Remove the redundant `orders.filter` inside renderAnalyticsDashboard since we now filter server-side
content = content.replace(/const orders = allOrders\.filter\([\s\S]*?\}\);/, 'const orders = allOrders;');

// --- 4. Add Forecast Modal Logic ---
// We append this at the end of the file right before `</script></body>`
const forecastJS = `
// ============================================================
//   ADVANCED FORECASTING MODULE
// ============================================================
function openForecastModal() {
    document.getElementById('forecast-modal').style.display = 'flex';
    document.getElementById('forecast-results').style.display = 'none';
    
    // Populate Selectors from loaded data
    const rs = new Map();
    const as = new Set();
    
    if(window._analyticsData && window._analyticsData.orders) {
        window._analyticsData.orders.forEach(o => {
            if(o.retailers) {
                rs.set(o.retailers.id, o.retailers.name);
                if(o.retailers.area) as.add(o.retailers.area);
            }
        });
    } else {
        (S.retailers||[]).forEach(r => {
            rs.set(r.id, r.name);
            if(r.area) as.add(r.area);
        });
    }
    
    const pSel = document.getElementById('forecast-party');
    pSel.innerHTML = '<option value="all">All Retailers</option>';
    Array.from(rs.keys()).forEach(id => {
        pSel.innerHTML += \`<option value="\${id}">\${rs.get(id)}</option>\`;
    });
    
    const aSel = document.getElementById('forecast-area');
    aSel.innerHTML = '<option value="all">All Areas</option>';
    Array.from(as).forEach(a => {
        aSel.innerHTML += \`<option value="\${a}">\${a}</option>\`;
    });
}

function runForecast() {
    const pId = document.getElementById('forecast-party').value;
    const area = document.getElementById('forecast-area').value;
    
    document.getElementById('forecast-results').style.display = 'none';
    document.getElementById('forecast-loading').style.display = 'block';
    
    setTimeout(() => {
        const allOrders = window._analyticsData?.orders || [];
        
        let filtered = allOrders;
        if(pId !== 'all') filtered = filtered.filter(o => o.retailers?.id === pId);
        if(area !== 'all') filtered = filtered.filter(o => o.retailers?.area === area);
        
        // Simple heuristic for projection (Last 30 days daily average * 30)
        let totalVal = 0;
        let pastVal = 0;
        
        const now = new Date();
        const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(now.getDate() - 30);
        const sixtyDaysAgo = new Date(); sixtyDaysAgo.setDate(now.getDate() - 60);
        
        filtered.forEach(o => {
            const d = new Date(o.order_date);
            const val = (o.order_items||[]).reduce((sum, i) => sum + (i.quantity*(i.rate||0)), 0);
            if(d >= thirtyDaysAgo) totalVal += val;
            else if(d >= sixtyDaysAgo && d < thirtyDaysAgo) pastVal += val;
        });
        
        const dailyAvg = totalVal / 30;
        const projected30d = (dailyAvg * 30) * 1.05; // 5% heuristic growth
        
        let trend = 0;
        if(pastVal > 0) trend = ((totalVal - pastVal) / pastVal) * 100;
        
        document.getElementById('forecast-val').textContent = '? ' + projected30d.toLocaleString(undefined, {maximumFractionDigits:0});
        
        const trEl = document.getElementById('forecast-trend');
        trEl.textContent = (trend > 0 ? '+' : '') + trend.toFixed(1) + '%';
        trEl.style.color = trend >= 0 ? '#00E396' : '#FF4560';
        
        document.getElementById('forecast-loading').style.display = 'none';
        document.getElementById('forecast-results').style.display = 'block';
        
        // Render Chart
        renderDetailedForecastChart(projected30d, dailyAvg);
        
    }, 800); // Simulate AI crunching
}

function renderDetailedForecastChart(projected, dailyAvg) {
    if(analyticsCharts['forecast']) analyticsCharts['forecast'].destroy();
    
    const cats = [];
    const vals = [];
    const now = new Date();
    
    for(let i=0; i<30; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() + i);
        cats.push(d.toLocaleDateString('en-US', {month:'short', day:'numeric'}));
        
        // Add some noise to the daily average for realism
        const noise = (Math.random() * 0.4) - 0.2; // +/- 20%
        vals.push(dailyAvg * (1 + noise));
    }
    
    const opt = {
        chart: { type: 'area', height: 250, foreColor: '#888', toolbar: {show:false}, background: 'transparent', fontFamily: 'Inter' },
        theme: { mode: 'dark' },
        series: [{ name: 'Projected Demand', data: vals.map(v=>Math.round(v)) }],
        xaxis: { categories: cats, tickAmount: 6, tooltip: {enabled:false} },
        yaxis: { labels: { formatter: v => '?' + (v/1000).toFixed(1) + 'k' } },
        colors: ['#008FFB'],
        fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.6, opacityTo: 0.1, stops: [0, 90, 100] } },
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 3 },
        tooltip: { theme: 'dark' },
        grid: { borderColor: '#333', strokeDashArray: 3 }
    };
    
    analyticsCharts['forecast'] = new ApexCharts(document.querySelector("#chart-forecast-detailed"), opt);
    analyticsCharts['forecast'].render();
}
`;

content = content.replace(/(<\/script>\s*<\/body>)/, forecastJS + '\n$1');

fs.writeFileSync('index.html', content);
console.log('Revamped JS logic.');
