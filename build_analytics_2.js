const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const analyticsJS = `
// ============================================================
//   ANALYTICS ENGINE
// ============================================================
let analyticsCharts = {};

async function loadAnalytics() {
  const el = document.getElementById('chart-line-trends');
  if(!el) return;

  // Show a loading skeleton or indicator
  el.innerHTML = '<div style="color:var(--mu);padding:20px">Loading complex analytics data...</div>';

  // Fetch massive data
  const p1 = db.from('orders').select('*, salesmen!orders_salesman_id_fkey(name), retailers(id,name,area,outstanding,credit_limit), order_items(quantity,rate,products(name,sku,category,companies(name))), payments(status)').order('order_date',{ascending:false}).limit(2000);
  const p2 = db.from('collections').select('amount, mode, collected_at');

  const [resOrders, resCol] = await Promise.all([p1, p2]);
  if(resOrders.error) { el.innerHTML='Error loading analytics'; return; }

  window._analyticsData = {
    orders: resOrders.data || [],
    collections: resCol.data || []
  };

  S.analyticsFilter = 'all'; // default
  renderAnalyticsDashboard();
}

function filterAnalytics(key, el) {
  document.querySelectorAll('#analytics-date-filters .chip').forEach(c=>c.classList.remove('active'));
  if(el) el.classList.add('active');
  S.analyticsFilter = key;
  renderAnalyticsDashboard();
}

function renderAnalyticsDashboard() {
  const allOrders = window._analyticsData.orders;
  const allCols = window._analyticsData.collections;

  // Apply Date Filter
  const range = getDateRange(S.analyticsFilter);
  const orders = allOrders.filter(o => {
    if(!range.from && !range.to) return true;
    const d = toYMD(new Date(o.order_date));
    if(range.from && d < range.from) return false;
    if(range.to && d > range.to) return false;
    return true;
  });

  // Common Theme config
  const theme = { mode: 'dark' };
  const commonOptions = {
    chart: { foreColor: '#aaa', toolbar: { show: false }, background: 'transparent' },
    theme: theme,
    tooltip: { theme: 'dark' }
  };

  // 1. Line Graph (Sales Trends - 30 days or filtered)
  renderTrendsChart(orders, commonOptions);

  // 2. Bar Chart (Top Salesmen by Area)
  renderSalesmenChart(orders, commonOptions);

  // 3. Donut (Payment Modes)
  renderPaymentDonut(orders, commonOptions);

  // 4. Treemap (Company / Category)
  renderTreemap(orders, commonOptions);

  // 5. Heatmap (Product across Areas)
  renderHeatmap(orders, commonOptions);

  // 6. Scatter Plot (Order Size vs Credit)
  renderScatter(orders, commonOptions);

  // 7. Histogram (Order Size Dist)
  renderHistogram(orders, commonOptions);
}

// 1. Trends Line Chart
function renderTrendsChart(orders, common) {
  const daily = {};
  orders.forEach(o => {
    const d = toYMD(new Date(o.order_date));
    if(!daily[d]) daily[d] = 0;
    const tot = (o.order_items||[]).reduce((s,i)=>s+(i.quantity*(i.rate||0)),0);
    daily[d] += tot;
  });
  
  const sortedDates = Object.keys(daily).sort();
  const data = sortedDates.map(d => daily[d]);
  
  // Forecast moving average
  const forecast = [];
  let sum=0;
  data.forEach((v, i) => {
    sum += v;
    forecast.push(Math.round(sum/(i+1)));
  });

  if(analyticsCharts['trends']) analyticsCharts['trends'].destroy();
  const opt = {
    ...common,
    series: [
      { name: 'Revenue', type: 'area', data: data },
      { name: 'Moving Avg', type: 'line', data: forecast }
    ],
    chart: { ...common.chart, height: 300, type: 'line' },
    stroke: { curve: 'smooth', width: [0, 3] },
    fill: { type: ['gradient', 'solid'], gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.1 } },
    colors: ['#3b82f6', '#f59e0b'],
    xaxis: { categories: sortedDates.map(d => d.slice(5)) },
    dataLabels: { enabled: false },
    yaxis: { labels: { formatter: v => '₹'+fmtMoneyCompact(v) } }
  };
  analyticsCharts['trends'] = new ApexCharts(document.querySelector("#chart-line-trends"), opt);
  analyticsCharts['trends'].render();
}

// 2. Salesmen Bar Chart
function renderSalesmenChart(orders, common) {
  const smData = {};
  orders.forEach(o => {
    const sm = o.salesmen?.name || 'Admin';
    if(!smData[sm]) smData[sm] = 0;
    smData[sm] += (o.order_items||[]).reduce((s,i)=>s+(i.quantity*(i.rate||0)),0);
  });
  
  const sorted = Object.entries(smData).sort((a,b)=>b[1]-a[1]).slice(0,6);
  
  if(analyticsCharts['salesmen']) analyticsCharts['salesmen'].destroy();
  const opt = {
    ...common,
    series: [{ name: 'Revenue', data: sorted.map(i=>i[1]) }],
    chart: { ...common.chart, type: 'bar', height: 250 },
    plotOptions: { bar: { horizontal: false, borderRadius: 4, columnWidth: '55%' } },
    colors: ['#10b981'],
    dataLabels: { enabled: false },
    xaxis: { categories: sorted.map(i=>i[0]) },
    yaxis: { labels: { formatter: v => '₹'+fmtMoneyCompact(v) } }
  };
  analyticsCharts['salesmen'] = new ApexCharts(document.querySelector("#chart-bar-salesmen"), opt);
  analyticsCharts['salesmen'].render();
}

// 3. Payment Donut
function renderPaymentDonut(orders, common) {
  let cash=0, credit=0, bill=0;
  orders.forEach(o => {
    const tot = (o.order_items||[]).reduce((s,i)=>s+(i.quantity*(i.rate||0)),0);
    if(o.payment_term==='cash') cash += tot;
    else if(o.payment_term==='credit') {
      if(o.credit_period_days <= 1) bill += tot;
      else credit += tot;
    }
  });
  
  if(analyticsCharts['payment']) analyticsCharts['payment'].destroy();
  const opt = {
    ...common,
    series: [cash, bill, credit],
    labels: ['Cash/UPI', 'Bill-to-Bill', 'Credit'],
    chart: { ...common.chart, type: 'donut', height: 250 },
    colors: ['#22c55e', '#3b82f6', '#f43f5e'],
    plotOptions: { pie: { donut: { size: '65%' } } },
    dataLabels: { enabled: false },
    legend: { position: 'bottom' }
  };
  analyticsCharts['payment'] = new ApexCharts(document.querySelector("#chart-donut-payment"), opt);
  analyticsCharts['payment'].render();
}

// 4. Treemap (Company)
function renderTreemap(orders, common) {
  const companies = {};
  orders.forEach(o => {
    (o.order_items||[]).forEach(i => {
      const c = i.products?.companies?.name || 'Unknown';
      if(!companies[c]) companies[c] = 0;
      companies[c] += (i.quantity*(i.rate||0));
    });
  });
  
  const data = Object.entries(companies).map(([x,y]) => ({x,y})).sort((a,b)=>b.y-a.y);
  
  if(analyticsCharts['treemap']) analyticsCharts['treemap'].destroy();
  const opt = {
    ...common,
    series: [{ data }],
    chart: { ...common.chart, type: 'treemap', height: 350 },
    colors: ['#6366f1'],
    dataLabels: { formatter: function(text, op) { return [text, '₹'+fmtMoneyCompact(op.value)] } }
  };
  analyticsCharts['treemap'] = new ApexCharts(document.querySelector("#chart-treemap-company"), opt);
  analyticsCharts['treemap'].render();
}

// 5. Heatmap (Product across Areas)
function renderHeatmap(orders, common) {
  const map = {};
  const products = new Set();
  
  orders.forEach(o => {
    const area = o.retailers?.area || 'Unknown';
    if(!map[area]) map[area] = {};
    (o.order_items||[]).forEach(i => {
      const p = (i.products?.name || 'Unknown').substring(0,15);
      products.add(p);
      if(!map[area][p]) map[area][p] = 0;
      map[area][p] += (i.quantity*(i.rate||0));
    });
  });
  
  const topProducts = Array.from(products).slice(0, 10);
  const series = Object.keys(map).slice(0, 8).map(area => {
    return {
      name: area,
      data: topProducts.map(p => ({ x: p, y: map[area][p] || 0 }))
    };
  });
  
  if(analyticsCharts['heatmap']) analyticsCharts['heatmap'].destroy();
  const opt = {
    ...common,
    series: series,
    chart: { ...common.chart, type: 'heatmap', height: 350 },
    plotOptions: { heatmap: { colorScale: { ranges: [{ from:0, to:0, color:'#1f2937' }, { from:1, to:1000000, color:'#8b5cf6' }] } } },
    dataLabels: { enabled: false }
  };
  analyticsCharts['heatmap'] = new ApexCharts(document.querySelector("#chart-heatmap-products"), opt);
  analyticsCharts['heatmap'].render();
}

// 6. Scatter (Order Size vs Credit)
function renderScatter(orders, common) {
  const data = orders.filter(o => o.payment_term === 'credit' && o.credit_period_days > 1).map(o => {
    const tot = (o.order_items||[]).reduce((s,i)=>s+(i.quantity*(i.rate||0)),0);
    return [tot, o.credit_period_days]; // [x,y] = [Size, Days]
  });
  
  if(analyticsCharts['scatter']) analyticsCharts['scatter'].destroy();
  const opt = {
    ...common,
    series: [{ name: 'Orders', data }],
    chart: { ...common.chart, type: 'scatter', height: 250 },
    colors: ['#ec4899'],
    xaxis: { title: { text: 'Order Size (₹)' }, labels: { formatter: v => fmtMoneyCompact(v) } },
    yaxis: { title: { text: 'Credit Days' } }
  };
  analyticsCharts['scatter'] = new ApexCharts(document.querySelector("#chart-scatter-credit"), opt);
  analyticsCharts['scatter'].render();
}

// 7. Histogram (Order Size Distribution)
function renderHistogram(orders, common) {
  const bins = { '0-2k':0, '2k-5k':0, '5k-10k':0, '10k-25k':0, '25k+':0 };
  
  orders.forEach(o => {
    const tot = (o.order_items||[]).reduce((s,i)=>s+(i.quantity*(i.rate||0)),0);
    if(tot < 2000) bins['0-2k']++;
    else if(tot < 5000) bins['2k-5k']++;
    else if(tot < 10000) bins['5k-10k']++;
    else if(tot < 25000) bins['10k-25k']++;
    else bins['25k+']++;
  });
  
  if(analyticsCharts['hist']) analyticsCharts['hist'].destroy();
  const opt = {
    ...common,
    series: [{ name: 'Number of Orders', data: Object.values(bins) }],
    chart: { ...common.chart, type: 'bar', height: 250 },
    plotOptions: { bar: { borderRadius: 4, columnWidth: '95%' } },
    colors: ['#06b6d4'],
    dataLabels: { enabled: true },
    xaxis: { categories: Object.keys(bins), title: { text: 'Order Value Range (₹)' } },
    yaxis: { title: { text: 'Frequency' } }
  };
  analyticsCharts['hist'] = new ApexCharts(document.querySelector("#chart-hist-orders"), opt);
  analyticsCharts['hist'].render();
}
</script>`;

content = content.replace('</script>', analyticsJS);
fs.writeFileSync('index.html', content);
console.log('JS patched');
