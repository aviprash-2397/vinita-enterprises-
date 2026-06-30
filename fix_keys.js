const fs = require('fs');
let c = fs.readFileSync('index.html', 'utf8');

const target1 = "const S={salesman:null,retailer:null,cart:[],editingOrderId:null,companies:[],retailers:[],allRetailers:[],salesmen:[],currentProducts:[],allProducts:[],categories:[],activeCategory:'all',adminOrders:[],filteredOrders:[],statusFilter:'all',searchTerm:'',dateFilter:'today',customFromDate:null,customToDate:null,collections:[],filteredCollections:[],colDateFilter:'today',lastSoldRates:{},online:navigator.onLine};";

if(c.includes(target1) && !c.includes('const db=createClient(SUPABASE_URL,SUPABASE_KEY);')) {
  const fix = `<script>\nconst SUPABASE_URL='https://rryibbqgeqtitdoeaxsx.supabase.co';\nconst SUPABASE_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyeWliYnFnZXF0aXRkb2VheHN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyODcwMjgsImV4cCI6MjA5Nzg2MzAyOH0.x3x3qBPl0cZ4XpL8VJHD3Fo7ilHC1I-nneoQGnLaM2U';\nconst ADMIN_PW='shyam2026';\nconst WA_NUM='919973478456';\nconst STORAGE_KEY='vinita_state_v2';\nconst {createClient}=supabase;\nconst db=createClient(SUPABASE_URL,SUPABASE_KEY);\n` + target1;
  c = c.replace(target1, fix);
  fs.writeFileSync('index.html', c);
  console.log('Fixed damage from diff_block');
} else {
  // if it's already there, let's just update the keys
  const oldUrl = /const SUPABASE_URL='https:\/\/[^']+\.supabase\.co';/;
  const oldKey = /const SUPABASE_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[^']+';/;
  
  if (oldUrl.test(c)) {
     c = c.replace(oldUrl, "const SUPABASE_URL='https://rryibbqgeqtitdoeaxsx.supabase.co';");
     c = c.replace(oldKey, "const SUPABASE_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyeWliYnFnZXF0aXRkb2VheHN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyODcwMjgsImV4cCI6MjA5Nzg2MzAyOH0.x3x3qBPl0cZ4XpL8VJHD3Fo7ilHC1I-nneoQGnLaM2U';");
     fs.writeFileSync('index.html', c);
     console.log('Successfully updated keys');
  } else {
     console.log('Could not find url/key to replace!');
  }
}
