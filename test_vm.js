const fs = require('fs');
const vm = require('vm');

const jsCode = fs.readFileSync('temp_check.js', 'utf8');

const context = {
  window: { _analyticsData: { orders: [], collections: [] }, addEventListener: () => {} },
  document: { 
    body: { classList: { toggle: () => {} } },
    getElementById: () => ({ style: {}, classList: { remove:()=>{}, toggle:()=>{} }, innerHTML: '' }), 
    querySelectorAll: () => ([]),
    querySelector: () => ({ style: {} }),
    addEventListener: () => {}
  },
  navigator: { onLine: true },
  history: { replaceState: () => {}, pushState: () => {} },
  console: console,
  setTimeout: setTimeout,
  supabase: { createClient: () => ({ auth: { getSession: async () => ({data:{session:null}}) } }) },
  ApexCharts: class { constructor(){}; render(){} destroy(){} },
  S: { adminAllRetailers: [] },
  localStorage: { getItem: () => null, setItem: () => {} }
};
vm.createContext(context);

try {
  vm.runInContext(jsCode, context);
  console.log("No top-level error. Calling initApp...");
  if (context.initApp) {
    context.initApp().catch(e => console.error("initApp error:", e));
  }
} catch (err) {
  console.error("Runtime Error:", err);
}
