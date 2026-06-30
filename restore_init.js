const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const oldInit = `initApp();

// ============================================================
//   ANALYTICS ENGINE`;

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

if(content.includes('initApp();')) {
  // If it's already defined just before, don't double inject
  if(!content.includes('async function initApp() {')) {
    content = content.replace(oldInit, newInit);
    fs.writeFileSync('index.html', content);
    console.log('Successfully restored initApp()');
  } else {
    console.log('initApp() already exists?!');
  }
} else {
  console.log('Could not find initApp();');
}
