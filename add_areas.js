const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// 1. Update loadManage HTML
const oldManageHtml = `<button class="btn btn-or" onclick="manageList('salesmen')" style="flex-direction:column;padding:18px 12px;gap:6px;text-align:center"><span style="display:flex;align-items:center;justify-content:center">\${ico('user',22)}</span><span style="font-size:13px;font-weight:600">Salesmen</span></button>`;
const newManageHtml = oldManageHtml + `\n      <button class="btn btn-or" onclick="manageList('areas')" style="flex-direction:column;padding:18px 12px;gap:6px;text-align:center"><span style="display:flex;align-items:center;justify-content:center">\${ico('map-pin',22)}</span><span style="font-size:13px;font-weight:600">Areas</span></button>`;
content = content.replace(oldManageHtml, newManageHtml);

// 2. Add 'areas' handling to manageList
const oldManageList = `if(type==='companies'){`;
const newManageList = `if(type==='areas'){
    const{data}=await db.from('areas').select('*').order('name');
    view.innerHTML=\`<button class="btn btn-or btn-sm" style="margin-bottom:12px" onclick="editArea(null)">+ Add Area</button>
      <div>\${(data||[]).map(a=>\`<div class="list-item">
        <div class="li-info"><div class="li-name">\${esc(a.name)}</div></div>
        <div class="li-actions">
          <button class="btn btn-sm btn-ghost" onclick="editArea('\${a.id}')">Edit</button>
        </div>
      </div>\`).join('')}</div>\`;
  }else if(type==='companies'){`;
content = content.replace(oldManageList, newManageList);

// 3. Add editArea and saveArea functions before editCompany
const editCompanyIndex = content.indexOf('async function editCompany(id){');
const areaFunctions = `
async function editArea(id){
  let name='';
  if(id){
    toast('Loading...');
    const{data}=await db.from('areas').select('*').eq('id',id).single();
    if(data)name=data.name;
  }
  document.getElementById('modal-content').innerHTML=\`<div class="form-title">\${id?'Edit Area':'New Area'}</div>
    <div class="fg"><label>Area Name</label><input type="text" id="m-area-name" value="\${escQ(name)}"></div>
    <button class="btn btn-or" onclick="saveArea('\${id||''}',this)">Save</button>\`;
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
`;
content = content.substring(0, editCompanyIndex) + areaFunctions + content.substring(editCompanyIndex);

// 4. Update the Retailer Modal so they can select an area from the DB instead of typing text!
// First, find editRetailer function
// Actually, it currently uses a text input: <input type="text" id="m-ret-area" value="${escQ(area)}">
// The user said: "where different retailers have same address but didn't have a prticular common area for that I want the areas section"
// To make it easy, we will fetch `areas` in `editRetailer` and make it a <select>.

const oldEditRet = `const{data}=await db.from('retailers').select('*').eq('id',id).single();
    if(data){name=data.name;area=data.area;contact=data.contact;limit=data.credit_limit;}}`;
const newEditRet = `const{data}=await db.from('retailers').select('*').eq('id',id).single();
    if(data){name=data.name;area=data.area;contact=data.contact;limit=data.credit_limit;}}
    const {data: areaList} = await db.from('areas').select('*').order('name');
    const areaOptions = (areaList||[]).map(a => \`<option value="\${escQ(a.name)}" \${area===a.name?'selected':''}>\${esc(a.name)}</option>\`).join('');
`;
content = content.replace(oldEditRet, newEditRet);

const oldRetFg = `<div class="fg"><label>Area/Location</label><input type="text" id="m-ret-area" value="\${escQ(area)}"></div>`;
const newRetFg = `<div class="fg"><label>Area/Location</label><select id="m-ret-area"><option value="">-- Select Area --</option>\${areaOptions}</select></div>`;
content = content.replace(oldRetFg, newRetFg);

fs.writeFileSync('index.html', content);
console.log('Added Areas section to Manage tabs.');
