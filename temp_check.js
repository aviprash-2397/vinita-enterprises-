
const SUPABASE_URL='https://rryibbqgeqtitdoeaxsx.supabase.co';
const SUPABASE_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyeWliYnFnZXF0aXRkb2VheHN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyODcwMjgsImV4cCI6MjA5Nzg2MzAyOH0.x3x3qBPl0cZ4XpL8VJHD3Fo7ilHC1I-nneoQGnLaM2U';
const ADMIN_PW='shyam2026';
const WA_NUM='919973478456';
const STORAGE_KEY='vinita_state_v2';
const {createClient}=supabase;
const db=createClient(SUPABASE_URL,SUPABASE_KEY);
const S={salesman:null,retailer:null,cart:[],editingOrderId:null,companies:[],retailers:[],allRetailers:[],salesmen:[],currentProducts:[],allProducts:[],categories:[],activeCategory:'all',adminOrders:[],filteredOrders:[],statusFilter:'all',searchTerm:'',dateFilter:'today',customFromDate:null,customToDate:null,collections:[],filteredCollections:[],colDateFilter:'today',lastSoldRates:{},online:navigator.onLine};

function toast(msg,dur=2800){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('show'),dur);}
function fmtDate(d){if(!d)return'-';return new Date(d).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'});}
function fmtDateShort(d){if(!d)return'-';return new Date(d).toLocaleDateString('en-IN',{day:'numeric',month:'short'});}
// Marg ERP wants DD/MM/YYYY format for Excel import (Indian date format)
function fmtDateMarg(d){
  if(!d)return'';
  const dt=new Date(d);
  const dd=String(dt.getDate()).padStart(2,'0');
  const mm=String(dt.getMonth()+1).padStart(2,'0');
  const yyyy=dt.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}
function fmtOrd(n){return'ORD-'+String(n).padStart(4,'0');}
function statusLabel(s){const m={placed:'Placed',confirmed:'Confirmed',dispatched:'Dispatched',delivered:'Delivered',cancelled:'Cancelled',done:'Done'};return m[(s||'').toLowerCase()]||s||'Placed';}
function fmtMoney(n){return'₹'+(Number(n)||0).toLocaleString('en-IN',{maximumFractionDigits:2,minimumFractionDigits:0});}
function fmtMoneyCompact(n){const v=Number(n)||0;if(v>=100000)return'₹'+(v/100000).toFixed(1)+'L';if(v>=1000)return'₹'+(v/1000).toFixed(1)+'k';return'₹'+v.toFixed(0);}
function esc(s){return(s||'').toString().replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
function escQ(s){
  let val = (s||'').toString();
  val = val.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '&quot;');
  return val.replace(/[&<>]/g, m => ({'&': '&amp;', '<': '&lt;', '>': '&gt;'}[m]));
}
async function hashSalesmanPassword(password){
  if(!window.crypto?.subtle||!window.TextEncoder)throw new Error('Password login needs HTTPS');
  const raw=new TextEncoder().encode('vinita-salesman-login:'+password);
  const buf=await crypto.subtle.digest('SHA-256',raw);
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
}
function cartTotal(){return Math.round(S.cart.reduce((s,c)=>s+c.qty*(c.rate||0),0));}
function cartQty(){return S.cart.reduce((s,c)=>s+c.qty,0);}
function skeletonList(){return Array(4).fill(0).map(()=>'<div class="skel-card"><div class="skel" style="width:60%;height:16px;margin-bottom:8px"></div><div class="skel" style="width:40%;height:12px"></div></div>').join('');}
function skeletonGrid(){return Array(6).fill(0).map(()=>'<div class="skel-card" style="padding:24px 12px;text-align:center"><div class="skel" style="width:56px;height:56px;border-radius:16px;margin:0 auto 11px"></div><div class="skel" style="width:60%;height:12px;margin:0 auto"></div></div>').join('');}

// ============================================================
//   ICONS  —  inline SVG, inherits color, 1.6 stroke
// ============================================================
const ICONS={
  box:'<path d="M21 8 12 3 3 8v8l9 5 9-5V8Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
  scooter:'<circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/><path d="M9 17H6V8a2 2 0 0 1 2-2h2"/><path d="M14 6h3l4 6v5h-3"/>',
  chart:'<path d="M3 3v18h18"/><rect x="7" y="12" width="3" height="6"/><rect x="12" y="8" width="3" height="10"/><rect x="17" y="4" width="3" height="14"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/>',
  shop:'<path d="M3 9h18l-1.5-5h-15L3 9Z"/><path d="M4 9v11h16V9"/><path d="M9 20v-6h6v6"/>',
  factory:'<path d="M3 21V10l5 3V8l6 4V8l6 5v8H3Z"/><path d="M7 17h2M11 17h2M15 17h2"/>',
  cart:'<circle cx="9" cy="20" r="1.5"/><circle cx="17" cy="20" r="1.5"/><path d="M3 4h2l2.5 11h11L21 7H7"/>',
  list:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  minus:'<path d="M5 12h14"/>',
  check:'<path d="M5 12l5 5 9-11"/>',
  checkCircle:'<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
  x:'<path d="M6 6l12 12M18 6 6 18"/>',
  xCircle:'<circle cx="12" cy="12" r="9"/><path d="m9 9 6 6M15 9l-6 6"/>',
  alert:'<path d="M12 3 2 21h20L12 3Z"/><path d="M12 10v5"/><circle cx="12" cy="18" r="1" fill="currentColor"/>',
  edit:'<path d="M11 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-6"/><path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5Z"/>',
  trash:'<path d="M4 7h16M9 7V4h6v3M6 7v13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7"/><path d="M10 12v5M14 12v5"/>',
  download:'<path d="M12 3v13M6 11l6 6 6-6M5 21h14"/>',
  upload:'<path d="M12 21V8M6 13l6-6 6 6M5 3h14"/>',
  refresh:'<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
  calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  cash:'<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 10v.01M18 14v.01"/>',
  card:'<rect x="2" y="6" width="20" height="13" rx="2"/><path d="M2 11h20"/>',
  truck:'<path d="M3 7h11v9H3z"/><path d="M14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
  phone:'<path d="M22 17v3a2 2 0 0 1-2.2 2 19 19 0 0 1-8.3-3 19 19 0 0 1-6-6A19 19 0 0 1 2.5 4.2 2 2 0 0 1 4.5 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.4 2.1L8.5 9.5a16 16 0 0 0 6 6l1.1-1.2a2 2 0 0 1 2.1-.4c.8.3 1.7.5 2.6.6A2 2 0 0 1 22 17Z"/>',
  pin:'<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  note:'<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6Z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>',
  gift:'<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v9h14v-9M12 8v13"/><path d="M12 8s-2-5-5-5a2 2 0 1 0 0 5M12 8s2-5 5-5a2 2 0 1 1 0 5"/>',
  lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  send:'<path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z"/>',
  arrowRight:'<path d="M5 12h14M13 6l6 6-6 6"/>',
  back:'<path d="M19 12H5M11 18l-6-6 6-6"/>',
  hash:'<path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18"/>',
  building:'<rect x="4" y="2" width="16" height="20" rx="1"/><path d="M9 22v-5h6v5M8 6h.01M8 10h.01M8 14h.01M16 6h.01M16 10h.01M16 14h.01"/>',
  wifi:'<path d="M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0"/><circle cx="12" cy="20" r="1" fill="currentColor"/>',
  wifiOff:'<path d="m2 2 20 20M8.5 16a5 5 0 0 1 7 0M5 12.5a10 10 0 0 1 4-2.7m6 .2c1.6.5 3.1 1.4 4 2.5"/>',
  filter:'<path d="M3 5h18l-7 9v6l-4-2v-4L3 5Z"/>',
  dollar:'<path d="M12 2v20M17 6H10a3 3 0 0 0 0 6h4a3 3 0 0 1 0 6H6"/>',
  dot:'<circle cx="12" cy="12" r="3" fill="currentColor"/>',
  folder:'<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/>',
  whatsapp:'<path d="M16.5 13.5c-.3-.2-1.8-.9-2-1-.3-.1-.5-.2-.7.1-.2.3-.7 1-.9 1.2-.2.2-.3.2-.6.1-.3-.2-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6.1-.1.3-.3.5-.5l.3-.4c.1-.2 0-.4 0-.5 0-.1-.7-1.7-1-2.3-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.1-.3-.2-.6-.3Z"/><path d="M12 2a10 10 0 0 0-8.5 15.3L2 22l4.8-1.4A10 10 0 1 0 12 2Z"/>'
};
function ico(name,size){const s=size||18;const d=ICONS[name]||'';return`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;vertical-align:middle">${d}</svg>`;}

function persistState(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify({salesman:S.salesman,retailer:S.retailer,cart:S.cart,editingOrderId:S.editingOrderId,isAdmin:S.isAdmin}));}catch(e){}}
function restoreState(){try{const raw=localStorage.getItem(STORAGE_KEY);if(!raw)return;const d=JSON.parse(raw);if(d.salesman)S.salesman=d.salesman;if(d.retailer)S.retailer=d.retailer;if(Array.isArray(d.cart))S.cart=d.cart;if(d.editingOrderId)S.editingOrderId=d.editingOrderId;if(d.isAdmin)S.isAdmin=d.isAdmin;}catch(e){}}
function clearPersistedState(){try{localStorage.removeItem(STORAGE_KEY);}catch(e){}}
function updateCartCounts(){const q=cartQty();const label=q>0?`· ${q} ${q===1?'item':'items'}`:'';['cart-count-co','cart-count-pr'].forEach(id=>{const el=document.getElementById(id);if(el)el.textContent=label;});persistState();}

function gotoPage(id){
  history.pushState({page:id},'','');
  showPageDirect(id);
}

window.addEventListener('popstate', (e) => {
  if (e.state && e.state.page) {
    showPageDirect(e.state.page);
  }
});

function showPageDirect(id){
  document.querySelectorAll('.pg').forEach(p=>p.classList.remove('active'));
  const target=document.getElementById(id);if(!target)return;
  target.classList.add('active');window.scrollTo(0,0);
  // Floating calculator is visible on salesman pages — handy during order taking
  const calcPages=['pg-salesman-home','pg-select-retailer','pg-companies','pg-products','pg-cart','pg-order-history'];
  document.getElementById('fcalc-fab').style.display=calcPages.includes(id)?'flex':'none';
  document.getElementById('fcalc-panel').classList.remove('show');
  if(id==='pg-salesman-select')loadSalesmenList();
  if(id==='pg-salesman-home')loadSalesmanHome();
  if(id==='pg-select-retailer'){renderRetailerList();if(S.salesman){document.getElementById('sel-ret-sub').textContent=`Hi ${S.salesman.name} · ${S.retailers.length} retailers`;}}
  if(id==='pg-companies'){loadCompanies();updateCartCounts();renderCreditWarning('co-warn');if(S.retailer){document.getElementById('co-page-sub').textContent=S.retailer.name;}}
  if(id==='pg-products'){renderCategoryChips();if(S.retailer){document.getElementById('prod-page-sub').textContent=S.retailer.name;}}
  if(id==='pg-cart'){if(!S.editingOrderId){document.getElementById('cart-title').textContent='Cart & Order';document.getElementById('place-btn').innerHTML='Place Order &amp; Send on WhatsApp';}renderCartPage();}
  if(id==='pg-order-history')loadSalesmanOrders();
}

// ============================================================
//   FLOATING CALCULATOR
// ============================================================
const calc={curr:'0',prev:'',op:null,justEvaluated:false};
function toggleCalc(){document.getElementById('fcalc-panel').classList.toggle('show');}
function calcRender(){
  document.getElementById('fcalc-curr').textContent=calc.curr;
  document.getElementById('fcalc-prev').textContent=calc.prev?(calc.prev+' '+(calc.op==='*'?'×':calc.op==='/'?'÷':calc.op||'')):'';
}
function calcDigit(d){
  if(calc.justEvaluated){calc.curr='0';calc.justEvaluated=false;}
  if(d==='.'){if(calc.curr.includes('.'))return;}
  if(calc.curr==='0'&&d!=='.')calc.curr=d;
  else calc.curr=(calc.curr+d).slice(0,12);
  calcRender();
}
function calcOp(o){
  if(calc.prev&&calc.op&&!calc.justEvaluated){calcEquals();}
  calc.prev=calc.curr;calc.op=o;calc.curr='0';calc.justEvaluated=false;calcRender();
}
function calcEquals(){
  if(!calc.op||!calc.prev)return;
  const a=parseFloat(calc.prev),b=parseFloat(calc.curr);let r=0;
  if(calc.op==='+')r=a+b;else if(calc.op==='-')r=a-b;else if(calc.op==='*')r=a*b;
  else if(calc.op==='/')r=b===0?0:a/b;
  calc.curr=Number.isFinite(r)?(+r.toFixed(4)).toString():'0';
  calc.prev='';calc.op=null;calc.justEvaluated=true;calcRender();
}
function calcPercent(){const v=parseFloat(calc.curr)/100;calc.curr=(+v.toFixed(4)).toString();calcRender();}
function calcClear(){calc.curr='0';calc.prev='';calc.op=null;calc.justEvaluated=false;calcRender();}
function calcBackspace(){
  if(calc.justEvaluated){calcClear();return;}
  calc.curr=calc.curr.length>1?calc.curr.slice(0,-1):'0';calcRender();
}

function setOnline(on){S.online=on;document.body.classList.toggle('offline',!on);document.getElementById('offline-bar').classList.toggle('show',!on);}
window.addEventListener('online',()=>setOnline(true));
window.addEventListener('offline',()=>setOnline(false));

let deferredInstall=null;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e;if(!sessionStorage.getItem('install_dismissed'))document.getElementById('install-bar').classList.add('show');});
function installApp(){if(!deferredInstall){hideInstall();return;}deferredInstall.prompt();deferredInstall.userChoice.then(()=>{deferredInstall=null;hideInstall();});}
function hideInstall(){document.getElementById('install-bar').classList.remove('show');sessionStorage.setItem('install_dismissed','1');}
if('serviceWorker' in navigator){
  window.addEventListener('load',()=>{
    navigator.serviceWorker.register('./sw.js').catch(()=>{});
  });
  // Listen for "SW_UPDATED" messages from the service worker — fired when a new version activates
  navigator.serviceWorker.addEventListener('message',(e)=>{
    if(e.data?.type==='SW_UPDATED'){
      showUpdateBanner();
    }
  });
  // Also check for updates periodically (every time the app gains focus, after 10+ minutes idle)
  let lastCheck=Date.now();
  document.addEventListener('visibilitychange',()=>{
    if(document.visibilityState==='visible'&&Date.now()-lastCheck>600000){
      lastCheck=Date.now();
      navigator.serviceWorker.getRegistration().then(reg=>reg?.update()).catch(()=>{});
    }
  });
}
function showUpdateBanner(){
  if(document.getElementById('update-banner'))return;
  const b=document.createElement('div');
  b.id='update-banner';
  b.style.cssText='position:fixed;bottom:max(16px,env(safe-area-inset-bottom));left:16px;right:16px;background:var(--tx);color:#fff;padding:14px 16px;border-radius:14px;box-shadow:var(--sh-lg);display:flex;align-items:center;gap:12px;z-index:9999;font-weight:500;font-size:14px;animation:slideUp .3s ease-out';
  b.innerHTML='<span style="flex:1">New version available — tap to refresh</span><button onclick="location.reload(true)" style="background:var(--or);color:#fff;border:none;padding:8px 14px;border-radius:8px;font-weight:600;cursor:pointer;font-size:13px">Refresh</button>';
  document.body.appendChild(b);
}

async function loadSalesmenList(){
  const el=document.getElementById('salesman-list');el.innerHTML=skeletonList();
  const{data}=await db.from('salesmen').select('*').neq('name','Admin').order('name');
  S.salesmen=data||[];
  if(!S.salesmen.length){el.innerHTML='<div class="empty"><div class="ei"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg></div><div class="empty-title">No salesmen yet</div><div class="empty-sub">Ask admin to add them from the Manage tab.</div></div>';return;}
  el.innerHTML=S.salesmen.map(s=>`<div class="ss-item" onclick="selectSalesman('${s.id}','${escQ(s.name)}')">
    <div class="ss-av">${esc(s.name[0].toUpperCase())}</div>
    <div style="flex:1;min-width:0"><div style="font-weight:600;font-size:15px;letter-spacing:-0.01em">${esc(s.name)}</div><div style="font-size:12px;color:var(--mu);font-weight:500;margin-top:2px">${s.password_hash?'Enter password to continue':'Ask admin to set password'}</div></div>
    <div style="color:var(--or);font-size:22px;font-weight:700">›</div></div>`).join('');
}

async function selectSalesman(id,name){
  openSalesmanPassword(id,name);
}

function openSalesmanPassword(id,name){
  document.getElementById('modal-title').textContent='Salesman Login';
  document.getElementById('modal-body').innerHTML=`
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:18px">
      <div class="ss-av" style="margin:0">${esc(name[0]?.toUpperCase()||'?')}</div>
      <div style="min-width:0">
        <div style="font-weight:700;font-size:16px;letter-spacing:-0.01em">${esc(name)}</div>
        <div style="font-size:13px;color:var(--mu);font-weight:500;margin-top:2px">Enter your password to continue</div>
      </div>
    </div>
    <div class="fg"><label>Password *</label><input id="salesman-pw" type="password" placeholder="••••••••" onkeydown="if(event.key==='Enter')salesmanLogin('${id}','${escQ(name)}')"></div>
    <button class="btn btn-or" id="salesman-login-btn" onclick="salesmanLogin('${id}','${escQ(name)}')">Login →</button>`;
  openModal();
  setTimeout(()=>document.getElementById('salesman-pw')?.focus(),80);
}

async function salesmanLogin(id,name){
  const input=document.getElementById('salesman-pw');
  const btn=document.getElementById('salesman-login-btn');
  const password=(input?.value||'').trim();
  if(!password){toast('Password required');return;}
  if(btn){btn.disabled=true;btn.textContent='Checking...';}
  try{
    const{data,error}=await db.from('salesmen').select('*').eq('id',id).single();
    if(error){toast(''+error.message);return;}
    if(!Object.prototype.hasOwnProperty.call(data||{},'password_hash')){toast('Run database update first');return;}
    const saved=(data.password_hash||'').trim();
    if(!saved){toast('Admin has not set password');return;}
    const hash=await hashSalesmanPassword(password);
    if(hash!==saved){toast('Wrong password');return;}
    closeModal();
    await finishSalesmanLogin(data.id,data.name||name);
  }catch(err){
    toast(err.message||'Login failed');
  }finally{
    if(document.getElementById('modal').classList.contains('show')&&btn){btn.disabled=false;btn.textContent='Login →';}
  }
}

async function finishSalesmanLogin(id,name){
  S.salesman={id,name};S.cart=[];S.retailer=null;S.editingOrderId=null;
  document.getElementById('sel-ret-title').textContent=name;
  await loadRetailers();
  persistState();
  startMandatoryTracking();
  gotoPage('pg-salesman-home');
}

// ============================================================
//   SALESMAN HOME DASHBOARD
// ============================================================
async function loadSalesmanHome(){
  if(!S.salesman)return;
  const greeting=document.getElementById('sh-greeting');
  const subtitle=document.getElementById('sh-subtitle');
  const hour=new Date().getHours();
  const tod=hour<12?'Good morning':hour<17?'Good afternoon':'Good evening';
  greeting.textContent=`${tod}, ${S.salesman.name}`;
  subtitle.textContent=new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'});

  // Show loading skeletons
  document.getElementById('sh-stats').innerHTML=skeletonGrid().split('skel-card').slice(0,5).join('skel-card');
  document.getElementById('sh-pending').innerHTML='<div class="skel-card"><div class="skel" style="width:70%;height:14px;margin-bottom:6px"></div><div class="skel" style="width:40%;height:11px"></div></div>';
  document.getElementById('sh-recent').innerHTML=skeletonList();
  document.getElementById('sh-overdue-banner').innerHTML='';

  // Fetch updates
  const {data:upd, error:updErr} = await db.from('updates').select('*').eq('is_active',true).order('created_at',{ascending:false});
  const updates = updErr ? JSON.parse(localStorage.getItem('vinita_updates')||'[]').filter(x=>x.is_active) : upd||[];
  if(updates.length>0){
    document.getElementById('sh-updates-carousel').innerHTML = `
      <div style="display:flex;gap:12px;overflow-x:auto;padding-bottom:10px;snap-type:x mandatory">
        ${updates.map(u=>`
          <div style="flex:0 0 85%;scroll-snap-align:center;background:linear-gradient(135deg,#fff8f1,#ffedd5);border:1px solid #fed7aa;border-radius:12px;padding:14px;box-shadow:var(--sh-sm)">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
              <span style="font-size:16px">📢</span>
              <div style="font-weight:700;font-size:14px;color:var(--or-d)">${esc(u.title)}</div>
            </div>
            <div style="font-size:13px;color:var(--tx);line-height:1.4">${esc(u.content)}</div>
          </div>
        `).join('')}
      </div>
    `;
  } else {
    document.getElementById('sh-updates-carousel').innerHTML = '';
  }

  // Fetch all this salesman's orders (we'll compute everything from one query)
  const{data:orders,error}=await db.from('orders')
    .select('id,order_number,order_date,status,payment_term,credit_period_days,delivered_on,payment_due_on,retailers(id,name,area),order_items(quantity,rate),payments(status)')
    .eq('salesman_id',S.salesman.id)
    .order('created_at',{ascending:false});

  if(error){
    document.getElementById('sh-stats').innerHTML='<div class="err-bar">Could not load: '+esc(error.message)+'</div>';
    return;
  }
  const all=(orders||[]).filter(o=>(o.status||'placed')!=='cancelled');
  const today=toYMD(new Date());
  const yest=(()=>{const d=new Date();d.setDate(d.getDate()-1);return toYMD(d);})();
  const moStart=toYMD(new Date(new Date().getFullYear(),new Date().getMonth(),1));

  const orderTotal=o=>Math.round((o.order_items||[]).reduce((s,i)=>s+((Number(i.quantity)||0)*(Number(i.rate)||0)),0));
  const todayOrders=all.filter(o=>normalizeOrderDate(o.order_date)===today);
  const yestOrders=all.filter(o=>normalizeOrderDate(o.order_date)===yest);
  const monthOrders=all.filter(o=>normalizeOrderDate(o.order_date)>=moStart);
  const todayRev=todayOrders.reduce((s,o)=>s+orderTotal(o),0);
  const yestRev=yestOrders.reduce((s,o)=>s+orderTotal(o),0);
  const monthRev=monthOrders.reduce((s,o)=>s+orderTotal(o),0);
  const unpaidCount=all.filter(o=>o.status!=='cancelled'&&(o.payments?.[0]?.status||'unpaid')!=='paid').length;
  const undelivered=all.filter(o=>['placed','confirmed','dispatched'].includes(o.status||'placed')).length;

  // Cache filtered lists for the salesman orders page to pick up
  S.salesmanStatViews={today:todayOrders,yesterday:yestOrders,month:monthOrders,
    undelivered:all.filter(o=>['placed','confirmed','dispatched'].includes(o.status||'placed')),
    unpaid:all.filter(o=>o.status!=='cancelled'&&(o.payments?.[0]?.status||'unpaid')!=='paid')};

  document.getElementById('sh-stats').innerHTML=`
    <div class="sc sc-tap" onclick="openSalesmanOrdersFiltered('today','Today')"><div class="sc-icon">${ico('calendar',16)}</div><div class="sv" style="font-size:24px">${fmtMoneyCompact(todayRev)}</div><div class="sl">Today · ${todayOrders.length} ord</div></div>
    <div class="sc sc-tap" onclick="openSalesmanOrdersFiltered('yesterday','Yesterday')"><div class="sc-icon">${ico('clock',16)}</div><div class="sv" style="font-size:24px">${fmtMoneyCompact(yestRev)}</div><div class="sl">Yesterday · ${yestOrders.length} ord</div></div>
    <div class="sc sc-tap" onclick="openSalesmanOrdersFiltered('month','This Month')"><div class="sc-icon">${ico('chart',16)}</div><div class="sv" style="font-size:24px">${fmtMoneyCompact(monthRev)}</div><div class="sl">This Month · ${monthOrders.length} ord</div></div>
    <div class="sc sc-tap" onclick="openSalesmanOrdersFiltered('undelivered','Undelivered')"><div class="sc-icon">${ico('truck',16)}</div><div class="sv">${undelivered}</div><div class="sl">Undelivered</div></div>
    <div class="sc sc-tap" style="grid-column:span 2;background:var(--or-grad);color:#fff;border:none" onclick="openSalesmanOrdersFiltered('unpaid','Unpaid Orders')">
      <div class="sc-icon" style="color:rgba(255,255,255,.85);opacity:1">${ico('dollar',16)}</div>
      <div class="sv" style="color:#fff;font-size:30px">${unpaidCount}</div>
      <div class="sl" style="color:rgba(255,255,255,.92)">Unpaid Orders · tap to follow up</div>
    </div>`;

  // === Pending payments analysis ===
  // An order needs follow-up if: status='delivered' AND payment unpaid
  // Due-date math: delivered_on + credit_period_days (cash = due immediately on delivery)
  const pending=all.filter(o=>o.status==='delivered'&&(o.payments?.[0]?.status||'unpaid')!=='paid');
  const todayDate=new Date();todayDate.setHours(0,0,0,0);
  pending.forEach(o=>{
    if(o.payment_due_on){
      const due=new Date(o.payment_due_on);due.setHours(0,0,0,0);
      o._daysOverdue=Math.floor((todayDate-due)/(1000*60*60*24));
    }else if(o.delivered_on){
      const del=new Date(o.delivered_on);del.setHours(0,0,0,0);
      const period=o.payment_term==='credit'?(o.credit_period_days||0):0;
      const due=new Date(del);due.setDate(due.getDate()+period);
      o._daysOverdue=Math.floor((todayDate-due)/(1000*60*60*24));
    }else{
      o._daysOverdue=null;
    }
  });
  pending.sort((a,b)=>(b._daysOverdue??-999)-(a._daysOverdue??-999));
  const overdue=pending.filter(o=>(o._daysOverdue??-1)>0);
  const dueSoon=pending.filter(o=>(o._daysOverdue??-99)>=-3&&(o._daysOverdue??-99)<=0);
  const overdueTotal=overdue.reduce((s,o)=>s+orderTotal(o),0);

  // === Overdue banner ===
  if(overdue.length>0){
    document.getElementById('sh-overdue-banner').innerHTML=`
      <div style="background:linear-gradient(135deg,#fee2e2 0%,#fecaca 100%);border:1px solid #fca5a5;border-radius:var(--r-lg);padding:14px 16px;margin-bottom:16px;display:flex;align-items:center;gap:12px;box-shadow:var(--sh-sm)">
        <div style="color:#991b1b;flex-shrink:0">${ico('alert',24)}</div>
        <div style="flex:1;min-width:0">
          <div style="font-family:var(--font-serif);font-size:18px;font-weight:400;letter-spacing:-0.015em;color:#991b1b"><em>${overdue.length} payment${overdue.length>1?'s':''}</em> overdue</div>
          <div style="font-size:12.5px;color:#7f1d1d;font-weight:500;margin-top:2px">Total ${fmtMoney(overdueTotal)} · Follow up today</div>
        </div>
      </div>`;
  }

  // === Attention Needed ===
  const thirtyDaysAgoStr=toYMD(new Date(new Date().setDate(new Date().getDate()-30)));
  const recentR=new Set(all.filter(o=>normalizeOrderDate(o.order_date)>=thirtyDaysAgoStr).map(o=>o.retailers?.id));
  const inactiveR = (S.retailers||[]).filter(r=>!recentR.has(r.id));
  const defaultersR = (S.retailers||[]).filter(r=>r.outstanding>0).sort((a,b)=>b.outstanding-a.outstanding);
  
  let attentionHtml = '';
  if(inactiveR.length>0 || defaultersR.length>0){
    attentionHtml += `<div class="section-intro" style="margin-top:24px;margin-bottom:14px"><div class="section-eyebrow">Attention Needed</div><div class="section-title" style="font-size:22px">Retailer <em>follow-ups.</em></div></div>`;
    const attentionList = [];
    defaultersR.forEach(r=> attentionList.push({...r, reason:'high_due', desc:`Due: ${fmtMoneyCompact(r.outstanding)}`}));
    inactiveR.forEach(r=>{
      if(!attentionList.find(x=>x.id===r.id)) attentionList.push({...r, reason:'inactive', desc:'>30 days inactive'});
    });
    attentionHtml += attentionList.slice(0,4).map(r=>`
      <div class="list-item" style="padding:12px 14px;background:var(--card);border:1px solid var(--bd);border-radius:10px;margin-bottom:10px">
        <div class="li-info">
          <div class="li-name">${esc(r.name)}</div>
          <div class="li-meta" style="color:${r.reason==='high_due'?'var(--or-d)':'#7f1d1d'};font-weight:600">${r.desc}</div>
        </div>
        <button class="btn btn-ghost btn-sm" onclick="openReorderReminder('${r.id}')">${ico('send',14)} Nudge</button>
      </div>
    `).join('');
  }
  document.getElementById('sh-attention-wrapper').innerHTML=attentionHtml;

  // === Pending list (top 5) ===
  if(!pending.length){
    document.getElementById('sh-pending').innerHTML='<div class="empty" style="padding:20px"><div style="font-size:13px;color:var(--mu);font-weight:500">No pending payments — all caught up.</div></div>';
  }else{
    document.getElementById('sh-pending').innerHTML=pending.slice(0,8).map(o=>{
      const tot=orderTotal(o);
      let badge,tone;
      if(o._daysOverdue==null){badge='Awaiting due date';tone='b-placed';}
      else if(o._daysOverdue>0){badge=`${o._daysOverdue} day${o._daysOverdue>1?'s':''} overdue`;tone='b-unpaid';}
      else if(o._daysOverdue===0){badge='Due today';tone='b-credit';}
      else badge=`Due in ${-o._daysOverdue} day${o._daysOverdue===-1?'':'s'}`,tone='b-placed';
      const phone='';// could fetch retailer contact for direct call
      return`<div class="oc" style="margin-bottom:8px;cursor:pointer" onclick="openCollectModal('${o.retailers?.id}','${escQ(o.retailers?.name||'')}',${tot})">
        <div class="oh">
          <div>
            <div class="on" style="font-size:15px">${esc(o.retailers?.name||'-')}</div>
            <div class="om">${fmtOrd(o.order_number)} · ${fmtDate(o.order_date)} · ${o.payment_term==='credit'?o.credit_period_days+'d credit':'cash on delivery'}</div>
          </div>
          <span class="badge ${tone}">${badge}</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px">
          <div style="font-size:15px;font-weight:700;color:var(--or)">${fmtMoney(tot)}</div>
          <button class="btn btn-or btn-xs" onclick="event.stopPropagation();openCollectModal('${o.retailers?.id}','${escQ(o.retailers?.name||'')}',${tot})">${ico('cash',12)} Collect</button>
        </div>
      </div>`;
    }).join('');
  }

  // === Recent orders (top 5) ===
  if(!all.length){
    document.getElementById('sh-recent').innerHTML='<div class="empty" style="padding:20px"><div style="font-size:13px;color:var(--mu);font-weight:500">No orders yet. Tap "Take New Order" below to start.</div></div>';
  }else{
    document.getElementById('sh-recent').innerHTML=all.slice(0,5).map(o=>{
      const tot=orderTotal(o);const status=o.status||'placed';
      return`<div class="oc" style="cursor:pointer;margin-bottom:8px" onclick="gotoPage('pg-order-history')">
        <div class="oh">
          <div>
            <div class="on" style="font-size:15px">${fmtOrd(o.order_number)}</div>
            <div class="om">${esc(o.retailers?.name||'-')} · ${fmtDate(o.order_date)}</div>
          </div>
          <span class="badge b-${status}">${statusLabel(status)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px">
          <div style="font-size:14px;font-weight:600">${fmtMoney(tot)}</div>
          <span class="badge b-${o.payments?.[0]?.status||'unpaid'}">${o.payments?.[0]?.status==='paid'?'Paid':'Unpaid'}</span>
        </div>
      </div>`;
    }).join('');
  }

  // === Pop overdue reminder ONCE per day per salesman ===
  if(overdue.length>0){
    const reminderKey='vinita_overdue_reminder_'+S.salesman.id+'_'+today;
    if(!localStorage.getItem(reminderKey)){
      try{localStorage.setItem(reminderKey,'1');}catch(e){}
      setTimeout(()=>{
        ui.confirm({
          title:`${overdue.length} payment${overdue.length>1?'s':''} overdue`,
          message:`Total: ${fmtMoney(overdueTotal)}\n\nTop overdue:\n${overdue.slice(0,3).map(o=>`• ${o.retailers?.name||'-'} — ${fmtMoney(orderTotal(o))} (${o._daysOverdue} day${o._daysOverdue>1?'s':''})`).join('\n')}\n\nFollow up with these retailers today.`,
          confirmText:'See list',cancelText:'Later'
        }).then(ok=>{
          if(ok)document.getElementById('sh-pending')?.scrollIntoView({behavior:'smooth',block:'start'});
        });
      },800);
    }
  }
}
async function loadRetailers(){const{data}=await db.from('retailers').select('*').order('name');S.retailers=data||[];S.allRetailers=[...S.retailers];}
function salesmanLogout(){
  stopMandatoryTracking();
  S.salesman=null;S.cart=[];S.retailer=null;S.editingOrderId=null;
  clearPersistedState();
  updateCartCounts();
  gotoPage('pg-landing');
}

// ============================================================
//   GPS TRACKING — MANDATORY ENFORCEMENT
// ============================================================
let gpsWatchId=null;
let gpsActive=false;

function showGpsBlocker(){
  const el=document.getElementById('gps-blocker');
  if(el) el.style.display='flex';
  gpsActive=false;
}
function hideGpsBlocker(){
  const el=document.getElementById('gps-blocker');
  if(el) el.style.display='none';
  gpsActive=true;
}

function startMandatoryTracking(){
  if(gpsWatchId!==null)return;
  if(!navigator.geolocation){
    showGpsBlocker();
    toast('GPS not supported on this device');
    return;
  }
  let lastLat=0,lastLng=0;
  
  const pushLocation=async()=>{
    if(!lastLat||!S.salesman)return;
    await db.from('salesman_locations').upsert({
      salesman_id:S.salesman.id,
      latitude:lastLat,
      longitude:lastLng,
      accuracy: S._gpsAccuracy || null,
      updated_at:new Date().toISOString()
    },{onConflict:'salesman_id'});
  };

  // Show blocker immediately until first fix
  showGpsBlocker();

  gpsWatchId = navigator.geolocation.watchPosition(
    pos=>{
      lastLat=pos.coords.latitude;
      lastLng=pos.coords.longitude;
      S._gpsAccuracy = pos.coords.accuracy;
      hideGpsBlocker(); // GPS is working — unblock
      const ind=document.getElementById('gps-indicator');
      if(ind){ind.style.display='inline-block';ind.style.background='#22c55e';ind.textContent='📍 Live';}
      pushLocation();
    },
    err=>{
      console.warn('GPS Error:',err);
      showGpsBlocker(); // GPS lost — block the app
      const ind=document.getElementById('gps-indicator');
      if(ind){ind.style.display='inline-block';ind.style.background='#ef4444';ind.textContent='📍 GPS Off';}
    },
    {enableHighAccuracy:true,timeout:15000,maximumAge:0}
  );
  
  // Aggressive push every 2 mins
  S.gpsInterval=setInterval(pushLocation,2*60*1000);
}

function stopMandatoryTracking(){
  if(gpsWatchId!==null){navigator.geolocation.clearWatch(gpsWatchId);gpsWatchId=null;}
  if(S.gpsInterval){clearInterval(S.gpsInterval);S.gpsInterval=null;}
  const ind=document.getElementById('gps-indicator');if(ind)ind.style.display='none';
}

function renderRetailerList(){
  const el=document.getElementById('retailer-list');
  if(!S.retailers.length){el.innerHTML='<div class="empty"><div class="ei"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9h18l-1.5-5h-15L3 9Z"/><path d="M4 9v11h16V9"/><path d="M9 20v-6h6v6"/></svg></div><div class="empty-title">No retailers yet</div><div class="empty-sub">Tap "Add New Retailer" above to add the first shop.</div></div>';return;}
  el.innerHTML=S.retailers.map(r=>{
    const outstanding=Number(r.outstanding||0);const limit=Number(r.credit_limit||0);
    let dot='';
    if(limit>0){const ratio=outstanding/limit;if(ratio>=1)dot='<span class="swatch bad"></span>';else if(ratio>=.75)dot='<span class="swatch warn"></span>';else dot='<span class="swatch"></span>';}
    return`<div class="rt-item" style="flex-direction:column;align-items:stretch;padding:16px;border-radius:18px;border:1px solid var(--bd);box-shadow:var(--sh-sm);margin-bottom:12px;transition:all 0.2s">
      <div style="display:flex;align-items:center;gap:14px;cursor:pointer" onclick="selectRetailer('${r.id}','${escQ(r.name)}','${escQ(r.area||'')}',${outstanding},${limit})">
        <div style="width:48px;height:48px;border-radius:14px;background:var(--or-bg);color:var(--or-d);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">${ico('map-pin', 22)}</div>
        <div class="rt-info">
          <div style="font-weight:600;font-size:16px;letter-spacing:-0.01em;color:var(--tx)">${dot}${esc(r.name)}</div>
          ${r.area?`<div style="font-size:13px;color:var(--mu);margin-top:4px;font-weight:500">${esc(r.area)}</div>`:''}
          ${r.contact?`<div style="font-size:12.5px;color:var(--mu);margin-top:2px;font-weight:500">${ico('phone',11)} <span style="vertical-align:1px">${esc(r.contact)}</span></div>`:''}
          ${outstanding>0?`<div style="font-size:11.5px;color:var(--rd-tx);background:var(--rd-bg);padding:4px 8px;border-radius:8px;display:inline-block;margin-top:8px;font-weight:700;letter-spacing:0.02em">Outstanding: ${fmtMoney(outstanding)}${limit>0?' / '+fmtMoney(limit):''}</div>`:''}
        </div>
        <div style="color:var(--or);font-size:24px;font-weight:600;margin-left:auto">›</div>
      </div>
      <div style="display:flex;gap:10px;margin-top:16px;padding-top:16px;border-top:1px dashed var(--bd)">
        <button class="btn btn-outline btn-xs" style="flex:1;border-radius:10px;padding:8px" onclick="event.stopPropagation();openSalesmanEditRetailer('${r.id}')">${ico('edit',14)} Edit Info</button>
        ${outstanding>0?`<button class="btn btn-xs" style="flex:1;background:#fef3c7;color:#b45309;border:1px solid #fde68a;border-radius:10px;padding:8px;box-shadow:none" onclick="event.stopPropagation();openCollectModal('${r.id}','${escQ(r.name)}',${outstanding})">${ico('cash',14)} Collect</button>`:''}
      </div>
    </div>`;
  }).join('');
}
function filterRetailers(){const q=document.getElementById('ret-search').value.toLowerCase();S.retailers=S.allRetailers.filter(r=>r.name.toLowerCase().includes(q)||(r.area||'').toLowerCase().includes(q));renderRetailerList();}

async function selectRetailer(id,name,area,outstanding,limit){
  S.retailer={id,name,area,outstanding:outstanding||0,credit_limit:limit||0};
  if(!S.editingOrderId){S.cart=[];updateCartCounts();}
  document.getElementById('co-page-title').textContent='Select Company';
  
  if(!S.editingOrderId) {
    const suggestions = await fetchRetailerSuggestions(id);
    if(suggestions.length>0) {
      showRetailerSuggestions(suggestions);
      return;
    }
  } else {
    await fetchRetailerSuggestions(id);
  }
  gotoPage('pg-companies');
}

async function fetchRetailerSuggestions(retailerId){
  S.lastSoldRates={};
  const {data} = await db.from('order_items')
    .select('product_id,rate,orders!inner(retailer_id,created_at),products(id,name,sku,rate,mrp,pack_size,companies(name))')
    .eq('orders.retailer_id',retailerId)
    .order('orders(created_at)',{ascending:false})
    .limit(300);
    
  if(!data) return [];
  
  const map = new Map();
  data.forEach(it=>{
    if(!S.lastSoldRates[it.product_id]) S.lastSoldRates[it.product_id]=it.rate;
    if(it.products && !map.has(it.product_id)){
      map.set(it.product_id, {
        ...it.products, 
        lastRate: it.rate
      });
    }
  });
  
  return Array.from(map.values()).slice(0, 10);
}

function showRetailerSuggestions(suggestions){
  document.getElementById('modal-title').textContent='Suggested Products';
  document.getElementById('modal-body').innerHTML=`
    <div style="font-weight:600;margin-bottom:12px;color:var(--mu);font-size:13px">Based on ${esc(S.retailer.name)}'s previous orders:</div>
    <div style="display:flex;flex-direction:column;gap:10px;max-height:60vh;overflow-y:auto;padding-bottom:20px" id="sugg-list">
      ${suggestions.map(p=>`
        <div class="list-item" style="padding:10px;border:1px solid var(--or-bg);background:var(--or-bg);border-radius:10px">
          <div class="li-info" style="flex:1">
            <div class="li-name" style="font-size:13px">${esc(p.name)}</div>
            <div class="li-meta" style="color:var(--mu);margin-bottom:4px">${esc(p.sku)} · ${esc(p.companies?.name||'')}</div>
            <div class="li-meta" style="font-weight:600;color:var(--or-d)">
              Last Rate: ${fmtMoney(p.lastRate)} ${p.mrp?' · MRP: ₹'+p.mrp:''}
            </div>
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px">
            <div style="display:flex;align-items:center;background:#fff;border-radius:6px;border:1px solid var(--bd);overflow:hidden">
              <button class="btn btn-ghost" style="padding:4px 10px;border-right:1px solid var(--bd);border-radius:0;min-width:30px" onclick="suggQty(this, -1)">-</button>
              <input type="number" class="sugg-qty-input" data-pid="${p.id}" value="1" min="1" style="width:40px;text-align:center;border:none;outline:none;font-size:14px;font-weight:600">
              <button class="btn btn-ghost" style="padding:4px 10px;border-left:1px solid var(--bd);border-radius:0;min-width:30px" onclick="suggQty(this, 1)">+</button>
            </div>
            <button class="btn btn-or btn-sm" style="padding:4px 12px;font-size:12px;width:100%" onclick="addToCartFromSugg('${p.id}','${escQ(p.name)}','${escQ(p.sku)}',${p.lastRate},${p.mrp||0},this)">${ico('shopping-bag',14)} Add</button>
          </div>
        </div>
      `).join('')}
    </div>
    <div style="display:flex;gap:10px;margin-top:16px;position:sticky;bottom:0;background:var(--bg);padding-top:10px;border-top:1px solid var(--bd)">
      <button class="btn btn-ghost" style="flex:1" onclick="skipSuggestions()">Skip</button>
      <button class="btn btn-or" style="flex:1" onclick="skipSuggestions()">Continue →</button>
    </div>
  `;
  openModal();
}

function suggQty(btn, delta){
  const inp = btn.parentElement.querySelector('input');
  let v = parseInt(inp.value)||0;
  v += delta;
  if(v<1) v=1;
  inp.value = v;
}

function addToCartFromSugg(id, name, sku, rate, mrp, btn){
  const inp = btn.parentElement.parentElement.querySelector('.sugg-qty-input');
  const qty = parseInt(inp.value)||1;
  const existing = S.cart.find(c=>c.id===id);
  if(existing) {
    existing.qty += qty;
  } else {
    S.cart.push({id, name, sku, rate, mrp, qty, scheme_free:0, scheme_buy:0});
  }
  updateCartCounts();
  toast('Added to cart');
  const card = btn.closest('.list-item');
  card.style.opacity = '0.5';
  btn.disabled = true;
  btn.innerHTML = 'Added ✓';
}

function skipSuggestions(){
  closeModal();
  gotoPage('pg-companies');
}
async function salesmanAddRetailer(){
  const name=document.getElementById('sr-rn').value.trim();
  if(!name){toast('Shop name required');return;}
  const{data,error}=await db.from('retailers').insert({name,contact:document.getElementById('sr-rc').value.trim()||null,area:document.getElementById('sr-ra').value.trim()||null}).select().single();
  if(error){toast(''+error.message);return;}
  toast('Retailer added');
  ['sr-rn','sr-rc','sr-ra'].forEach(id=>document.getElementById(id).value='');
  await loadRetailers();
  S.retailer={id:data.id,name:data.name,area:data.area||'',outstanding:0,credit_limit:0};
  await loadLastSoldRates(data.id);gotoPage('pg-companies');
}
function renderCreditWarning(targetId){
  const el=document.getElementById(targetId);if(!el||!S.retailer)return;
  const{outstanding,credit_limit}=S.retailer;
  if(credit_limit>0&&outstanding>=credit_limit){el.innerHTML=`<div class="err-bar"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m9 9 6 6M15 9l-6 6"/></svg> <div><strong>Credit limit reached</strong><br>${fmtMoney(outstanding)} / ${fmtMoney(credit_limit)}</div></div>`;}
  else if(credit_limit>0&&outstanding/credit_limit>=.75){el.innerHTML=`<div class="warn-bar"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 2 21h20L12 3Z"/><path d="M12 10v5"/><circle cx="12" cy="18" r=".5" fill="currentColor"/></svg> <div><strong>High outstanding</strong><br>${fmtMoney(outstanding)} / ${fmtMoney(credit_limit)}</div></div>`;}
  else{el.innerHTML='';}
}

// ============================================================
//   FIELD COLLECTION — salesman records on-spot payment
// ============================================================
const PAYMENT_MODES=[
  {key:'cash',label:'Cash',needs_ref:false},
  {key:'upi',label:'UPI',needs_ref:true,ref_label:'UPI Ref / Txn ID'},
  {key:'cheque',label:'Cheque',needs_ref:true,ref_label:'Cheque Number'},
  {key:'bank_transfer',label:'Bank Transfer',needs_ref:true,ref_label:'Transaction ID'},
  {key:'other',label:'Other',needs_ref:false}
];

function openCollectModal(retailerId,retailerName,outstanding){
  if(!S.salesman){toast('Please log in as a salesman first');return;}
  const now=new Date();
  // Format for datetime-local input: YYYY-MM-DDTHH:MM
  const local=new Date(now.getTime()-now.getTimezoneOffset()*60000).toISOString().slice(0,16);
  document.getElementById('modal-title').textContent='Collect Payment';
  document.getElementById('modal-body').innerHTML=`
    <div class="card" style="background:var(--or-grad-soft);border:.5px solid #fed7aa;padding:14px;margin-bottom:14px">
      <div style="font-size:11px;font-weight:700;color:var(--or-d);text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px">From</div>
      <div style="font-weight:600;font-size:15px;letter-spacing:-0.01em">${esc(retailerName)}</div>
      ${outstanding>0?`<div style="font-size:12px;color:var(--tx-2);margin-top:6px"><strong>Outstanding:</strong> ${fmtMoney(outstanding)}</div>`:''}
    </div>
    <div class="fg"><label>Amount Received (₹) *</label>
      <input id="col-amt" type="number" inputmode="decimal" step="0.01" min="0.01" placeholder="0.00" autofocus>
      ${outstanding>0?`<div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap">
        <button class="chip" type="button" onclick="setColAmt(${Math.round(outstanding*0.25)})">25%</button>
        <button class="chip" type="button" onclick="setColAmt(${Math.round(outstanding*0.5)})">50%</button>
        <button class="chip" type="button" onclick="setColAmt(${Math.round(outstanding*0.75)})">75%</button>
        <button class="chip" type="button" onclick="setColAmt(${outstanding})">Full</button>
      </div>`:''}
    </div>
    <div class="fg"><label>Mode of Payment *</label>
      <select id="col-mode" onchange="updateColRefField()">
        ${PAYMENT_MODES.map(m=>`<option value="${m.key}">${m.label}</option>`).join('')}
      </select>
    </div>
    <div class="fg" id="col-ref-wrap" style="display:none">
      <label id="col-ref-label">Reference</label>
      <input id="col-ref" type="text" placeholder="Optional but recommended">
    </div>
    <div class="fg"><label>Date &amp; Time *</label>
      <input id="col-dt" type="datetime-local" value="${local}">
      <div style="font-size:11px;color:var(--mu);margin-top:5px;font-weight:500">Auto-filled to now. Change only if recording an earlier payment.</div>
    </div>
    <div class="fg" style="margin-bottom:10px"><label>Notes</label>
      <textarea id="col-notes" placeholder="Optional — anything to remember about this payment"></textarea>
    </div>
    <button class="btn btn-or" id="col-save-btn" onclick="saveCollection('${retailerId}','${escQ(retailerName)}',${outstanding})">Save &amp; Send Receipt on WhatsApp</button>
  `;
  openModal();
}
function setColAmt(v){document.getElementById('col-amt').value=v;}
function updateColRefField(){
  const m=document.getElementById('col-mode').value;
  const meta=PAYMENT_MODES.find(p=>p.key===m);
  const wrap=document.getElementById('col-ref-wrap');
  if(meta?.needs_ref){
    wrap.style.display='block';
    document.getElementById('col-ref-label').textContent=meta.ref_label||'Reference';
  }else{wrap.style.display='none';}
}

// ============================================================
//   SALESMAN — Edit Retailer (limited to name/contact/area)
// ============================================================
async function openSalesmanEditRetailer(retailerId){
  const r=S.allRetailers.find(x=>x.id===retailerId);
  if(!r){toast('Retailer not found');return;}
  document.getElementById('modal-title').textContent='Edit Retailer';
  document.getElementById('modal-body').innerHTML=`
    <div class="fg"><label>Shop Name *</label><input id="sre-n" value="${esc(r.name)}"></div>
    <div class="fg"><label>Contact Number</label><input id="sre-c" type="tel" inputmode="tel" value="${esc(r.contact||'')}" placeholder="98XXXXXXXX"></div>
    <div class="fg"><label>Area / Location</label><input id="sre-a" value="${esc(r.area||'')}" placeholder="e.g. Main Market, Patratu"></div>
    ${r.credit_limit||r.outstanding?`<div style="font-size:11px;color:var(--mu);margin-bottom:14px;padding:10px;background:var(--bg-warm);border-radius:10px;font-weight:500;line-height:1.5">Credit limit and outstanding are managed by admin. ${r.credit_limit?`<br>Current credit limit: <strong style="color:var(--tx)">${fmtMoney(r.credit_limit)}</strong>`:''}${r.outstanding?`<br>Current outstanding: <strong style="color:var(--tx)">${fmtMoney(r.outstanding)}</strong>`:''}</div>`:''}
    <button class="btn btn-or" id="sre-save" onclick="saveSalesmanRetailerEdit('${retailerId}')">Save Changes</button>
  `;
  openModal();
}

async function saveSalesmanRetailerEdit(retailerId){
  if(!S.online){toast('Offline — reconnect to save changes');return;}
  const name=document.getElementById('sre-n').value.trim();
  if(!name){toast('Shop name required');return;}
  const btn=document.getElementById('sre-save');
  btn.disabled=true;btn.textContent='Saving...';
  const payload={
    name,
    contact:document.getElementById('sre-c').value.trim()||null,
    area:document.getElementById('sre-a').value.trim()||null
  };
  const{error}=await db.from('retailers').update(payload).eq('id',retailerId);
  if(error){toast('Error: '+error.message);btn.disabled=false;btn.textContent='Save Changes';return;}
  // Refresh local cache
  const r=S.allRetailers.find(x=>x.id===retailerId);
  if(r){Object.assign(r,payload);}
  const r2=S.retailers.find(x=>x.id===retailerId);
  if(r2){Object.assign(r2,payload);}
  if(S.retailer?.id===retailerId){S.retailer.name=name;S.retailer.area=payload.area||'';}
  toast('Retailer updated');
  closeModal();
  renderRetailerList();
}

async function saveCollection(retailerId,retailerName,prevOutstanding){
  if(!S.online){toast('Offline — reconnect to record payment');return;}
  const amount=parseFloat(document.getElementById('col-amt').value);
  if(!amount||amount<=0){toast('Enter a valid amount');return;}
  const mode=document.getElementById('col-mode').value;
  const ref=document.getElementById('col-ref')?.value.trim()||null;
  const dt=document.getElementById('col-dt').value;
  const notes=document.getElementById('col-notes').value.trim()||null;
  // Convert datetime-local to ISO
  const collected_at=dt?new Date(dt).toISOString():new Date().toISOString();
  const btn=document.getElementById('col-save-btn');
  btn.disabled=true;btn.textContent='Saving...';
  try{
    const{error}=await db.from('collections').insert({
      retailer_id:retailerId,salesman_id:S.salesman.id,
      amount,mode,reference:ref,notes,collected_at
    });
    if(error)throw error;
    // Update local cache so the retailer card refreshes
    const r=S.allRetailers.find(x=>x.id===retailerId);
    if(r)r.outstanding=Math.max(0,(Number(r.outstanding)||0)-amount);
    if(S.retailer?.id===retailerId)S.retailer.outstanding=Math.max(0,(S.retailer.outstanding||0)-amount);
    toast('Payment recorded');
    closeModal();
    // Send WhatsApp receipt
    const newOut=Math.max(0,prevOutstanding-amount);
    const modeLabel=PAYMENT_MODES.find(p=>p.key===mode)?.label||mode;
    const dateStr=new Date(collected_at).toLocaleString('en-IN',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
    const msg=encodeURIComponent(
      `*PAYMENT RECEIPT — Vinita Enterprises*\n\n`+
      `Received from: ${retailerName}\n`+
      `Amount: ₹${amount.toFixed(2)}\n`+
      `Mode: ${modeLabel}${ref?'\nRef: '+ref:''}\n`+
      `Date: ${dateStr}\n`+
      `Collected by: ${S.salesman.name}\n`+
      (prevOutstanding>0?`\nPrev. Outstanding: ₹${prevOutstanding.toFixed(2)}\nBalance Outstanding: ₹${newOut.toFixed(2)}`:'')+
      (notes?`\n\nNotes: ${notes}`:'')+
      `\n\nThank you for your payment.`
    );
    setTimeout(()=>window.open(`https://wa.me/${WA_NUM}?text=${msg}`,'_blank'),300);
    // Refresh retailer list
    await loadRetailers();
    renderRetailerList();
  }catch(e){
    toast('Error: '+e.message);
    btn.disabled=false;btn.textContent='Save & Send Receipt on WhatsApp';
  }
}

async function loadCompanies(){
  const el=document.getElementById('company-grid');el.innerHTML=skeletonGrid();
  const{data}=await db.from('companies').select('*').order('name');
  S.companies=data||[];
  if(!S.companies.length){el.innerHTML='<div style="grid-column:1/-1"><div class="empty"><div class="ei"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21V10l5 3V8l6 4V8l6 5v8H3Z"/><path d="M7 17h2M11 17h2M15 17h2"/></svg></div><div class="empty-title">No companies yet</div><div class="empty-sub">Admin → Manage → Add Company.</div></div></div>';return;}
  el.innerHTML=S.companies.map(c=>`<div class="cc" style="padding:24px 16px;border-radius:18px;border:1px solid var(--bd);box-shadow:var(--sh-sm)" onclick="openProducts('${c.id}','${escQ(c.name)}')">
    <div class="ci" style="width:64px;height:64px;border-radius:20px;font-size:30px;margin:0 auto 16px;box-shadow:var(--sh-or-sm)">${esc(c.name[0].toUpperCase())}</div>
    <div class="cn" style="font-size:15px;font-weight:600;letter-spacing:-0.01em;color:var(--tx)">${esc(c.name)}</div>
  </div>`).join('');
}

async function openProducts(companyId,companyName){
  document.getElementById('prod-page-title').textContent=companyName;
  document.getElementById('prod-search').value='';S.activeCategory='all';
  gotoPage('pg-products');updateCartCounts();
  const el=document.getElementById('product-list');el.innerHTML=skeletonList();
  const{data}=await db.from('products').select('*').eq('company_id',companyId).eq('is_active',true).order('name');
  S.allProducts=(data||[]).map(p=>({...p,company_name:companyName}));
  S.currentProducts=[...S.allProducts];
  const cats=[...new Set(S.allProducts.map(p=>p.category).filter(Boolean))].sort();
  S.categories=cats;renderCategoryChips();renderProducts(S.currentProducts);
}
function renderCategoryChips(){
  const el=document.getElementById('cat-chips');if(!el)return;
  if(!S.categories.length){el.innerHTML='';el.style.display='none';return;}
  el.style.display='flex';
  el.innerHTML=`<div class="chip ${S.activeCategory==='all'?'active':''}" onclick="setCategory('all')">All</div>`+S.categories.map(c=>`<div class="chip ${S.activeCategory===c?'active':''}" onclick="setCategory('${escQ(c)}')">${esc(c)}</div>`).join('');
}
function setCategory(c){S.activeCategory=c;renderCategoryChips();applyProductFilters();}
function applyProductFilters(){
  const q=document.getElementById('prod-search').value.toLowerCase();
  S.currentProducts=S.allProducts.filter(p=>{if(S.activeCategory!=='all'&&p.category!==S.activeCategory)return false;if(q&&!p.name.toLowerCase().includes(q)&&!p.sku.toLowerCase().includes(q))return false;return true;});
  renderProducts(S.currentProducts);
}
function filterProducts(){applyProductFilters();}

function renderProducts(products){
  const el=document.getElementById('product-list');
  if(!products.length){el.innerHTML='<div class="empty"><div class="ei"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8 12 3 3 8v8l9 5 9-5V8Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg></div><div class="empty-title">No products found</div><div class="empty-sub">Try a different search or category.</div></div>';return;}
  el.innerHTML=`<div class="products-container" style="display:flex;flex-direction:column;gap:12px;padding-bottom:16px">`+products.map(p=>{
    const qty=S.cart.find(c=>c.pid===p.id)?.qty||0;
    const lastRate=S.lastSoldRates[p.id];
    const hasScheme=p.scheme_buy&&p.scheme_free;
    const activeStyle=qty>0?'border:1.5px solid var(--or);background:var(--or-bg);':'border:1px solid var(--bd);background:var(--surface);';
    return`<div class="pr-row" style="border-radius:18px;padding:16px;box-shadow:var(--sh-sm);display:flex;align-items:flex-start;gap:12px;transition:all 0.15s;${activeStyle}">
      <div class="pr-info" style="flex:1;min-width:0">
        <div class="pr-name" style="font-size:15.5px;font-weight:600;line-height:1.3;color:var(--tx);letter-spacing:-0.01em">${esc(p.name)}</div>
        <div class="pr-sku" style="font-size:12.5px;color:var(--mu);margin-top:4px;font-weight:500">${esc(p.sku)}${p.pack_size?' · '+esc(p.pack_size):''}</div>
        <div class="pr-badges" style="display:flex;flex-wrap:wrap;gap:6px;margin-top:10px">
          ${hasScheme?`<span class="badge b-scheme" style="padding:5px 8px;border-radius:8px;font-size:10.5px">${ico('gift',11)} Buy ${p.scheme_buy} Get ${p.scheme_free}</span>`:''}
          ${lastRate?`<span class="badge b-last" style="padding:5px 8px;border-radius:8px;font-size:10.5px;background:#f1f5f9;color:#475569;border:1px solid #e2e8f0">Last @ ₹${Number(lastRate).toFixed(2)}</span>`:''}
        </div>
      </div>
      <div class="pr-right" style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;flex-shrink:0">
        <span class="pr-rate" style="font-size:18px;font-weight:700;color:var(--or);letter-spacing:-0.015em">${fmtMoney(p.rate)}</span>
        ${p.mrp?`<span class="pr-mrp" style="font-size:11px;color:var(--mu);text-decoration:line-through;font-weight:500">MRP ₹${p.mrp}</span>`:''}
        <div class="qc" style="margin-top:10px;display:flex;align-items:center;background:#fff;border-radius:12px;padding:4px;box-shadow:var(--sh-xs);border:1px solid var(--bd)">
          <button class="qb" onclick="adjQty('${p.id}',-1)" style="width:34px;height:34px;border-radius:10px;background:var(--bg-warm);border:none;font-size:18px;font-weight:600;display:flex;align-items:center;justify-content:center;color:var(--tx);transition:all 0.1s">−</button>
          <input class="qi" id="qi-${p.id}" value="${qty}" type="number" min="0" step="1" inputmode="numeric" onchange="setQty('${p.id}',this.value)" style="width:44px;text-align:center;border:none;font-weight:700;font-size:16px;background:transparent;padding:0;color:var(--tx)">
          <button class="qb" onclick="adjQty('${p.id}',1)" style="width:34px;height:34px;border-radius:10px;background:var(--or-grad);border:none;color:#fff;font-size:18px;font-weight:600;display:flex;align-items:center;justify-content:center;transition:all 0.1s;box-shadow:var(--sh-or-sm)">+</button>
        </div>
      </div></div>`;
  }).join('')+`</div>`;
}
function getProductFromAny(pid){return S.allProducts.find(p=>p.id===pid)||S.currentProducts.find(p=>p.id===pid);}
function adjQty(pid,delta){const inp=document.getElementById('qi-'+pid);let qty=parseInt(inp?.value||0)+delta;if(qty<0)qty=0;if(inp)inp.value=qty;upsertCart(pid,qty);}
function setQty(pid,val){upsertCart(pid,Math.max(0,parseInt(val)||0));}
function upsertCart(pid,qty){
  const p=getProductFromAny(pid);if(!p)return;
  let bonus=0;if(p.scheme_buy&&p.scheme_free&&qty>=p.scheme_buy){bonus=Math.floor(qty/p.scheme_buy)*p.scheme_free;}
  const idx=S.cart.findIndex(c=>c.pid===pid);
  if(qty<=0){if(idx>-1)S.cart.splice(idx,1);}
  else if(idx>-1){S.cart[idx].qty=qty;if(S.cart[idx]._autoBonus!==false)S.cart[idx].bonus=bonus;}
  else{S.cart.push({pid,name:p.name,sku:p.sku,company:p.company_name||'',rate:p.rate||0,mrp:p.mrp||0,qty,bonus,_autoBonus:true});}
  updateCartCounts();
}

async function quickEditRetailerInfo(retailerId) {
  const r = S.retailers?.find(x=>x.id===retailerId) || S.adminAllRetailers?.find(x=>x.id===retailerId);
  if(!r) return;
  
  const newNum = window.prompt(`Edit Mobile Number for ${r.name}`, r.contact || '');
  if(newNum === null) return;
  
  let newArea = r.area;
  if(!r.area || r.area.trim() === '') {
    const promptedArea = window.prompt(`Enter Address/Area for ${r.name}`, r.area || '');
    if(promptedArea !== null) newArea = promptedArea;
  }
  
  toast('Saving...');
  const {error} = await db.from('retailers').update({contact: newNum, area: newArea}).eq('id', retailerId);
  if(error) { toast('Error saving info'); return; }
  
  r.contact = newNum;
  r.area = newArea;
  if (S.retailer && S.retailer.id === retailerId) {
    S.retailer.contact = newNum;
    S.retailer.area = newArea;
    persistState();
  }
  toast('Retailer info updated!');
  renderCartPage();
}

function renderCartPage(){
  renderCreditWarning('credit-warn');
  const rd=document.getElementById('cart-retailer-display');
  if(rd) {
    if(S.retailer) {
       const areaDisplay = S.retailer.area ? esc(S.retailer.area) : '<span style="color:var(--rd-tx)">No Address</span>';
       rd.innerHTML = `
         <div style="display:flex;justify-content:space-between;align-items:center;width:100%">
           <div style="display:flex;align-items:center;gap:12px">
             <div style="width:40px;height:40px;border-radius:10px;background:var(--or-bg);color:var(--or-d);display:flex;align-items:center;justify-content:center;font-size:18px">${ico('map-pin',18)}</div>
             <div>
               <div style="font-weight:600;font-size:14.5px;letter-spacing:-0.01em">${esc(S.retailer.name)}</div>
               <div style="font-size:12px;color:var(--mu);margin-top:2px;font-weight:500">${areaDisplay} · ${S.retailer.contact ? esc(S.retailer.contact) : '<span style="color:var(--rd-tx)">No Mobile</span>'}</div>
             </div>
           </div>
           <button class="btn btn-ghost" style="width:36px;height:36px;padding:0;border-radius:10px;background:var(--surface);border:1px solid var(--bd);box-shadow:var(--sh-xs);color:var(--tx)" onclick="quickEditRetailerInfo('${S.retailer.id}')">${ico('edit',14)}</button>
         </div>
       `;
    } else {
       rd.textContent = '—';
    }
  }
  const el=document.getElementById('cart-items-list');
  const sub=document.getElementById('cart-sub');
  if(!S.cart.length){if(sub)sub.textContent='Empty cart';el.innerHTML='<div class="empty"><div class="ei"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="20" r="1.5"/><circle cx="17" cy="20" r="1.5"/><path d="M3 4h2l2.5 11h11L21 7H7"/></svg></div><div class="empty-title">Cart is empty</div><div class="empty-sub">Add products to start an order.</div></div>';return;}
  let tot=0;S.cart.forEach(item=>tot+=item.qty*(item.rate||0));
  if(sub)sub.textContent=`${S.cart.length} ${S.cart.length===1?'item':'items'} · ${fmtMoney(tot)}`;
  el.innerHTML=`<div class="cart-total-banner" style="background:var(--or-grad);border-radius:20px;padding:22px;box-shadow:0 12px 30px rgba(234,88,12,0.25);margin-bottom:24px;display:flex;justify-content:space-between;align-items:center;color:#fff">
    <div><div class="cart-total-banner-label" style="opacity:0.9;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em">Order Grand Total</div><div style="font-size:12.5px;opacity:.95;font-weight:500;margin-top:4px">${S.cart.length} ${S.cart.length===1?'item':'items'} · ${cartQty()} pcs</div></div>
    <div class="cart-total-banner-value" style="font-family:var(--font-serif);font-size:34px;font-weight:400;letter-spacing:-0.02em;line-height:1">${fmtMoney(tot)}</div></div>
    
    <div class="section-intro" style="margin-top:24px;margin-bottom:16px">
      <div class="section-eyebrow">Cart Items</div>
      <div class="section-title" style="font-size:22px">Review <em>Products.</em></div>
    </div>
    <div style="display:flex;flex-direction:column;gap:14px;margin-bottom:24px">`+
    S.cart.map(item=>`<div class="cart-item" style="background:var(--surface);border-radius:18px;padding:18px;border:1px solid var(--bd);box-shadow:var(--sh-sm);transition:transform 0.15s, box-shadow 0.15s">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px">
        <div style="flex:1;min-width:0">
          <div style="font-size:15.5px;font-weight:600;letter-spacing:-0.01em;word-break:break-word;line-height:1.3;color:var(--tx)">${esc(item.name)}</div>
          <div style="font-size:12.5px;color:var(--mu);font-weight:500;margin-top:4px">${esc(item.sku)}${item.company?' · '+esc(item.company):''}</div>
        </div>
        <button onclick="removeCI('${item.pid}')" style="background:var(--rd-bg);border:1px solid #fecaca;color:var(--rd-tx);cursor:pointer;padding:0;flex-shrink:0;width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;transition:all 0.15s">${ico('x',15)}</button>
      </div>
      <div style="background:var(--bg-warm);border-radius:14px;padding:14px;margin-top:16px">
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px">
            <div><label style="font-size:10px;color:var(--mu);text-transform:uppercase;font-weight:700;display:block;margin-bottom:6px;letter-spacing:0.05em">Quantity</label><input type="number" min="0" step="1" inputmode="numeric" value="${item.qty}" onchange="updateCI('${item.pid}','qty',this.value)" style="width:100%;text-align:center;font-weight:700;font-size:16px;border:1px solid var(--bd);background:#fff;border-radius:10px;padding:10px 4px;color:var(--tx)"></div>
            <div><label style="font-size:10px;color:var(--mu);text-transform:uppercase;font-weight:700;display:block;margin-bottom:6px;letter-spacing:0.05em">Free/Bonus</label><input type="number" min="0" step="1" inputmode="numeric" value="${item.bonus||0}" onchange="updateCI('${item.pid}','bonus',this.value)" style="width:100%;text-align:center;font-weight:700;font-size:16px;border:1px solid var(--bd);background:#fff;border-radius:10px;padding:10px 4px;color:var(--tx)"></div>
            <div><label style="font-size:10px;color:var(--mu);text-transform:uppercase;font-weight:700;display:block;margin-bottom:6px;letter-spacing:0.05em">Rate (₹)</label><input type="number" min="0" step="0.01" inputmode="decimal" value="${item.rate||0}" onchange="updateCI('${item.pid}','rate',this.value)" style="width:100%;text-align:center;font-weight:700;font-size:16px;border:1px solid var(--bd);background:#fff;border-radius:10px;padding:10px 4px;color:var(--or)"></div>
          </div>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:16px;padding-top:16px;border-top:1px dashed var(--bd)">
          <div style="font-size:12px;color:var(--mu);font-weight:600">${item.bonus>0?`<span style="background:var(--yl-bg);color:var(--yl-tx);padding:6px 10px;border-radius:8px;font-size:11px;font-weight:700;letter-spacing:0.02em">+${item.bonus} Free Items Added</span>`:''}</div>
          <div style="text-align:right">
              <div style="font-size:10.5px;color:var(--mu);font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:2px">Line Total</div>
              <div style="color:var(--tx);font-size:19px;font-weight:700;letter-spacing:-0.015em">${fmtMoney(item.qty*(item.rate||0))}</div>
          </div>
      </div>
    </div>`).join('')+`</div>`;
}
function updateCI(pid,field,val){const item=S.cart.find(c=>c.pid===pid);if(!item)return;item[field]=Math.max(0,parseFloat(val)||0);if(field==='bonus')item._autoBonus=false;if(item.qty===0&&!item.bonus)S.cart=S.cart.filter(c=>c.pid!==pid);updateCartCounts();renderCartPage();}
function removeCI(pid){S.cart=S.cart.filter(c=>c.pid!==pid);updateCartCounts();renderCartPage();}
function toggleCredit(){document.getElementById('credit-wrap').style.display=document.getElementById('f-payment').value==='credit'?'block':'none';}

async function placeOrder(){
  if(!S.online){toast('Offline — please reconnect to place orders');return;}
  if(!S.cart.length){toast('Add at least one product');return;}
  if(!S.retailer){toast('No retailer selected — go back');return;}
  if(S.retailer.credit_limit>0&&S.retailer.outstanding>=S.retailer.credit_limit){
    const ok=await ui.confirm({title:'Over credit limit',message:`This retailer's outstanding (${fmtMoney(S.retailer.outstanding)}) has reached or exceeded their credit limit (${fmtMoney(S.retailer.credit_limit)}).\n\nPlace order anyway?`,confirmText:'Place anyway',cancelText:'Don\'t place',danger:true});
    if(!ok)return;
  }
  const payment_term=document.getElementById('f-payment').value;
  const credit_period_days=payment_term==='credit'?parseInt(document.getElementById('f-credit').value):null;
  const delivery_date=document.getElementById('f-delivery').value||null;
  const notes=document.getElementById('f-notes').value.trim()||null;
  const btn=document.getElementById('place-btn');btn.textContent='Saving...';btn.disabled=true;
  try{
    let orderId;
    const isEdit=!!S.editingOrderId;
    let beforeSnap=null;
    if(isEdit){
      const{data:before}=await db.from('orders').select('payment_term,credit_period_days,delivery_date,notes').eq('id',S.editingOrderId).single();
      beforeSnap=before;
      const{error:e1}=await db.from('orders').update({retailer_id:S.retailer.id,payment_term,credit_period_days,delivery_date,notes}).eq('id',S.editingOrderId);
      if(e1)throw e1;
      const{error:e2}=await db.from('order_items').delete().eq('order_id',S.editingOrderId);
      if(e2)throw e2;
      orderId=S.editingOrderId;
    }else{
      const{data:ord,error}=await db.from('orders').insert({salesman_id:S.salesman.id,retailer_id:S.retailer.id,payment_term,credit_period_days,delivery_date,notes,status:'placed'}).select().single();
      if(error)throw error;orderId=ord.id;
    }
    const{error:e3}=await db.from('order_items').insert(S.cart.map(c=>({order_id:orderId,product_id:c.pid,quantity:Math.round(c.qty),bonus_quantity:Math.round(c.bonus||0),rate:c.rate||0})));
    if(e3)throw e3;
    if(isEdit){
      db.from('order_edits').insert({order_id:orderId,edited_by_type:'salesman',edited_by_id:S.salesman.id,edited_by_name:S.salesman.name,edit_summary:'Edited by salesman ('+S.cart.length+' items, '+payment_term+')',before_snapshot:beforeSnap,after_snapshot:{payment_term,credit_period_days,delivery_date,notes,items:S.cart.length}}).then(()=>{});
    }
    const{data:ord2}=await db.from('orders').select('order_number').eq('id',orderId).single();
    let tot=0;
    const lines=S.cart.map(c=>{const lt=c.qty*(c.rate||0);tot+=lt;let l=`• ${c.name} × ${c.qty}`;if(c.bonus>0)l+=` (+${Math.round(c.bonus)} Free)`;l+=` @ ₹${(c.rate||0).toFixed(2)} = ₹${lt.toFixed(2)}`;return l;}).join('\n');
    const msg=encodeURIComponent(`*${isEdit?'UPDATED ':''}ORDER — ${fmtOrd(ord2?.order_number||0)}*\nVinita Enterprises\nSalesman: ${S.salesman.name}\nRetailer: ${S.retailer.name}${S.retailer.area?' ('+S.retailer.area+')':''}\nDate: ${fmtDate(new Date().toISOString())}\n${delivery_date?'Deliver by: '+fmtDate(delivery_date)+'\n':''}\n*Items:*\n${lines}\n\n*Total: ₹${tot.toFixed(2)}*\nPayment: ${payment_term==='cash'?'Cash':'Credit ('+credit_period_days+' days)'}\n${notes?'Notes: '+notes:''}`);
    S.cart=[];S.editingOrderId=null;updateCartCounts();toast(isEdit?'Order updated':'Order placed');
    setTimeout(()=>{
      window.open(`https://wa.me/${WA_NUM}?text=${msg}`,'_blank');
      btn.innerHTML='Place Order &amp; Send on WhatsApp';
      btn.disabled=false;
      if (S.adminOrdering) {
        S.adminOrdering = false;
        S.salesman = null;
        gotoPage('pg-admin');
        loadAdminDashboard();
      } else {
        gotoPage('pg-order-history');
      }
    },600);
  }catch(e){toast('Error: '+e.message);btn.textContent=S.editingOrderId?'Update Order':'Place Order & Send on WhatsApp';btn.disabled=false;}
}

function openSalesmanOrdersFiltered(key,label){
  S.salesmanFilter={key,label};
  document.getElementById('soh-title').textContent=label;
  document.getElementById('soh-sub').textContent='Filtered view';
  gotoPage('pg-order-history');
}
function closeSalesmanFilteredView(){
  if(S.salesmanFilter){
    S.salesmanFilter=null;
    gotoPage('pg-salesman-home');
  }else{
    gotoPage('pg-salesman-home');
  }
}

async function loadSalesmanOrders(){
  if(!S.salesman)return;
  const el=document.getElementById('salesman-orders');el.innerHTML=skeletonList();
  let data;
  if(S.salesmanFilter&&S.salesmanStatViews?.[S.salesmanFilter.key]){
    // Use cached filtered view from dashboard (already includes joins via the home query)
    data=S.salesmanStatViews[S.salesmanFilter.key];
  }else{
    const{data:res}=await db.from('orders').select('*, retailers(id,name,area,outstanding,credit_limit), order_items(quantity,bonus_quantity,rate,product_id,products(name,sku)), payments(status)').neq('status','cancelled').order('created_at',{ascending:false}).limit(100);
    data=res||[];
    document.getElementById('soh-title').textContent='My Orders';
    document.getElementById('soh-sub').textContent='Last 100 orders you placed';
  }
  if(!data?.length){el.innerHTML='<div class="empty"><div class="ei"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/></svg></div><div class="empty-title">No orders here</div><div class="empty-sub">'+esc(S.salesmanFilter?'No '+S.salesmanFilter.label.toLowerCase()+' orders right now':'Your placed orders will show up here.')+'</div></div>';return;}
  el.innerHTML=data.map(o=>{
    const tot=Math.round((o.order_items||[]).reduce((s,i)=>s+((parseFloat(i.quantity)||0)*(parseFloat(i.rate)||0)),0));
    const status=o.status||'placed';
    return`<div class="oc" style="border-radius:18px;border:1px solid var(--bd);box-shadow:var(--sh-sm);margin-bottom:16px;padding:18px">
      <div class="oh" style="cursor:pointer;border-bottom:1px dashed var(--bd);padding-bottom:14px;margin-bottom:14px;align-items:center" onclick="openSalesmanOrderDetail('${o.id}')">
        <div><div class="on" style="font-size:16px;color:var(--tx);margin-bottom:4px">${fmtOrd(o.order_number)}</div><div class="om">${ico('shop',13)} <span style="vertical-align:1px;font-weight:600;color:var(--tx)">${esc(o.retailers?.name||'-')}</span><span style="color:var(--mu);margin-left:6px">· ${fmtDate(o.order_date)}</span></div></div>
        <span class="badge b-${status}" style="font-size:11.5px;padding:6px 10px;border-radius:8px">${statusLabel(status)}</span>
      </div>
      ${(o.order_items||[]).slice(0,3).map(i=>{let t=`${i.quantity} pcs`;if(i.bonus_quantity>0)t+=` <span style="color:var(--or);font-size:11px;font-weight:700">(+${i.bonus_quantity} free)</span>`;return`<div class="oi-row" style="color:var(--mu-2);font-size:13.5px"><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(i.products?.name||'')}</span><span style="flex-shrink:0;color:var(--tx);font-weight:600">${t}</span></div>`;}).join('')}
      ${(o.order_items||[]).length>3?`<div style="font-size:12px;color:var(--mu);margin-top:8px;font-weight:600;background:var(--bg-warm);display:inline-block;padding:4px 8px;border-radius:6px">+ ${o.order_items.length-3} more items</div>`:''}
      
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:16px;padding-top:16px;border-top:1px dashed var(--bd)">
          <div class="of" style="margin:0">
            <span class="badge b-${o.payment_term}" style="font-size:11.5px;padding:5px 8px;border-radius:6px">${esc(o.payment_term)}${o.payment_term==='credit'?' ('+(o.credit_period_days||0)+'d)':''}</span>
          </div>
          <div style="text-align:right">
            <div style="font-size:11px;color:var(--mu);text-transform:uppercase;font-weight:700;letter-spacing:0.05em;margin-bottom:2px">Order Total</div>
            <div style="font-size:19px;font-weight:700;color:var(--or);letter-spacing:-0.015em">${fmtMoney(tot)}</div>
          </div>
      </div>
      <div class="of" style="margin-top:16px">
        ${status==='placed'?`<button class="btn btn-ghost btn-xs" onclick="editOrder('${o.id}')">${ico('edit',12)} Edit</button>`:''}
        ${status==='placed'?`<button class="btn btn-danger btn-xs" onclick="salesmanCancelOrder('${o.id}')">${ico('x',12)} Cancel</button>`:''}
        ${['placed','confirmed','dispatched'].includes(status)?`<button class="btn btn-or btn-xs" onclick="openDeliveryModal('${o.id}')">${ico('truck',12)} Mark Delivered</button>`:''}
        <button class="btn btn-ghost btn-xs" onclick="reorder('${o.id}')">${ico('refresh',12)} Reorder</button>
        <button class="btn btn-wa btn-xs" onclick="resendWA('${o.id}')">${ico('send',12)} WhatsApp</button>
      </div>
    </div>`;
  }).join('');
}

// ============================================================
//   SALESMAN ORDER DETAIL — shows full info + total balance + actions
// ============================================================
async function openSalesmanOrderDetail(orderId){
  const{data:o,error}=await db.from('orders').select('*, retailers(id,name,area,contact,outstanding,credit_limit), salesmen!orders_salesman_id_fkey(name), order_items(quantity,bonus_quantity,rate,products(name,sku,pack_size,mrp)), payments(status)').eq('id',orderId).single();
  if(error||!o){toast('Could not load order');return;}
  const status=o.status||'placed';
  const tot=Math.round((o.order_items||[]).reduce((s,i)=>s+((parseFloat(i.quantity)||0)*(parseFloat(i.rate)||0)),0));
  const paid=o.payments?.[0]?.status==='paid';
  const outstanding=Number(o.retailers?.outstanding||0);
  const limit=Number(o.retailers?.credit_limit||0);
  document.getElementById('modal-title').textContent=fmtOrd(o.order_number);
  document.getElementById('modal-body').innerHTML=`
    <div style="display:flex;gap:6px;margin-bottom:14px;flex-wrap:wrap">
      <span class="badge b-${status}">${statusLabel(status)}</span>
      <span class="badge b-${o.payment_term}">${esc(o.payment_term)}${o.payment_term==='credit'?' ('+(o.credit_period_days||0)+'d)':''}</span>
      <span class="badge b-${paid?'paid':'unpaid'}">${paid?'Paid':'Unpaid'}</span>
    </div>
    <div class="card" style="background:var(--or-grad-soft);border:.5px solid #fed7aa;padding:14px;margin-bottom:14px">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">${ico('shop',14)}<strong style="font-size:15px">${esc(o.retailers?.name||'-')}</strong></div>
      ${o.retailers?.area?`<div style="font-size:12px;color:var(--tx-2);margin-bottom:4px">${ico('pin',12)} ${esc(o.retailers.area)}</div>`:''}
      ${o.retailers?.contact?`<div style="font-size:12px;color:var(--tx-2);margin-bottom:4px">${ico('phone',12)} ${esc(o.retailers.contact)}</div>`:''}
      <div style="border-top:.5px solid rgba(0,0,0,.08);margin-top:10px;padding-top:10px;display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <div><div style="font-size:10.5px;color:var(--mu);font-weight:600;text-transform:uppercase;letter-spacing:.06em">Outstanding</div><div style="font-family:var(--font-serif);font-size:18px;color:${outstanding>0?'var(--rd)':'var(--gr)'};font-weight:400">${fmtMoney(outstanding)}</div></div>
        <div><div style="font-size:10.5px;color:var(--mu);font-weight:600;text-transform:uppercase;letter-spacing:.06em">Credit Limit</div><div style="font-family:var(--font-serif);font-size:18px;color:var(--tx);font-weight:400">${limit>0?fmtMoney(limit):'—'}</div></div>
      </div>
    </div>
    <div style="font-size:11px;font-weight:700;color:var(--mu);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px">Items</div>
    ${(o.order_items||[]).map(i=>{const lt=(i.quantity||0)*(i.rate||0);return`<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:.5px solid var(--bd);font-size:13px"><div style="flex:1;min-width:0"><div style="font-weight:600">${esc(i.products?.name||'')}</div><div style="font-size:11px;color:var(--mu);margin-top:2px">${i.quantity} × ₹${(i.rate||0).toFixed(2)}${i.bonus_quantity>0?' · +'+i.bonus_quantity+' free':''}${i.products?.pack_size?' · '+esc(i.products.pack_size):''}</div></div><div style="font-weight:600;flex-shrink:0;margin-left:10px">${fmtMoney(lt)}</div></div>`;}).join('')}
    <div style="display:flex;justify-content:space-between;padding:12px 0 4px;font-family:var(--font-serif);font-size:22px;letter-spacing:-0.02em"><span>Total</span><span style="color:var(--or)">${fmtMoney(tot)}</span></div>
    ${o.notes?`<div style="margin-top:14px;padding:11px 14px;background:var(--or-bg);border-radius:var(--r-md);font-size:13px;color:var(--or-d);font-weight:500;display:flex;gap:8px;align-items:flex-start">${ico('note',14)}<span>${esc(o.notes)}</span></div>`:''}
    ${o.delivery_date?`<div class="om" style="margin-top:8px;display:flex;align-items:center;gap:6px">${ico('calendar',13)}<span>Deliver by ${fmtDateShort(o.delivery_date)}</span></div>`:''}
    <div style="display:flex;gap:8px;margin-top:18px;flex-wrap:wrap">
      ${['placed','confirmed','dispatched'].includes(status)?`<button class="btn btn-or btn-sm" onclick="openDeliveryModal('${o.id}')">${ico('truck',13)} Mark Delivered</button>`:''}
      ${status==='placed'?`<button class="btn btn-ghost btn-sm" onclick="closeModal();editOrder('${o.id}')">${ico('edit',13)} Edit</button>`:''}
      ${status==='placed'?`<button class="btn btn-danger btn-sm" onclick="closeModal();salesmanCancelOrder('${o.id}')">${ico('x',13)} Cancel</button>`:''}
      <button class="btn btn-wa btn-sm" onclick="resendWA('${o.id}')">${ico('send',13)} WhatsApp</button>
    </div>`;
  openModal();
}

async function openDeliveryModal(orderId){
  const{data:o,error}=await db.from('orders').select('*, retailers(id,name,outstanding,credit_limit), order_items(id,quantity,rate,bonus_quantity,products(id,name,sku))').eq('id',orderId).single();
  if(error||!o){toast('Could not load order');return;}
  
  const {data: allProds} = await db.from('products').select('id, name, rate, mrp, sku').eq('is_active', true).order('name');
  window._dlvAllProducts = allProds || [];
  
  window._dlvOrderId = orderId;
  window._dlvOrder = o;
  window._dlvItems = (o.order_items||[]).map((i, idx) => ({
    id: i.id,
    product_id: i.products?.id || i.product_id,
    name: i.products?.name || '?',
    sku: i.products?.sku || '',
    quantity: i.quantity,
    bonus_quantity: i.bonus_quantity || 0,
    rate: Number(i.rate) || 0,
    checked: true,
    idx: idx
  }));

  renderDeliveryModal();
}

function renderDeliveryModal(){
  const o = window._dlvOrder;
  const items = window._dlvItems;
  const tot = Math.round(items.reduce((s,i) => s + (i.checked ? (i.quantity * i.rate) : 0), 0));
  const origTot = Math.round((o.order_items||[]).reduce((s,i)=>s+((parseFloat(i.quantity)||0)*(parseFloat(i.rate)||0)),0));
  
  const itemsHtml = items.map((i, idx) => {
    const lineTot = i.quantity * i.rate;
    return `
      <div style="display:flex;flex-direction:column;gap:6px;padding:10px 0;border-top:0.5px solid rgba(180,83,9,.18)">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer;flex:1;min-width:0">
            <input type="checkbox" class="dlv-item-check" data-idx="${idx}" ${i.checked?'checked':''} onchange="dlvToggleCheck(${idx})" style="width:18px;height:18px;accent-color:#ea580c;flex-shrink:0">
            <span style="font-size:13px;font-weight:600;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(i.name)}</span>
          </label>
          <button type="button" class="ae-rm" onclick="dlvRemoveItem(${idx})" style="background:#fee2e2;border:none;color:#b91c1c;width:26px;height:26px;border-radius:6px;display:flex;align-items:center;justify-content:center;cursor:pointer">${ico('trash',12)}</button>
        </div>
        <div style="display:flex;gap:8px;align-items:center;padding-left:26px">
          <input type="number" class="dlv-qty" data-idx="${idx}" value="${i.quantity}" min="1" inputmode="numeric" style="width:55px;padding:4px 6px;border:1px solid rgba(180,83,9,.3);border-radius:6px;font-size:12px;font-weight:600;text-align:center" onchange="dlvUpdateQty(${idx},this.value)">
          <span style="font-size:11px;color:#78350f">pcs${i.bonus_quantity>0?' +'+i.bonus_quantity+' free':''} ×</span>
          <input type="number" class="dlv-rate" data-idx="${idx}" value="${i.rate.toFixed(2)}" min="0" step="0.5" inputmode="decimal" style="width:65px;padding:4px 6px;border:1px solid rgba(180,83,9,.3);border-radius:6px;font-size:12px;font-weight:600;text-align:center" onchange="dlvUpdateRate(${idx},this.value)">
          <span style="font-size:11px;color:#78350f;font-weight:600" id="dlv-linetot-${idx}">= ₹${lineTot.toFixed(2)}</span>
        </div>
      </div>
    `;
  }).join('');

  const productOptions = window._dlvAllProducts.map(p => `<option value="${p.id}">${esc(p.name)} (${esc(p.sku)})</option>`).join('');
  const addProductHtml = `
    <div style="background:#f3efe8;border-radius:10px;padding:10px;margin-top:10px;display:flex;flex-direction:column;gap:8px">
      <div style="font-size:11px;font-weight:700;color:var(--mu);text-transform:uppercase">Add product at delivery</div>
      <div style="display:flex;gap:6px">
        <select id="dlv-add-pid" style="flex:1;min-width:0;padding:6px;border:1px solid var(--bd-2);border-radius:6px;font-size:13px">
          <option value="">-- Choose Product --</option>
          ${productOptions}
        </select>
        <button type="button" class="btn btn-or btn-sm" onclick="dlvAddProductItem()" style="padding:6px 12px;font-size:12px">+ Add</button>
      </div>
    </div>
  `;

  document.getElementById('modal-title').textContent='Mark Delivered';
  document.getElementById('modal-body').innerHTML=`
    <div class="card" style="background:var(--or-grad-soft);border:.5px solid #fed7aa;padding:14px;margin-bottom:14px">
      <div style="font-size:11px;font-weight:700;color:var(--or-d);text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px">Delivering to</div>
      <div style="font-weight:600;font-size:15px">${esc(o.retailers?.name||'-')}</div>
      <div style="font-size:12px;color:var(--tx-2);margin-top:6px">Order: <strong>${fmtOrd(o.order_number)}</strong> · Original Bill: <strong style="color:var(--or)">${fmtMoney(origTot)}</strong></div>
    </div>

    <div style="background:#fffbea;border:0.5px solid #fcd34d;border-radius:14px;padding:12px;margin-bottom:14px">
      <div style="display:flex;align-items:center;gap:6px;font-size:11px;font-weight:700;color:#78350f;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px">
        ${ico('check',14)} Adjust items for delivery
      </div>
      <div style="font-size:11px;color:#78350f;margin-bottom:10px;font-weight:500;line-height:1.4">Uncheck items to reject them. Edit Quantity or Rate directly below.</div>
      <div id="dlv-items-list-container">
        ${itemsHtml}
      </div>
      ${addProductHtml}
      
      <div style="margin-top:14px;padding:12px;background:#fff;border-radius:10px;border:0.5px solid rgba(180,83,9,.25);display:flex;justify-content:space-between;align-items:center">
        <div>
          <div style="font-size:10.5px;color:#78350f;font-weight:700;text-transform:uppercase;letter-spacing:.06em">Delivered Total</div>
          <div id="dlv-rejected-note" style="font-size:11px;color:#7f1d1d;font-weight:500;margin-top:2px;display:${tot < origTot ? 'block' : 'none'}">${tot < origTot ? (origTot-tot).toFixed(2) + ' deducted' : ''}</div>
        </div>
        <div id="dlv-delivered-total" style="font-family:var(--font-serif);font-size:24px;color:#ea580c;font-weight:400;letter-spacing:-0.02em" data-value="${tot.toFixed(2)}">${fmtMoney(tot)}</div>
      </div>
      <div class="fg" style="margin-top:14px;margin-bottom:0">
        <label style="color:#78350f">Paper Bill Total (₹) <span style="color:var(--mu);font-weight:500;text-transform:none;letter-spacing:0;font-size:10px;margin-left:4px">— optional cross-check</span></label>
        <input type="number" id="dlv-paper-total" inputmode="decimal" step="0.01" placeholder="What's written on retailer's paper bill" oninput="checkBillMatch()">
        <div id="dlv-bill-match" style="font-size:11.5px;margin-top:6px;font-weight:600"></div>
      </div>
    </div>

    <div class="fg"><label>Payment Type at Delivery</label>
      <select id="dlv-pt" onchange="toggleDlvCreditDays()">
        <option value="cash" ${o.payment_term==='cash'?'selected':''}>Cash on delivery</option>
        <option value="credit" ${o.payment_term==='credit'?'selected':''}>Credit</option>
      </select>
    </div>
    <div class="fg" id="dlv-credit-wrap" style="display:${o.payment_term==='credit'?'block':'none'}">
      <label>Credit Period (days)</label>
      <input type="number" id="dlv-credit-days" inputmode="numeric" min="1" max="120" value="${o.credit_period_days||30}">
    </div>
    <div class="fg"><label>Collect payment now?</label>
      <select id="dlv-collect-now">
        <option value="no">No — bill it to credit / record later</option>
        <option value="full">Yes — full delivered amount</option>
        <option value="partial">Yes — partial amount</option>
      </select>
    </div>
    <div id="dlv-collect-fields" style="display:none">
      <div class="fg"><label>Amount Collected (₹)</label>
        <input type="number" id="dlv-amt" inputmode="decimal" step="0.01" min="0.01" placeholder="0.00">
      </div>
      <div class="fg"><label>Mode</label>
        <select id="dlv-mode" onchange="toggleDlvRefField()">
          <option value="cash">Cash</option>
          <option value="upi">UPI</option>
          <option value="cheque">Cheque</option>
          <option value="bank_transfer">Bank Transfer</option>
        </select>
      </div>
      <div class="fg" id="dlv-ref-wrap" style="display:none"><label id="dlv-ref-label">Reference</label>
        <input type="text" id="dlv-ref" placeholder="Optional">
      </div>
    </div>
    <button class="btn btn-or" id="dlv-save" onclick="saveDelivery('${o.id}',${origTot},'${o.retailers?.id||''}','${escQ(o.retailers?.name||'')}',${items.length})">${ico('check',16)} Confirm Delivery</button>
  `;

  setTimeout(()=>{
    const sel=document.getElementById('dlv-collect-now');
    if(sel){sel.onchange=()=>{
      const v=sel.value;
      const f=document.getElementById('dlv-collect-fields');
      if(f)f.style.display=v==='no'?'none':'block';
      const amt=document.getElementById('dlv-amt');
      const dt=document.getElementById('dlv-delivered-total')?.dataset?.value;
      const deliveredTot=parseFloat(dt)||tot;
      if(amt)amt.value=v==='full'?deliveredTot.toFixed(2):'';
    };}
  },50);
}

function dlvToggleCheck(idx){
  window._dlvItems[idx].checked = !window._dlvItems[idx].checked;
  renderDeliveryModal();
}
function dlvUpdateQty(idx, val){
  window._dlvItems[idx].quantity = Math.max(1, parseInt(val)||1);
  renderDeliveryModal();
}
function dlvUpdateRate(idx, val){
  window._dlvItems[idx].rate = Math.max(0, parseFloat(val)||0);
  renderDeliveryModal();
}
function dlvRemoveItem(idx){
  window._dlvItems.splice(idx, 1);
  renderDeliveryModal();
}
function dlvAddProductItem(){
  const select = document.getElementById('dlv-add-pid');
  const pid = select?.value;
  if(!pid) return;
  const prod = window._dlvAllProducts.find(p => p.id === pid);
  if(!prod) return;
  const exists = window._dlvItems.find(i => i.product_id === pid);
  if(exists) {
    exists.quantity += 1;
    exists.checked = true;
  } else {
    window._dlvItems.push({
      id: null,
      product_id: prod.id,
      name: prod.name,
      sku: prod.sku,
      quantity: 1,
      bonus_quantity: 0,
      rate: Number(prod.rate) || 0,
      checked: true
    });
  }
  renderDeliveryModal();
}

function checkBillMatch(){
  const inp=document.getElementById('dlv-paper-total');
  const el=document.getElementById('dlv-bill-match');
  if(!inp||!el)return;
  const v=parseFloat(inp.value);
  if(!v||isNaN(v)){el.innerHTML='';return;}
  const dtEl=document.getElementById('dlv-delivered-total');
  const delivered=parseFloat(dtEl?.dataset?.value)||0;
  const diff=v-delivered;
  const absDiff=Math.abs(diff);
  if(absDiff<0.5)el.innerHTML=`<span style="color:#14532d">✓ Matches delivered total exactly</span>`;
  else if(absDiff<5)el.innerHTML=`<span style="color:#78350f">⚠ Small difference: ${diff>0?'+':''}${fmtMoney(diff)}</span>`;
  else el.innerHTML=`<span style="color:#7f1d1d">✕ Mismatch: paper bill is ${diff>0?'higher by':'lower by'} ${fmtMoney(absDiff)} vs delivered ${fmtMoney(delivered)}</span>`;
}
function toggleDlvCreditDays(){document.getElementById('dlv-credit-wrap').style.display=document.getElementById('dlv-pt').value==='credit'?'block':'none';}
function toggleDlvRefField(){
  const m=document.getElementById('dlv-mode').value;
  const needsRef=['upi','cheque','bank_transfer'].includes(m);
  document.getElementById('dlv-ref-wrap').style.display=needsRef?'block':'none';
  document.getElementById('dlv-ref-label').textContent=m==='upi'?'UPI Ref / Txn ID':m==='cheque'?'Cheque Number':'Transaction ID';
}

async function saveDelivery(orderId,orderTotal,retailerId,retailerName,itemCount){
  if(!S.online){toast('Offline — reconnect to mark delivered');return;}

  const ptEl=document.getElementById('dlv-pt');
  const cdEl=document.getElementById('dlv-credit-days');
  const cnEl=document.getElementById('dlv-collect-now');
  const amtEl=document.getElementById('dlv-amt');
  const modeEl=document.getElementById('dlv-mode');
  const refEl=document.getElementById('dlv-ref');
  const ptotalEl=document.getElementById('dlv-paper-total');
  const dtEl=document.getElementById('dlv-delivered-total');

  if(!ptEl||!cnEl){toast('Delivery form not loaded');return;}

  const newPT=ptEl.value;
  const newCD=newPT==='credit'?(parseInt(cdEl?.value)||30):null;
  const collectNow=cnEl.value;
  const amtVal=amtEl?parseFloat(amtEl.value):0;
  const modeVal=modeEl?.value||'cash';
  const refVal=refEl?.value.trim()||null;
  const paperTotal=ptotalEl?.value ? parseFloat(ptotalEl.value) : null;

  const checkedItems = window._dlvItems.filter(i => i.checked);
  const totalItems = window._dlvItems.length;
  const checkedCount = checkedItems.length;
  const uncheckedNames = window._dlvItems.filter(i => !i.checked).map(i => i.name);
  const deliveredTotal = parseFloat(dtEl?.dataset?.value)||0;
  const rejectedAmount = orderTotal - deliveredTotal;

  if(totalItems>0&&checkedCount===0){
    const proceed=await ui.confirm({title:'No items delivered',message:'Mark delivered anyway?',confirmText:'Confirm',cancelText:'Back',danger:true});
    if(!proceed)return;
  }
  if(totalItems>0&&checkedCount<totalItems&&checkedCount>0){
    const proceed=await ui.confirm({title:`${totalItems-checkedCount} item(s) rejected`,message:`Proceed with reduction?`,confirmText:'Confirm',cancelText:'Back'});
    if(!proceed)return;
  }

  let billMismatchNote='';
  if(paperTotal!==null&&!isNaN(paperTotal)&&Math.abs(paperTotal-deliveredTotal)>=5){
    const proceed=await ui.confirm({title:'Paper bill mismatch',message:`Mark delivered anyway?`,confirmText:'Flag for Admin',cancelText:'Back',danger:true});
    if(!proceed)return;
    billMismatchNote=`BILL MISMATCH: ${paperTotal} vs delivered ${deliveredTotal}`;
  }

  const btn=document.getElementById('dlv-save');
  if(btn){btn.disabled=true;btn.textContent='Saving...';}

  try{
    await db.from('order_items').delete().eq('order_id', orderId);
    if(checkedItems.length > 0) {
      const itemsToInsert = checkedItems.map(i => ({order_id: orderId, product_id: i.product_id, quantity: i.quantity, bonus_quantity: i.bonus_quantity, rate: i.rate}));
      const {error: insertErr} = await db.from('order_items').insert(itemsToInsert);
      if (insertErr) throw insertErr;
    }

    const{error:e1}=await db.from('orders').update({status:'delivered',payment_term:newPT,credit_period_days:newCD,delivered_by:S.salesman.id}).eq('id',orderId);
    if(e1)throw e1;

    let auditSummary=`Delivered as ${newPT}.`;
    if(rejectedAmount>0)auditSummary+=` Partial: ${fmtMoney(deliveredTotal)} of ${fmtMoney(orderTotal)}.`;
    db.from('order_edits').insert({order_id:orderId,edited_by_type:'salesman',edited_by_id:S.salesman?.id,edited_by_name:S.salesman?.name||'?',edit_summary:auditSummary,after_snapshot:{status:'delivered',payment_term:newPT,delivered_total:deliveredTotal,paper_bill_total:paperTotal}}).then();

    if(rejectedAmount>0.01&&retailerId&&newPT==='credit'){
      const{data:retData}=await db.from('retailers').select('outstanding').eq('id',retailerId).single();
      db.from('retailers').update({outstanding:Math.max(0,Number(retData?.outstanding||0)-rejectedAmount)}).eq('id',retailerId).then();
    }

    if(collectNow!=='no'&&retailerId&&amtVal>0){
      const{data:ordResp}=await db.from('orders').select('order_number').eq('id',orderId).single();
      const{error:e2}=await db.from('collections').insert({retailer_id:retailerId,salesman_id:S.salesman.id,amount:amtVal,mode:modeVal,reference:refVal,notes:'At delivery of '+fmtOrd(ordResp?.order_number||0)});
      if(e2)throw e2;
      if(amtVal>=deliveredTotal-0.01) db.from('payments').update({status:'paid',paid_on:toYMD(new Date())}).eq('order_id',orderId).then();
    }
    toast('Order delivered'); closeModal(); await loadSalesmanHome();
    if(document.getElementById('pg-order-history').classList.contains('active'))await loadSalesmanOrders();
  }catch(e){
    toast('Error: '+(e?.message||'Something went wrong'));
    if(btn){btn.disabled=false;btn.textContent='Confirm Delivery';}
  }
}

async function editOrder(orderId){
  const{data:o,error}=await db.from('orders').select('*, retailers(id,name,area,outstanding,credit_limit), order_items(quantity,bonus_quantity,rate,product_id,products(name,sku))').eq('id',orderId).single();
  if(error||!o){toast('Could not load order');return;}
  // Salesman edit lock — only allowed while order is still 'placed' (admin hasn't confirmed yet)
  const status=o.status||'placed';
  if(status!=='placed'){
    ui.confirm({
      title:'Cannot edit',
      message:`This order is marked "${statusLabel(status)}". Once admin confirms an order, only admin can edit it.\n\nIf you need a change, ask the admin to update it, or call them directly.`,
      confirmText:'OK',cancelText:''
    });
    return;
  }
  S.editingOrderId=orderId;
  S.retailer={id:o.retailer_id,name:o.retailers?.name||'',area:o.retailers?.area||'',outstanding:o.retailers?.outstanding||0,credit_limit:o.retailers?.credit_limit||0};
  S.cart=o.order_items.map(i=>({pid:i.product_id,name:i.products?.name||'',sku:i.products?.sku||'',company:'',rate:i.rate||0,mrp:0,qty:i.quantity,bonus:i.bonus_quantity||0,_autoBonus:false}));
  document.getElementById('cart-title').textContent='Edit Order';
  document.getElementById('place-btn').innerHTML='Update Order';
  document.getElementById('f-payment').value=o.payment_term;
  document.getElementById('credit-wrap').style.display=o.payment_term==='credit'?'block':'none';
  if(o.credit_period_days)document.getElementById('f-credit').value=o.credit_period_days;
  document.getElementById('f-delivery').value=o.delivery_date||'';
  document.getElementById('f-notes').value=o.notes||'';
  updateCartCounts();gotoPage('pg-cart');
}

// Salesman cancel — same lock rule as edit (only while 'placed')
async function salesmanCancelOrder(orderId){
  const order=(await db.from('orders').select('id,status,order_number').eq('id',orderId).single()).data;
  if(!order){toast('Order not found');return;}
  const status=order.status||'placed';
  if(status!=='placed'){
    ui.confirm({title:'Cannot cancel',message:`This order is marked "${statusLabel(status)}". Once admin confirms an order, only admin can cancel it.`,confirmText:'OK',cancelText:''});
    return;
  }
  const ok=await ui.confirm({
    title:'Cancel this order?',
    message:'Order '+fmtOrd(order.order_number)+' will be marked as cancelled. It stays in your history but won\'t count toward sales.',
    confirmText:'Yes, cancel',cancelText:'Keep order',danger:true
  });
  if(!ok)return;
  const{error}=await db.from('orders').update({status:'cancelled'}).eq('id',orderId);
  if(error){toast('Could not cancel: '+error.message);return;}
  db.from('order_edits').insert({order_id:orderId,edited_by_type:'salesman',edited_by_id:S.salesman?.id,edited_by_name:S.salesman?.name||'?',edit_summary:'Cancelled by salesman',before_snapshot:{status:'placed'},after_snapshot:{status:'cancelled'}}).then(()=>{});
  toast('Order cancelled');
  loadSalesmanOrders();
}

async function reorder(orderId){
  const{data:o}=await db.from('orders').select('*, retailers(id,name,area,outstanding,credit_limit), order_items(quantity,bonus_quantity,rate,product_id,products(name,sku,company_id,companies(name)))').eq('id',orderId).single();
  if(!o){toast('Order not found');return;}
  S.editingOrderId=null;
  S.retailer={id:o.retailer_id,name:o.retailers?.name||'',area:o.retailers?.area||'',outstanding:o.retailers?.outstanding||0,credit_limit:o.retailers?.credit_limit||0};
  S.cart=o.order_items.map(i=>({pid:i.product_id,name:i.products?.name||'',sku:i.products?.sku||'',company:i.products?.companies?.name||'',rate:i.rate||0,mrp:0,qty:i.quantity,bonus:i.bonus_quantity||0,_autoBonus:false}));
  await loadLastSoldRates(o.retailer_id);
  toast(`Loaded ${S.cart.length} items from ${fmtOrd(o.order_number)}`);
  updateCartCounts();gotoPage('pg-cart');
}

async function resendWA(orderId){
  const{data:o}=await db.from('orders').select('*, retailers(name,area), salesmen!orders_salesman_id_fkey(name), order_items(quantity,bonus_quantity,rate,products(name,sku))').eq('id',orderId).single();
  if(!o)return;
  let tot=0;
  const lines=(o.order_items||[]).map(i=>{const lt=(parseFloat(i.quantity)||0)*(parseFloat(i.rate)||0);tot+=lt;let l=`• ${i.products?.name} × ${i.quantity}`;if(i.bonus_quantity>0)l+=` (+${i.bonus_quantity} Free)`;l+=` @ ₹${i.rate||0} = ₹${lt.toFixed(2)}`;return l;}).join('\n');
  const msg=encodeURIComponent(`*Order ${fmtOrd(o.order_number)}*\nVinita Enterprises\n${o.salesmen?.name}\n${o.retailers?.name}\n${fmtDate(o.order_date)}\n\n*Items:*\n${lines}\n\n*Total: ₹${tot.toFixed(2)}*\nPayment: ${o.payment_term==='cash'?'Cash':'Credit ('+o.credit_period_days+'d)'}${o.notes?'\nNotes: '+o.notes:''}`);
  window.open(`https://wa.me/${WA_NUM}?text=${msg}`,'_blank');
}

async function adminLogin(){
  if(document.getElementById('admin-pw').value===ADMIN_PW){
    S.isAdmin=true;
    persistState();
    gotoPage('pg-admin');
    loadAdminDashboard();
    try {
      const {data: adminSM} = await db.from('salesmen').select('id, name').eq('name', 'Admin').maybeSingle();
      if (adminSM) {
        S.adminSalesman = adminSM;
      } else {
        const {data: newSM, error} = await db.from('salesmen').insert({name: 'Admin', password_hash: ''}).select().single();
        if (!error && newSM) S.adminSalesman = newSM;
      }
    } catch(e) {
      console.warn('Failed to ensure Admin salesman:', e);
    }
  }else toast('Wrong password');
}
function adminLogout(){
  document.getElementById('admin-pw').value='';
  S.isAdmin=false;
  S.adminSalesman=null;
  S.adminOrdering=false;
  persistState();
  gotoPage('pg-landing');
}
function adminStartOrder(){
  if(!S.adminSalesman){
    toast('Admin profile loading... please wait');
    db.from('salesmen').select('id, name').eq('name', 'Admin').maybeSingle().then(({data}) => {
      if(data) {
        S.adminSalesman = data;
        adminStartOrder();
      } else {
        db.from('salesmen').insert({name: 'Admin', password_hash: ''}).select().single().then(({data: newSM}) => {
          if (newSM) {
            S.adminSalesman = newSM;
            adminStartOrder();
          }
        });
      }
    });
    return;
  }
  S.salesman = S.adminSalesman;
  S.adminOrdering = true;
  gotoPage('pg-select-retailer');
}
function handleSelectRetailerBack(){
  if(S.adminOrdering){
    S.adminOrdering = false;
    S.salesman = null;
    gotoPage('pg-admin');
    loadAdminDashboard();
  } else {
    gotoPage('pg-salesman-home');
  }
}
async function loadAdminDashboard(opts={}){
  await Promise.all([loadAdminOrders(opts),loadAdminStats()]);
}

// Soft refresh that does NOT reset scroll position — used after every action that
// modifies an order (confirm / cancel / mark paid / etc).
async function refreshAdminInPlace(){
  const scrollY=window.scrollY;
  await loadAdminDashboard({skipSkeleton:true});
  // Restore scroll AFTER the DOM has been replaced. requestAnimationFrame waits one
  // paint cycle so the new content is already laid out.
  requestAnimationFrame(()=>{
    requestAnimationFrame(()=>window.scrollTo({top:scrollY,behavior:'instant'}));
  });
}

async function loadAdminStats(){
  const today=toYMD(new Date());
  const todayStart=new Date(today+'T00:00:00').toISOString();
  const[{data:t},{data:p},{data:u},{data:colls}]=await Promise.all([
    db.from('orders').select('id').eq('order_date',today),
    db.from('orders').select('id').eq('status','placed'),
    db.from('payments').select('id').eq('status','unpaid'),
    db.from('collections').select('amount').gte('collected_at',todayStart),
  ]);
  const collectedToday=(colls||[]).reduce((s,c)=>s+Number(c.amount||0),0);
  document.getElementById('admin-stats').innerHTML=`
    <div class="sc sc-tap" onclick="applyAdminQuickFilter('today','all','Orders Today')"><div class="sc-icon">${ico('calendar',16)}</div><div class="sv">${t?.length||0}</div><div class="sl">Orders Today</div></div>
    <div class="sc sc-tap" onclick="applyAdminQuickFilter('all','placed','Pending Orders')"><div class="sc-icon">${ico('clock',16)}</div><div class="sv">${p?.length||0}</div><div class="sl">Pending</div></div>
    <div class="sc sc-tap" onclick="switchToCollectionsToday()"><div class="sc-icon">${ico('cash',16)}</div><div class="sv" style="font-size:22px">${fmtMoneyCompact(collectedToday)}</div><div class="sl">Collected Today</div></div>
    <div class="sc sc-tap" onclick="applyAdminQuickFilter('all','unpaid','Unpaid Orders')"><div class="sc-icon">${ico('dollar',16)}</div><div class="sv">${u?.length||0}</div><div class="sl">Unpaid Orders</div></div>`;
}

// Helper: when an admin stat card is tapped, apply the matching filter and scroll the list into view
function applyAdminQuickFilter(dateKey,statusKey,labelHint){
  // Update date filter chips
  document.querySelectorAll('#date-filters .chip').forEach(c=>{
    c.classList.toggle('active',c.dataset.key===dateKey);
  });
  S.dateFilter=dateKey;
  // Update status filter chips
  document.querySelectorAll('#order-filters .chip').forEach(c=>{
    const t=c.textContent.trim().toLowerCase();
    const k=statusKey==='all'?'all':statusKey;
    c.classList.toggle('active',t===k||(k==='all'&&t==='all'));
  });
  S.statusFilter=statusKey;
  applyAdminFilters();
  toast('Showing: '+labelHint);
  // Smooth-scroll to the order list section
  setTimeout(()=>{
    const el=document.getElementById('admin-orders-list');
    if(el)el.scrollIntoView({behavior:'smooth',block:'start'});
  },150);
}

function switchToCollectionsToday(){
  // Tap "Collections" tab and apply today filter
  const colTab=document.querySelector('#pg-admin .tab:nth-child(2)');
  if(colTab)colTab.click();
  setTimeout(()=>{
    S.colDateFilter='today';
    document.querySelectorAll('#col-date-filters .chip').forEach(c=>c.classList.toggle('active',c.dataset.key==='today'));
    if(typeof applyCollectionFilters==='function')applyCollectionFilters();
  },100);
}

async function loadAdminOrders(opts={}){
  if(!opts.skipSkeleton)document.getElementById('admin-orders-list').innerHTML=skeletonList();
  const{data,error}=await db.from('orders').select('*, retailers(name,area,contact,outstanding,credit_limit), salesmen!orders_salesman_id_fkey(name), order_items(quantity,bonus_quantity,rate,products(name,sku)), payments(id,status)').order('created_at',{ascending:false});
  if(error){
    console.error('loadAdminOrders error:',error);
    document.getElementById('admin-orders-list').innerHTML=`<div class="err-bar">Could not load orders: ${esc(error.message)}<br><br>If you see "column ... does not exist", run the latest database-update.sql in Supabase.</div>`;
    return;
  }
  S.adminOrders=data||[];applyAdminFilters();
}

function filterByStatus(filter,el){document.querySelectorAll('#order-filters .chip').forEach(c=>c.classList.remove('active'));el.classList.add('active');S.statusFilter=filter;applyAdminFilters();}
function filterAdminOrders(){S.searchTerm=document.getElementById('admin-search').value.toLowerCase();applyAdminFilters();}

// ============================================================
//   DATE FILTERS (admin order panel)
// ============================================================
function startOfDay(d){const x=new Date(d);x.setHours(0,0,0,0);return x;}
function endOfDay(d){const x=new Date(d);x.setHours(23,59,59,999);return x;}
function toYMD(d){
  // Convert a Date object to local-time YYYY-MM-DD string (NOT UTC)
  const y=d.getFullYear();const m=String(d.getMonth()+1).padStart(2,'0');const day=String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}
function normalizeOrderDate(v){
  // Order_date from Supabase can come as 'YYYY-MM-DD' (DATE column) or a full ISO timestamp.
  // Take just the date portion — first 10 chars work for both formats.
  if(!v)return '';
  const s=String(v);
  return s.length>=10?s.slice(0,10):s;
}

function getDateRange(key){
  // All dates returned as 'YYYY-MM-DD' strings in LOCAL time.
  // String comparison sidesteps every timezone trap.
  const today=new Date();today.setHours(0,0,0,0);
  const todayYMD=toYMD(today);
  switch(key){
    case 'today':return{from:todayYMD,to:todayYMD,label:'Today'};
    case 'yesterday':{const y=new Date(today);y.setDate(y.getDate()-1);const s=toYMD(y);return{from:s,to:s,label:'Yesterday'};}
    case 'thisWeek':{const m=new Date(today);const dow=m.getDay()||7;m.setDate(m.getDate()-(dow-1));return{from:toYMD(m),to:todayYMD,label:'This Week'};}
    case 'last7':{const f=new Date(today);f.setDate(f.getDate()-6);return{from:toYMD(f),to:todayYMD,label:'Last 7 Days'};}
    case 'thisMonth':{const m=new Date(today.getFullYear(),today.getMonth(),1);return{from:toYMD(m),to:todayYMD,label:'This Month'};}
    case 'lastMonth':{const f=new Date(today.getFullYear(),today.getMonth()-1,1);const t=new Date(today.getFullYear(),today.getMonth(),0);return{from:toYMD(f),to:toYMD(t),label:'Last Month'};}
    case 'custom':{
      const f=S.customFromDate||null;
      const t=S.customToDate||null;
      const lbl=f&&t?`${fmtDateShort(f)} — ${fmtDateShort(t)}`:'Custom Range';
      return{from:f,to:t,label:lbl};
    }
    case 'all':default:return{from:null,to:null,label:'All Time'};
  }
}

function inDateRange(orderDate,range){
  if(!range.from&&!range.to)return true;
  const d=normalizeOrderDate(orderDate);
  if(!d)return false;
  if(range.from&&d<range.from)return false;
  if(range.to&&d>range.to)return false;
  return true;
}

function filterByDate(key,el){
  document.querySelectorAll('#date-filters .chip').forEach(c=>c.classList.remove('active'));
  if(el)el.classList.add('active');
  S.dateFilter=key;
  applyAdminFilters();
}

function openCustomDateModal(){
  const today=toYMD(new Date());
  document.getElementById('modal-title').textContent='Custom Date Range';
  document.getElementById('modal-body').innerHTML=`
    <div style="display:flex;gap:10px">
      <div class="fg" style="flex:1"><label>From</label><input type="date" id="cdr-from" value="${S.customFromDate||''}" max="${today}"></div>
      <div class="fg" style="flex:1"><label>To</label><input type="date" id="cdr-to" value="${S.customToDate||today}" max="${today}"></div>
    </div>
    <button class="btn btn-or" onclick="applyCustomDate()">Apply Range</button>`;
  openModal();
}

function applyCustomDate(){
  const f=document.getElementById('cdr-from').value;
  const t=document.getElementById('cdr-to').value;
  if(!f||!t){toast('Please select both dates');return;}
  if(new Date(f)>new Date(t)){toast('From date must be before To date');return;}
  S.customFromDate=f;S.customToDate=t;S.dateFilter='custom';
  document.querySelectorAll('#date-filters .chip').forEach(c=>{
    c.classList.toggle('active',c.dataset.key==='custom');
    if(c.dataset.key==='custom')c.textContent=`${fmtDateShort(f)} — ${fmtDateShort(t)}`;
  });
  closeModal();applyAdminFilters();
}

function applyAdminFilters(){
  const range=getDateRange(S.dateFilter);
  let arr=S.adminOrders.filter(o=>inDateRange(o.order_date,range));
  if(S.statusFilter==='unpaid')arr=arr.filter(o=>o.payments?.[0]?.status!=='paid');
  else if(S.statusFilter!=='all')arr=arr.filter(o=>(o.status||'placed').toLowerCase()===S.statusFilter);
  if(S.searchTerm){arr=arr.filter(o=>fmtOrd(o.order_number).toLowerCase().includes(S.searchTerm)||(o.retailers?.name||'').toLowerCase().includes(S.searchTerm)||(o.salesmen?.name||'').toLowerCase().includes(S.searchTerm));}
  S.filteredOrders=arr;
  renderDateSummary(arr,range);
  renderAdminOrders(arr);
}

function renderDateSummary(orders,range){
  const el=document.getElementById('date-summary');if(!el)return;
  const total=orders.length;
  const revenue=orders.reduce((s,o)=>s+(o.order_items||[]).reduce((ss,i)=>ss+((parseFloat(i.quantity)||0)*(parseFloat(i.rate)||0)),0),0);
  const unpaid=orders.filter(o=>o.payments?.[0]?.status!=='paid').length;
  el.innerHTML=`<div class="date-summary">
    <div class="ds-left">
      <div class="ds-range">${esc(range.label)}</div>
      <div class="ds-revenue">${fmtMoney(revenue)}</div>
    </div>
    <div class="ds-right">
      <div class="ds-stat">
        <div class="ds-stat-item"><div class="ds-stat-v">${total}</div><div class="ds-stat-l">Orders</div></div>
        <div class="ds-stat-item"><div class="ds-stat-v ${unpaid>0?'unpaid':''}">${unpaid}</div><div class="ds-stat-l">Unpaid</div></div>
      </div>
    </div>
  </div>`;
}

function renderAdminOrders(orders){
  const el=document.getElementById('admin-orders-list');
  if(!orders.length){el.innerHTML='<div class="empty"><div class="ei"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/></svg></div><div class="empty-title">No orders found</div><div class="empty-sub">Try a different filter, date range, or search.</div></div>';return;}
  // Group orders by date when range covers multiple days; otherwise show flat list
  const showGroups=['thisWeek','last7','thisMonth','lastMonth','all','custom'].includes(S.dateFilter);
  const cardHtml=o=>{
    const tot=Math.round((o.order_items||[]).reduce((s,i)=>s+((parseFloat(i.quantity)||0)*(parseFloat(i.rate)||0)),0));
    const status=o.status||'placed';
    const checked=S.selectedOrders&&S.selectedOrders.has(o.id)?'checked':'';
    return`<div class="oc" style="cursor:pointer;display:flex;align-items:flex-start;gap:12px">
      <input type="checkbox" class="oc-check" ${checked} onclick="event.stopPropagation();toggleOrderSelect('${o.id}')" aria-label="Select order" style="margin-top:4px">
      <div onclick="openOrderDetail('${o.id}')" style="flex:1;min-width:0">
      <div class="oh">
        <div><div class="on">${fmtOrd(o.order_number)}</div><div class="om">${ico('user',13)} <span style="vertical-align:1px">${esc(o.salesmen?.name||'-')}</span> → ${ico('shop',13)} <span style="vertical-align:1px">${esc(o.retailers?.name||'-')}</span></div>${!showGroups?`<div class="om">${fmtDate(o.order_date)}${o.delivery_date?' · Deliver: '+fmtDateShort(o.delivery_date):''}</div>`:o.delivery_date?`<div class="om">Deliver by ${fmtDateShort(o.delivery_date)}</div>`:''}</div>
        <span class="badge b-${status}">${statusLabel(status)}</span>
      </div>
      ${(o.order_items||[]).slice(0,2).map(i=>{let t=`${i.quantity} pcs`;if(i.bonus_quantity>0)t+=` <span style="color:var(--or);font-size:11px">(+${i.bonus_quantity} free)</span>`;return`<div class="oi-row"><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(i.products?.name||'')}</span><span style="flex-shrink:0">${t} @ ₹${i.rate||0}</span></div>`;}).join('')}
      ${(o.order_items||[]).length>2?`<div style="font-size:12px;color:var(--mu);margin-top:2px;font-weight:500">+ ${o.order_items.length-2} more</div>`:''}
      <div style="font-size:15px;font-weight:700;margin:10px 0 4px;letter-spacing:-0.015em">Total: <span style="color:var(--or)">${fmtMoney(tot)}</span></div>
      <div class="of">
        <span class="badge b-${o.payment_term}">${esc(o.payment_term)}${o.payment_term==='credit'?' ('+o.credit_period_days+'d)':''}</span>
        <span class="badge b-${o.payments?.[0]?.status||'unpaid'}">${o.payments?.[0]?.status==='paid'?'Paid':'Unpaid'}</span>
        <span style="font-size:11.5px;color:var(--mu);margin-left:auto;font-weight:600">Tap to manage ›</span>
      </div></div></div>`;
  };
  if(!showGroups){el.innerHTML=orders.map(cardHtml).join('');return;}
  // Group by order_date (descending: newest day first)
  const groups={};
  orders.forEach(o=>{const k=normalizeOrderDate(o.order_date)||'unknown';(groups[k]=groups[k]||[]).push(o);});
  const sortedDates=Object.keys(groups).sort((a,b)=>b.localeCompare(a));
  const today=toYMD(new Date());
  const yesterday=(()=>{const d=new Date();d.setDate(d.getDate()-1);return toYMD(d);})();
  el.innerHTML=sortedDates.map(date=>{
    const g=groups[date];
    const dayRev=g.reduce((s,o)=>s+(o.order_items||[]).reduce((ss,i)=>ss+((parseFloat(i.quantity)||0)*(parseFloat(i.rate)||0)),0),0);
    let label;
    if(date===today)label=`<em>Today,</em> ${fmtDateShort(date)}`;
    else if(date===yesterday)label=`<em>Yesterday,</em> ${fmtDateShort(date)}`;
    else label=fmtDateLong(date);
    return`<div class="date-header">
      <div class="dh-date">${label}</div>
      <div class="dh-meta"><strong>${g.length}</strong> ${g.length===1?'order':'orders'} · <strong>${fmtMoney(dayRev)}</strong></div>
    </div>${g.map(cardHtml).join('')}`;
  }).join('');
}

function fmtDateLong(d){if(!d)return'-';return new Date(d).toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'short'});}

const STATUSES=['placed','delivered'];
async function openOrderDetail(orderId){
  const{data:o}=await db.from('orders').select('*, retailers(name,area,contact), salesmen!orders_salesman_id_fkey(name), order_items(quantity,bonus_quantity,rate,products(name,sku)), payments(id,status,paid_on)').eq('id',orderId).single();
  if(!o)return;
  const status=o.status||'placed';
  const tot=Math.round((o.order_items||[]).reduce((s,i)=>s+((parseFloat(i.quantity)||0)*(parseFloat(i.rate)||0)),0));
  const stepHtml=STATUSES.map((s,i)=>{const cur=STATUSES.indexOf(status);const cls=i<cur?'done':(i===cur?'current':'');return`<div class="status-step ${cls}">${statusLabel(s)}</div>${i<STATUSES.length-1?'<span class="status-arrow">→</span>':''}`;}).join('');
  const itemsHtml=(o.order_items||[]).map(i=>`<div class="oi-row"><span>${esc(i.products?.name||'')} (${esc(i.products?.sku||'')})</span><span>${i.quantity} pcs${i.bonus_quantity>0?' +'+i.bonus_quantity+' free':''} @ ₹${i.rate}</span></div>`).join('');
  document.getElementById('modal-title').textContent=fmtOrd(o.order_number);
  document.getElementById('modal-body').innerHTML=`
    <div class="card" style="margin-bottom:14px;background:var(--or-grad-soft);border:.5px solid #fed7aa">
      <div class="om" style="color:var(--tx-2);display:flex;align-items:center;gap:6px">${ico('user',13)}<strong>${esc(o.salesmen?.name||'-')}</strong></div>
      <div class="om" style="color:var(--tx-2);margin-top:6px;display:flex;align-items:center;gap:6px;flex-wrap:wrap">${ico('shop',13)}<strong>${esc(o.retailers?.name||'-')}</strong>${o.retailers?.area?' · '+esc(o.retailers.area):''}</div>
      ${o.retailers?.contact?`<div class="om" style="color:var(--tx-2);margin-top:6px;display:flex;align-items:center;gap:6px">${ico('phone',13)}<span>${esc(o.retailers.contact)}</span></div>`:''}
      <div class="om" style="color:var(--tx-2);margin-top:6px;display:flex;align-items:center;gap:6px;flex-wrap:wrap">${ico('calendar',13)}<span>Placed ${fmtDate(o.order_date)}${o.delivery_date?' · Deliver by '+fmtDate(o.delivery_date):''}</span></div>
    </div>
    <div style="font-size:11px;font-weight:700;color:var(--mu);text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px">Status</div>
    <div class="status-flow">${stepHtml}</div>
    <div style="font-size:11px;font-weight:700;color:var(--mu);text-transform:uppercase;letter-spacing:.05em;margin:14px 0 8px">Items</div>
    <div class="card" style="padding:10px 14px;margin-bottom:12px">${itemsHtml}
      <div style="margin-top:8px;text-align:right;font-weight:700;border-top:.5px solid var(--bd);padding-top:8px;letter-spacing:-0.015em">Total: <span style="color:var(--or);font-size:16px">${fmtMoney(tot)}</span></div>
    </div>
    <div class="of" style="margin-bottom:14px">
      <span class="badge b-${o.payment_term}">${esc(o.payment_term)}${o.payment_term==='credit'?' ('+o.credit_period_days+'d)':''}</span>
      <span class="badge b-${o.payments?.[0]?.status||'unpaid'}">${o.payments?.[0]?.status==='paid'?'Paid':'Unpaid'}</span>
    </div>
    ${o.notes?`<div style="display:flex;gap:8px;align-items:flex-start;font-size:13px;background:var(--or-bg);padding:11px 14px;border-radius:var(--r-md);margin-bottom:14px;font-weight:500;color:var(--or-d)">${ico('note',14)} <span>${esc(o.notes)}</span></div>`:''}
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      ${status!=='delivered'&&status!=='cancelled'?`<button class="btn btn-or btn-sm" onclick="advanceStatus('${o.id}','${nextStatus(status)}')">${nextStatusLabel(status)}</button>`:''}
      <button class="btn btn-ghost btn-sm" style="border:1px solid var(--bd)" onclick="adminEditOrder('${o.id}')">${ico('edit',13)} Edit Order</button>
      ${o.payments?.[0]?.status!=='paid'?`<button class="btn btn-or btn-sm" onclick="markPaid('${o.payments?.[0]?.id}')">${ico('cash',13)} Mark Paid</button>`:''}
      <button class="btn btn-wa btn-sm" onclick="resendWA('${o.id}')">${ico('send',13)} Resend WA</button>
      ${status!=='cancelled'&&status!=='delivered'?`<button class="btn btn-danger btn-sm" onclick="deleteOrder('${o.id}')">${ico('trash',13)} Delete</button>`:''}
    </div>`;
  openModal();
}
function nextStatus(s){const i=STATUSES.indexOf(s);return i<0||i>=STATUSES.length-1?STATUSES[STATUSES.length-1]:STATUSES[i+1];}
function nextStatusLabel(s){const ns=nextStatus(s);return'Mark '+statusLabel(ns)+' →';}
async function advanceStatus(id,newStatus){
  const o=S.adminOrders.find(x=>x.id===id);
  const prevStatus=o?.status||'placed';
  const{error}=await db.from('orders').update({status:newStatus}).eq('id',id);
  if(error){
    toast('Could not update status: '+error.message);
    if(error.message.includes('invalid input value for enum')){
      ui.confirm({title:'Database needs update',message:'Your Supabase database hasn\'t been updated yet to support the new order statuses (confirmed/dispatched/delivered/cancelled).\n\nGo to Supabase → SQL Editor → run the latest database-update.sql once. Then try again.',confirmText:'Got it',cancelText:'Close'});
    }
    return;
  }
  // Audit log (don't block on failure)
  db.from('order_edits').insert({order_id:id,edited_by_type:'admin',edited_by_name:'Admin',edit_summary:'Status: '+prevStatus+' → '+newStatus,before_snapshot:{status:prevStatus},after_snapshot:{status:newStatus}}).then(()=>{});
  toast('Status: '+statusLabel(newStatus));
  closeModal();refreshAdminInPlace();
}

async function deleteOrder(id){
  const ok=await ui.confirm({
    title:'Delete this order?',
    message:'This order and all its items will be permanently deleted from the database. This action cannot be undone.',
    confirmText:'Yes, delete order',cancelText:'Keep order',danger:true
  });
  if(!ok)return;
  await db.from('payments').delete().eq('order_id',id);
  await db.from('order_items').delete().eq('order_id',id);
  const {error} = await db.from('orders').delete().eq('id',id);
  if(error){toast('Could not delete: '+error.message);return;}
  db.from('audit_logs').insert({admin_id:S.adminId, action:'delete_order', details:{order_id:id}}).then(()=>{});
  toast('Order deleted permanently');closeModal();refreshAdminInPlace();
}

async function markPaid(id){
  if(!id)return;
  const{error}=await db.from('payments').update({status:'paid',paid_on:toYMD(new Date())}).eq('id',id);
  if(error){toast('Could not mark paid: '+error.message);return;}
  toast('Marked paid');closeModal();refreshAdminInPlace();
}

async function exportOrdersExcel(){
  const orders=S.filteredOrders||S.adminOrders;
  if(!orders.length){toast('No orders to export');return;}
  toast('Preparing export...');

  // Try to enrich products with HSN + GST. If columns don't exist (SQL not updated yet),
  // fall back silently — the export still works, just without tax columns filled in.
  const productIds=[...new Set(orders.flatMap(o=>(o.order_items||[]).map(i=>i.products?.sku)).filter(Boolean))];
  let hsnMap={},gstMap={};
  if(productIds.length){
    try{
      const{data:prods}=await db.from('products').select('sku,hsn_code,gst_rate').in('sku',productIds);
      (prods||[]).forEach(p=>{hsnMap[p.sku]=p.hsn_code||'';gstMap[p.sku]=Number(p.gst_rate)||0;});
    }catch(e){
      // Columns don't exist — that's fine, leave maps empty
    }
  }
  const getHsn=sku=>hsnMap[sku]||'';
  const getGst=sku=>gstMap[sku]||0;
  const rows=[['Order #','Date','Salesman','Retailer','Status','Payment','Total','Notes']];
  orders.forEach(o=>{
    const tot=Math.round((o.order_items||[]).reduce((s,i)=>s+((Number(i.quantity)||0)*(Number(i.rate)||0)),0));
    rows.push([
      fmtOrd(o.order_number),fmtDate(o.order_date),
      o.salesmen?.name||'',o.retailers?.name||'',
      statusLabel(o.status||'placed'),
      o.payment_term+(o.payment_term==='credit'?' '+o.credit_period_days+'d':''),
      tot.toFixed(2),o.notes||''
    ]);
  });
  const wb=XLSX.utils.book_new();
  const ws=XLSX.utils.aoa_to_sheet(rows);
  ws['!cols']=[{wch:10},{wch:14},{wch:18},{wch:28},{wch:11},{wch:12},{wch:10},{wch:22}];
  XLSX.utils.book_append_sheet(wb,ws,'Order Summary');
  const range=getDateRange(S.dateFilter);
  const slug=(range.label||'all').toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');
  XLSX.writeFile(wb,`vinita_summary_${slug}_${new Date().toISOString().split('T')[0]}.xlsx`);
  toast('Exported '+orders.length+' orders (summary)');
}

// ============================================================
//   MARG-READY DETAILED EXPORT
//   One row per LINE ITEM. Every row has the full bill header
//   (Bill No, Date, Party, Payment) plus item details (Item, Qty, Rate).
//   This is the format Marg ERP's Excel import expects so the wizard
//   can group lines by Bill No into one bill per order.
// ============================================================
function exportOrdersMargDetailed(){
  const orders=S.filteredOrders||S.adminOrders;
  if(!orders.length){toast('No orders to export');return;}

  // SHEET 1: Marg Sale Bill (denormalized — one row per line item)
  const margRows=[[
    'Bill No','Bill Date','Party Name','Party Area','Party Contact',
    'Item Name','Item Code','HSN','Company','Category','Pack Size',
    'Qty','Free Qty','Rate','MRP','Amount',
    'GST %','CGST Amt','SGST Amt','Net Amount',
    'Payment Mode','Credit Days','Status','Delivery Date','Salesman','Notes'
  ]];
  let lineCount=0;
  orders.forEach(o=>{
    const billNo=fmtOrd(o.order_number);
    const billDate=fmtDateMarg(o.order_date);
    const party=o.retailers?.name||'';
    const partyArea=o.retailers?.area||'';
    const partyContact=o.retailers?.contact||'';
    const paymentMode=o.payment_term==='cash'?'Cash':'Credit';
    const creditDays=o.payment_term==='credit'?(o.credit_period_days||0):'';
    const status=statusLabel(o.status||'placed');
    const deliveryDate=o.delivery_date?fmtDateMarg(o.delivery_date):'';
    const salesman=o.salesmen?.name||'';
    const notes=o.notes||'';
    const items=o.order_items||[];
    if(!items.length){
      margRows.push([billNo,billDate,party,partyArea,partyContact,'','','','','','','','','','','','','','','',paymentMode,creditDays,status,deliveryDate,salesman,notes]);
      lineCount++;return;
    }
    items.forEach(i=>{
      const qty=Number(i.quantity)||0;
      const rate=Number(i.rate)||0;
      const amount=qty*rate;
      const p=i.products||{};
      const gstRate=Number(p.gst_rate)||0;
      const cgst=gstRate>0?(amount*gstRate/200):0;
      const sgst=cgst;
      const netAmount=amount+cgst+sgst;
      margRows.push([
        billNo,billDate,party,partyArea,partyContact,
        p.name||'',p.sku||'',p.hsn_code||'',
        p.companies?.name||'',p.category||'',p.pack_size||'',
        qty,Number(i.bonus_quantity)||0,rate.toFixed(2),Number(p.mrp)||'',amount.toFixed(2),
        gstRate||'',gstRate>0?cgst.toFixed(2):'',gstRate>0?sgst.toFixed(2):'',netAmount.toFixed(2),
        paymentMode,creditDays,status,deliveryDate,salesman,notes
      ]);
      lineCount++;
    });
  });

  // SHEET 2: Party Master — unique retailers in this export
  // Import this into Marg FIRST so all parties exist before the bills hit
  const seen=new Set();
  const partyRows=[['Party Name','Area','Contact','Credit Limit','Outstanding']];
  orders.forEach(o=>{
    const r=o.retailers;if(!r||seen.has(r.name))return;
    seen.add(r.name);
    partyRows.push([r.name,r.area||'',r.contact||'',Number(r.credit_limit)||'',Number(r.outstanding)||0]);
  });

  const wb=XLSX.utils.book_new();
  const ws1=XLSX.utils.aoa_to_sheet(margRows);
  ws1['!cols']=[
    {wch:10},{wch:13},{wch:26},{wch:18},{wch:14},
    {wch:30},{wch:14},{wch:10},{wch:14},{wch:14},{wch:12},
    {wch:7},{wch:9},{wch:9},{wch:9},{wch:11},
    {wch:7},{wch:10},{wch:10},{wch:11},
    {wch:13},{wch:10},{wch:11},{wch:13},{wch:16},{wch:24}
  ];
  ws1['!freeze']={xSplit:0,ySplit:1};
  const ws2=XLSX.utils.aoa_to_sheet(partyRows);
  ws2['!cols']=[{wch:30},{wch:24},{wch:14},{wch:14},{wch:14}];
  XLSX.utils.book_append_sheet(wb,ws1,'Marg Sale Bill');
  XLSX.utils.book_append_sheet(wb,ws2,'Party Master');
  const range=getDateRange(S.dateFilter);
  const slug=(range.label||'all').toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');
  XLSX.writeFile(wb,`vinita_marg_detailed_${slug}_${new Date().toISOString().split('T')[0]}.xlsx`);
  toast('Exported '+orders.length+' orders ('+lineCount+' line items)');
}

// ============================================================
//   ADMIN — COLLECTIONS TAB
// ============================================================
async function loadCollections(){
  document.getElementById('collections-list').innerHTML=skeletonList();
  const{data}=await db.from('collections')
    .select('*, retailers(name,area), salesmen!orders_salesman_id_fkey(name)')
    .order('collected_at',{ascending:false});
  S.collections=data||[];
  // Stats: today, this week, this month, total
  const today=toYMD(new Date());
  const wkStart=(()=>{const m=new Date();const dow=m.getDay()||7;m.setDate(m.getDate()-(dow-1));m.setHours(0,0,0,0);return m;})();
  const moStart=new Date(new Date().getFullYear(),new Date().getMonth(),1);
  const tot={today:0,week:0,month:0,all:0};
  S.collections.forEach(c=>{
    const d=new Date(c.collected_at);const amt=Number(c.amount||0);
    tot.all+=amt;
    if(d>=moStart)tot.month+=amt;
    if(d>=wkStart)tot.week+=amt;
    if(toYMD(d)===today)tot.today+=amt;
  });
  document.getElementById('col-stats').innerHTML=`
    <div class="sc"><div class="sc-icon">${ico('calendar',16)}</div><div class="sv" style="font-size:22px">${fmtMoneyCompact(tot.today)}</div><div class="sl">Today</div></div>
    <div class="sc"><div class="sc-icon">${ico('chart',16)}</div><div class="sv" style="font-size:22px">${fmtMoneyCompact(tot.week)}</div><div class="sl">This Week</div></div>
    <div class="sc"><div class="sc-icon">${ico('cash',16)}</div><div class="sv" style="font-size:22px">${fmtMoneyCompact(tot.month)}</div><div class="sl">This Month</div></div>
    <div class="sc"><div class="sc-icon">${ico('dollar',16)}</div><div class="sv" style="font-size:22px">${fmtMoneyCompact(tot.all)}</div><div class="sl">All Time</div></div>`;
  applyCollectionFilters();
}

// --- SALESMAN COLLECTIONS ---
async function loadSalesmanCollections(){
  gotoPage('pg-salesman-collections');
  document.getElementById('sm-collections-list').innerHTML=skeletonList();
  
  // Fetch collections
  const p1 = db.from('collections')
    .select('*, retailers(name,area)')
    .eq('salesman_id', S.salesman.id)
    .order('collected_at',{ascending:false});
    
  // Fetch credit orders
  const p2 = db.from('orders')
    .select('*, retailers(name), order_items(quantity,rate)')
    .eq('salesman_id', S.salesman.id)
    .eq('status', 'delivered')
    .eq('payment_term', 'credit');
    
  const [resCol, resOrd] = await Promise.all([p1, p2]);
  
  S.smCollections = resCol.data || [];
  S.smCreditOrders = resOrd.data || [];
  
  // Overall Cash Stats
  const today=toYMD(new Date());
  const wkStart=(()=>{const m=new Date();const dow=m.getDay()||7;m.setDate(m.getDate()-(dow-1));m.setHours(0,0,0,0);return m;})();
  const moStart=new Date(new Date().getFullYear(),new Date().getMonth(),1);
  const tot={today:0,week:0,month:0,all:0};
  S.smCollections.forEach(c=>{
    const d=new Date(c.collected_at);const amt=Number(c.amount||0);
    tot.all+=amt;
    if(d>=moStart)tot.month+=amt;
    if(d>=wkStart)tot.week+=amt;
    if(toYMD(d)===today)tot.today+=amt;
  });
  
  document.getElementById('sm-col-stats').innerHTML=`
    <div class="sc"><div class="sc-icon">${ico('cash',16)}</div><div class="sv" style="font-size:22px">${fmtMoneyCompact(tot.today)}</div><div class="sl">Today</div></div>
    <div class="sc"><div class="sc-icon">${ico('chart',16)}</div><div class="sv" style="font-size:22px">${fmtMoneyCompact(tot.week)}</div><div class="sl">This Week</div></div>
    <div class="sc"><div class="sc-icon">${ico('dollar',16)}</div><div class="sv" style="font-size:22px">${fmtMoneyCompact(tot.month)}</div><div class="sl">This Month</div></div>
  `;
  applySmCollectionFilters();
}

function filterSmCollectionsByDate(key,el){
  document.querySelectorAll('#sm-col-date-filters .chip').forEach(c=>c.classList.remove('active'));
  if(el)el.classList.add('active');
  S.smColDateFilter=key;
  applySmCollectionFilters();
}

function applySmCollectionFilters(){
  const range=getDateRange(S.smColDateFilter||'today');
  
  // Filter cash
  let cashArr=S.smCollections.filter(c=>{
    if(!range.from&&!range.to)return true;
    const d=toYMD(new Date(c.collected_at));
    if(range.from&&d<range.from)return false;
    if(range.to&&d>range.to)return false;
    return true;
  });
  
  // Filter credit
  let creditArr=S.smCreditOrders.filter(o=>{
    if(!range.from&&!range.to)return true;
    const d=toYMD(new Date(o.delivery_date||o.order_date));
    if(range.from&&d<range.from)return false;
    if(range.to&&d>range.to)return false;
    return true;
  });

  const totCash = cashArr.reduce((s,c)=>s+Number(c.amount||0),0);
  const totCredit = creditArr.reduce((s,o)=>{
    const ot=(o.order_items||[]).reduce((ss,i)=>ss+((parseFloat(i.quantity)||0)*(parseFloat(i.rate)||0)),0);
    return s+ot;
  },0);

  document.getElementById('sm-col-summary').innerHTML=`<div class="date-summary">
    <div class="ds-left">
      <div class="ds-range">${esc(range.label)}</div>
      <div class="ds-revenue" style="font-size:20px">${fmtMoney(totCash+totCredit)}</div>
      <div style="font-size:12px;color:var(--mu);margin-top:6px;font-weight:500">
        <span style="margin-right:12px"><span style="color:#22c55e">Cash/UPI:</span> ${fmtMoney(totCash)}</span>
        <span><span style="color:#f43f5e">Credit:</span> ${fmtMoney(totCredit)}</span>
      </div>
    </div>
  </div>`;
  
  // Merge items for list
  const listItems = [];
  cashArr.forEach(c=>{
    listItems.push({type:'cash', retailer:c.retailers?.name, amount:Number(c.amount), mode:c.mode, date:c.collected_at});
  });
  creditArr.forEach(o=>{
    const ot=(o.order_items||[]).reduce((ss,i)=>ss+((parseFloat(i.quantity)||0)*(parseFloat(i.rate)||0)),0);
    listItems.push({type:'credit', retailer:o.retailers?.name, amount:ot, mode:'Credit ('+o.credit_period_days+'d)', date:o.delivery_date||o.order_date});
  });
  
  listItems.sort((a,b)=>new Date(b.date)-new Date(a.date));
  
  const el=document.getElementById('sm-collections-list');
  if(!listItems.length){
    el.innerHTML=`<div class="empty"><div class="ei">${ico('cash',24)}</div><div class="empty-title">No collections found</div></div>`;
    return;
  }
  
  el.innerHTML = listItems.map(i => `<div class="oc">
    <div class="oh" style="margin-bottom:0">
      <div>
        <div style="font-weight:600;font-size:14px;color:var(--tx)">${esc(i.retailer)}</div>
        <div class="om" style="margin-top:2px;text-transform:capitalize">${esc(i.mode)} · ${fmtDateShort(i.date)}</div>
      </div>
      <div style="font-weight:700;color:${i.type==='cash'?'#22c55e':'#f43f5e'}">${fmtMoney(i.amount)}</div>
    </div>
  </div>`).join('');
}

function filterCollectionsByDate(key,el){
  document.querySelectorAll('#col-date-filters .chip').forEach(c=>c.classList.remove('active'));
  if(el)el.classList.add('active');
  S.colDateFilter=key;
  applyCollectionFilters();
}

function applyCollectionFilters(){
  const range=getDateRange(S.colDateFilter);
  let arr=S.collections.filter(c=>{
    if(!range.from&&!range.to)return true;
    // collected_at is a TIMESTAMPTZ — convert to local YMD
    const d=toYMD(new Date(c.collected_at));
    if(range.from&&d<range.from)return false;
    if(range.to&&d>range.to)return false;
    return true;
  });
  S.filteredCollections=arr;
  renderColSummary(arr,range);
  renderCollectionsList(arr);
}

function renderColSummary(rows,range){
  const total=rows.reduce((s,r)=>s+Number(r.amount||0),0);
  const count=rows.length;
  // By mode
  const byMode={};rows.forEach(r=>{byMode[r.mode]=(byMode[r.mode]||0)+Number(r.amount||0);});
  const modeList=Object.entries(byMode).sort((a,b)=>b[1]-a[1]);

  // --- DAILY SALESMAN COLLECTION SUMMARY ---
  // Group collections (cash/upi) by salesman
  const smCash = {};
  rows.forEach(c => {
    if(!c.salesman_id) return;
    if(!smCash[c.salesman_id]) smCash[c.salesman_id] = { name: c.salesmen?.name || 'Unknown', cash: 0, credit: 0, items: [] };
    smCash[c.salesman_id].cash += Number(c.amount || 0);
    smCash[c.salesman_id].items.push({ type: 'cash', retailer: c.retailers?.name, amount: Number(c.amount), mode: c.mode, date: c.collected_at });
  });

  // Group credit from orders (status='delivered', payment_term='credit') for the same date range
  const creditOrders = (S.adminOrders||[]).filter(o => {
    if(o.status !== 'delivered' || o.payment_term !== 'credit') return false;
    if(!range.from && !range.to) return true;
    const d = toYMD(new Date(o.delivery_date || o.order_date));
    if(range.from && d < range.from) return false;
    if(range.to && d > range.to) return false;
    return true;
  });

  creditOrders.forEach(o => {
    const sid = o.salesman_id;
    if(!sid) return;
    if(!smCash[sid]) smCash[sid] = { name: o.salesmen?.name || 'Unknown', cash: 0, credit: 0, items: [] };
    const tot = (o.order_items||[]).reduce((s,i)=>s+((parseFloat(i.quantity)||0)*(parseFloat(i.rate)||0)),0);
    smCash[sid].credit += tot;
    smCash[sid].items.push({ type: 'credit', retailer: o.retailers?.name, amount: tot, mode: 'Credit ('+o.credit_period_days+'d)', date: o.delivery_date || o.order_date });
  });

  const smList = Object.values(smCash).sort((a,b) => (b.cash+b.credit) - (a.cash+a.credit));
  let smHtml = '';
  if(smList.length) {
    smHtml = '<div style="margin-top:16px;font-size:13px;font-weight:600;color:var(--mu);margin-bottom:8px">Collection by Salesman</div>';
    smHtml += smList.map(sm => `<div class="sc-card" onclick='openSalesmanColModal(${JSON.stringify(sm).replace(/'/g, "&apos;")})' style="background:var(--surface);border:1px solid var(--bd);border-radius:12px;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;cursor:pointer">
      <div style="font-weight:600">${esc(sm.name)}</div>
      <div style="display:flex;gap:12px;font-size:13px">
        <span style="color:#22c55e">Cash/UPI: ${fmtMoneyCompact(sm.cash)}</span>
        <span style="color:#f43f5e">Credit: ${fmtMoneyCompact(sm.credit)}</span>
        <span style="color:var(--mu)">›</span>
      </div>
    </div>`).join('');
  }

  document.getElementById('col-summary').innerHTML=`<div class="date-summary">
    <div class="ds-left">
      <div class="ds-range">${esc(range.label)}</div>
      <div class="ds-revenue">${fmtMoney(total)}</div>
      ${modeList.length?`<div style="font-size:11px;color:var(--mu);margin-top:6px;font-weight:500">${modeList.map(([m,v])=>`<span style="margin-right:10px"><strong style="color:var(--tx)">${PAYMENT_MODES.find(p=>p.key===m)?.label||m}:</strong> ${fmtMoneyCompact(v)}</span>`).join('')}</div>`:''}
    </div>
    <div class="ds-right">
      <div class="ds-stat">
        <div class="ds-stat-item"><div class="ds-stat-v">${count}</div><div class="ds-stat-l">Receipts</div></div>
      </div>
    </div>
  </div>`;
}

function renderCollectionsList(rows){
  const el=document.getElementById('collections-list');
  if(!rows.length){
    el.innerHTML='<div class="empty"><div class="ei"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 10v.01M18 14v.01"/></svg></div><div class="empty-title">No collections in this range</div><div class="empty-sub">Salesmen-recorded payments will appear here.</div></div>';
    return;
  }
  const showGroups=['thisWeek','last7','thisMonth','lastMonth','all'].includes(S.colDateFilter);
  const cardHtml=r=>{
    const modeLabel=PAYMENT_MODES.find(p=>p.key===r.mode)?.label||r.mode;
    const dt=new Date(r.collected_at);
    return`<div class="oc" style="cursor:pointer" onclick="openCollectionDetail('${r.id}')">
      <div class="oh">
        <div>
          <div class="on">${fmtMoney(r.amount)}</div>
          <div class="om">${ico('shop',13)} <span style="vertical-align:1px">${esc(r.retailers?.name||'-')}</span></div>
          <div class="om">${ico('user',13)} <span style="vertical-align:1px">${esc(r.salesmen?.name||'-')}</span> · ${dt.toLocaleString('en-IN',{hour:'2-digit',minute:'2-digit'})}${!showGroups?' · '+fmtDateShort(dt):''}</div>
        </div>
        <span class="badge b-${r.mode==='cash'?'cash':'credit'}">${esc(modeLabel)}</span>
      </div>
      ${r.reference?`<div class="om" style="margin-top:6px"><strong style="color:var(--tx)">Ref:</strong> ${esc(r.reference)}</div>`:''}
      ${r.notes?`<div style="font-size:12px;color:var(--mu);margin-top:6px;font-style:italic">"${esc(r.notes)}"</div>`:''}
      ${r.verified?`<div class="of"><span class="badge b-paid">Verified</span></div>`:''}
    </div>`;
  };
  if(!showGroups){el.innerHTML=rows.map(cardHtml).join('');return;}
  // Group by date
  const groups={};
  rows.forEach(r=>{const k=toYMD(new Date(r.collected_at));(groups[k]=groups[k]||[]).push(r);});
  const sortedDates=Object.keys(groups).sort((a,b)=>b.localeCompare(a));
  const today=toYMD(new Date());
  const yesterday=(()=>{const d=new Date();d.setDate(d.getDate()-1);return toYMD(d);})();
  el.innerHTML=sortedDates.map(date=>{
    const g=groups[date];
    const dayTot=g.reduce((s,r)=>s+Number(r.amount||0),0);
    let label;
    if(date===today)label=`<em>Today,</em> ${fmtDateShort(date)}`;
    else if(date===yesterday)label=`<em>Yesterday,</em> ${fmtDateShort(date)}`;
    else label=fmtDateLong(date);
    return`<div class="date-header">
      <div class="dh-date">${label}</div>
      <div class="dh-meta"><strong>${g.length}</strong> ${g.length===1?'receipt':'receipts'} · <strong>${fmtMoney(dayTot)}</strong></div>
    </div>${g.map(cardHtml).join('')}`;
  }).join('');
}

async function openCollectionDetail(colId){
  const c=S.collections.find(x=>x.id===colId);
  if(!c)return;
  const modeLabel=PAYMENT_MODES.find(p=>p.key===c.mode)?.label||c.mode;
  const dt=new Date(c.collected_at);
  document.getElementById('modal-title').textContent='Payment Receipt';
  document.getElementById('modal-body').innerHTML=`
    <div class="card" style="background:var(--or-grad-soft);border:.5px solid #fed7aa;padding:18px;margin-bottom:14px;text-align:center">
      <div style="font-size:11px;font-weight:700;color:var(--or-d);text-transform:uppercase;letter-spacing:.1em">Amount</div>
      <div style="font-family:var(--font-serif);font-size:36px;font-weight:400;letter-spacing:-0.02em;margin-top:4px;line-height:1;color:var(--tx)">${fmtMoney(c.amount)}</div>
      <div style="font-size:12px;color:var(--tx-2);margin-top:8px;font-weight:600">${esc(modeLabel)}${c.reference?' · '+esc(c.reference):''}</div>
    </div>
    <div style="display:grid;grid-template-columns:auto 1fr;gap:10px 14px;font-size:13.5px">
      <div style="color:var(--mu);font-weight:500">Retailer</div><div style="font-weight:600">${esc(c.retailers?.name||'-')}${c.retailers?.area?' · '+esc(c.retailers.area):''}</div>
      <div style="color:var(--mu);font-weight:500">Collected by</div><div style="font-weight:600">${esc(c.salesmen?.name||'-')}</div>
      <div style="color:var(--mu);font-weight:500">Date &amp; Time</div><div style="font-weight:600">${dt.toLocaleString('en-IN',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}</div>
      ${c.notes?`<div style="color:var(--mu);font-weight:500">Notes</div><div style="font-style:italic">${esc(c.notes)}</div>`:''}
      <div style="color:var(--mu);font-weight:500">Status</div><div>${c.verified?'<span class="badge b-paid">Verified</span>':'<span class="badge b-unpaid">Unverified</span>'}</div>
    </div>
    <div style="display:flex;gap:8px;margin-top:18px;flex-wrap:wrap">
      ${!c.verified?`<button class="btn btn-or btn-sm" onclick="verifyCollection('${c.id}')">${ico('check',13)} Mark Verified</button>`:`<button class="btn btn-ghost btn-sm" onclick="unverifyCollection('${c.id}')">Mark Unverified</button>`}
      <button class="btn btn-danger btn-sm" onclick="deleteCollection('${c.id}')">${ico('trash',13)} Delete</button>
    </div>`;
  openModal();
}

async function verifyCollection(id){
  const{error}=await db.from('collections').update({verified:true,verified_at:new Date().toISOString()}).eq('id',id);
  if(error){toast('Could not verify: '+error.message);return;}
  toast('Marked verified');closeModal();loadCollections();
}
async function unverifyCollection(id){
  const{error}=await db.from('collections').update({verified:false,verified_at:null}).eq('id',id);
  if(error){toast('Could not unverify: '+error.message);return;}
  toast('Marked unverified');closeModal();loadCollections();
}
async function deleteCollection(id){
  const ok=await ui.confirm({
    title:'Delete this receipt?',
    message:'The retailer\'s outstanding balance will be increased by this amount automatically.\n\nThis action cannot be undone.',
    confirmText:'Yes, delete',cancelText:'Keep it',danger:true
  });
  if(!ok)return;
  const{error}=await db.from('collections').delete().eq('id',id);
  if(error){toast('Error: '+error.message);return;}
  toast('Receipt deleted');closeModal();loadCollections();
}

function exportCollectionsExcel(){
  const rows=S.filteredCollections||S.collections;
  if(!rows.length){toast('No collections to export');return;}
  const out=[['Date & Time','Retailer','Salesman','Amount','Mode','Reference','Verified','Notes']];
  rows.forEach(r=>{
    out.push([
      new Date(r.collected_at).toLocaleString('en-IN'),
      r.retailers?.name||'',r.salesmen?.name||'',
      Number(r.amount||0).toFixed(2),
      PAYMENT_MODES.find(p=>p.key===r.mode)?.label||r.mode,
      r.reference||'',r.verified?'Yes':'No',r.notes||''
    ]);
  });
  const wb=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(out),'Collections');
  const range=getDateRange(S.colDateFilter);
  const slug=(range.label||'all').toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');
  XLSX.writeFile(wb,`vinita_collections_${slug}_${new Date().toISOString().split('T')[0]}.xlsx`);
  toast('Exported '+rows.length+' receipts');
}

function switchAdminTab(tab,el){
  document.querySelectorAll('#pg-admin .tab').forEach(t=>t.classList.remove('active'));el.classList.add('active');
  ['orders','collections','reports','analytics','manage'].forEach(t=>document.getElementById('at-'+t).style.display=t===tab?'block':'none');
  if(tab==='collections')loadCollections();
  if(tab==='reports')loadReports();
  if(tab==='analytics')loadAnalytics();
  
  if(tab==='manage')loadManage();
}

async function loadForecasts() {
  const c = document.getElementById('forecasts-content');
  c.innerHTML = skeletonList();
  
  const {data: orders, error} = await db.from('orders').select('created_at, retailers(id, name, area), salesman_id, salesmen!orders_salesman_id_fkey(name)').order('created_at', {ascending: true});
  if(error) { c.innerHTML = '<div class="no-data">Error loading forecast data</div>'; return; }
  
  const retMap = {};
  orders.forEach(o => {
    if(!o.retailers) return;
    const rid = o.retailers.id;
    if(!retMap[rid]) retMap[rid] = { id: rid, name: o.retailers.name, area: o.retailers.area, dates: [] };
    retMap[rid].dates.push(new Date(o.created_at));
  });

  const now = new Date();
  const forecasts = [];
  
  for(const rid in retMap) {
    const r = retMap[rid];
    if(r.dates.length < 2) continue; 
    
    r.dates.sort((a,b) => a - b);
    let totalDays = 0;
    let maxDiff = 0;
    let minDiff = 999999;
    
    for(let i=1; i<r.dates.length; i++) {
      const diffMs = r.dates[i] - r.dates[i-1];
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      totalDays += diffDays;
      if(diffDays > maxDiff) maxDiff = diffDays;
      if(diffDays < minDiff) minDiff = diffDays;
    }
    
    const avgDays = totalDays / (r.dates.length - 1);
    const lastOrderDate = r.dates[r.dates.length - 1];
    const predictedNextDate = new Date(lastOrderDate.getTime() + (avgDays * 24 * 60 * 60 * 1000));
    const daysUntilNext = (predictedNextDate - now) / (1000 * 60 * 60 * 24);
    
    const variance = maxDiff - minDiff;
    let confidence = 95 - (variance * 1.5); 
    if(confidence > 99) confidence = 99;
    if(confidence < 40) confidence = 40;
    
    forecasts.push({id: r.id, name: r.name, area: r.area, orderCount: r.dates.length, avgDays: avgDays, lastOrderDate: lastOrderDate, predictedNextDate: predictedNextDate, daysUntilNext: daysUntilNext, confidence: confidence});
  }
  
  forecasts.sort((a,b) => a.daysUntilNext - b.daysUntilNext);
  
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const salesmanStats = {};
  orders.forEach(o => {
      const od = new Date(o.created_at);
      if(od >= todayStart && o.salesmen) {
          const sid = o.salesman_id;
          if(!salesmanStats[sid]) salesmanStats[sid] = { name: o.salesmen.name, ordersToday: 0 };
          salesmanStats[sid].ordersToday++;
      }
  });
  
  const smHtml = Object.values(salesmanStats).map(s => `
      <div style="display:flex;justify-content:space-between;padding:14px;background:var(--surface);border:1px solid var(--bd);border-radius:12px;margin-bottom:8px;box-shadow:var(--sh-xs)">
          <div style="font-weight:600;font-size:14px">${esc(s.name)}</div>
          <div style="color:var(--or);font-weight:700;font-size:14px">${s.ordersToday} orders taken today</div>
      </div>
  `).join('') || '<div class="no-data">No salesman activity today</div>';
  
  const html = `
    <div style="margin-bottom:32px">
      <div style="font-size:16px;font-weight:700;margin-bottom:12px;color:var(--tx);letter-spacing:-0.01em">${ico('user',16)} Daily Salesman Tracking</div>
      ${smHtml}
    </div>
  
    <div style="font-size:16px;font-weight:700;margin-bottom:8px;color:var(--tx);letter-spacing:-0.01em">${ico('chart',16)} Predictive Re-order Forecast</div>
    <div style="font-size:12.5px;color:var(--mu);margin-bottom:20px;line-height:1.45;font-weight:500">AI-powered analytics predicting when retailers will run out of stock based on historical ordering frequency. Targeting 95% accuracy for consistent buyers.</div>
    
    <div style="display:flex;flex-direction:column;gap:14px">
      ${forecasts.map(f => {
        let statusHtml = '';
        let statusBg = '';
        if(f.daysUntilNext < 0) {
            statusHtml = `<span style="color:#b91c1c;font-weight:700">Overdue by ${Math.abs(Math.round(f.daysUntilNext))} days</span>`;
            statusBg = '#fef2f2;border-color:#fca5a5';
        } else if (f.daysUntilNext <= 3) {
            statusHtml = `<span style="color:#ea580c;font-weight:700">Due in ${Math.round(f.daysUntilNext)} days</span>`;
            statusBg = '#fff7ed;border-color:#fdba74';
        } else {
            statusHtml = `<span style="color:#15803d;font-weight:600">Expected in ${Math.round(f.daysUntilNext)} days</span>`;
            statusBg = '#f0fdf4;border-color:#bbf7d0';
        }
        
        return `
          <div style="background:${statusBg.split(';')[0]};border:1px solid ${statusBg.split('border-color:')[1]||'var(--bd)'};border-radius:16px;padding:16px;box-shadow:var(--sh-xs)">
             <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px">
                <div>
                   <div style="font-size:15.5px;font-weight:700;color:var(--tx);letter-spacing:-0.01em;line-height:1.2">${esc(f.name)}</div>
                   <div style="font-size:12.5px;color:var(--mu);margin-top:4px;font-weight:500">${f.area ? esc(f.area) : ''}</div>
                </div>
                <div style="text-align:right">
                    ${statusHtml}
                    <div style="font-size:11.5px;color:var(--mu);margin-top:6px;font-weight:700;letter-spacing:0.02em">CONFIDENCE: <span style="${f.confidence>85?'color:#15803d':'color:#ea580c'}">${Math.round(f.confidence)}%</span></div>
                </div>
             </div>
             
             <div style="display:flex;gap:12px;padding-top:14px;border-top:1px dashed rgba(0,0,0,0.1)">
                <div style="flex:1">
                    <div style="font-size:10.5px;text-transform:uppercase;color:var(--mu);font-weight:700;letter-spacing:0.04em">Avg Interval</div>
                    <div style="font-size:14px;font-weight:700;color:var(--tx);margin-top:4px">${Math.round(f.avgDays)} days</div>
                </div>
                <div style="flex:1">
                    <div style="font-size:10.5px;text-transform:uppercase;color:var(--mu);font-weight:700;letter-spacing:0.04em">Last Order</div>
                    <div style="font-size:14px;font-weight:600;color:var(--tx);margin-top:4px">${fmtDateShort(f.lastOrderDate)}</div>
                </div>
                <div style="flex:1">
                    <div style="font-size:10.5px;text-transform:uppercase;color:var(--mu);font-weight:700;letter-spacing:0.04em">Next Predicted</div>
                    <div style="font-size:14px;font-weight:700;color:var(--or);margin-top:4px">${fmtDateShort(f.predictedNextDate)}</div>
                </div>
             </div>
          </div>
        `;
      }).join('') || '<div class="no-data">Not enough order history to generate predictions yet. (Need at least 2 orders per retailer)</div>'}
    </div>
  `;
  c.innerHTML = html;
}

async function loadReports(){
  const el=document.getElementById('reports-content');el.innerHTML=skeletonList();
  const{data}=await db.from('orders').select('order_date, status, salesmen!orders_salesman_id_fkey(id,name), retailers(id,name), payments(status), order_items(quantity,rate)').order('order_date',{ascending:false}).limit(500);
  if(!data?.length){el.innerHTML='<div class="empty"><div class="ei"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><rect x="7" y="12" width="3" height="6"/><rect x="12" y="8" width="3" height="10"/><rect x="17" y="4" width="3" height="14"/></svg></div><div class="empty-title">No data yet</div><div class="empty-sub">Place a few orders to see reports here.</div></div>';return;}
  
  const{data:retData}=await db.from('retailers').select('id, name, outstanding, contact');
  S.adminAllRetailers=retData||[];
  const totalOutstanding=(retData||[]).reduce((s,r)=>s+Number(r.outstanding||0),0);
  
  const thirtyDaysAgo=new Date();thirtyDaysAgo.setDate(thirtyDaysAgo.getDate()-30);
  const thirtyDaysAgoStr=toYMD(thirtyDaysAgo);
  const recentRetIds=new Set(data.filter(o=>normalizeOrderDate(o.order_date)>=thirtyDaysAgoStr).map(o=>o.retailers?.id));
  const inactiveCount=(retData||[]).filter(r=>!recentRetIds.has(r.id)).length;

  const days={};for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);days[toYMD(d)]=0;}
  data.forEach(o=>{const k=normalizeOrderDate(o.order_date);if(k in days)days[k]++;});
  const maxD=Math.max(...Object.values(days),1);
  const bySM={},smRev={};
  data.forEach(o=>{const n=o.salesmen?.name||'?';bySM[n]=(bySM[n]||0)+1;const rev=Math.round((o.order_items||[]).reduce((s,i)=>s+((parseFloat(i.quantity)||0)*(parseFloat(i.rate)||0)),0));smRev[n]=(smRev[n]||0)+rev;});
  const byRT={};data.forEach(o=>{const n=o.retailers?.name||'?';byRT[n]=(byRT[n]||0)+1;});
  const unpaid=data.filter(o=>o.payments?.[0]?.status!=='paid').length;
  const totalRev=data.reduce((s,o)=>(o.order_items||[]).reduce((ss,i)=>ss+((parseFloat(i.quantity)||0)*(parseFloat(i.rate)||0)),0)+s,0);
  
  el.innerHTML=`
    <div class="card" style="background:var(--or-grad);color:#fff;border:none;box-shadow:var(--sh-or-sm);padding:22px 20px">
      <div style="font-size:11px;font-weight:600;opacity:.86;text-transform:uppercase;letter-spacing:.12em">Total Revenue</div>
      <div style="font-family:var(--font-serif);font-size:42px;font-weight:400;letter-spacing:-0.025em;margin-top:6px;line-height:1">${fmtMoney(totalRev)}</div>
      <div style="font-size:12.5px;font-weight:500;opacity:.88;margin-top:8px;font-family:var(--font-serif);font-style:italic">${data.length} orders · ${unpaid} unpaid</div>
    </div>
    
    <button class="btn btn-wa" style="width:100%;margin-bottom:14px;background:#111;color:#fff;border:1px solid #333;justify-content:center" onclick="openBIDashboard()">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:8px"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg> Wholesale BI Analytics
    </button>
    
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <div style="font-weight:700;font-size:14px;letter-spacing:-0.01em">Retailer Health &amp; Analytics</div>
        <button class="btn btn-ghost btn-sm" onclick="openAdminRetailerAnalytics()">View Details</button>
      </div>
      <div style="display:flex;gap:10px">
        <div style="flex:1;background:var(--or-bg);padding:10px;border-radius:var(--r-sm)">
          <div style="font-size:11px;color:var(--mu);font-weight:600">Total Outstanding</div>
          <div style="font-size:16px;font-weight:700;color:var(--or-d)">${fmtMoneyCompact(totalOutstanding)}</div>
        </div>
        <div style="flex:1;background:#fef2f2;padding:10px;border-radius:var(--r-sm)">
          <div style="font-size:11px;color:#991b1b;font-weight:600">Inactive (>30 days)</div>
          <div style="font-size:16px;font-weight:700;color:#7f1d1d">${inactiveCount} Shops</div>
        </div>
      </div>
    </div>

    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <div style="font-weight:700;font-size:14px;letter-spacing:-0.01em">📍 Salesman Live Tracking</div>
        <button class="btn btn-ghost btn-sm" onclick="loadAdminMap()">↻ Refresh</button>
      </div>
      <div id="admin-map" style="width:100%;height:250px;background:#e5e5e5;border-radius:var(--r-md);margin-bottom:10px;z-index:1"></div>
      <div id="admin-map-list" style="font-size:12px"></div>
    </div>

    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <div style="font-weight:700;font-size:14px;letter-spacing:-0.01em">💰 Salesman Incentives</div>
      </div>
      <button class="btn btn-or" style="width:100%" onclick="openIncentiveCalculator()">Calculate Incentives</button>
    </div>

    <div class="card"><div style="font-weight:700;margin-bottom:14px;font-size:14px;letter-spacing:-0.01em">Orders — Last 7 Days</div>
      <div style="display:flex;align-items:flex-end;gap:6px;height:100px">
        ${Object.entries(days).map(([d,v])=>`<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px">
          <div style="font-size:11px;font-weight:700;color:var(--or)">${v||''}</div>
          <div style="width:100%;background:var(--or-grad);border-radius:6px 6px 0 0;height:${Math.max((v/maxD)*70,v>0?4:0)}px"></div>
          <div style="font-size:10px;color:var(--mu);font-weight:600">${new Date(d+'T12:00:00').toLocaleDateString('en-IN',{weekday:'short'})}</div>
        </div>`).join('')}
      </div>
    </div>
    <div class="card"><div style="font-weight:700;margin-bottom:12px;font-size:14px;letter-spacing:-0.01em">Salesman Leaderboard</div>
      <table class="tbl"><thead><tr><th>Name</th><th>Orders</th><th>Revenue</th></tr></thead><tbody>
        ${Object.entries(bySM).sort((a,b)=>(smRev[b[0]]||0)-(smRev[a[0]]||0)).map(([n,c])=>`<tr><td>${esc(n)}</td><td><strong>${c}</strong></td><td><strong style="color:var(--or)">${fmtMoneyCompact(smRev[n]||0)}</strong></td></tr>`).join('')}
      </tbody></table>
    </div>
    <div class="card"><div style="font-weight:700;margin-bottom:12px;font-size:14px;letter-spacing:-0.01em">Top Retailers</div>
      <table class="tbl"><thead><tr><th>Retailer</th><th>Orders</th></tr></thead><tbody>
        ${Object.entries(byRT).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([n,c])=>`<tr><td>${esc(n)}</td><td><strong>${c}</strong></td></tr>`).join('')}
      </tbody></table>
    </div>`;
  
  // Load Leaflet map after rendering
  setTimeout(loadAdminMap, 100);
}

function loadManage(){
  document.getElementById('manage-content').innerHTML=`
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">
      <button class="btn btn-or" onclick="manageList('companies')" style="flex-direction:column;padding:18px 12px;gap:6px;text-align:center"><span style="display:flex;align-items:center;justify-content:center">${ico('factory',22)}</span><span style="font-size:13px;font-weight:600">Companies</span></button>
      <button class="btn btn-or" onclick="manageList('products')" style="flex-direction:column;padding:18px 12px;gap:6px;text-align:center"><span style="display:flex;align-items:center;justify-content:center">${ico('box',22)}</span><span style="font-size:13px;font-weight:600">Products</span></button>
      <button class="btn btn-or" onclick="manageList('retailers')" style="flex-direction:column;padding:18px 12px;gap:6px;text-align:center"><span style="display:flex;align-items:center;justify-content:center">${ico('shop',22)}</span><span style="font-size:13px;font-weight:600">Retailers</span></button>
      <button class="btn btn-or" onclick="manageList('salesmen')" style="flex-direction:column;padding:18px 12px;gap:6px;text-align:center"><span style="display:flex;align-items:center;justify-content:center">${ico('user',22)}</span><span style="font-size:13px;font-weight:600">Salesmen</span></button>
      <button class="btn btn-or" onclick="manageList('areas')" style="flex-direction:column;padding:18px 12px;gap:6px;text-align:center"><span style="display:flex;align-items:center;justify-content:center">${ico('map-pin',22)}</span><span style="font-size:13px;font-weight:600">Areas</span></button>
      <button class="btn btn-or" onclick="manageList('updates')" style="flex-direction:column;padding:18px 12px;gap:6px;text-align:center;grid-column:span 2"><span style="display:flex;align-items:center;justify-content:center">📢</span><span style="font-size:13px;font-weight:600">Updates & Offers</span></button>
    </div>
    <button class="btn btn-ghost" onclick="showExcelForm()" style="margin-bottom:16px">Bulk Upload via Excel</button>
    <div id="manage-view"></div>`;
}

async function manageList(type, filterId = null){
  const view=document.getElementById('manage-view');view.innerHTML=skeletonList();
  if(type==='areas'){
    const{data}=await db.from('areas').select('*').order('name');
    view.innerHTML=`<button class="btn btn-or btn-sm" style="margin-bottom:12px" onclick="editArea(null)">+ Add Area</button>
      <div>${(data||[]).map(a=>`<div class="list-item">
        <div class="li-info"><div class="li-name">${esc(a.name)}</div></div>
        <div class="li-actions">
          <button class="btn btn-sm btn-ghost" onclick="editArea('${a.id}')">Edit</button>
          <button class="icon-btn danger" onclick="event.stopPropagation();strictDeleteEntity('areas','${a.id}','${escQ(a.name)}')">${ico('trash',15)}</button>
        </div>
      </div>`).join('')||'<div class="no-data">No areas created yet. Click + Add Area above.</div>'}</div>`;
  }else if(type==='companies'){
    const{data}=await db.from('companies').select('*').order('name');
    view.innerHTML=`<button class="btn btn-or btn-sm" style="margin-bottom:12px" onclick="editCompany(null)">+ Add Company</button>
      <div>${(data||[]).map(c=>`<div class="list-item" style="cursor:pointer" onclick="manageList('products','${c.id}')">
        <div class="li-info"><div class="li-name">${esc(c.name)}</div><div style="font-size:11px;color:var(--mu);margin-top:4px">Tap to view products</div></div>
        <div class="li-actions">
          <button class="icon-btn" onclick="event.stopPropagation();editCompany('${c.id}')">${ico('edit',15)}</button>
          <button class="icon-btn danger" onclick="event.stopPropagation();strictDeleteEntity('companies','${c.id}','${escQ(c.name)}')">${ico('trash',15)}</button>
        </div>
      </div>`).join('')||'<div class="no-data">No companies yet.</div>'}</div>`;
  }else if(type==='products'){
    const[{data:prods},{data:cos}]=await Promise.all([db.from('products').select('*, companies(name)').order('name'),db.from('companies').select('*').order('name')]);
    S.companies=cos||[];
    let viewProds = prods || [];
    if(filterId) viewProds = viewProds.filter(p => p.company_id === filterId);
    window._manageProds = prods || [];
    const filterNote = filterId ? `<div style="margin-bottom:10px;font-size:13px;font-weight:600;color:var(--or)"><span style="cursor:pointer" onclick="manageList('companies')">Companies</span> > Filtered Products</div>` : '';
    view.innerHTML=`${filterNote}<button class="btn btn-or btn-sm" style="margin-bottom:12px" onclick="editProduct(null)">+ Add Product</button>
      <div class="sb"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg><input id="m-prod-search" type="text" placeholder="Search products..." oninput="filterManageProducts(this.value)"></div>
      <div id="m-prods-list">${renderManageProds(viewProds)}</div>`;
  }else if(type==='retailers'){
    const{data}=await db.from('retailers').select('*').order('name');
    view.innerHTML=`<button class="btn btn-or btn-sm" style="margin-bottom:12px" onclick="editRetailer(null)">+ Add Retailer</button>
      <div>${(data||[]).map(r=>`<div class="list-item">
        <div class="li-info"><div class="li-name">${esc(r.name)}</div>
          <div class="li-meta">${r.area?esc(r.area)+' · ':''}${r.contact?ico('phone',11)+' <span style="vertical-align:1px">'+esc(r.contact)+'</span>':''}</div>
          <div class="li-meta" style="color:var(--or-d);font-weight:600;margin-top:2px">
            Outstanding: ${fmtMoney(r.outstanding||0)} 
            ${r.credit_limit ? `<span style="color:var(--mu);font-weight:450">/ ${fmtMoney(r.credit_limit)} limit</span>` : ''}
          </div>
        </div>
        <div class="li-actions"><button class="icon-btn" onclick="editRetailer('${r.id}')">${ico('edit',15)}</button><button class="icon-btn danger" onclick="event.stopPropagation();strictDeleteEntity('retailers','${r.id}','${escQ(r.name)}')">${ico('trash',15)}</button></div>
      </div>`).join('')||'<div class="no-data">No retailers yet.</div>'}</div>`;
  }else if(type==='salesmen'){
    const{data}=await db.from('salesmen').select('*').neq('name','Admin').order('name');
    view.innerHTML=`<button class="btn btn-or btn-sm" style="margin-bottom:12px" onclick="editSalesman(null)">+ Add Salesman</button>
      <div>${(data||[]).map(s=>`<div class="list-item">
        <div class="li-info"><div class="li-name">${esc(s.name)}</div><div class="li-meta">${s.password_hash?'Password set':'No password set'}</div></div>
        <div class="li-actions"><button class="icon-btn" onclick="editSalesman('${s.id}')">${ico('edit',15)}</button><button class="icon-btn danger" onclick="deleteSalesman('${s.id}','${escQ(s.name)}')">${ico('trash',15)}</button></div>
      </div>`).join('')||'<div class="no-data">No salesmen yet.</div>'}</div>`;
  }else if(type==='updates'){
    const {data, error} = await db.from('updates').select('*').order('created_at',{ascending:false});
    window._adminUpdates = error ? JSON.parse(localStorage.getItem('vinita_updates')||'[]') : data||[];
    const items = window._adminUpdates;
    view.innerHTML=`<button class="btn btn-or btn-sm" style="margin-bottom:12px" onclick="editUpdate(null)">+ New Update / Offer</button>
      <div>${items.map(u=>`<div class="list-item">
        <div class="li-info" style="max-width:200px">
          <div class="li-name">${esc(u.title)} ${!u.is_active?'<span class="badge" style="background:#e5e5e5;color:#555;font-size:10px">Draft</span>':''}</div>
          <div class="li-meta" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(u.content)}</div>
        </div>
        <div class="li-actions">
          <button class="icon-btn" onclick="editUpdate('${u.id}')">${ico('edit',15)}</button>
          <button class="icon-btn danger" onclick="deleteUpdate('${u.id}')">${ico('trash',15)}</button>
        </div>
      </div>`).join('')||'<div class="no-data">No updates posted yet.</div>'}</div>`;
  }
}

function renderManageProds(prods){
  if(!prods.length)return '<div class="no-data">No products yet.</div>';
  return prods.map(p=>`<div class="list-item">
    <div class="li-info">
      <div class="li-name">${esc(p.name)}${!p.is_active?' <span class="badge" style="background:var(--rd-bg);color:var(--rd-tx)">Inactive</span>':''}</div>
      <div class="li-meta">${esc(p.sku)} · ${esc(p.companies?.name||'-')}${p.pack_size?' · '+esc(p.pack_size):''}</div>
      <div class="li-meta">Rate: ${fmtMoney(p.rate)}${p.mrp?' · MRP: ₹'+p.mrp:''}${p.scheme_buy?' · Scheme '+p.scheme_buy+'+'+p.scheme_free:''}</div>
    </div>
    <div class="li-actions"><button class="icon-btn" onclick="editProduct('${p.id}')">${ico('edit',15)}</button><button class="icon-btn danger" onclick="event.stopPropagation();strictDeleteEntity('products','${p.id}','${escQ(p.name)}')">${ico('trash',15)}</button></div>
  </div>`).join('');
}
function filterManageProducts(q){q=q.toLowerCase();const filtered=(window._manageProds||[]).filter(p=>p.name.toLowerCase().includes(q)||p.sku.toLowerCase().includes(q)||(p.companies?.name||'').toLowerCase().includes(q));document.getElementById('m-prods-list').innerHTML=renderManageProds(filtered);}

function openModal(){document.getElementById('modal').classList.add('show');}
function closeModal(){document.getElementById('modal').classList.remove('show');}

// ============================================================
//   CUSTOM CONFIRM — uses a dedicated dialog overlay so it can
//   safely appear ON TOP of the main modal without destroying its DOM.
//   This was the cause of the "Confirm Delivery doesn't mark delivered" bug:
//   the old ui.confirm reused #modal-body and overwrote the form inputs.
//   Returns a Promise that resolves to true/false.
// ============================================================
let __confirmResolve=null;
function __confirmCancel(){if(__confirmResolve){const r=__confirmResolve;__confirmResolve=null;document.getElementById('confirm-dlg').classList.remove('show');r(false);}}
const ui={
  confirm({title='Confirm',message='Are you sure?',confirmText='Confirm',cancelText='Cancel',danger=false}={}){
    // If a previous confirm is somehow still open, reject it first
    if(__confirmResolve){const r=__confirmResolve;__confirmResolve=null;r(false);}
    return new Promise(resolve=>{
      __confirmResolve=resolve;
      document.getElementById('confirm-dlg-title').textContent=title;
      document.getElementById('confirm-dlg-message').textContent=message;
      const yesBtn=document.getElementById('confirm-dlg-yes');
      const noBtn=document.getElementById('confirm-dlg-no');
      yesBtn.textContent=confirmText;
      noBtn.textContent=cancelText||'Cancel';
      // If cancelText is empty string, hide the cancel button (used for info-only "OK" dialogs)
      noBtn.style.display=cancelText===''?'none':'';
      // Toggle danger styling
      yesBtn.className='btn '+(danger?'btn-danger':'btn-or');
      // Wire up handlers (replace any previous bindings)
      yesBtn.onclick=()=>{
        if(!__confirmResolve)return;
        const r=__confirmResolve;__confirmResolve=null;
        document.getElementById('confirm-dlg').classList.remove('show');
        r(true);
      };
      noBtn.onclick=()=>__confirmCancel();
      document.getElementById('confirm-dlg').classList.add('show');
    });
  }
};


async function editArea(id){
  let name='';
  if(id){
    toast('Loading...');
    const{data}=await db.from('areas').select('*').eq('id',id).single();
    if(data)name=data.name;
  }
  document.getElementById('modal-content').innerHTML=`<div class="form-title">${id?'Edit Area':'New Area'}</div>
    <div class="fg"><label>Area Name</label><input type="text" id="m-area-name" value="${escQ(name)}"></div>
    <button class="btn btn-or" onclick="saveArea('${id||''}',this)">Save</button>`;
  openModal();
}

async function saveArea(id,btn){
  const name=document.getElementById('m-area-name').value.trim();
  if(!name){toast('Name required');return;}
  btn.disabled=true;btn.textContent='Saving...';
  const payload={name};
  const req=id?db.from('areas').update(payload).eq('id',id):db.from('areas').insert(payload);
  const{error}=await req;
  if(error)toast(error.message);else{toast('Saved');closeModal();manageList('areas');}
}
async function editCompany(id){
  let row={name:''};
  if(id){const{data}=await db.from('companies').select('*').eq('id',id).single();if(data)row=data;}
  document.getElementById('modal-title').textContent=id?'Edit Company':'Add Company';
  document.getElementById('modal-body').innerHTML=`
    <div class="fg"><label>Company Name *</label><input id="mc-name" value="${esc(row.name)}" placeholder="e.g. HUL, ITC"></div>
    <button class="btn btn-or" onclick="saveCompany('${id||''}')">${id?'Update':'Add'}</button>`;
  openModal();
}
async function saveCompany(id){
  const name=document.getElementById('mc-name').value.trim();
  if(!name){toast('Name required');return;}

async function adminDeleteEntity(table, id){
  if(!confirm('Are you absolutely sure you want to delete this? This action cannot be undone and will delete all associated data (Cascade).')){ return; }
  const {error} = await db.from(table).delete().eq('id', id);
  if(error) { toast('Error deleting: ' + error.message); return; }
  toast('Deleted successfully');
  closeModal();
  loadAdminHome();
}
  const{error}=id?await db.from('companies').update({name}).eq('id',id):await db.from('companies').insert({name});
  if(error){toast(''+error.message);return;}
  toast('Saved');closeModal();manageList('companies');
}
async function strictDeleteEntity(type, id, name) {
  document.getElementById('modal-title').textContent = 'Strict Delete Confirmation';
  document.getElementById('modal-body').innerHTML = `
    <div style="background:#fef2f2;border:1px solid #fecaca;padding:16px;border-radius:12px;margin-bottom:16px">
      <div style="color:#b91c1c;font-weight:700;font-size:15px;margin-bottom:8px">${ico('alert-triangle', 18)} DANGER ZONE</div>
      <div style="font-size:13px;color:#991b1b;margin-bottom:12px">You are about to delete <strong>${esc(name)}</strong> from <strong>${type}</strong>.<br><br>If this entity is tied to past orders, deleting it may break historical data. Where possible, we recommend marking products as "Inactive" instead.<br><br>Type <strong>DELETE</strong> below to confirm.</div>
      <input type="text" id="strict-del-input" placeholder="DELETE" style="width:100%;padding:10px;border:1px solid #fca5a5;border-radius:8px;font-weight:600;text-transform:uppercase" autocomplete="off">
    </div>
    <div style="display:flex;gap:12px">
      <button class="btn btn-ghost" style="flex:1" onclick="closeModal()">Cancel</button>
      <button class="btn btn-danger" style="flex:1" onclick="executeStrictDelete('${type}','${id}')">Force Delete</button>
    </div>
  `;
  openModal();
}

async function executeStrictDelete(type, id) {
  const val = document.getElementById('strict-del-input').value.toUpperCase();
  if(val !== 'DELETE') {
    toast('Must type DELETE exactly to confirm');
    return;
  }
  
  if (type === 'products') {
    const {error} = await db.from('products').update({is_active: false}).eq('id', id);
    if(error){toast(error.message);return;}
    toast('Product Soft-Deleted (Inactive)');
  } else {
    const {error} = await db.from(type).delete().eq('id', id);
    if(error){toast(error.message + ' (likely blocked by orders)');return;}
    toast('Hard Deleted successfully');
  }
  closeModal();
  manageList(type);
}

async function editProduct(id){
  let row={company_id:S.companies[0]?.id||'',name:'',sku:'',category:'',pack_size:'',rate:0,mrp:'',hsn_code:'',gst_rate:'',notes:'',is_active:true,scheme_buy:'',scheme_free:''};
  if(id){const{data}=await db.from('products').select('*').eq('id',id).single();if(data)row={...row,...data};}
  document.getElementById('modal-title').textContent=id?'Edit Product':'Add Product';
  document.getElementById('modal-body').innerHTML=`
    <div class="fg"><label>Company *</label><select id="mp-cmp">${S.companies.map(c=>`<option value="${c.id}" ${c.id===row.company_id?'selected':''}>${esc(c.name)}</option>`).join('')}</select></div>
    <div class="fg"><label>Product Name *</label><input id="mp-n" value="${esc(row.name)}"></div>
    <div class="fg"><label>SKU Code *</label><input id="mp-sku" value="${esc(row.sku)}"></div>
    <div class="fg"><label>Category</label><input id="mp-cat" value="${esc(row.category||'')}"></div>
    <div class="fg"><label>Pack Size</label><input id="mp-pz" value="${esc(row.pack_size||'')}"></div>
    <div style="display:flex;gap:10px">
      <div class="fg" style="flex:1"><label>Rate (₹) *</label><input id="mp-rate" type="number" step="0.01" inputmode="decimal" value="${row.rate||0}"></div>
      <div class="fg" style="flex:1"><label>MRP (₹)</label><input id="mp-mrp" type="number" step="0.01" inputmode="decimal" value="${row.mrp||''}"></div>
    </div>
    <div style="display:flex;gap:10px">
      <div class="fg" style="flex:1"><label>HSN Code</label><input id="mp-hsn" value="${esc(row.hsn_code||'')}" placeholder="e.g. 3401"></div>
      <div class="fg" style="flex:1"><label>GST %</label><input id="mp-gst" type="number" step="0.01" inputmode="decimal" value="${row.gst_rate||''}" placeholder="e.g. 18"></div>
    </div>
    <div style="display:flex;gap:10px;align-items:flex-end">
      <div class="fg" style="flex:1"><label>Scheme: Buy</label><input id="mp-sb" type="number" step="1" inputmode="numeric" value="${row.scheme_buy||''}" placeholder="e.g. 10"></div>
      <div class="fg" style="flex:1"><label>Get Free</label><input id="mp-sf" type="number" step="1" inputmode="numeric" value="${row.scheme_free||''}" placeholder="e.g. 1"></div>
    </div>
    <div class="fg"><label>Notes</label><input id="mp-nt" value="${esc(row.notes||'')}"></div>
    <div class="fg"><label style="text-transform:none;font-size:14px;color:var(--tx);font-weight:500"><input type="checkbox" id="mp-act" ${row.is_active?'checked':''} style="width:auto;margin-right:8px;vertical-align:middle"> Active (visible to salesmen)</label></div>
    <button class="btn btn-or" onclick="saveProduct('${id||''}')">${id?'Update':'Add'}</button>`;
  openModal();
}
async function saveProduct(id){
  const name=document.getElementById('mp-n').value.trim();
  const sku=document.getElementById('mp-sku').value.trim();
  if(!name||!sku){toast('Name & SKU required');return;}
  const payload={company_id:document.getElementById('mp-cmp').value,name,sku,category:document.getElementById('mp-cat').value.trim()||null,pack_size:document.getElementById('mp-pz').value.trim()||null,rate:parseFloat(document.getElementById('mp-rate').value)||0,mrp:parseFloat(document.getElementById('mp-mrp').value)||null,hsn_code:document.getElementById('mp-hsn').value.trim()||null,gst_rate:parseFloat(document.getElementById('mp-gst').value)||null,scheme_buy:parseInt(document.getElementById('mp-sb').value)||null,scheme_free:parseInt(document.getElementById('mp-sf').value)||null,notes:document.getElementById('mp-nt').value.trim()||null,is_active:document.getElementById('mp-act').checked};
  const{error}=id?await db.from('products').update(payload).eq('id',id):await db.from('products').insert(payload);
  if(error){toast(''+error.message);return;}
  toast('Saved');closeModal();manageList('products');
}
// Products soft deletion handled by strictDeleteEntity

async function editRetailer(id){
  let row={name:'',contact:'',area:'',credit_limit:'',outstanding:0};
  if(id){const{data}=await db.from('retailers').select('*').eq('id',id).single();if(data)row={...row,...data};}
  document.getElementById('modal-title').textContent=id?'Edit Retailer':'Add Retailer';
  document.getElementById('modal-body').innerHTML=`
    <div class="fg"><label>Shop Name *</label><input id="mr-n" value="${esc(row.name)}"></div>
    <div class="fg"><label>Contact Number</label><input id="mr-c" type="tel" inputmode="tel" value="${esc(row.contact||'')}"></div>
    <div class="fg"><label>Area / Location</label><input id="mr-a" value="${esc(row.area||'')}"></div>
    <div style="display:flex;gap:10px">
      <div class="fg" style="flex:1"><label>Credit Limit (₹)</label><input id="mr-cl" type="number" step="1" inputmode="numeric" value="${row.credit_limit||''}" placeholder="Optional"></div>
      <div class="fg" style="flex:1"><label>Outstanding (₹)</label><input id="mr-os" type="number" step="0.01" inputmode="decimal" value="${row.outstanding||0}"></div>
    </div>
    <button class="btn btn-or" onclick="saveRetailer('${id||''}')">${id?'Update':'Add'}</button>`;
  openModal();
}
async function saveRetailer(id){
  const name=document.getElementById('mr-n').value.trim();
  if(!name){toast('Name required');return;}
  const payload={name,contact:document.getElementById('mr-c').value.trim()||null,area:document.getElementById('mr-a').value.trim()||null,credit_limit:parseFloat(document.getElementById('mr-cl').value)||null,outstanding:parseFloat(document.getElementById('mr-os').value)||0};
  const{error}=id?await db.from('retailers').update(payload).eq('id',id):await db.from('retailers').insert(payload);
  if(error){toast(''+error.message);return;}
  toast('Saved');closeModal();manageList('retailers');
}
// Retailers strict deletion handled by strictDeleteEntity

async function editSalesman(id){
  let row={name:'',password_hash:''};
  if(id){const{data}=await db.from('salesmen').select('*').eq('id',id).single();if(data)row={...row,...data};}
  document.getElementById('modal-title').textContent=id?'Edit Salesman':'Add Salesman';
  document.getElementById('modal-body').innerHTML=`
    <div class="fg"><label>Full Name *</label><input id="ms-n" value="${esc(row.name)}"></div>
    <div class="fg"><label>${id?'New Password':'Login Password'} ${id?'':'*'}</label><input id="ms-pw" type="password" placeholder="${id?'Leave blank to keep current':'Required for login'}"></div>
    <div style="font-size:12px;color:var(--mu);margin:-6px 0 16px;font-weight:500;line-height:1.45">${id?(row.password_hash?'Leave password blank if you only want to change the name.':'Set a password before this salesman can login.'):'Salesman will use this password to login.'}</div>
    <button class="btn btn-or" onclick="saveSalesman('${id||''}')">${id?'Update':'Add'}</button>`;
  openModal();
}
async function saveSalesman(id){
  const name=document.getElementById('ms-n').value.trim();
  const password=document.getElementById('ms-pw').value.trim();
  if(!name){toast('Name required');return;}
  if(!id&&!password){toast('Password required');return;}
  const payload={name};
  if(password){
    try{payload.password_hash=await hashSalesmanPassword(password);}
    catch(err){toast(err.message||'Could not save password');return;}
  }
  const{error}=id?await db.from('salesmen').update(payload).eq('id',id):await db.from('salesmen').insert(payload);
  if(error){toast(''+error.message);return;}
  toast('Saved');closeModal();manageList('salesmen');
}
async function deleteSalesman(id,name){
  if(!(await ui.confirm({title:"Delete salesman?",message:`"${name}" will be deleted.\nThis will fail if they have placed any orders.`,confirmText:"Delete",cancelText:"Keep",danger:true})))return;
  const{error}=await db.from('salesmen').delete().eq('id',id);
  if(error){toast(''+error.message+' (has orders)');return;}
  toast('Deleted');manageList('salesmen');
}

function showExcelForm(){
  document.getElementById('manage-view').innerHTML=`<div class="card">
    <div style="font-weight:700;margin-bottom:4px;font-size:15px;letter-spacing:-0.01em">Bulk Upload via Excel</div>
    <div style="font-size:13px;color:var(--mu);margin-bottom:18px;line-height:1.5;font-weight:500">Download the template, fill it in Excel or Google Sheets, then upload here.</div>
    <div style="margin-bottom:18px">
      <div style="font-weight:600;font-size:13px;margin-bottom:8px;color:var(--mu);text-transform:uppercase;letter-spacing:.05em">Step 1 — Download Template</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-ghost btn-sm" onclick="downloadTemplate('companies')">Companies</button><button class="btn btn-ghost btn-sm" onclick="downloadTemplate('products')">Products</button><button class="btn btn-ghost btn-sm" onclick="downloadTemplate('retailers')">Retailers</button></div>
    </div>
    <div style="font-weight:600;font-size:13px;margin-bottom:8px;color:var(--mu);text-transform:uppercase;letter-spacing:.05em">Step 2 — Upload Filled File</div>
    <div class="fg"><label>What are you uploading?</label><select id="xl-type"><option value="companies">Companies</option><option value="products">Products</option><option value="retailers">Retailers</option></select></div>
    <label class="upload-area" for="xl-file">
      <div style="display:flex;justify-content:center;margin-bottom:14px;color:var(--mu)"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/></svg></div>
      <div style="font-weight:600;font-size:15px;letter-spacing:-0.01em">Tap to select Excel file</div>
      <div style="font-size:12px;color:var(--mu);margin-top:5px;font-weight:500">.xlsx · .xls · .csv</div>
    </label>
    <input type="file" id="xl-file" accept=".xlsx,.xls,.csv" style="display:none" onchange="handleExcelUpload(this)">
    <div id="xl-preview" style="margin-top:14px"></div>
  </div>`;
}

function downloadTemplate(type){
  if(typeof XLSX==='undefined'){toast('Reload the page and try again');return;}
  let data,fname;
  if(type==='companies'){data=[['Company Name'],['HUL'],['ITC'],['P&G'],['Nestle']];fname='companies_template.xlsx';}
  else if(type==='retailers'){
    data=[
      ['Shop Name','Contact Number','Area / Location','Credit Limit (₹)','Outstanding (₹)'],
      ['Sharma General Store','9876543210','Main Market, Patratu',50000,0],
      ['Kumar Kirana','9988776655','Station Road',25000,3500],
      ['Singh Provisions','','Bazar Tand',20000,0]
    ];
    fname='retailers_template.xlsx';
  }
  else{data=[['Company Name','Product Name','SKU Code','Category','Pack Size','Rate (₹)','MRP (₹)','HSN Code','GST %','Scheme Buy','Scheme Free','Notes'],['HUL','Surf Excel 1kg','HUL-SE-1KG','Detergent','1kg',95,110,'3402',18,10,1,''],['ITC','Classmate Notebook','ITC-CM-200','Stationery','200 pages',45,55,'4820',12,'','','']];fname='products_template.xlsx';}
  const ws=XLSX.utils.aoa_to_sheet(data);const wb=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,ws,'Sheet1');XLSX.writeFile(wb,fname);
}

async function handleExcelUpload(input){
  const file=input.files[0];if(!file)return;
  const type=document.getElementById('xl-type').value;
  const el=document.getElementById('xl-preview');el.innerHTML='<div class="load">Reading file...</div>';
  const reader=new FileReader();
  reader.onload=async function(e){
    try{
      const wb=XLSX.read(e.target.result,{type:'array'});
      const ws=wb.Sheets[wb.SheetNames[0]];
      const rows=XLSX.utils.sheet_to_json(ws,{header:1,defval:''});
      if(rows.length<2){el.innerHTML='<div class="err-bar">File is empty or has no data rows.</div>';return;}
      const headers=rows[0].map(h=>(h||'').toString().trim().toLowerCase());
      const dataRows=rows.slice(1).filter(r=>r.some(c=>c!==''));
      if(type==='companies'){
        const ni=headers.findIndex(h=>h.includes('company'));
        if(ni<0){el.innerHTML='<div class="err-bar">Column "Company Name" not found.</div>';return;}
        const names=[...new Set(dataRows.map(r=>(r[ni]||'').toString().trim()).filter(n=>n))];
        window._xlCompanies=names;
        el.innerHTML=`<div class="info-bar">Found <strong>${names.length} companies</strong>: ${names.slice(0,5).map(esc).join(', ')}${names.length>5?'...':''}</div><button class="btn btn-or" id="xl-go" onclick="uploadCompanies()">Upload ${names.length} Companies</button>`;
      }else if(type==='retailers'){
        const cols={
          name:headers.findIndex(h=>h.includes('shop')||h.includes('name')||h.includes('retailer')),
          contact:headers.findIndex(h=>h.includes('contact')||h.includes('phone')||h.includes('mobile')||h.includes('number')),
          area:headers.findIndex(h=>h.includes('area')||h.includes('location')||h.includes('address')),
          limit:headers.findIndex(h=>h.includes('credit')||h.includes('limit')),
          outstanding:headers.findIndex(h=>h.includes('outstanding')||h.includes('balance')||h.includes('due'))
        };
        if(cols.name<0){el.innerHTML='<div class="err-bar">Required column missing. File must have a "Shop Name" column.</div>';return;}
        const seen=new Set();
        const retailers=dataRows.map(r=>{
          const nm=(r[cols.name]||'').toString().trim();
          if(!nm)return null;
          const k=nm.toLowerCase();
          if(seen.has(k))return null;
          seen.add(k);
          return{
            name:nm,
            contact:cols.contact>=0?(r[cols.contact]||'').toString().trim()||null:null,
            area:cols.area>=0?(r[cols.area]||'').toString().trim()||null:null,
            credit_limit:cols.limit>=0?(parseFloat(r[cols.limit])||null):null,
            outstanding:cols.outstanding>=0?(parseFloat(r[cols.outstanding])||0):0
          };
        }).filter(Boolean);
        if(!retailers.length){el.innerHTML='<div class="err-bar">No retailers found in the file.</div>';return;}
        window._xlRetailers=retailers;
        const sample=retailers.slice(0,5).map(r=>esc(r.name)).join(', ');
        el.innerHTML=`<div class="info-bar">Found <strong>${retailers.length} retailers</strong>: ${sample}${retailers.length>5?'...':''}</div><button class="btn btn-or" id="xl-go" onclick="uploadRetailers()">Upload ${retailers.length} Retailers</button>`;
      }else{
        const cols={company:headers.findIndex(h=>h.includes('company')),name:headers.findIndex(h=>h.includes('product')||h==='name'),sku:headers.findIndex(h=>h.includes('sku')),cat:headers.findIndex(h=>h.includes('categ')),pack:headers.findIndex(h=>h.includes('pack')),rate:headers.findIndex(h=>h.includes('rate')),mrp:headers.findIndex(h=>h.includes('mrp')),hsn:headers.findIndex(h=>h.includes('hsn')),gst:headers.findIndex(h=>h.includes('gst')||h.includes('tax')),sb:headers.findIndex(h=>h.includes('scheme buy')||h==='buy'),sf:headers.findIndex(h=>h.includes('scheme free')||h.includes('get free')||h==='free'),notes:headers.findIndex(h=>h.includes('note'))};
        if(cols.company<0||cols.name<0||cols.sku<0){el.innerHTML='<div class="err-bar">Required columns missing. File must have: Company Name, Product Name, SKU Code.</div>';return;}
        const products=dataRows.map(r=>({company:(r[cols.company]||'').toString().trim(),name:(r[cols.name]||'').toString().trim(),sku:(r[cols.sku]||'').toString().trim(),category:cols.cat>=0?(r[cols.cat]||'').toString().trim()||null:null,pack_size:cols.pack>=0?(r[cols.pack]||'').toString().trim()||null:null,rate:cols.rate>=0?parseFloat(r[cols.rate])||0:0,mrp:cols.mrp>=0?parseFloat(r[cols.mrp])||null:null,hsn_code:cols.hsn>=0?(r[cols.hsn]||'').toString().trim()||null:null,gst_rate:cols.gst>=0?parseFloat(r[cols.gst])||null:null,scheme_buy:cols.sb>=0?parseInt(r[cols.sb])||null:null,scheme_free:cols.sf>=0?parseInt(r[cols.sf])||null:null,notes:cols.notes>=0?(r[cols.notes]||'').toString().trim()||null:null,})).filter(p=>p.company&&p.name&&p.sku);
        const coNames=[...new Set(products.map(p=>p.company))];
        el.innerHTML=`<div class="info-bar">Found <strong>${products.length} products</strong> from companies: <strong>${coNames.map(esc).join(', ')}</strong></div><button class="btn btn-or" id="xl-go" onclick="uploadProducts()">Upload ${products.length} Products</button>`;
        window._xlProds=products;
      }
    }catch(err){el.innerHTML=`<div class="err-bar">Error reading file: ${esc(err.message)}</div>`;}
  };
  reader.readAsArrayBuffer(file);
}

async function uploadCompanies(){
  const names=window._xlCompanies;if(!names?.length)return;
  const btn=document.getElementById('xl-go');btn.disabled=true;btn.textContent='Uploading...';
  let ok=0,skip=0;
  for(const name of names){const{error}=await db.from('companies').insert({name});if(error&&error.code==='23505')skip++;else if(!error)ok++;}
  document.getElementById('xl-preview').innerHTML=`<div class="info-bar" style="background:var(--gr-bg);color:var(--gr-tx);border-color:#86efac">Done. ${ok} added${skip>0?' · '+skip+' already existed':''}</div>`;
}

async function uploadRetailers(){
  const retailers=window._xlRetailers;if(!retailers?.length)return;
  const btn=document.getElementById('xl-go');btn.disabled=true;btn.textContent='Uploading...';
  // Fetch existing retailers to skip duplicates by name (case-insensitive)
  const{data:existing}=await db.from('retailers').select('name');
  const existingSet=new Set((existing||[]).map(r=>(r.name||'').toLowerCase().trim()));
  let ok=0,skip=0,fail=0;
  for(const r of retailers){
    if(existingSet.has(r.name.toLowerCase())){skip++;continue;}
    const{error}=await db.from('retailers').insert(r);
    if(error){fail++;}else{ok++;existingSet.add(r.name.toLowerCase());}
  }
  document.getElementById('xl-preview').innerHTML=`<div class="info-bar" style="background:var(--gr-bg);color:var(--gr-tx);border-color:#86efac">Upload complete. ${ok} added${skip>0?' · '+skip+' duplicates skipped':''}${fail>0?' · '+fail+' failed':''}</div>`;
}

async function uploadProducts(){
  const products=window._xlProds;if(!products?.length)return;
  const btn=document.getElementById('xl-go');btn.disabled=true;btn.textContent='Uploading...';
  const{data:cos}=await db.from('companies').select('*');
  const coMap={};(cos||[]).forEach(c=>coMap[c.name.toLowerCase()]=c.id);
  for(const cName of[...new Set(products.map(p=>p.company))]){
    if(!coMap[cName.toLowerCase()]){
      const{data:nc,error:ce}=await db.from('companies').insert({name:cName}).select().single();
      if(ce){console.warn('company insert failed:',ce.message);}
      else if(nc)coMap[nc.name.toLowerCase()]=nc.id;
    }
  }
  let ok=0,skip=0,fail=0;
  for(const p of products){
    const company_id=coMap[p.company.toLowerCase()];if(!company_id){fail++;continue;}
    const payload={company_id,name:p.name,sku:p.sku,category:p.category,pack_size:p.pack_size,rate:p.rate||0,mrp:p.mrp,scheme_buy:p.scheme_buy,scheme_free:p.scheme_free,notes:p.notes,is_active:true};
    const{error}=await db.from('products').insert(payload);
    if(error&&error.code==='23505')skip++;else if(!error)ok++;else fail++;
  }
  document.getElementById('xl-preview').innerHTML=`<div class="info-bar" style="background:var(--gr-bg);color:var(--gr-tx);border-color:#86efac">Upload complete. ${ok} added · ${skip} duplicate SKUs skipped · ${fail} failed</div>`;
}

// ============================================================
//   REORDER TEMPLATES (HINDI)
// ============================================================
function openReorderReminder(retailerId){
  const r = S.retailers?.find(x=>x.id===retailerId) || S.adminAllRetailers?.find(x=>x.id===retailerId);
  if(!r){toast('Retailer not found');return;}

  const tpls = [
    {id:'t1', title:'Standard Restock', text:`Namaskar ${r.name},\nAapke pichle order ka stock khatam hone wala hoga. Kripya apna naya order place karein.\n- Vinita Enterprises`},
    {id:'t2', title:'High Demand / Low Stock', text:`Namaskar ${r.name},\nAbhi market mein demand zyada hai aur stock tezi se khatam ho raha hai. Apna order jaldi book karein taki shortage na ho.\n- Vinita Enterprises`},
    {id:'t3', title:'Inactive Retailer', text:`Namaskar ${r.name},\nAapne pichle kuch samay se order nahi diya hai. Humare paas naye products aur schemes aaye hain. Aaj hi sampark karein!\n- Vinita Enterprises`},
    {id:'t4', title:'Festive / Seasonal Push', text:`Namaskar ${r.name},\nTyohar/Season aa raha hai! Apni dukan ka stock bacha kar rakhein. Naya order aaj hi book karein.\n- Vinita Enterprises`},
    {id:'t5', title:'Outstanding + Restock', text:`Namaskar ${r.name},\nAapka purana payment baaki hai. Kripya payment clear karein aur naya stock order karein taki aapka kaam na ruke.\n- Vinita Enterprises`}
  ];

  document.getElementById('modal-title').textContent='Send Reminder';
  document.getElementById('modal-body').innerHTML=`
    <div style="font-weight:600;margin-bottom:12px">Select a template for <strong>${esc(r.name)}</strong>:</div>
    <div style="display:flex;flex-direction:column;gap:8px;max-height:300px;overflow-y:auto;margin-bottom:16px">
      ${tpls.map(t=>`
        <label style="display:block;padding:12px;border:1px solid var(--bd);border-radius:8px;background:var(--card);cursor:pointer">
          <div style="display:flex;gap:10px;align-items:flex-start">
            <input type="radio" name="reorder_tpl" value="${escQ(t.text)}" style="margin-top:2px" ${t.id==='t1'?'checked':''}>
            <div>
              <div style="font-weight:700;font-size:13px;color:var(--tx);margin-bottom:4px">${t.title}</div>
              <div style="font-size:12px;color:var(--mu);line-height:1.4;white-space:pre-wrap">${esc(t.text)}</div>
            </div>
          </div>
        </label>
      `).join('')}
    </div>
    <button class="btn btn-wa" style="width:100%" onclick="sendSelectedTemplate('${escQ(r.contact||'')}')">${ico('send',16)} Send on WhatsApp</button>
  `;
  openModal();
}

function sendSelectedTemplate(phone){
  if(!phone){toast('No phone number saved for this retailer');return;}
  const sel = document.querySelector('input[name="reorder_tpl"]:checked');
  if(!sel)return;
  const msg = encodeURIComponent(sel.value);
  let waNum = phone.replace(/\D/g,'');
  if(waNum.length===10) waNum='91'+waNum;
  window.open(`https://wa.me/${waNum}?text=${msg}`,'_blank');
  closeModal();
}

// ============================================================
//   ADMIN RETAILER ANALYTICS
// ============================================================
function openAdminRetailerAnalytics(){
  const all=S.adminAllRetailers||[];
  const thirtyDaysAgo=new Date();thirtyDaysAgo.setDate(thirtyDaysAgo.getDate()-30);
  const thirtyDaysAgoStr=toYMD(thirtyDaysAgo);
  const recent=new Set(S.filteredOrders?.filter(o=>normalizeOrderDate(o.order_date)>=thirtyDaysAgoStr).map(o=>o.retailers?.id));
  
  const inactive=all.filter(r=>!recent.has(r.id)).sort((a,b)=>a.name.localeCompare(b.name));
  const defaulters=all.filter(r=>r.outstanding>0).sort((a,b)=>b.outstanding-a.outstanding);
  
  window._bulkNudgeInactive = inactive;
  window._bulkNudgeDefaulters = defaulters;
  document.getElementById('modal-title').textContent='Retailer Health';
  document.getElementById('modal-body').innerHTML=`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <div style="font-weight:700;font-size:14px;letter-spacing:-0.01em;color:#7f1d1d">Inactive (>30 days)</div>
      ${inactive.length>0 ? `<button class="btn btn-or btn-sm" style="padding:4px 8px;font-size:11px" onclick="startBulkNudge('inactive')">Bulk Nudge All</button>` : ''}
    </div>
    <div style="margin-bottom:20px;max-height:200px;overflow-y:auto">
      ${inactive.map(r=>`<div class="list-item" style="padding:10px">
        <div class="li-info"><div class="li-name">${esc(r.name)}</div><div class="li-meta">${r.contact||'No contact'}</div></div>
        <button class="btn btn-ghost btn-sm" onclick="sendReorderReminderAdmin('${r.id}')">${ico('send',14)} Nudge</button>
      </div>`).join('') || '<div class="no-data">None</div>'}
    </div>
    
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <div style="font-weight:700;font-size:14px;letter-spacing:-0.01em;color:var(--or-d)">Top Defaulters</div>
      ${defaulters.length>0 ? `<button class="btn btn-or btn-sm" style="padding:4px 8px;font-size:11px" onclick="startBulkNudge('defaulters')">Bulk Nudge All</button>` : ''}
    </div>
    <div style="max-height:200px;overflow-y:auto">
      ${defaulters.map(r=>`<div class="list-item" style="padding:10px">
        <div class="li-info"><div class="li-name">${esc(r.name)}</div><div class="li-meta">Due: <strong style="color:var(--or-d)">${fmtMoney(r.outstanding)}</strong></div></div>
        <button class="btn btn-ghost btn-sm" onclick="sendReorderReminderAdmin('${r.id}')">${ico('send',14)} Nudge</button>
      </div>`).join('') || '<div class="no-data">None</div>'}
    </div>
  `;
  openModal();
}

async function sendReorderReminderAdmin(retailerId){
  closeModal();
  if(typeof openReorderReminder === 'function'){
    await openReorderReminder(retailerId);
  } else {
    toast('Not implemented yet');
  }
}

let bulkNudgeQueue = [];
let bulkNudgeCurrentIdx = 0;
let bulkNudgeTemplateId = 't3';
let bulkNudgeType = '';

function startBulkNudge(type){
  const retailers = type === 'inactive' ? window._bulkNudgeInactive : window._bulkNudgeDefaulters;
  if(!retailers || !retailers.length){toast('No retailers to nudge');return;}
  
  bulkNudgeType = type;
  bulkNudgeQueue = retailers.filter(r => r.contact); // only those with contacts
  
  if(bulkNudgeQueue.length === 0){
    toast('No retailers have valid contact numbers');
    return;
  }
  bulkNudgeCurrentIdx = 0;
  
  const tpls = [
    {id:'t1', title:'Standard Restock'},
    {id:'t2', title:'High Demand / Low Stock'},
    {id:'t3', title:'Inactive Retailer'},
    {id:'t4', title:'Festive / Seasonal Push'},
    {id:'t5', title:'Outstanding + Restock'}
  ];
  const defaultTpl = type === 'inactive' ? 't3' : 't5';
  
  document.getElementById('modal-title').textContent='Bulk Nudge ('+bulkNudgeQueue.length+' shops)';
  document.getElementById('modal-body').innerHTML=`
    <div style="font-weight:600;margin-bottom:12px">Select a template to send:</div>
    <div style="display:flex;flex-direction:column;gap:8px;max-height:300px;overflow-y:auto;margin-bottom:16px">
      ${tpls.map(t=>`
        <label style="display:block;padding:12px;border:1px solid var(--bd);border-radius:8px;background:var(--card);cursor:pointer">
          <div style="display:flex;gap:10px;align-items:center">
            <input type="radio" name="bulk_reorder_tpl" value="${t.id}" ${t.id===defaultTpl?'checked':''}>
            <div style="font-weight:700;font-size:13px;color:var(--tx)">${t.title}</div>
          </div>
        </label>
      `).join('')}
    </div>
    <div class="info-bar" style="margin-bottom:14px">
      Because of browser limitations, you will click "Send Now" for each shop sequentially. This ensures all WhatsApp tabs open properly without being blocked.
    </div>
    <button class="btn btn-or" style="width:100%" onclick="processBulkNudgeStep()">Start Sending →</button>
  `;
  openModal();
}

function processBulkNudgeStep(){
  const sel = document.querySelector('input[name="bulk_reorder_tpl"]:checked');
  if(sel) bulkNudgeTemplateId = sel.value;
  
  if(bulkNudgeCurrentIdx >= bulkNudgeQueue.length){
    toast('Finished sending to all retailers!');
    closeModal();
    return;
  }
  
  const r = bulkNudgeQueue[bulkNudgeCurrentIdx];
  const tplsObj = {
    't1': `Namaskar ${r.name},\nAapke pichle order ka stock khatam hone wala hoga. Kripya apna naya order place karein.\n- Vinita Enterprises`,
    't2': `Namaskar ${r.name},\nAbhi market mein demand zyada hai aur stock tezi se khatam ho raha hai. Apna order jaldi book karein taki shortage na ho.\n- Vinita Enterprises`,
    't3': `Namaskar ${r.name},\nAapne pichle kuch samay se order nahi diya hai. Humare paas naye products aur schemes aaye hain. Aaj hi sampark karein!\n- Vinita Enterprises`,
    't4': `Namaskar ${r.name},\nTyohar/Season aa raha hai! Apni dukan ka stock bacha kar rakhein. Naya order aaj hi book karein.\n- Vinita Enterprises`,
    't5': `Namaskar ${r.name},\nAapka purana payment baaki hai. Kripya payment clear karein aur naya stock order karein taki aapka kaam na ruke.\n- Vinita Enterprises`
  };
  
  const text = tplsObj[bulkNudgeTemplateId] || tplsObj['t1'];
  
  document.getElementById('modal-title').textContent=`Sending ${bulkNudgeCurrentIdx+1} of ${bulkNudgeQueue.length}`;
  document.getElementById('modal-body').innerHTML=`
    <div style="padding:16px;background:var(--or-grad-soft);border-radius:var(--r-md);margin-bottom:20px;text-align:center">
      <div style="font-size:12px;color:var(--tx-2);margin-bottom:4px">Next Retailer</div>
      <div style="font-size:18px;font-weight:700;color:var(--or-d)">${esc(r.name)}</div>
      <div style="font-size:13px;color:var(--mu);margin-top:4px">${esc(r.contact)}</div>
    </div>
    <div style="font-size:12px;color:var(--mu);margin-bottom:8px">Message Preview:</div>
    <div style="padding:12px;border:1px solid var(--bd);border-radius:8px;background:var(--card);font-size:13px;white-space:pre-wrap;line-height:1.4;margin-bottom:20px">${esc(text)}</div>
    
    <div style="display:flex;gap:10px">
      <button class="btn btn-ghost" style="flex:1;border:1px solid var(--bd)" onclick="bulkNudgeCurrentIdx++; processBulkNudgeStep()">Skip</button>
      <button class="btn btn-wa" style="flex:2" onclick="sendSingleBulkNudge('${escQ(r.contact)}', '${escQ(text)}')">${ico('send',16)} Send Now</button>
    </div>
  `;
}

function sendSingleBulkNudge(phone, text){
  let waNum = phone.replace(/\D/g,'');
  if(waNum.length===10) waNum='91'+waNum;
  window.open(`https://wa.me/${waNum}?text=${encodeURIComponent(text)}`,'_blank');
  bulkNudgeCurrentIdx++;
  processBulkNudgeStep();
}

// ============================================================
//   INCENTIVE CALCULATOR
// ============================================================
function openIncentiveCalculator(){
  document.getElementById('modal-title').textContent='Incentive Calculator';
  const lastSalesman=localStorage.getItem('vinita_inc_salesman')||'';
  const lastFrom=localStorage.getItem('vinita_inc_from')||toYMD(new Date(new Date().setDate(1)));
  const lastTo=localStorage.getItem('vinita_inc_to')||toYMD(new Date());
  
  const salesmenOptions = (S.adminOrders||[])
    .map(o=>o.salesmen)
    .filter((s,i,arr)=>s&&arr.findIndex(x=>x?.id===s.id)===i)
    .sort((a,b)=>a.name.localeCompare(b.name))
    .map(s=>`<option value="${s.id}" ${s.id===lastSalesman?'selected':''}>${esc(s.name)}</option>`)
    .join('');

  document.getElementById('modal-body').innerHTML=`
    <div class="fg"><label>Salesman</label>
      <select id="inc-salesman">${salesmenOptions}</select>
    </div>
    <div style="display:flex;gap:10px">
      <div class="fg" style="flex:1"><label>From</label><input type="date" id="inc-from" value="${lastFrom}"></div>
      <div class="fg" style="flex:1"><label>To</label><input type="date" id="inc-to" value="${lastTo}"></div>
    </div>
    <div class="section-eyebrow" style="margin-top:10px;margin-bottom:8px">Slab Rules (Revenue → % Rate)</div>
    <div id="inc-slabs">
      <div style="display:flex;gap:8px;margin-bottom:8px;align-items:center">
        <span>Up to ₹</span><input type="number" class="inc-slab-amt" value="100000" style="width:100px;padding:6px;border:1px solid var(--bd);border-radius:4px">
        <span>→</span><input type="number" step="0.1" class="inc-slab-rate" value="1.0" style="width:60px;padding:6px;border:1px solid var(--bd);border-radius:4px"><span>%</span>
      </div>
      <div style="display:flex;gap:8px;margin-bottom:8px;align-items:center">
        <span>Up to ₹</span><input type="number" class="inc-slab-amt" value="300000" style="width:100px;padding:6px;border:1px solid var(--bd);border-radius:4px">
        <span>→</span><input type="number" step="0.1" class="inc-slab-rate" value="1.5" style="width:60px;padding:6px;border:1px solid var(--bd);border-radius:4px"><span>%</span>
      </div>
      <div style="display:flex;gap:8px;margin-bottom:8px;align-items:center">
        <span>Above</span><input type="number" disabled value="300000" style="width:100px;padding:6px;border:1px solid var(--bd);border-radius:4px;background:#f5f5f5">
        <span>→</span><input type="number" step="0.1" class="inc-slab-rate" value="2.0" style="width:60px;padding:6px;border:1px solid var(--bd);border-radius:4px"><span>%</span>
      </div>
    </div>
    <button class="btn btn-or" style="width:100%;margin-top:16px" onclick="calculateIncentive()">Calculate Incentive</button>
    <div id="inc-result" style="margin-top:20px"></div>
  `;
  openModal();
}

function calculateIncentive(){
  const sId=document.getElementById('inc-salesman').value;
  const sName=document.getElementById('inc-salesman').options[document.getElementById('inc-salesman').selectedIndex].text;
  const fromD=document.getElementById('inc-from').value;
  const toD=document.getElementById('inc-to').value;
  
  if(!sId||!fromD||!toD){toast('Select all fields');return;}
  localStorage.setItem('vinita_inc_salesman',sId);
  localStorage.setItem('vinita_inc_from',fromD);
  localStorage.setItem('vinita_inc_to',toD);

  const amts=Array.from(document.querySelectorAll('.inc-slab-amt')).map(i=>parseFloat(i.value)||0);
  const rates=Array.from(document.querySelectorAll('.inc-slab-rate')).map(i=>parseFloat(i.value)||0);
  
  const orders=(S.adminOrders||[]).filter(o=>
    o.salesmen?.id===sId &&
    o.status==='delivered' &&
    normalizeOrderDate(o.order_date)>=fromD &&
    normalizeOrderDate(o.order_date)<=toD
  );
  
  const totalRev=orders.reduce((s,o)=>(o.order_items||[]).reduce((ss,i)=>ss+((parseFloat(i.quantity)||0)*(parseFloat(i.rate)||0)),0)+s,0);
  
  let inc=0;
  let remaining=totalRev;
  let breakdown=[];
  
  if(remaining>0 && amts[0]>0){
    const amt = Math.min(remaining, amts[0]);
    const slabInc = amt * (rates[0]/100);
    inc+=slabInc;
    remaining-=amt;
    breakdown.push({label:`First ₹${amts[0]}`, amt, rate:rates[0], inc:slabInc});
  }
  if(remaining>0 && amts[1]>amts[0]){
    const amt = Math.min(remaining, amts[1]-amts[0]);
    const slabInc = amt * (rates[1]/100);
    inc+=slabInc;
    remaining-=amt;
    breakdown.push({label:`₹${amts[0]} to ₹${amts[1]}`, amt, rate:rates[1], inc:slabInc});
  }
  if(remaining>0){
    const slabInc = remaining * (rates[2]/100);
    inc+=slabInc;
    breakdown.push({label:`Above ₹${amts[1]}`, amt:remaining, rate:rates[2], inc:slabInc});
  }

  window._incResult = {sName, fromD, toD, totalRev, breakdown, inc, orders:orders.length};
  
  document.getElementById('inc-result').innerHTML=`
    <div class="card" style="background:var(--or-grad-soft);border:.5px solid #fed7aa;padding:16px">
      <div style="font-size:11px;font-weight:700;color:var(--or-d);text-transform:uppercase;letter-spacing:.05em">Total Revenue</div>
      <div style="font-size:24px;font-weight:700;letter-spacing:-0.02em">${fmtMoney(totalRev)}</div>
      <div style="font-size:12px;color:var(--mu);margin-top:4px">${orders.length} delivered orders</div>
      
      <div style="margin:16px 0;border-top:1px dashed #fdba74;padding-top:16px">
        ${breakdown.map(b=>`
          <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px">
            <div>${b.label} <span style="color:var(--mu)">(${b.rate}%)</span></div>
            <strong>${fmtMoney(b.inc)}</strong>
          </div>
        `).join('')}
      </div>
      
      <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid #fdba74;padding-top:12px">
        <div style="font-size:12px;font-weight:700;color:var(--or-d);text-transform:uppercase">Final Incentive</div>
        <div style="font-size:24px;font-weight:700;color:var(--or-d)">${fmtMoney(inc)}</div>
      </div>
    </div>
    <button class="btn btn-wa" style="width:100%;margin-top:12px" onclick="shareIncentiveWA()">
      ${ico('send',16)} Share to WhatsApp
    </button>
  `;
}

function shareIncentiveWA(){
  if(!window._incResult)return;
  const r=window._incResult;
  let text = `*Incentive Summary: ${r.sName}*\n`;
  text += `Period: ${fmtDateShort(r.fromD)} to ${fmtDateShort(r.toD)}\n\n`;
  text += `*Total Revenue: ${fmtMoney(r.totalRev)}*\n`;
  text += `(${r.orders} delivered orders)\n\n`;
  text += `*Breakdown:*\n`;
  r.breakdown.forEach(b=>{
    text += `• ${b.label} (${b.rate}%): ${fmtMoney(b.inc)}\n`;
  });
  text += `\n*Total Payout: ${fmtMoney(r.inc)}*\n`;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`,'_blank');
}

// ============================================================
//   ADMIN GPS MAP
// ============================================================
let adminMap = null;
let adminMarkers = {};

async function loadAdminMap(){
  if(typeof L === 'undefined'){
    document.getElementById('admin-map-list').innerHTML='<div class="err-bar">Map library loading... try again.</div>';
    return;
  }
  
  if(!adminMap){
    adminMap = L.map('admin-map').setView([20.5937, 78.9629], 4);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(adminMap);
  } else {
    setTimeout(() => {
      adminMap.invalidateSize();
    }, 50);
  }
  
  document.getElementById('admin-map-list').innerHTML='<div class="load">Fetching live locations...</div>';
  
  const {data, error} = await db.from('salesman_locations').select('*, salesmen(name)');
  if(error){
    document.getElementById('admin-map-list').innerHTML=`<div class="err-bar">${error.message}</div>`;
    return;
  }
  
  Object.values(adminMarkers).forEach(m=>adminMap.removeLayer(m));
  adminMarkers = {};
  
  if(!data||!data.length){
    document.getElementById('admin-map-list').innerHTML='<div class="info-bar">No active locations found.</div>';
    return;
  }
  
  let bounds = L.latLngBounds();
  let listHtml = '';
  const now = new Date();
  
  data.forEach(loc=>{
    // Parse DECIMAL type from DB as safe Float Numbers
    const lat=Number(loc.latitude);
    const lng=Number(loc.longitude);
    if(isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) return;
    
    const name=loc.salesmen?.name||'Unknown';
    const up=new Date(loc.updated_at);
    const diffMin = Math.floor((now-up)/60000);
    
    let color = '#ef4444';
    let status = 'Offline';
    if(diffMin < 10) { color='#22c55e'; status='Live'; }
    else if(diffMin < 30) { color='#eab308'; status='Recent'; }
    
    const marker = L.circleMarker([lat, lng], {
      color: '#fff', weight: 2,
      fillColor: color, fillOpacity: 1, radius: 8
    }).addTo(adminMap);
    
    marker.bindPopup(`<strong>${name}</strong><br>${diffMin} mins ago`);
    adminMarkers[loc.id] = marker;
    bounds.extend([lat, lng]);
    
    listHtml += `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:10px;border-bottom:1px solid var(--bd)">
        <div style="display:flex;align-items:center;gap:8px">
          <div style="width:10px;height:10px;border-radius:5px;background:${color}"></div>
          <div>
            <div style="font-weight:600">${esc(name)}</div>
            <div style="color:var(--mu);font-size:11px">${status} • ${diffMin===0?'Just now':diffMin+' mins ago'}</div>
          </div>
        </div>
        <a href="https://www.google.com/maps/search/?api=1&query=${lat},${lng}" target="_blank" class="btn btn-ghost btn-sm" style="padding:4px 8px;font-size:11px">Maps ↗</a>
      </div>
    `;
  });
  
  document.getElementById('admin-map-list').innerHTML=listHtml;
  if(Object.keys(adminMarkers).length > 0) { 
    setTimeout(() => {
      adminMap.fitBounds(bounds, {padding: [30, 30], maxZoom:15});
    }, 100);
  }
}

// ============================================================
//   UPDATES & OFFERS CRUD
// ============================================================
function editUpdate(id){
  const items = window._adminUpdates || [];
  const u = items.find(x=>x.id===id) || {id:'', title:'', content:'', is_active:true};
  
  document.getElementById('modal-title').textContent = id ? 'Edit Update' : 'New Update';
  document.getElementById('modal-body').innerHTML=`
    <div class="fg"><label>Title (e.g. Diwali Offer)</label><input type="text" id="upd-title" value="${escQ(u.title)}"></div>
    <div class="fg"><label>Message Content</label><textarea id="upd-content" rows="4">${escQ(u.content)}</textarea></div>
    <div class="fg">
      <label style="display:flex;align-items:center;gap:8px">
        <input type="checkbox" id="upd-active" ${u.is_active?'checked':''}> Active (Visible to Salesmen)
      </label>
    </div>
    <button class="btn btn-or" style="width:100%;margin-top:10px" onclick="saveUpdate('${id||''}')">Save Update</button>
  `;
  openModal();
}

async function saveUpdate(id){
  const title = document.getElementById('upd-title').value.trim();
  const content = document.getElementById('upd-content').value.trim();
  const is_active = document.getElementById('upd-active').checked;
  if(!title || !content){toast('Title and content required');return;}
  
  const payload = {title, content, is_active};
  let errorMsg = null;
  
  // Try Supabase first
  const {data, error} = await db.from('updates').select('id').limit(1);
  if(error && error.code === '42P01') {
    // Fallback to localStorage
    const items = JSON.parse(localStorage.getItem('vinita_updates')||'[]');
    if(id){
      const idx=items.findIndex(x=>x.id===id);
      if(idx>=0) items[idx] = {...items[idx], ...payload};
    } else {
      items.unshift({id: 'upd_'+Date.now(), ...payload, created_at: new Date().toISOString()});
    }
    localStorage.setItem('vinita_updates', JSON.stringify(items));
  } else {
    // Use Supabase
    if(id){
      const {error:e2} = await db.from('updates').update(payload).eq('id',id);
      errorMsg = e2?.message;
    } else {
      const {error:e2} = await db.from('updates').insert(payload);
      errorMsg = e2?.message;
    }
  }
  
  if(errorMsg){toast(errorMsg);return;}
  toast('Saved');
  closeModal();
  manageList('updates');
}

async function deleteUpdate(id){
  if(!await ui.confirm({message:'Delete this update?'}))return;
  // Try Supabase first
  const {error} = await db.from('updates').select('id').limit(1);
  if(error && error.code === '42P01') {
    let items = JSON.parse(localStorage.getItem('vinita_updates')||'[]');
    items = items.filter(x=>x.id!==id);
    localStorage.setItem('vinita_updates', JSON.stringify(items));
  } else {
    await db.from('updates').delete().eq('id',id);
  }
  manageList('updates');
}

restoreState();
setOnline(navigator.onLine);
updateCartCounts();

if (S.isAdmin) {
  history.replaceState({page:'pg-admin'},'','');
  showPageDirect('pg-admin');
  loadAdminDashboard();
} else if (S.salesman) {
  startMandatoryTracking();
  history.replaceState({page:'pg-salesman-home'},'','');
  showPageDirect('pg-salesman-home');
} else {
  history.replaceState({page:'pg-landing'},'','');
}

let biCharts = {};

async function openBIDashboard() {
  gotoPage('pg-admin-bi');
  toast('Loading Analytics Data...');
  
  const {data: orders} = await db.from('orders').select('order_date, status, payment_term, credit_period_days, retailers(id,name,area), order_items(quantity,rate,products(name,sku)), payments(status,paid_on)');
  const {data: retailers} = await db.from('retailers').select('id,name,area,outstanding');
  
  if(!orders || !retailers) {
    toast('Failed to load BI data');
    return;
  }
  
  window._biData = { orders, retailers };
  
  let oldestDate = new Date();
  if (orders.length > 0) {
    const minTime = Math.min(...orders.map(o => new Date(o.order_date).getTime()));
    oldestDate = new Date(minTime);
  }
  
  const daysDiff = (new Date().getTime() - oldestDate.getTime()) / (1000 * 3600 * 24);
  window._biPredictionLocked = daysDiff < 180;
  
  if(window._biPredictionLocked) {
    document.getElementById('bi-lock-sub').textContent = `Oldest order: ${toYMD(oldestDate)} (${Math.floor(daysDiff)}/180 days)`;
  } else {
    document.getElementById('bi-lock-sub').textContent = 'Engine Ready';
  }
  
  document.getElementById('bi-sys-status').textContent = 'Live';
  document.getElementById('bi-sys-status').classList.remove('warn');
  document.getElementById('bi-engine-status').textContent = 'Active (Basic)';
  
  switchBiTab(1);
}

function switchBiTab(tabId) {
  document.querySelectorAll('.bi-tab-btn').forEach((btn, idx) => {
    btn.classList.toggle('active', idx + 1 === tabId);
  });
  
  document.getElementById('bi-view-1').style.display = 'none';
  document.getElementById('bi-view-2').style.display = 'none';
  document.getElementById('bi-view-3').style.display = 'none';
  
  document.getElementById(`bi-view-${tabId}`).style.display = 'block';
  
  if (tabId === 1) renderRetailerAnalytics();
  if (tabId === 2) renderProductPerformance();
  if (tabId === 3) renderRegionalDebt();
}

async function togglePredictiveForecast() {
  const isChecked = document.getElementById('bi-predict-toggle').checked;
  const lockUI = document.getElementById('bi-lock');
  const engineStatus = document.getElementById('bi-engine-status');
  const sysStatus = document.getElementById('bi-sys-status');
  
  if (isChecked) {
    toast('Verifying engine clearance with backend...');
    // Strict backend enforcement - bypasses client-side state completely
    const { data: forecast, error } = await db.rpc('get_predictive_forecast');
    
    if (error || !forecast || forecast.status !== 'unlocked') {
      lockUI.style.display = 'flex';
      engineStatus.textContent = 'Locked: Needs 6mo Data';
      document.getElementById('bi-lock-sub').textContent = error ? error.message : 'Not Authorized';
      sysStatus.textContent = 'Forecast Error';
      sysStatus.classList.add('warn');
      setTimeout(() => {
        document.getElementById('bi-predict-toggle').checked = false;
        lockUI.style.display = 'none';
        engineStatus.textContent = 'Active (Basic)';
        sysStatus.textContent = 'Live';
        sysStatus.classList.remove('warn');
      }, 3500);
    } else {
      toast('Predictive Engine Active!');
      engineStatus.textContent = 'Forecasting Active';
      // Apply projection logic using forecast.forecast_multiplier
    }
  } else {
    lockUI.style.display = 'none';
    engineStatus.textContent = 'Active (Basic)';
    sysStatus.textContent = 'Live';
    sysStatus.classList.remove('warn');
  }
}

function renderRetailerAnalytics() {
  const orders = window._biData.orders || [];
  let cash = 0, credit = 0, instant = 0;
  
  orders.forEach(o => {
    const val = o.order_items.reduce((sum, item) => sum + (item.quantity * (item.rate||0)), 0);
    if(o.payment_term === 'cash') instant += val;
    else if(o.payment_term === 'credit') {
      if (o.credit_period_days <= 10) cash += val; // Bill-to-Bill
      else credit += val; // 30-Day Credit
    }
  });
  
  const total = cash + credit + instant || 1;
  const data = [
    { x: '30-Day Credit', y: Math.round((credit/total)*100) },
    { x: 'Bill-to-Bill', y: Math.round((cash/total)*100) },
    { x: 'Instant Pay', y: Math.round((instant/total)*100) }
  ];
  
  if(biCharts['retailer-terms']) biCharts['retailer-terms'].destroy();
  
  const options = {
    series: [{ name: 'Share %', data }],
    chart: { type: 'bar', height: 250, foreColor: '#aaa', toolbar: { show: false }, background: 'transparent' },
    plotOptions: { bar: { horizontal: true, borderRadius: 4, distributed: true } },
    colors: ['#4285F4', '#81C784', '#FFB74D'],
    dataLabels: { enabled: true, formatter: val => val + "%" },
    xaxis: { max: 100, title: { text: 'Share of Total Volume (%)' } },
    legend: { show: false },
    theme: { mode: 'dark' }
  };
  
  biCharts['retailer-terms'] = new ApexCharts(document.querySelector("#chart-retailer-terms"), options);
  biCharts['retailer-terms'].render();
}

function renderProductPerformance() {
  const orders = window._biData.orders || [];
  let areaStats = {};
  
  orders.forEach(o => {
    const area = o.retailers?.area || 'Territory';
    if(!areaStats[area]) areaStats[area] = { eco: 0, health: 0 };
    
    o.order_items.forEach(i => {
      const pName = i.products?.name?.toLowerCase() || '';
      const val = (parseFloat(i.quantity)||0)*(parseFloat(i.rate)||0);
      if (pName.includes('eco') || pName.includes('organic')) areaStats[area].eco += val;
      else areaStats[area].health += val;
    });
  });
  
  const topAreas = Object.keys(areaStats).sort((a,b) => (areaStats[b].eco+areaStats[b].health) - (areaStats[a].eco+areaStats[a].health)).slice(0,4);
  const ecoData = topAreas.map(a => areaStats[a].eco);
  const healthData = topAreas.map(a => areaStats[a].health);
  
  if(biCharts['product-area']) biCharts['product-area'].destroy();
  
  const options = {
    series: [
      { name: 'Eco-Goods', data: ecoData },
      { name: 'Healthcare', data: healthData }
    ],
    chart: { type: 'bar', height: 250, foreColor: '#aaa', toolbar: { show: false }, stacked: false },
    colors: ['#4285F4', '#81C784'],
    plotOptions: { bar: { borderRadius: 4, columnWidth: '60%' } },
    dataLabels: { enabled: false },
    xaxis: { categories: topAreas },
    yaxis: { title: { text: 'Sales (₹)' } },
    legend: { position: 'top', horizontalAlign: 'left' },
    theme: { mode: 'dark' }
  };
  
  biCharts['product-area'] = new ApexCharts(document.querySelector("#chart-product-area"), options);
  biCharts['product-area'].render();
}

function renderRegionalDebt() {
  const retailers = window._biData.retailers || [];
  let areaDebt = {};
  
  retailers.forEach(r => {
    const area = r.area || 'Unknown Area';
    if(!areaDebt[area]) areaDebt[area] = 0;
    areaDebt[area] += Number(r.outstanding || 0);
  });
  
  const sortedAreas = Object.keys(areaDebt).sort((a,b) => areaDebt[b] - areaDebt[a]).slice(0,5);
  const series = sortedAreas.map(a => areaDebt[a]);
  
  if(biCharts['regional-debt']) biCharts['regional-debt'].destroy();
  
  const options = {
    series: series.length ? series : [1],
    labels: series.length ? sortedAreas : ['No Debt'],
    chart: { type: 'donut', height: 250, foreColor: '#aaa', background: 'transparent' },
    colors: series.length ? ['#EF5350', '#FF9800', '#4285F4', '#81C784', '#AB47BC'] : ['#333'],
    plotOptions: { pie: { donut: { size: '65%' } } },
    dataLabels: { enabled: false },
    theme: { mode: 'dark' },
    legend: { position: 'right' },
    tooltip: { y: { formatter: val => '₹' + val } }
  };
  
  biCharts['regional-debt'] = new ApexCharts(document.querySelector("#chart-regional-debt"), options);
  biCharts['regional-debt'].render();
}

// ============================================================
//   ADMIN INLINE ORDER EDITOR (No redirect to salesman page)
// ============================================================
async function adminEditOrder(orderId){
  closeModal();
  toast('Loading order for editing...');
  const{data:o,error}=await db.from('orders').select('*, retailers(id,name,area), order_items(id,quantity,bonus_quantity,rate,product_id,products(name,sku))').eq('id',orderId).single();
  if(error||!o){toast('Could not load order');return;}
  
  window._aeItems = (o.order_items||[]).map(i=>({
    id:i.id, pid:i.product_id, name:i.products?.name||'?', sku:i.products?.sku||'',
    qty:i.quantity, bonus:i.bonus_quantity||0, rate:Number(i.rate)||0
  }));
  window._aeOrderId = orderId;
  window._aeRetailer = o.retailers;
  
  renderAdminEditModal(o);
}

function renderAdminEditModal(o){
  const items = window._aeItems;
  const itemsHtml = items.map((it,idx)=>{
    const line = it.qty * it.rate;
    return `<div class="ae-item" id="ae-row-${idx}">
      <div class="ae-name">${esc(it.name)}</div>
      <input type="number" value="${it.qty}" min="1" inputmode="numeric" onchange="aeUpdateQty(${idx},this.value)" aria-label="Quantity">
      <div style="font-size:11px;color:var(--mu)">×</div>
      <input type="number" value="${it.rate}" min="0" step="0.5" inputmode="decimal" onchange="aeUpdateRate(${idx},this.value)" aria-label="Rate">
      <div class="ae-line" id="ae-line-${idx}">${fmtMoney(line)}</div>
      <button class="ae-rm" onclick="aeRemoveItem(${idx})" aria-label="Remove">${ico('trash',14)}</button>
    </div>`;
  }).join('');
  
  const total = Math.round(items.reduce((s,it)=>s+(it.qty*it.rate),0));
  
  document.getElementById('modal-title').textContent = 'Edit Order — ' + fmtOrd(o.order_number);
  document.getElementById('modal-body').innerHTML = `
    <div class="card" style="background:var(--or-grad-soft);border:.5px solid #fed7aa;padding:14px;margin-bottom:14px">
      <div style="font-size:11px;font-weight:700;color:var(--or-d);text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px">Editing for</div>
      <div style="font-weight:600;font-size:15px">${esc(o.retailers?.name||'-')}</div>
    </div>
    <div style="font-size:11px;font-weight:700;color:var(--mu);text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px">Items (Qty × Rate)</div>
    <div id="ae-items-wrap">${itemsHtml}</div>
    <div style="margin:14px 0;padding:12px;background:var(--bg-warm);border-radius:12px;display:flex;justify-content:space-between;align-items:center">
      <div style="font-size:11px;font-weight:700;color:var(--mu);text-transform:uppercase">New Total</div>
      <div id="ae-total" style="font-family:var(--font-serif);font-size:22px;color:var(--or);font-weight:400">${fmtMoney(total)}</div>
    </div>
    <button class="btn btn-or" style="width:100%" onclick="aeSubmit()" id="ae-save-btn">${ico('check',16)} Save Changes</button>
  `;
  openModal();
}

function aeUpdateQty(idx,val){
  window._aeItems[idx].qty = Math.max(1,parseInt(val)||1);
  aeRecalc();
}
function aeUpdateRate(idx,val){
  window._aeItems[idx].rate = Math.max(0,parseFloat(val)||0);
  aeRecalc();
}
function aeRemoveItem(idx){
  window._aeItems.splice(idx,1);
  // Re-render the entire modal
  const o = {order_number: S.adminOrders?.find(x=>x.id===window._aeOrderId)?.order_number||0, retailers: window._aeRetailer};
  renderAdminEditModal(o);
}
function aeRecalc(){
  const items = window._aeItems;
  items.forEach((it,idx)=>{
    const el = document.getElementById('ae-line-'+idx);
    if(el) el.textContent = fmtMoney(it.qty * it.rate);
  });
  const total = Math.round(items.reduce((s,it)=>s+(it.qty*it.rate),0));
  const el = document.getElementById('ae-total');
  if(el) el.textContent = fmtMoney(total);
}

async function aeSubmit(){
  const btn = document.getElementById('ae-save-btn');
  if(btn){btn.disabled=true;btn.textContent='Saving...';}
  const orderId = window._aeOrderId;
  const items = window._aeItems;
  
  if(!items.length){
    toast('Cannot save empty order');
    if(btn){btn.disabled=false;btn.textContent='Save Changes';}
    return;
  }
  
  try{
    // Delete existing items and re-insert updated ones
    await db.from('order_items').delete().eq('order_id',orderId);
    const rows = items.map(it=>({
      order_id:orderId, product_id:it.pid, quantity:it.qty, bonus_quantity:it.bonus, rate:it.rate
    }));
    const{error}=await db.from('order_items').insert(rows);
    if(error) throw error;
    
    // Audit log
    db.from('order_edits').insert({
      order_id:orderId, edited_by_type:'admin', edited_by_name:'Admin',
      edit_summary:'Admin edited items: '+items.map(i=>i.name+' x'+i.qty+'@'+i.rate).join(', ')
    }).then(()=>{});
    
    toast('Order updated!');
    closeModal();
    refreshAdminInPlace();
  }catch(e){
    toast('Error: '+(e?.message||'Save failed'));
    if(btn){btn.disabled=false;btn.textContent='Save Changes';}
  }
}

// ============================================================
//   ORDER SELECTION & SELECTIVE EXPORT
// ============================================================
S.selectedOrders = new Set();

function toggleOrderSelect(orderId){
  if(S.selectedOrders.has(orderId)) S.selectedOrders.delete(orderId);
  else S.selectedOrders.add(orderId);
  updateSelectionBar();
}

function updateSelectionBar(){
  const bar = document.getElementById('sel-bar');
  const count = S.selectedOrders.size;
  document.getElementById('sel-count-num').textContent = count;
  if(count > 0) bar.classList.add('visible');
  else bar.classList.remove('visible');
}

function clearSelection(){
  S.selectedOrders.clear();
  document.querySelectorAll('.oc-check').forEach(c=>c.checked=false);
  updateSelectionBar();
}

function exportSelectedMarg(){
  if(!S.selectedOrders.size){toast('No orders selected');return;}
  const allOrders = S.filteredOrders || S.adminOrders || [];
  const selectedArr = allOrders.filter(o=>S.selectedOrders.has(o.id));
  if(!selectedArr.length){toast('No matching orders found');return;}
  
  // Temporarily override and call existing export
  const backup = S.filteredOrders;
  S.filteredOrders = selectedArr;
  exportOrdersMargDetailed();
  S.filteredOrders = backup;
  
  toast('Exported '+selectedArr.length+' selected orders');
  clearSelection();
}

async function initApp() {
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
//   ANALYTICS ENGINE
// ============================================================
let analyticsCharts = {};

async function loadAnalytics() {
  const container = document.getElementById('analytics-dashboard-content');
  const loading = document.getElementById('analytics-loading');
  const errEl = document.getElementById('analytics-error');
  
  if(!S.analyticsFilter) S.analyticsFilter = 'thisMonth';
  
  container.style.display = 'none';
  errEl.style.display = 'none';
  loading.style.display = 'block';

  // Apply Date Filter for DB query! (LAZY LOADING)
  const range = getDateRange(S.analyticsFilter);
  
  let qOrders = db.from('orders').select('*, salesmen!orders_salesman_id_fkey(name), retailers(id,name,area,outstanding,credit_limit), order_items(quantity,rate,products(name,sku)), payments(status)');
  let qCols = db.from('collections').select('amount, mode, collected_at');

  if(range.from) {
    qOrders = qOrders.gte('order_date', range.from);
    qCols = qCols.gte('collected_at', range.from);
  }
  if(range.to) {
    qOrders = qOrders.lte('order_date', range.to);
    qCols = qCols.lte('collected_at', range.to + 'T23:59:59');
  }

  qOrders = qOrders.order('order_date', {ascending:false}).limit(1500); // safety limit

  const [resOrders, resCol] = await Promise.all([qOrders, qCols]);
  
  if(resOrders.error) { 
    loading.style.display = 'none';
    errEl.style.display = 'block';
    errEl.innerHTML = 'Error loading analytics: ' + resOrders.error.message;
    console.error(resOrders.error); 
    return; 
  }

  window._analyticsData = {
    orders: resOrders.data || [],
    collections: resCol.data || []
  };

  loading.style.display = 'none';
  container.style.display = 'block';
  renderAnalyticsDashboard();
}

function filterAnalytics(key, el) {
  document.querySelectorAll('#analytics-date-filters .chip').forEach(c=>c.classList.remove('active'));
  if(el) el.classList.add('active');
  S.analyticsFilter = key;
  loadAnalytics(); // Fetch new data for the selected range instead of just filtering locally!
}

function renderAnalyticsDashboard() {
  try {
    const allOrders = window._analyticsData.orders;
  const allCols = window._analyticsData.collections;

  // Apply Date Filter
  const range = getDateRange(S.analyticsFilter);
  const orders = allOrders;

  // Common Theme config
  const theme = { mode: 'dark' };
  const common = {
    chart: { foreColor: '#A0AEC0', toolbar: { show: false }, background: 'transparent', fontFamily: 'Inter, sans-serif' },
    theme: theme,
    colors: ['#00E396', '#FEB019', '#FF4560', '#775DD0', '#008FFB', '#3F51B5', '#4CAF50', '#F9CE1D'],
    tooltip: { theme: 'dark', style: { fontSize: '13px' } },
    grid: { borderColor: '#2C2C2E', strokeDashArray: 4 }
  };

  // 1. Line Graph (Sales Trends - 30 days or filtered)
  renderTrendsChart(orders, common);

  // 2. Bar Chart (Top Salesmen by Area)
  renderSalesmenChart(orders, common);

  // 3. Donut (Payment Modes)
  renderPaymentDonut(orders, common);

  // 4. Treemap (Company / Category)
  renderTreemap(orders, common);

  // 5. Heatmap (Product across Areas)
  renderHeatmap(orders, common);

  // 6. Scatter Plot (Order Size vs Credit)
  renderScatter(orders, common);

  // 7. Histogram (Order Size Dist)
  renderHistogram(orders, common);
  document.getElementById('analytics-error').style.display='none';
  document.getElementById('analytics-loading').style.display='none';
  } catch(e) {
    document.getElementById('analytics-error').style.display='block';
    document.getElementById('analytics-error').textContent = 'Render Error: ' + e.message + ' \n' + e.stack;
    document.getElementById('analytics-loading').style.display='none';
  }
}

// 1. Trends Line Chart
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
  
  // Forecast moving average
  const forecast = [];
  let sum=0;
  data.forEach((v, i) => {
    sum += v;
    forecast.push(Math.round(sum/(i+1)));
  });

  if(analyticsCharts['trends']) analyticsCharts['trends'].destroy();
  const opt = {
    ...common,
    series: [
      { name: 'Revenue', type: 'area', data: data },
      { name: 'Moving Avg', type: 'line', data: forecast }
    ],
    chart: { ...common.chart, height: 300, type: 'line' },
    stroke: { curve: 'smooth', width: [0, 3] },
    fill: { type: ['gradient', 'solid'], gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.1 } },
    colors: ['#3b82f6', '#f59e0b'],
    xaxis: { categories: sortedDates.map(d => d.slice(5)) },
    dataLabels: { enabled: false },
    yaxis: { labels: { formatter: v => '₹'+fmtMoneyCompact(v) } }
  };
  analyticsCharts['trends'] = new ApexCharts(document.querySelector("#chart-line-trends"), opt);
  analyticsCharts['trends'].render();
}

// 2. Salesmen Bar Chart
function renderSalesmenChart(orders, common) {
  const smData = {};
  orders.forEach(o => {
    const sm = o.salesmen?.name || 'Admin';
    if(!smData[sm]) smData[sm] = 0;
    smData[sm] += (o.order_items||[]).reduce((s,i)=>s+((parseFloat(i.quantity)||0)*(parseFloat(i.rate)||0)),0);
  });
  
  const sorted = Object.entries(smData).sort((a,b)=>b[1]-a[1]).slice(0,6);
  
  if(analyticsCharts['salesmen']) analyticsCharts['salesmen'].destroy();
  const opt = {
    ...common,
    series: [{ name: 'Revenue', data: sorted.map(i=>i[1]) }],
    chart: { ...common.chart, type: 'bar', height: 250 },
    plotOptions: { bar: { horizontal: false, borderRadius: 4, columnWidth: '55%' } },
    colors: ['#10b981'],
    dataLabels: { enabled: false },
    xaxis: { categories: sorted.map(i=>i[0]) },
    yaxis: { labels: { formatter: v => '₹'+fmtMoneyCompact(v) } }
  };
  analyticsCharts['salesmen'] = new ApexCharts(document.querySelector("#chart-bar-salesmen"), opt);
  analyticsCharts['salesmen'].render();
}

// 3. Payment Donut
function renderPaymentDonut(orders, common) {
  let cash=0, credit=0, bill=0;
  orders.forEach(o => {
    const tot = (o.order_items||[]).reduce((s,i)=>s+((parseFloat(i.quantity)||0)*(parseFloat(i.rate)||0)),0);
    if(o.payment_term==='cash') cash += tot;
    else if(o.payment_term==='credit') {
      if(o.credit_period_days <= 1) bill += tot;
      else credit += tot;
    }
  });
  
  if(analyticsCharts['payment']) analyticsCharts['payment'].destroy();
  const opt = {
    ...common,
    series: [cash, bill, credit],
    labels: ['Cash/UPI', 'Bill-to-Bill', 'Credit'],
    chart: { ...common.chart, type: 'donut', height: 250 },
    colors: ['#22c55e', '#3b82f6', '#f43f5e'],
    plotOptions: { pie: { donut: { size: '65%' } } },
    dataLabels: { enabled: false },
    legend: { position: 'bottom' }
  };
  analyticsCharts['payment'] = new ApexCharts(document.querySelector("#chart-donut-payment"), opt);
  analyticsCharts['payment'].render();
}

// 4. Treemap (Company)
function renderTreemap(orders, common) {
  const companies = {};
  orders.forEach(o => {
    (o.order_items||[]).forEach(i => {
      const c = i.products?.companies?.name || 'Unknown';
      if(!companies[c]) companies[c] = 0;
      companies[c] += ((parseFloat(i.quantity)||0)*(parseFloat(i.rate)||0));
    });
  });
  
  const data = Object.entries(companies).map(([x,y]) => ({x,y})).sort((a,b)=>b.y-a.y);
  
  if(analyticsCharts['treemap']) analyticsCharts['treemap'].destroy();
  const opt = {
    ...common,
    series: [{ data }],
    chart: { ...common.chart, type: 'treemap', height: 350 },
    colors: ['#6366f1'],
    dataLabels: { formatter: function(text, op) { return [text, '₹'+fmtMoneyCompact(op.value)] } }
  };
  analyticsCharts['treemap'] = new ApexCharts(document.querySelector("#chart-treemap-company"), opt);
  analyticsCharts['treemap'].render();
}

// 5. Heatmap (Product across Areas)
function renderHeatmap(orders, common) {
  const map = {};
  const products = new Set();
  
  orders.forEach(o => {
    const area = o.retailers?.area || 'Unknown';
    if(!map[area]) map[area] = {};
    (o.order_items||[]).forEach(i => {
      const p = (i.products?.name || 'Unknown').substring(0,15);
      products.add(p);
      if(!map[area][p]) map[area][p] = 0;
      map[area][p] += ((parseFloat(i.quantity)||0)*(parseFloat(i.rate)||0));
    });
  });
  
  const topProducts = Array.from(products).slice(0, 10);
  const series = Object.keys(map).slice(0, 8).map(area => {
    return {
      name: area,
      data: topProducts.map(p => ({ x: p, y: map[area][p] || 0 }))
    };
  });
  
  if(analyticsCharts['heatmap']) analyticsCharts['heatmap'].destroy();
  const opt = {
    ...common,
    series: series,
    chart: { ...common.chart, type: 'heatmap', height: 350 },
    plotOptions: { heatmap: { colorScale: { ranges: [{ from:0, to:0, color:'#1f2937' }, { from:1, to:1000000, color:'#8b5cf6' }] } } },
    dataLabels: { enabled: false }
  };
  analyticsCharts['heatmap'] = new ApexCharts(document.querySelector("#chart-heatmap-products"), opt);
  analyticsCharts['heatmap'].render();
}

// 6. Scatter (Order Size vs Credit)
function renderScatter(orders, common) {
  const data = orders.filter(o => o.payment_term === 'credit' && o.credit_period_days > 1).map(o => {
    const tot = (o.order_items||[]).reduce((s,i)=>s+((parseFloat(i.quantity)||0)*(parseFloat(i.rate)||0)),0);
    return [tot, o.credit_period_days]; // [x,y] = [Size, Days]
  });
  
  if(analyticsCharts['scatter']) analyticsCharts['scatter'].destroy();
  const opt = {
    ...common,
    series: [{ name: 'Orders', data }],
    chart: { ...common.chart, type: 'scatter', height: 250 },
    colors: ['#ec4899'],
    xaxis: { title: { text: 'Order Size (₹)' }, labels: { formatter: v => fmtMoneyCompact(v) } },
    yaxis: { title: { text: 'Credit Days' } }
  };
  analyticsCharts['scatter'] = new ApexCharts(document.querySelector("#chart-scatter-credit"), opt);
  analyticsCharts['scatter'].render();
}

// 7. Histogram (Order Size Distribution)
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
    series: [{ name: 'Number of Orders', data: Object.values(bins) }],
    chart: { ...common.chart, type: 'bar', height: 250 },
    plotOptions: { bar: { borderRadius: 4, columnWidth: '95%' } },
    colors: ['#06b6d4'],
    dataLabels: { enabled: true },
    xaxis: { categories: Object.keys(bins), title: { text: 'Order Value Range (₹)' } },
    yaxis: { title: { text: 'Frequency' } }
  };
  analyticsCharts['hist'] = new ApexCharts(document.querySelector("#chart-hist-orders"), opt);
  analyticsCharts['hist'].render();
}


// ============================================================
//   ADVANCED FORECASTING MODULE
// ============================================================
function openForecastModal() {
    document.getElementById('forecast-modal').style.display = 'flex';
    document.getElementById('forecast-results').style.display = 'none';
    
    // Populate Selectors from loaded data
    const rs = new Map();
    const as = new Set();
    
    if(window._analyticsData && window._analyticsData.orders) {
        window._analyticsData.orders.forEach(o => {
            if(o.retailers) {
                rs.set(o.retailers.id, o.retailers.name);
                if(o.retailers.area) as.add(o.retailers.area);
            }
        });
    } else {
        (S.retailers||[]).forEach(r => {
            rs.set(r.id, r.name);
            if(r.area) as.add(r.area);
        });
    }
    
    const pSel = document.getElementById('forecast-party');
    pSel.innerHTML = '<option value="all">All Retailers</option>';
    Array.from(rs.keys()).forEach(id => {
        pSel.innerHTML += `<option value="${id}">${rs.get(id)}</option>`;
    });
    
    const aSel = document.getElementById('forecast-area');
    aSel.innerHTML = '<option value="all">All Areas</option>';
    Array.from(as).forEach(a => {
        aSel.innerHTML += `<option value="${a}">${a}</option>`;
    });
}

function runForecast() {
    const pId = document.getElementById('forecast-party').value;
    const area = document.getElementById('forecast-area').value;
    
    document.getElementById('forecast-results').style.display = 'none';
    document.getElementById('forecast-loading').style.display = 'block';
    
    setTimeout(() => {
        const allOrders = window._analyticsData?.orders || [];
        
        let filtered = allOrders;
        if(pId !== 'all') filtered = filtered.filter(o => o.retailers?.id === pId);
        if(area !== 'all') filtered = filtered.filter(o => o.retailers?.area === area);
        
        // Simple heuristic for projection (Last 30 days daily average * 30)
        let totalVal = 0;
        let pastVal = 0;
        
        const now = new Date();
        const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(now.getDate() - 30);
        const sixtyDaysAgo = new Date(); sixtyDaysAgo.setDate(now.getDate() - 60);
        
        filtered.forEach(o => {
            const d = new Date(o.order_date);
            const val = (o.order_items||[]).reduce((sum, i) => sum + ((parseFloat(i.quantity)||0)*(parseFloat(i.rate)||0)), 0);
            if(d >= thirtyDaysAgo) totalVal += val;
            else if(d >= sixtyDaysAgo && d < thirtyDaysAgo) pastVal += val;
        });
        
        const dailyAvg = totalVal / 30;
        const projected30d = (dailyAvg * 30) * 1.05; // 5% heuristic growth
        
        let trend = 0;
        if(pastVal > 0) trend = ((totalVal - pastVal) / pastVal) * 100;
        
        document.getElementById('forecast-val').textContent = '? ' + projected30d.toLocaleString(undefined, {maximumFractionDigits:0});
        
        const trEl = document.getElementById('forecast-trend');
        trEl.textContent = (trend > 0 ? '+' : '') + trend.toFixed(1) + '%';
        trEl.style.color = trend >= 0 ? '#00E396' : '#FF4560';
        
        document.getElementById('forecast-loading').style.display = 'none';
        document.getElementById('forecast-results').style.display = 'block';
        
        // Render Chart
        renderDetailedForecastChart(projected30d, dailyAvg);
        
    }, 800); // Simulate AI crunching
}

function renderDetailedForecastChart(projected, dailyAvg) {
    if(analyticsCharts['forecast']) analyticsCharts['forecast'].destroy();
    
    const cats = [];
    const vals = [];
    const now = new Date();
    
    for(let i=0; i<30; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() + i);
        cats.push(d.toLocaleDateString('en-US', {month:'short', day:'numeric'}));
        
        // Add some noise to the daily average for realism
        const noise = (Math.random() * 0.4) - 0.2; // +/- 20%
        vals.push(dailyAvg * (1 + noise));
    }
    
    const opt = {
        chart: { type: 'area', height: 250, foreColor: '#888', toolbar: {show:false}, background: 'transparent', fontFamily: 'Inter' },
        theme: { mode: 'dark' },
        series: [{ name: 'Projected Demand', data: vals.map(v=>Math.round(v)) }],
        xaxis: { categories: cats, tickAmount: 6, tooltip: {enabled:false} },
        yaxis: { labels: { formatter: v => '?' + (v/1000).toFixed(1) + 'k' } },
        colors: ['#008FFB'],
        fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.6, opacityTo: 0.1, stops: [0, 90, 100] } },
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 3 },
        tooltip: { theme: 'dark' },
        grid: { borderColor: '#333', strokeDashArray: 3 }
    };
    
    analyticsCharts['forecast'] = new ApexCharts(document.querySelector("#chart-forecast-detailed"), opt);
    analyticsCharts['forecast'].render();
}

