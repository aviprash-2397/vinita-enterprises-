const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// 1. Add .chart-card CSS
const cssIndex = content.indexOf('</style>');
const chartCardCss = `
.chart-card {
  background: var(--surface);
  border-radius: var(--r-xl);
  padding: 24px;
  box-shadow: var(--sh-md);
  border: 1px solid var(--bd);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
}
.chart-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 15px 35px rgba(0,0,0,0.4);
  border-color: var(--or);
}
.chart-title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 16px;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 8px;
}
.chart-card::before {
  content:'';
  position:absolute;
  top:0; right:0;
  width:150px; height:150px;
  background: radial-gradient(circle, rgba(255,138,0,0.1) 0%, rgba(0,0,0,0) 70%);
  pointer-events:none;
}
`;
content = content.substring(0, cssIndex) + chartCardCss + content.substring(cssIndex);

// 2. Replace class="rcard" with class="chart-card" inside at-analytics
// I'll just regex replace it within the analytics block
const analyticsStart = content.indexOf('<div id="at-analytics"');
const analyticsEnd = content.indexOf('<div id="at-manage"');
let analyticsBlock = content.substring(analyticsStart, analyticsEnd);

analyticsBlock = analyticsBlock.replace(/class="rcard"/g, 'class="chart-card"');
// Fix titles inside analytics
analyticsBlock = analyticsBlock.replace(/<div style="font-size:16px; font-weight:700; margin-bottom:10px; color:#fff; display:flex; align-items:center; gap:8px;">/g, '<div class="chart-title">');
analyticsBlock = analyticsBlock.replace(/<div style="font-size:16px; font-weight:700; margin-bottom:10px; color:#fff;">/g, '<div class="chart-title"><div style="width:10px; height:10px; border-radius:50%; background:var(--or);"></div>');

content = content.substring(0, analyticsStart) + analyticsBlock + content.substring(analyticsEnd);

// 3. Fix manageList('areas') missing 'No areas yet.' text
const oldAreasList = `</div>\`).join('')}</div>\`;`;
const newAreasList = `</div>\`).join('')||'<div class="no-data">No areas created yet. Click + Add Area above.</div>'}</div>\`;`;
content = content.replace(oldAreasList, newAreasList);

fs.writeFileSync('index.html', content);
console.log('Fixed Visual Structure for Analytics and Area empty states');
