const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const oldRender = `function renderAnalyticsDashboard() {
  const allOrders = window._analyticsData.orders;`;

const newRender = `function renderAnalyticsDashboard() {
  try {
    const allOrders = window._analyticsData.orders;`;

const oldEnd = `  // 7. Histogram (Order Size Dist)
  renderHistogram(orders, common);
}`;

const newEnd = `  // 7. Histogram (Order Size Dist)
  renderHistogram(orders, common);
  document.getElementById('analytics-error').style.display='none';
  document.getElementById('analytics-loading').style.display='none';
  } catch(e) {
    document.getElementById('analytics-error').style.display='block';
    document.getElementById('analytics-error').textContent = 'Render Error: ' + e.message + ' \\n' + e.stack;
    document.getElementById('analytics-loading').style.display='none';
  }
}`;

content = content.replace(oldRender, newRender).replace(oldEnd, newEnd);
fs.writeFileSync('index.html', content);
console.log('Added try-catch to renderAnalyticsDashboard');
