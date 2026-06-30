const fs = require('fs');

let content = fs.readFileSync('index.html', 'utf8');

const newJS = `function renderAnalyticsDashboard() {
  try {
    const allOrders = window._analyticsData.orders;
    const allCols = window._analyticsData.collections;

    const orders = allOrders;

    // Common Neon Theme config
    const theme = { mode: 'dark' };
    const common = {
      chart: { foreColor: '#A0AEC0', toolbar: { show: false }, background: 'transparent', fontFamily: 'Inter, sans-serif' },
      theme: theme,
      colors: ['#FF2A85', '#00F2FE', '#8E2DE2', '#4FACFE', '#00E396', '#FEB019'],
      tooltip: { theme: 'dark', style: { fontSize: '13px' } },
      grid: { borderColor: 'rgba(255,255,255,0.05)', strokeDashArray: 4 }
    };

    renderStatisticRadials(orders, common);
    renderTrendsChart(orders, common);
    renderNetworkTopology(orders, common);
    renderTreemap(orders, common);
    renderHeatmap(orders, common);
    renderSalesmenChart(orders, common);
    renderHistogram(orders, common);
    
    document.getElementById('analytics-error').style.display='none';
    document.getElementById('analytics-loading').style.display='none';
  } catch(e) {
    document.getElementById('analytics-error').style.display='block';
    document.getElementById('analytics-error').textContent = 'Render Error: ' + e.message + ' \\n' + e.stack;
    document.getElementById('analytics-loading').style.display='none';
  }
}

// 0. Top Row Statistic Radials
function renderStatisticRadials(orders, common) {
  const totOrders = orders.length || 1;
  const delivered = orders.filter(o => o.status === 'delivered').length;
  const paid = orders.filter(o => (o.payments?.[0]?.status) === 'paid').length;
  
  const activeRet = new Set(orders.map(o => o.retailers?.id)).size;
  const totalRet = S.adminAllRetailers?.length || Math.max(activeRet, 1);

  const monthRev = orders.reduce((s,o)=>s+((o.order_items||[]).reduce((ss,i)=>ss+((parseFloat(i.quantity)||0)*(parseFloat(i.rate)||0)),0)),0);
  const target = 500000; // Example target
  
  const metrics = [
    { id: 'chart-radial-1', pct: Math.round((delivered/totOrders)*100), color: '#FF2A85', label: 'Delivery' },
    { id: 'chart-radial-2', pct: Math.round((paid/totOrders)*100), color: '#00F2FE', label: 'Collection' },
    { id: 'chart-radial-3', pct: Math.round((activeRet/totalRet)*100), color: '#8E2DE2', label: 'Active Ret' },
    { id: 'chart-radial-4', pct: Math.min(100, Math.round((monthRev/target)*100)), color: '#00E396', label: 'Target' }
  ];

  metrics.forEach((m, i) => {
    if(analyticsCharts['rad'+i]) analyticsCharts['rad'+i].destroy();
    const opt = {
      series: [m.pct],
      chart: { type: 'radialBar', height: 180, sparkline: { enabled: true } },
      plotOptions: {
        radialBar: {
          startAngle: -90,
          endAngle: 90,
          track: { background: 'rgba(255,255,255,0.05)', strokeWidth: '100%', margin: 5, dropShadow: { enabled: true, top: 0, left: 0, blur: 3, opacity: 0.5 } },
          dataLabels: {
            name: { show: false },
            value: { offsetY: 0, fontSize: '24px', fontWeight: 800, color: m.color, formatter: (v) => v + '%' }
          }
        }
      },
      colors: [m.color],
      stroke: { lineCap: 'round' }
    };
    analyticsCharts['rad'+i] = new ApexCharts(document.querySelector("#" + m.id), opt);
    analyticsCharts['rad'+i].render();
  });
}

// 1. Trends Line Chart (Area Glowing)
function renderTrendsChart(orders, common) {
  const daily = {};
  orders.forEach(o => {
    const d = toYMD(new Date(o.order_date));
    if(!daily[d]) daily[d] = 0;
    const tot = (o.order_items||[]).reduce((s,i)=>s+((parseFloat(i.quantity)||0)*(parseFloat(i.rate)||0)),0);
    daily[d] += tot;
  });
  
  const sortedDates = Object.keys(daily).sort();
  const data = sortedDates.map(d => daily[d]);
  
  if(analyticsCharts['trends']) analyticsCharts['trends'].destroy();
  const opt = {
    ...common,
    series: [
      { name: 'Revenue', type: 'area', data: data }
    ],
    chart: { ...common.chart, type: 'area', height: 350 },
    colors: ['#FF2A85'],
    stroke: { curve: 'smooth', width: 3 },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.05,
        stops: [0, 90, 100]
      }
    },
    dataLabels: { enabled: false },
    xaxis: { categories: sortedDates.map(d=>d.substring(5)), labels: { style: { colors: '#718096' } } },
    yaxis: { labels: { formatter: (v) => '₹' + (v/1000).toFixed(1) + 'k', style: { colors: '#718096' } } }
  };
  analyticsCharts['trends'] = new ApexCharts(document.querySelector("#chart-line-trends"), opt);
  analyticsCharts['trends'].render();
}

// 2. Network Topology (Bubble Chart mapping Salesman -> Retailer -> Order Size)
function renderNetworkTopology(orders, common) {
  // Bubble series: each salesman is a series, each bubble is a retailer
  const seriesMap = {}; // by salesman
  orders.forEach(o => {
    const sm = o.salesmen?.name || 'Unassigned';
    const rt = o.retailers?.name || 'Unknown';
    if(!seriesMap[sm]) seriesMap[sm] = {};
    if(!seriesMap[sm][rt]) seriesMap[sm][rt] = { count: 0, val: 0, cr: Number(o.retailers?.credit_limit||0) };
    seriesMap[sm][rt].count++;
    seriesMap[sm][rt].val += (o.order_items||[]).reduce((s,i)=>s+((parseFloat(i.quantity)||0)*(parseFloat(i.rate)||0)),0);
  });

  const series = Object.keys(seriesMap).map(sm => {
    return {
      name: sm,
      data: Object.keys(seriesMap[sm]).map(rt => {
        const d = seriesMap[sm][rt];
        return [ Math.min(d.cr, 500000), d.count, d.val/1000 ]; // x: credit, y: orders, z: value (bubble size)
      })
    };
  });

  if(analyticsCharts['scatter']) analyticsCharts['scatter'].destroy();
  const opt = {
    ...common,
    series: series,
    chart: { ...common.chart, type: 'bubble', height: 320 },
    dataLabels: { enabled: false },
    fill: { opacity: 0.8 },
    xaxis: { title: { text: 'Retailer Credit Limit' }, labels: { formatter: v => '₹'+(v/1000)+'k' } },
    yaxis: { title: { text: 'Order Frequency' } },
    theme: { palette: 'palette1' }
  };
  analyticsCharts['scatter'] = new ApexCharts(document.querySelector("#chart-scatter-credit"), opt);
  analyticsCharts['scatter'].render();
}

// 3. Treemap (Brand Penetration)
function renderTreemap(orders, common) {
  const brands = {};
  orders.forEach(o => {
    (o.order_items||[]).forEach(i => {
      const comp = i.products?.companies?.name || i.products?.name?.split(' ')[0] || 'Unknown';
      brands[comp] = (brands[comp]||0) + ((parseFloat(i.quantity)||0) * (parseFloat(i.rate)||0));
    });
  });

  const data = Object.keys(brands).map(k => ({ x: k, y: Math.round(brands[k]) })).sort((a,b)=>b.y - a.y).slice(0, 15);

  if(analyticsCharts['treemap']) analyticsCharts['treemap'].destroy();
  const opt = {
    ...common,
    series: [{ data }],
    chart: { ...common.chart, type: 'treemap', height: 320 },
    colors: ['#8E2DE2'],
    plotOptions: {
      treemap: {
        enableShades: true,
        shadeIntensity: 0.5,
        reverseNegativeShade: true,
        colorScale: { ranges: [{ from: 0, to: 9999999, color: '#8E2DE2' }] }
      }
    }
  };
  analyticsCharts['treemap'] = new ApexCharts(document.querySelector("#chart-treemap-company"), opt);
  analyticsCharts['treemap'].render();
}

// 4. Heatmap
function renderHeatmap(orders, common) {
  const areaProduct = {};
  orders.forEach(o => {
    const a = o.retailers?.area || 'Unknown';
    if(!areaProduct[a]) areaProduct[a] = {};
    (o.order_items||[]).forEach(i => {
      const p = i.products?.name?.substring(0, 15) || 'Item';
      areaProduct[a][p] = (areaProduct[a][p]||0) + (parseFloat(i.quantity)||0);
    });
  });

  const areas = Object.keys(areaProduct).slice(0,6);
  const allProds = new Set();
  areas.forEach(a => Object.keys(areaProduct[a]).forEach(p => allProds.add(p)));
  const topProds = Array.from(allProds).slice(0, 8);

  const series = areas.map(a => ({
    name: a,
    data: topProds.map(p => ({ x: p, y: areaProduct[a][p] || 0 }))
  }));

  if(analyticsCharts['heatmap']) analyticsCharts['heatmap'].destroy();
  const opt = {
    ...common,
    series: series,
    chart: { ...common.chart, type: 'heatmap', height: 320 },
    colors: ['#4FACFE'],
    dataLabels: { enabled: false }
  };
  analyticsCharts['heatmap'] = new ApexCharts(document.querySelector("#chart-heatmap-products"), opt);
  analyticsCharts['heatmap'].render();
}

// 5. Salesmen Bar Chart
function renderSalesmenChart(orders, common) {
  const sm = {};
  orders.forEach(o => {
    const n = o.salesmen?.name || 'Unassigned';
    sm[n] = (sm[n]||0) + (o.order_items||[]).reduce((s,i)=>s+((parseFloat(i.quantity)||0)*(parseFloat(i.rate)||0)),0);
  });
  const data = Object.keys(sm).map(k => ({ x: k, y: Math.round(sm[k]) })).sort((a,b)=>b.y - a.y).slice(0, 7);

  if(analyticsCharts['salesmen']) analyticsCharts['salesmen'].destroy();
  const opt = {
    ...common,
    series: [{ name: 'Revenue', data: data.map(d=>d.y) }],
    chart: { ...common.chart, type: 'bar', height: 300 },
    colors: ['#00E396'],
    plotOptions: { bar: { borderRadius: 4, horizontal: true } },
    dataLabels: { enabled: false },
    xaxis: { categories: data.map(d=>d.x) },
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.8, opacityTo: 0.3, stops: [0, 90, 100] } }
  };
  analyticsCharts['salesmen'] = new ApexCharts(document.querySelector("#chart-bar-salesmen"), opt);
  analyticsCharts['salesmen'].render();
}

// 6. Histogram
function renderHistogram(orders, common) {
  const bins = { '0-2k':0, '2k-5k':0, '5k-10k':0, '10k-25k':0, '25k+':0 };
  orders.forEach(o => {
    const tot = (o.order_items||[]).reduce((s,i)=>s+((parseFloat(i.quantity)||0)*(parseFloat(i.rate)||0)),0);
    if(tot < 2000) bins['0-2k']++;
    else if(tot < 5000) bins['2k-5k']++;
    else if(tot < 10000) bins['5k-10k']++;
    else if(tot < 25000) bins['10k-25k']++;
    else bins['25k+']++;
  });

  if(analyticsCharts['hist']) analyticsCharts['hist'].destroy();
  const opt = {
    ...common,
    series: [{ name: 'Orders', data: Object.values(bins) }],
    chart: { ...common.chart, type: 'bar', height: 250 },
    colors: ['#FEB019'],
    plotOptions: { bar: { borderRadius: 4, columnWidth: '80%' } },
    dataLabels: { enabled: false },
    xaxis: { categories: Object.keys(bins) },
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.8, opacityTo: 0.3, stops: [0, 90, 100] } }
  };
  analyticsCharts['hist'] = new ApexCharts(document.querySelector("#chart-hist-orders"), opt);
  analyticsCharts['hist'].render();
}`;

content = content.replace(/function renderAnalyticsDashboard\(\) \{[\s\S]*?analyticsCharts\['hist'\]\.render\(\);\n\}/, newJS);
fs.writeFileSync('index.html', content, 'utf8');
console.log('JS Patched successfully.');
