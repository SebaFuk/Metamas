/* ── Sanitizador XSS — datos de Supabase ── */
function escXSS(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}

/* Page logic for catalogo.html — extracted from inline script */
/* ============================================================
   DATOS DEL CATÁLOGO — cargados desde MetamasCatalogo
   ============================================================ */
const CATALOG_PRODUCTS = window.MetamasCatalogo
  ? window.MetamasCatalogo.getCatalogo().filter(p => p.visible !== false)
  : [];

/* Datos hardcodeados de respaldo por si no carga el script */
const CATALOG_PRODUCTS_FALLBACK = [
  {
    id: 'mesa-soldadura',
    name: 'Mesa de Soldadura Profesional',
    category: 'mesas',
    badge: 'Más vendida',
    shortDesc: 'Mesa resistente con superficie ranurada para trabajos de soldadura. Ideal para taller y uso doméstico.',
    price: 95000,
    images: ['assets/img/bases-metalicas.png', 'assets/img/productos_1.png', 'assets/img/productos_2.png'],
    longDesc: 'Mesa de soldadura fabricada en acero estructural de alta resistencia. La superficie ranurada permite fijar piezas con sargentos y escuadras. Diseñada para soportar el calor de la soldadura sin deformarse. Patas regulables en altura para nivelación perfecta.',
    specs: [
      'Superficie: 1200 x 600 mm (estándar)',
      'Altura: 850 mm (regulable ±50mm)',
      'Carga máxima: 500 kg',
      'Material: Acero ST37',
      'Espesor superficie: 10 mm',
      'Tratamiento: Granallado + pintura epoxi',
    ],
    videoUrl: '',
  },
  {
    id: 'banqueta-industrial',
    name: 'Banqueta Industrial Giratoria',
    category: 'asientos',
    badge: 'Nuevo',
    shortDesc: 'Banqueta robusta de acero con asiento giratorio. Para taller, mostrador y uso industrial general.',
    price: 42000,
    images: ['assets/img/soportes-para-cadenas.png', 'assets/img/productos_1.png'],
    longDesc: 'Banqueta industrial con base de acero de alta resistencia y asiento giratorio 360°. El asiento está regulable en altura mediante sistema de rosca. Base hexagonal antivuelco con pies de goma antideslizante.',
    specs: [
      'Altura asiento: 550–750 mm regulable',
      'Diámetro base: 350 mm',
      'Carga máxima: 180 kg',
      'Rotación: 360° continua',
      'Material estructura: Acero ST37',
      'Acabado: Pintura epoxi negra',
    ],
    videoUrl: '',
  },
  {
    id: 'mesa-trabajo-cajones',
    name: 'Mesa de Trabajo con Cajones',
    category: 'mesas',
    badge: '',
    shortDesc: 'Banco de trabajo completo con cajones metálicos deslizantes. Organización y robustez para el taller.',
    price: 128000,
    images: ['assets/img/bases-metalicas.png', 'assets/img/productos_2.png'],
    longDesc: 'Mesa de trabajo todo en uno con 3 cajones metálicos con guías de rodamientos. Superficie de MDF con reborde metálico protector. Estructura de acero cuadrado soldada para máxima rigidez. Ideal para taller, garage y uso industrial liviano.',
    specs: [
      'Dimensiones: 1500 x 600 x 900 mm',
      'Cajones: 3 unidades (380 x 500 x 120 mm)',
      'Capacidad cajón: 30 kg c/u',
      'Material: Acero 1"x1" + MDF 25mm',
      'Guías: Rodamientos telescópicos',
      'Acabado: Pintura epoxi gris',
    ],
    videoUrl: '',
  },
  {
    id: 'soporte-multiusos',
    name: 'Soporte Metálico Multiusos',
    category: 'soportes',
    badge: '',
    shortDesc: 'Soporte versátil para equipos, monitores, herramientas o accesorios. Regulable en altura y ángulo.',
    price: 35000,
    images: ['assets/img/soportes-para-cadenas.png'],
    longDesc: 'Soporte metálico de acero con múltiples regulaciones. Perfecto para montar equipos de medición, monitores, lámparas de taller o cualquier accesorio que necesite altura y posición precisa. Base con tornillos de fijación a mesa.',
    specs: [
      'Altura total: 300–600 mm',
      'Cabezal articulado: 180°',
      'Base: 150 x 150 mm',
      'Capacidad: hasta 15 kg',
      'Material: Acero 25 x 25 mm',
      'Acabado: Cromado / Negro',
    ],
    videoUrl: '',
  },
  {
    id: 'estante-modular',
    name: 'Estante Industrial Modular',
    category: 'almacenaje',
    badge: '',
    shortDesc: 'Sistema de estanterías metálicas resistentes. Configuración modular para garage, depósito y taller.',
    price: 68000,
    images: ['assets/img/bases-metalicas.png', 'assets/img/productos_1.png'],
    longDesc: 'Estantería industrial de acero de alta resistencia con sistema de encastre sin tornillos. Los estantes son regulables cada 50 mm. Ideal para organizar herramientas, insumos y piezas en taller, garage o depósito.',
    specs: [
      'Alto: 1980 mm',
      'Ancho: 900 mm',
      'Profundidad: 400 mm',
      'Estantes: 5 niveles ajustables',
      'Carga por estante: 120 kg',
      'Material: Acero galvanizado',
    ],
    videoUrl: '',
  },
  {
    id: 'caballete-metalico',
    name: 'Caballete Metálico de Corte',
    category: 'soportes',
    badge: '',
    shortDesc: 'Caballete resistente para corte de madera, metal y materiales de construcción. Fácil plegado.',
    price: 28000,
    images: ['assets/img/soportes-para-cadenas.png'],
    longDesc: 'Caballete de acero plegable, ideal para trabajos de corte y apoyo de materiales. Diseño en X con refuerzo central. Altura estándar 90 cm. Se vende en pares. Fácil almacenamiento gracias al plegado rápido.',
    specs: [
      'Altura: 900 mm',
      'Apertura máxima: 600 mm',
      'Carga máxima: 300 kg (par)',
      'Material: Ángulo 30x30x3 mm',
      'Plegado: sí, con pasador',
      'Precio: por unidad',
    ],
    videoUrl: '',
  },
  {
    id: 'porta-herramientas',
    name: 'Porta Herramientas de Pared',
    category: 'almacenaje',
    badge: '',
    shortDesc: 'Panel organizador de herramientas para montaje en pared. Ganchos y soportes incluidos.',
    price: 22000,
    images: ['assets/img/bases-metalicas.png'],
    longDesc: 'Panel de acero perforado para organizar herramientas en la pared del taller. Incluye set de 20 ganchos y soportes de distintos tamaños. Acabado en negro. Fácil instalación con 4 tornillos.',
    specs: [
      'Dimensiones: 600 x 900 mm',
      'Perforación: Ø 6 mm (paso 50mm)',
      'Espesor chapa: 1.5 mm',
      'Ganchos incluidos: 20 piezas',
      'Material: PPGI (pre-pintado)',
      'Color: Negro mate',
    ],
    videoUrl: '',
  },
  {
    id: 'mesa-ajustable',
    name: 'Mesa Ajustable para Taller',
    category: 'mesas',
    badge: 'Premium',
    shortDesc: 'Mesa de altura regulable eléctricamente. Postura ergonómica para trabajo en taller y oficina técnica.',
    price: 185000,
    images: ['assets/img/bases-metalicas.png', 'assets/img/productos_1.png', 'assets/img/productos_2.png'],
    longDesc: 'Mesa con patas ajustables en altura mediante actuadores eléctricos. Memoria de 4 posiciones. Superficie de acero con terminación antirrayado. Ideal para quien alterna trabajo sentado y de pie. Control digital con display.',
    specs: [
      'Rango de altura: 650–1280 mm',
      'Superficie: 1400 x 700 mm acero 3mm',
      'Velocidad ajuste: 38 mm/s',
      'Carga máxima: 120 kg',
      'Memorias: 4 posiciones',
      'Motor: dual 24V',
    ],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
];

/* Usar datos del admin si existen, si no usar los hardcodeados */
let PRODUCTOS_ACTIVOS = CATALOG_PRODUCTS_FALLBACK;

/* ============================================================
   RENDER GRID
   ============================================================ */
function formatP(n){ return n ? '$' + n.toLocaleString('es-AR') : 'Consultar'; }

function renderGrid(filter){
  const grid = document.getElementById('catalog-grid');
  const allProds = PRODUCTOS_ACTIVOS;
  const prods = filter === 'all' ? allProds : allProds.filter(p => p.category === filter);
  grid.innerHTML = prods.map(p => `
    <div class="catalog-card reveal" data-id="${p.id}">
      <div class="catalog-card-img">
        <img src="${escXSS(p.images[0])}" alt="${escXSS(p.name)}" loading="lazy">
        ${p.badge ? `<span class="catalog-badge">${p.badge}</span>` : ''}
      </div>
      <div class="catalog-card-body">
        <h3>${escXSS(p.name)}</h3>
        <p>${escXSS(p.shortDesc)}</p>
        <div class="catalog-card-footer">
          <div class="catalog-price">${escXSS(formatP(p.price))} <span>ARS</span></div>
          <button class="btn-view-detail" data-id="${p.id}">Ver detalle →</button>
        </div>
      </div>
    </div>
  `).join('');

  // Click to open detail
  grid.querySelectorAll('[data-id]').forEach(el => {
    el.addEventListener('click', (e) => {
      const id = el.dataset.id || e.target.closest('[data-id]')?.dataset?.id;
      if(id) openDetail(id);
    });
  });

  // Reveal animation
  requestAnimationFrame(() => {
    document.querySelectorAll('.reveal').forEach((el,i) => {
      setTimeout(() => el.classList.add('in'), i * 60);
    });
  });
}

/* ============================================================
   PRODUCT DETAIL
   ============================================================ */
let currentQty = 1;
let currentProductId = null;

function openDetail(id){
  const p = PRODUCTOS_ACTIVOS.find(x => x.id === id);
  if(!p) return;
  currentProductId = id;
  currentQty = 1;

  const inner = document.getElementById('catalog-detail-inner');
  inner.innerHTML = `
    <div class="catalog-detail-gallery-wrap">
      <div class="catalog-detail-main-img">
        <img src="${escXSS(p.images[0])}" alt="${escXSS(p.name)}" id="detail-main-img">
      </div>
      <div class="catalog-detail-thumbs">
        ${p.images.map((img,i) => `
          <div class="catalog-detail-thumb ${i===0?'active':''}" data-img="${img}">
            <img src="${escXSS(img)}" alt="${escXSS(p.name)} ${i+1}" loading="lazy">
          </div>
        `).join('')}
      </div>
    </div>

    <h2 class="catalog-detail-title">${escXSS(p.name)}</h2>
    <div class="catalog-detail-price">${escXSS(formatP(p.price))} <small style="font-size:13px;font-weight:500;color:var(--text-soft)">ARS</small></div>
    <p class="catalog-detail-desc">${escXSS(p.longDesc)}</p>

    ${p.specs.length ? `
    <div class="catalog-detail-specs">
      <h4>Especificaciones</h4>
      <ul>${p.specs.map(s=>`<li>${s}</li>`).join('')}</ul>
    </div>` : ''}

    ${p.videoUrl ? `
    <div class="catalog-detail-video">
      <iframe src="${p.videoUrl}" allowfullscreen title="Video ${p.name}"></iframe>
    </div>` : ''}

    <div class="catalog-detail-actions">
      <div class="qty-ctrl">
        <button id="qty-minus" aria-label="Reducir cantidad">−</button>
        <span class="qty-val" id="qty-val">1</span>
        <button id="qty-plus" aria-label="Aumentar cantidad">+</button>
      </div>
      <button class="btn-add-cart-lg" id="detail-add-cart">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
        Agregar al carrito
      </button>
      <a class="btn ghost" href="https://wa.me/5493412622980?text=${encodeURIComponent('Hola Metamas, quisiera info sobre: '+p.name)}" rel="noopener noreferrer" target="_blank">Consultar por WhatsApp</a>
    </div>
  `;

  // Thumbnails
  inner.querySelectorAll('.catalog-detail-thumb').forEach(thumb => {
    thumb.addEventListener('click', () => {
      inner.querySelectorAll('.catalog-detail-thumb').forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
      document.getElementById('detail-main-img').src = thumb.dataset.img;
    });
  });

  // Qty controls
  document.getElementById('qty-minus').addEventListener('click', () => {
    currentQty = Math.max(1, currentQty - 1);
    document.getElementById('qty-val').textContent = currentQty;
  });
  document.getElementById('qty-plus').addEventListener('click', () => {
    currentQty++;
    document.getElementById('qty-val').textContent = currentQty;
  });

  // Add to cart
  document.getElementById('detail-add-cart').addEventListener('click', () => {
    window.metamasAgregarCarrito({
      id: p.id,
      name: p.name,
      price: p.price,
      img: p.images[0],
      section: 'Catálogo',
      qty: currentQty,
    });
    closeDetail();
    setTimeout(() => window.metamasOpenCarrito(), 300);
  });

  // Open overlay
  document.getElementById('catalog-detail-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeDetail(){
  document.getElementById('catalog-detail-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

/* ============================================================
   INIT — espera Supabase antes de renderizar
   ============================================================ */
document.addEventListener('DOMContentLoaded', async () => {

  // 1. Cargar desde Supabase PRIMERO, antes de cualquier render
  try {
    if (window.MetamasDB) {
      const data = await window.MetamasDB.getData('catalogo');
      if (data && data.length) {
        PRODUCTOS_ACTIVOS = data.filter(p => p.visible !== false);
      }
    }
  } catch(e) {}

  // 2. Renderizar con los datos correctos de Supabase
  renderGrid('all');

  // Filters
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderGrid(btn.dataset.filter);
    });
  });

  // Close detail
  document.getElementById('catalog-detail-close').addEventListener('click', closeDetail);
  document.getElementById('catalog-detail-overlay').addEventListener('click', (e) => {
    if(e.target === document.getElementById('catalog-detail-overlay')) closeDetail();
  });

  // 3. Suscripcion tiempo real: si admin cambia algo, se actualiza sin recargar
  try {
    if (window.MetamasDB) {
      window.MetamasDB.subscribe('catalogo', (newData) => {
        if (!newData) return;
        PRODUCTOS_ACTIVOS = newData.filter(p => p.visible !== false);
        const f = document.querySelector('.filter-btn.active')?.dataset?.filter || 'all';
        renderGrid(f);
      });
    }
  } catch(e) {}
});
