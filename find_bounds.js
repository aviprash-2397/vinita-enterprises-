const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');
const startJs = lines.findIndex(l => l.includes('function renderAnalyticsDashboard() {'));
const endJs = lines.findIndex((l, i) => i > startJs && l.includes('async function fetchTotalCollections('));
console.log('JS:', startJs, endJs);
