const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// 1. Fix missing deleteRetailer
const oldRetDel = `onclick="deleteRetailer('\${r.id}','\${escQ(r.name)}')">`;
const newRetDel = `onclick="event.stopPropagation();strictDeleteEntity('retailers','\${r.id}','\${escQ(r.name)}')">`;
content = content.replace(oldRetDel, newRetDel);

// 2. Fix missing deleteProduct
const oldProdDel = `onclick="deleteProduct('\${p.id}','\${escQ(p.name)}')">`;
const newProdDel = `onclick="event.stopPropagation();strictDeleteEntity('products','\${p.id}','\${escQ(p.name)}')">`;
content = content.replace(oldProdDel, newProdDel);

// 3. Add delete button to Areas
const oldAreaBtn = `<button class="btn btn-sm btn-ghost" onclick="editArea('\${a.id}')">Edit</button>`;
const newAreaBtn = `<button class="btn btn-sm btn-ghost" onclick="editArea('\${a.id}')">Edit</button>
          <button class="icon-btn danger" onclick="event.stopPropagation();strictDeleteEntity('areas','\${a.id}','\${escQ(a.name)}')">\${ico('trash',15)}</button>`;
content = content.replace(oldAreaBtn, newAreaBtn);

// 4. Fix strictDeleteEntity not refreshing list
const oldStrictDel = `toast('Hard Deleted successfully');
  }
  closeModal();
}`;
const newStrictDel = `toast('Hard Deleted successfully');
  }
  closeModal();
  if(typeof manageList === 'function') manageList(type);
}`;
content = content.replace(oldStrictDel, newStrictDel);

// 5. Ensure "No Salesmen Yet" bug is handled.
// If salesman_locations returns null, map crashes. It already handles `if(!data||!data.length)` but what if `m.salesmen` is null? 
// `const name = m.salesmen ? m.salesmen.name : 'Unknown';` is already present. This is safe.

// 6. Fix `at-analytics` scrollbar bug.
// `overflow-x:auto` on some cards with `width:100%` can cause horizontal scrollbars. We'll add `box-sizing: border-box` to cards.
const rcardCss = `.rcard{background:var(--surface);border-radius:var(--r-xl);padding:22px;cursor:pointer;display:flex;align-items:center;gap:16px;box-shadow:var(--sh-md);border:.5px solid var(--bd);transition:all .2s;text-align:left;position:relative;overflow:hidden}`;
const newRcardCss = `.rcard{background:var(--surface);border-radius:var(--r-xl);padding:22px;cursor:pointer;display:flex;align-items:center;gap:16px;box-shadow:var(--sh-md);border:.5px solid var(--bd);transition:all .2s;text-align:left;position:relative;overflow:hidden;box-sizing:border-box;}`;
content = content.replace(rcardCss, newRcardCss);

fs.writeFileSync('index.html', content);
console.log('Final fixes applied.');
