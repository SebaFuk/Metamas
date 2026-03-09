/* ============================================================
   CARRITO COMPARTIDO — METAMAS
   Funciona en Productos y Catálogo
   ============================================================ */
(function(){
  const WA_NUMBER = '5493413667500';
  const STORAGE_KEY = 'metamas_carrito';

  /* ---- Estado ---- */
  let cart = loadCart();

  function loadCart(){
    try{ return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch(e){ return []; }
  }
  function saveCart(){
    try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); }
    catch(e){}
  }
  function getTotal(){
    return cart.reduce((s,i) => s + (i.price||0)*i.qty, 0);
  }
  function formatPrice(n){
    if(!n) return 'A cotizar';
    return '$' + n.toLocaleString('es-AR');
  }

  /* ---- Agregar al carrito ---- */
  window.metamasAgregarCarrito = function(item){
    // item: {id, name, price, img, section, qty}
    const existing = cart.find(c => c.id === item.id);
    if(existing){
      existing.qty += (item.qty || 1);
    } else {
      cart.push({ id:item.id, name:item.name, price:item.price||0, img:item.img||'', section:item.section||'', qty:item.qty||1 });
    }
    saveCart();
    updateBadge();
    renderCarrito();
    showToast(item.name);
  };

  /* ---- Toast ---- */
  function showToast(name){
    let t = document.getElementById('metamas-toast');
    if(!t){
      t = document.createElement('div');
      t.id = 'metamas-toast';
      t.className = 'toast-added';
      t.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 13l4 4L19 7"/></svg> <span></span>';
      document.body.appendChild(t);
    }
    t.querySelector('span').textContent = 'Agregado: ' + name;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('show'), 2500);
  }

  /* ---- Badge ---- */
  function updateBadge(){
    const total = cart.reduce((s,i) => s + i.qty, 0);
    document.querySelectorAll('.cart-badge').forEach(b => {
      b.textContent = total;
      b.classList.toggle('visible', total > 0);
    });
  }

  /* ---- Abrir/Cerrar carrito ---- */
  function openCarrito(){
    const overlay = document.getElementById('carrito-overlay');
    const panel = document.getElementById('carrito-panel');
    if(overlay) overlay.classList.add('open');
    if(panel) panel.classList.add('open');
    document.body.style.overflow = 'hidden';
    renderCarrito();
  }
  function closeCarrito(){
    const overlay = document.getElementById('carrito-overlay');
    const panel = document.getElementById('carrito-panel');
    if(overlay) overlay.classList.remove('open');
    if(panel) panel.classList.remove('open');
    document.body.style.overflow = '';
  }
  window.metamasOpenCarrito = openCarrito;
  window.metamasCloseCarrito = closeCarrito;

  /* ---- Render items ---- */
  function renderCarrito(){
    const container = document.getElementById('carrito-items');
    if(!container) return;

    if(cart.length === 0){
      container.innerHTML = `
        <div class="carrito-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          <span>Tu carrito está vacío</span>
        </div>`;
      updateTotal();
      return;
    }

    container.innerHTML = cart.map((item,idx) => `
      <div class="carrito-item" data-idx="${idx}">
        <div class="carrito-item-img">
          ${item.img ? `<img src="${item.img}" alt="${item.name}" loading="lazy">` : ''}
        </div>
        <div class="carrito-item-info">
          <div class="carrito-item-name">${item.name}</div>
          <div class="carrito-item-price">${formatPrice(item.price * item.qty)}</div>
          <div class="carrito-item-section">${item.section}</div>
          <div class="carrito-item-ctrl">
            <button class="qty-minus" data-idx="${idx}">−</button>
            <span class="qty">${item.qty}</span>
            <button class="qty-plus" data-idx="${idx}">+</button>
            <button class="carrito-item-del" data-idx="${idx}" title="Eliminar">×</button>
          </div>
        </div>
      </div>
    `).join('');

    updateTotal();

    container.querySelectorAll('.qty-minus').forEach(btn => {
      btn.addEventListener('click', () => { changeQty(+btn.dataset.idx, -1); });
    });
    container.querySelectorAll('.qty-plus').forEach(btn => {
      btn.addEventListener('click', () => { changeQty(+btn.dataset.idx, 1); });
    });
    container.querySelectorAll('.carrito-item-del').forEach(btn => {
      btn.addEventListener('click', () => { removeItem(+btn.dataset.idx); });
    });
  }

  function changeQty(idx, delta){
    cart[idx].qty = Math.max(1, cart[idx].qty + delta);
    saveCart(); updateBadge(); renderCarrito();
  }
  function removeItem(idx){
    cart.splice(idx, 1);
    saveCart(); updateBadge(); renderCarrito();
  }

  function updateTotal(){
    const totalEl = document.getElementById('carrito-total-price');
    if(totalEl){
      const t = getTotal();
      totalEl.textContent = t > 0 ? formatPrice(t) : 'A cotizar';
    }
  }

  /* ---- Mensaje WhatsApp ---- */
  function buildWAMessage(){
    if(cart.length === 0) return '';
    let msg = '¡Hola Metamas! Quisiera solicitar cotización de los siguientes productos:\n\n';
    cart.forEach((item,i) => {
      msg += `${i+1}. *${item.name}*\n`;
      msg += `   Cantidad: ${item.qty}\n`;
      if(item.price) msg += `   Precio unitario: ${formatPrice(item.price)}\n`;
      if(item.section) msg += `   Sección: ${item.section}\n`;
      msg += '\n';
    });
    const total = getTotal();
    if(total > 0){
      msg += `*Total estimado: ${formatPrice(total)}*\n`;
    }
    msg += '\nPor favor confirmen disponibilidad y condiciones de entrega. ¡Gracias!';
    return msg;
  }

  window.metamasCheckout = function(){
    if(cart.length === 0){ alert('Tu carrito está vacío'); return; }
    const msg = buildWAMessage();
    const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  window.metamasLimpiarCarrito = function(){
    if(confirm('¿Vaciar el carrito?')){ cart=[]; saveCart(); updateBadge(); renderCarrito(); }
  };

  /* ---- Init al cargar el DOM ---- */
  function init(){
    /* Overlay click */
    const overlay = document.getElementById('carrito-overlay');
    if(overlay) overlay.addEventListener('click', closeCarrito);

    /* Botón cerrar */
    const closeBtn = document.getElementById('carrito-close');
    if(closeBtn) closeBtn.addEventListener('click', closeCarrito);

    /* Botones abrir carrito */
    document.querySelectorAll('[data-open-cart]').forEach(btn => {
      btn.addEventListener('click', e => { e.preventDefault(); openCarrito(); });
    });

    /* Checkout WA */
    const checkoutBtn = document.getElementById('carrito-checkout');
    if(checkoutBtn) checkoutBtn.addEventListener('click', window.metamasCheckout);

    /* Clear */
    const clearBtn = document.getElementById('carrito-clear');
    if(clearBtn) clearBtn.addEventListener('click', window.metamasLimpiarCarrito);

    updateBadge();
    renderCarrito();
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
