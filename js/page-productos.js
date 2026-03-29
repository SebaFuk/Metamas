/* ── Sanitizador XSS — datos de Supabase ── */
function escXSS(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}

/* Page logic for productos.html — extracted from inline script */
/* ── Carga productos desde Supabase con tiempo real ── */
(async function(){
  function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}

  function renderProductos(data){
    const productos = (data||[]).filter(p => p.visible !== false);
    window._productosMap = {};
    productos.forEach(p => { window._productosMap[p.id] = p; });

    const grid = document.getElementById('listado');
    const detalleEl = document.getElementById('producto-detalle-dinamico');

    grid.innerHTML = productos.map(p => `
    <a class="work-card work-card--clickable" data-product="${p.id}" href="#producto-${p.id}" role="button" tabindex="0">
      <div class="work-media">
        ${p.imagen ? `<img alt="${esc(p.nombre)}" src="${esc(p.imagen)}" loading="lazy" onerror="this.style.display='none'"/>` : '<div style="height:140px;display:flex;align-items:center;justify-content:center;opacity:.3;font-size:40px">\u{1F4E6}</div>'}
      </div>
      <div class="work-title">${esc(p.nombre)}</div>
      ${p.precio > 0 ? `<div style="font-size:12px;font-weight:600;color:var(--primary);padding:0 16px 12px">$${Number(p.precio).toLocaleString('es-AR')}</div>` : ''}
    </a>
  `).join('');

    detalleEl.innerHTML = productos.map(p => `
    <article id="producto-${p.id}" class="product-detail-card">
      <div class="product-detail-grid">
        ${p.imagen ? `<img class="product-detail-img" src="${esc(p.imagen)}" alt="${esc(p.nombre)}" loading="lazy"/>` : '<div class="product-detail-img" style="background:#eee;display:flex;align-items:center;justify-content:center;font-size:48px">\u{1F4E6}</div>'}
        <div>
          <h3>${esc(p.nombre)}</h3>
          ${p.seccion ? `<p style="font-size:12px;font-weight:600;color:var(--primary);margin-bottom:8px;text-transform:uppercase;letter-spacing:.5px">${esc(p.seccion)}</p>` : ''}
          ${p.precio > 0 ? `<p style="font-size:18px;font-weight:700;color:var(--primary);margin-bottom:12px">$${Number(p.precio).toLocaleString('es-AR')}</p>` : '<p style="font-size:14px;color:var(--gray);margin-bottom:12px">Precio: A cotizar</p>'}
          ${p.descripcion ? `<p>${esc(p.descripcion)}</p>` : ''}
          ${p.proceso && p.proceso.length ? `<h4>Proceso típico</h4><ul>${p.proceso.map(s=>`<li>${esc(s)}</li>`).join('')}</ul>` : ''}
          <div class="product-detail-actions">
            <button class="btn primary" onclick="agregarAlCarrito('${p.id}')">\u{1F6D2} Agregar al carrito</button>
            <a class="btn primary" href="contacto.html">Contactanos</a>
            <a class="btn" href="#listado">Volver al listado</a>
          </div>
        </div>
      </div>
    </article>
  `).join('');
  }

  // Carga inicial
  let productos;
  try {
    if (window.MetamasDB) {
      productos = await window.MetamasDB.getData('productos');
    }
  } catch(e) {}
  if (!productos || !productos.length) {
    productos = window.MetamasData ? window.MetamasData.getProductos() : [];
  }
  renderProductos(productos);

  window.agregarAlCarrito = function(id){
    const p = window._productosMap[id];
    if(!p || !window.metamasAgregarCarrito) return;
    window.metamasAgregarCarrito({id:p.id,name:p.nombre,price:p.precio||0,img:p.imagen,section:p.seccion||'',qty:1});
  };

  // ── Tiempo real: actualiza sin recargar si el admin hace cambios ──
  if(window.MetamasDB){
    window.MetamasDB.subscribe('productos', function(newData){
      if(Array.isArray(newData) && newData.length) renderProductos(newData);
    });
  }
})();
