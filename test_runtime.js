const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

let html = fs.readFileSync('index.html', 'utf8');

// Inject mocks at the very top of the script
html = html.replace('<script>', '<script>window.supabase = { auth: { getSession: async () => ({data:{session:null}}) } }; window.ApexCharts = class { constructor(){}; render(){} destroy(){} };');

const virtualConsole = new jsdom.VirtualConsole();
virtualConsole.on("error", (err) => {
  console.error("Runtime Error:", err);
});
virtualConsole.on("jsdomError", (err) => {
  console.error("JSDOM Error:", err);
});
virtualConsole.on("log", (log) => {
  console.log("Console log:", log);
});

const dom = new JSDOM(html, { runScripts: "dangerously", virtualConsole });
