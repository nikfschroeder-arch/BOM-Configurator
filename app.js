const dummyData = [
  { itemNo: '100-AX1', description: 'Frame Assembly', productCategory: 'Generator', purchasingCategory: 'Fabrication' },
  { itemNo: '100-AX2', description: 'Engine Block', productCategory: 'Generator', purchasingCategory: 'Mechanical' },
  { itemNo: '100-AX3', description: 'Control Board', productCategory: 'Generator', purchasingCategory: 'Electrical' },
  { itemNo: '200-BX1', description: 'Housing Shell', productCategory: 'Compressor', purchasingCategory: 'Fabrication' },
  { itemNo: '200-BX2', description: 'Rotor Set', productCategory: 'Compressor', purchasingCategory: 'Mechanical' },
  { itemNo: '200-BX3', description: 'Sensor Harness', productCategory: 'Compressor', purchasingCategory: 'Electrical' },
  { itemNo: '300-CX1', description: 'Tank Body', productCategory: 'Pump', purchasingCategory: 'Fabrication' },
  { itemNo: '300-CX2', description: 'Impeller', productCategory: 'Pump', purchasingCategory: 'Mechanical' },
  { itemNo: '300-CX3', description: 'Drive Module', productCategory: 'Pump', purchasingCategory: 'Electrical' }
];

const state = {
  selectedProductCategory: null,
  selectedPurchasing: new Set(),
  bom: new Map(),
  mappings: []
};

const productCategories = [...new Set(dummyData.map(d => d.productCategory))];
const purchasingCategories = [...new Set(dummyData.map(d => d.purchasingCategory))];

const productCategoryButtons = document.getElementById('productCategoryButtons');
const purchasingFilters = document.getElementById('purchasingFilters');
const itemCloud = document.getElementById('itemCloud');
const selectedCategoryBadge = document.getElementById('selectedCategoryBadge');
const bomDropZone = document.getElementById('bomDropZone');
const bomRows = document.getElementById('bomRows');
const drawingUpload = document.getElementById('drawingUpload');
const drawingImage = document.getElementById('drawingImage');
const drawingOverlay = document.getElementById('drawingOverlay');
const bomItemSelector = document.getElementById('bomItemSelector');
const mappingList = document.getElementById('mappingList');

function renderCategoryButtons() {
  productCategoryButtons.innerHTML = '';
  productCategories.forEach(cat => {
    const btn = document.createElement('button');
    btn.textContent = cat;
    btn.className = state.selectedProductCategory === cat ? 'active' : '';
    btn.onclick = () => {
      state.selectedProductCategory = cat;
      state.selectedPurchasing = new Set(purchasingCategories);
      renderAll();
    };
    productCategoryButtons.appendChild(btn);
  });
}

function renderPurchasingFilters() {
  purchasingFilters.innerHTML = '';
  purchasingCategories.forEach(cat => {
    const id = `pc-${cat}`;
    const label = document.createElement('label');
    label.innerHTML = `<input type="checkbox" id="${id}" ${state.selectedPurchasing.has(cat) ? 'checked' : ''} ${state.selectedProductCategory ? '' : 'disabled'} /> ${cat}`;
    label.querySelector('input').addEventListener('change', (e) => {
      e.target.checked ? state.selectedPurchasing.add(cat) : state.selectedPurchasing.delete(cat);
      renderItemNodes();
    });
    purchasingFilters.appendChild(label);
  });
}

function nodeVisible(item) {
  if (!state.selectedProductCategory) return true;
  return item.productCategory === state.selectedProductCategory && state.selectedPurchasing.has(item.purchasingCategory);
}

function renderItemNodes() {
  itemCloud.innerHTML = '';
  dummyData.forEach((item, idx) => {
    const node = document.createElement('div');
    node.className = `item-node ${nodeVisible(item) ? '' : 'hidden-item'}`;
    node.textContent = item.itemNo;
    node.style.left = `${(idx * 17) % 90 + 5}%`;
    node.style.top = `${(idx * 23) % 80 + 5}%`;
    node.style.transform = state.selectedProductCategory
      ? 'translate3d(0,0,0)'
      : `translate3d(${Math.sin(Date.now()/400 + idx) * 10}px, ${Math.cos(Date.now()/500 + idx) * 8}px, 0) scale(${0.9 + (idx % 4)/10})`;
    node.draggable = nodeVisible(item);
    node.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', item.itemNo);
    });
    node.title = `${item.itemNo} - ${item.description}`;
    itemCloud.appendChild(node);
  });

  if (!state.selectedProductCategory) {
    requestAnimationFrame(renderItemNodes);
  }
}

function getItem(itemNo) { return dummyData.find(d => d.itemNo === itemNo); }

function renderBom() {
  bomRows.innerHTML = '';
  const options = ['<option value="">Select BOM item to map</option>'];
  [...state.bom.values()].forEach((entry) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${entry.item.itemNo}</td>
      <td>${entry.item.description}</td>
      <td><input type="number" min="1" value="${entry.qty}" data-item="${entry.item.itemNo}" class="qty-input" /></td>
      <td><button data-remove="${entry.item.itemNo}">Remove</button></td>
    `;
    bomRows.appendChild(tr);
    options.push(`<option value="${entry.item.itemNo}">${entry.item.itemNo}</option>`);
  });
  bomItemSelector.innerHTML = options.join('');

  bomRows.querySelectorAll('.qty-input').forEach((input) => {
    input.addEventListener('change', (e) => {
      const entry = state.bom.get(e.target.dataset.item);
      entry.qty = Number(e.target.value) || 1;
    });
  });
  bomRows.querySelectorAll('button[data-remove]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.bom.delete(btn.dataset.remove);
      renderBom();
      renderMappings();
    });
  });
}

function renderMappings() {
  drawingOverlay.innerHTML = '';
  mappingList.innerHTML = '';
  state.mappings.forEach((m) => {
    if (!state.bom.has(m.itemNo)) return;
    const pin = document.createElement('div');
    pin.className = 'map-pin';
    pin.style.left = `${m.x}%`;
    pin.style.top = `${m.y}%`;
    pin.textContent = m.itemNo;
    drawingOverlay.appendChild(pin);

    const li = document.createElement('li');
    li.textContent = `${m.itemNo} mapped at (${m.x.toFixed(1)}%, ${m.y.toFixed(1)}%)`;
    mappingList.appendChild(li);
  });
}

bomDropZone.addEventListener('dragover', (e) => { e.preventDefault(); bomDropZone.classList.add('over'); });
bomDropZone.addEventListener('dragleave', () => bomDropZone.classList.remove('over'));
bomDropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  bomDropZone.classList.remove('over');
  const itemNo = e.dataTransfer.getData('text/plain');
  const item = getItem(itemNo);
  if (!item || !nodeVisible(item)) return;
  if (!state.bom.has(itemNo)) {
    state.bom.set(itemNo, { item, qty: 1 });
  }
  renderBom();
});

drawingUpload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  drawingImage.src = URL.createObjectURL(file);
  drawingImage.classList.remove('hidden');
});

drawingOverlay.addEventListener('click', (e) => {
  const itemNo = bomItemSelector.value;
  if (!itemNo) return;
  const rect = drawingOverlay.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top) / rect.height) * 100;
  state.mappings.push({ itemNo, x, y });
  renderMappings();
});

function renderBadge() {
  if (!state.selectedProductCategory) {
    selectedCategoryBadge.classList.add('hidden');
    return;
  }
  selectedCategoryBadge.textContent = `Building: ${state.selectedProductCategory}`;
  selectedCategoryBadge.classList.remove('hidden');
}

function renderAll() {
  renderCategoryButtons();
  renderPurchasingFilters();
  renderBadge();
  renderItemNodes();
  renderBom();
  renderMappings();
}

renderAll();
