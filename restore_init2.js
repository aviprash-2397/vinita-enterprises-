const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const regex = /initApp\(\);[\s]*\/\/ ===+[\s]*\/\/   ANALYTICS ENGINE/;
const newInit = `async function initApp() {
  try {
    restoreState();
    if (S.isAdmin) {
      showPageDirect('pg-admin');
      if (typeof switchAdminTab === 'function') switchAdminTab('orders', document.querySelector('.tab'));
    } else if (S.salesman) {
      showPageDirect('pg-salesman-home');
    } else {
      showPageDirect('pg-auth');
    }
  } catch(e) {
    console.error('initApp error:', e);
  }
}

initApp();

// ============================================================
//   ANALYTICS ENGINE`;

if (regex.test(content)) {
  if (!content.includes('async function initApp() {')) {
    content = content.replace(regex, newInit);
    fs.writeFileSync('index.html', content);
    console.log('REALLY restored initApp()');
  } else {
    console.log('Already there');
  }
} else {
  console.log('Regex failed to match');
}
