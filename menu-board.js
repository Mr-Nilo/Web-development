// ── STATE ──────────────────────────────────────────────────────────────────
let items = JSON.parse(localStorage.getItem('menuItems') || '[]');
let restaurantName = localStorage.getItem('restaurantName') || 'The Daily Board';

// ── BOOT ───────────────────────────────────────────────────────────────────
(function init() {
  const d = new Date();
  document.getElementById('board-date').textContent = d.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  applyRestaurantName();
  document.getElementById('rname-input').value = restaurantName;
  renderBoard();
  renderAdminList();
})();

// ── RENDER: BOARD ──────────────────────────────────────────────────────────
function renderBoard() {
  const grid = document.getElementById('menu-grid');
  if (!items.length) {
    grid.innerHTML = '<div class="empty-state">Today\'s menu is coming soon.<br>Check back in a moment.</div>';
    return;
  }
  grid.innerHTML = items.map(item => `
    <div class="menu-item">
      <div class="item-left">
        <div class="item-name">${esc(item.name)}</div>
        ${item.desc ? `<div class="item-desc">${esc(item.desc)}</div>` : ''}
      </div>
      <div class="item-price">${esc(item.price)}</div>
    </div>
  `).join('');
}

// ── RENDER: ADMIN LIST ─────────────────────────────────────────────────────
function renderAdminList() {
  const list = document.getElementById('admin-item-list');
  if (!items.length) {
    list.innerHTML = '<p class="no-items-msg">No items yet — add one above.</p>';
    return;
  }
  list.innerHTML = items.map((item, i) => `
    <div class="admin-item">
      <div class="admin-item-row">
        <div class="admin-item-name">${esc(item.name)}</div>
        <div class="admin-item-price">${esc(item.price)}</div>
      </div>
      ${item.desc ? `<div class="admin-item-desc">${esc(item.desc)}</div>` : ''}
      <div class="admin-item-btns">
        <button class="btn btn-ghost btn-sm" onclick="editItem(${i})">Edit</button>
        <button class="btn btn-red btn-sm"   onclick="deleteItem(${i})">Delete</button>
      </div>
    </div>
  `).join('');
}

// ── PERSIST ────────────────────────────────────────────────────────────────
function save() {
  localStorage.setItem('menuItems', JSON.stringify(items));
}

// ── ADD / EDIT ITEM ────────────────────────────────────────────────────────
function saveItem(e) {
  e.preventDefault();
  const name  = document.getElementById('f-name').value.trim();
  const price = document.getElementById('f-price').value.trim();
  const desc  = document.getElementById('f-desc').value.trim();
  const idx   = document.getElementById('edit-idx').value;

  if (!name || !price) {
    alert('Please fill in the item name and price.');
    return;
  }

  if (idx !== '') {
    items[parseInt(idx, 10)] = { name, price, desc };
    cancelEdit();
  } else {
    items.push({ name, price, desc });
    document.getElementById('item-form').reset();
    document.getElementById('f-name').focus();
  }

  save();
  renderBoard();
  renderAdminList();
}

function editItem(i) {
  const item = items[i];
  document.getElementById('edit-idx').value   = i;
  document.getElementById('f-name').value     = item.name;
  document.getElementById('f-price').value    = item.price;
  document.getElementById('f-desc').value     = item.desc || '';
  document.getElementById('submit-btn').textContent = 'Save Changes';
  document.getElementById('cancel-btn').style.display = 'block';
  document.getElementById('item-form').classList.add('editing');
  document.getElementById('form-section-label').textContent = 'Edit Item';
  document.getElementById('f-name').focus();
  document.getElementById('item-form').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function cancelEdit() {
  document.getElementById('edit-idx').value = '';
  document.getElementById('item-form').reset();
  document.getElementById('submit-btn').textContent = '+ Add to Menu';
  document.getElementById('cancel-btn').style.display = 'none';
  document.getElementById('item-form').classList.remove('editing');
  document.getElementById('form-section-label').textContent = 'Add Menu Item';
}

function deleteItem(i) {
  if (!confirm(`Remove "${items[i].name}" from the menu?`)) return;
  const editingIdx = document.getElementById('edit-idx').value;
  if (editingIdx !== '' && parseInt(editingIdx, 10) === i) cancelEdit();
  items.splice(i, 1);
  save();
  renderBoard();
  renderAdminList();
}

function clearAll() {
  if (!items.length) return;
  if (!confirm('This will clear all items from today\'s menu. Continue?')) return;
  items = [];
  save();
  cancelEdit();
  renderBoard();
  renderAdminList();
}

// ── RESTAURANT NAME ────────────────────────────────────────────────────────
function applyRestaurantName() {
  document.getElementById('restaurant-name').textContent = restaurantName;
  document.title = restaurantName + ' — Menu';
}

function saveRestaurantName() {
  const val = document.getElementById('rname-input').value.trim();
  restaurantName = val || 'The Daily Board';
  localStorage.setItem('restaurantName', restaurantName);
  applyRestaurantName();
}

// ── ADMIN PANEL ────────────────────────────────────────────────────────────
function openAdmin() {
  document.getElementById('admin-panel').classList.add('open');
  document.getElementById('overlay').classList.add('open');
  document.getElementById('admin-toggle').style.display = 'none';
}

function closeAdmin() {
  document.getElementById('admin-panel').classList.remove('open');
  document.getElementById('overlay').classList.remove('open');
  document.getElementById('admin-toggle').style.display = '';
}

// ── UTIL ───────────────────────────────────────────────────────────────────
function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
