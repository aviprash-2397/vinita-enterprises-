const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const targetStr = '<div id="pg-admin" class="pg">\r\n  <div class="hd">\r\n      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>';

const replacement = `<div id="pg-admin" class="pg">
  <div class="hd">
    <button class="hd-back" onclick="adminLogout()">←</button>
    <div class="hd-title"><div>Admin Dashboard</div><div class="hd-sub">Vinita Enterprises</div></div>
  </div>
  <div class="tb">
    <div class="tab active" onclick="switchAdminTab('orders',this)">Orders</div>
    <div class="tab" onclick="switchAdminTab('collections',this)">Collections</div>
    <div class="tab" onclick="switchAdminTab('analytics',this)">Analytics</div>
    <div class="tab" onclick="switchAdminTab('manage',this)">Manage</div>
  </div>
  <div id="at-orders" class="ct">
    <div id="admin-stats" class="sg"></div>
    <div class="sb">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>`;

// Try regex if strict matching fails
content = content.replace(/<div id="pg-admin" class="pg">\s*<div class="hd">\s*<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2\.2"><circle cx="11" cy="11" r="7"\/><path d="m21 21-4\.3-4\.3"\/><\/svg>/, replacement);

fs.writeFileSync('index.html', content);
console.log('Restored tabs!');
