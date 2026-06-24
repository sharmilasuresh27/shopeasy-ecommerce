const API = '/api';
<img src="${p.image}" class="prod-img" alt="${p.name}"></img>


/* ── Auth ── */
const getToken  = () => localStorage.getItem('token');
const getUserName = () => localStorage.getItem('userName');
const isLoggedIn  = () => !!getToken();
const authHeaders = () => ({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getToken() });

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('userName');
  window.location.href = 'login.html';
}

/* ── Cart ── */
function getCart()  { return JSON.parse(localStorage.getItem('cart') || '[]'); }
function saveCart(c){ localStorage.setItem('cart', JSON.stringify(c)); updateCartBadge(); }

function addToCart(id, name, price) {
  const cart = getCart();
  const ex = cart.find(i => i.id === id);
  if (ex) ex.qty++;
  else cart.push({ id, name, price, qty: 1 });
  saveCart(cart);
  showToast('🛒 Added: ' + name);
}

function updateCartBadge() {
  const el = document.getElementById('cart-count');
  if (!el) return;
  const n = getCart().reduce((s, i) => s + i.qty, 0);
  el.textContent = n;
}

/* ── Nav ── */
function renderNav() {
  const el = document.getElementById('nav-user');
  if (!el) return;
  if (isLoggedIn()) {
    el.innerHTML = `
      <span class="user-pill">👤 ${getUserName()}</span>
      <a href="orders.html">Orders</a>
      <a href="#" onclick="logout()">Logout</a>`;
  } else {
    el.innerHTML = `<a href="login.html">Login</a><a href="register.html">Register</a>`;
  }
}

/* ── Toast ── */
function showToast(msg, ms = 2800) {
  const t = document.createElement('div');
  t.className = 'toast'; t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; setTimeout(() => t.remove(), 300); }, ms);
}

/* ── Loader ── */
function loader() { return `<div class="loader"><span></span><span></span><span></span></div>`; }

document.addEventListener('DOMContentLoaded', () => { renderNav(); updateCartBadge(); });
