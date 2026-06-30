const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// 1. Add back the "Reports" tab button.
const tabStr = `<div class="tab" onclick="switchAdminTab('collections',this)">Collections</div>`;
const newTabStr = `<div class="tab" onclick="switchAdminTab('collections',this)">Collections</div>
    <div class="tab" onclick="switchAdminTab('reports',this)">Reports</div>`;
content = content.replace(tabStr, newTabStr);

// 2. Add back the `at-reports` container before `at-analytics`.
const analyticsStr = `<div id="at-analytics"`;
const reportsHtml = `<div id="at-reports" class="ct" style="display:none"><div id="reports-content"></div></div>\n  <div id="at-analytics"`;
content = content.replace(analyticsStr, reportsHtml);

// 3. Update switchAdminTab
const switchStr = `['orders','collections','analytics','manage']`;
const newSwitchStr = `['orders','collections','reports','analytics','manage']`;
content = content.replace(switchStr, newSwitchStr);

const logicStr = `if(tab==='analytics')loadAnalytics();`;
const newLogicStr = `if(tab==='reports')loadReports();\n  if(tab==='analytics')loadAnalytics();`;
content = content.replace(logicStr, newLogicStr);

fs.writeFileSync('index.html', content);
console.log('Restored Reports tab HTML and switch logic.');
