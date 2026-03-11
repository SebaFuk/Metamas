/* ============================================================
   CATALOGO-DATA.JS — METAMAS
   Capa de datos del catálogo compartida entre admin y catálogo
   ============================================================ */

const CATALOGO_KEY = 'metamas_catalogo_v2';

const CATALOGO_DEFAULT = [
  {
    id: 'mesa-soldadura',
    name: 'Mesa de Soldadura Profesional',
    category: 'mesas',
    badge: 'Más vendida',
    shortDesc: 'Mesa resistente con superficie ranurada para trabajos de soldadura. Ideal para taller y uso doméstico.',
    price: 95000,
    images: ['assets/img/bases-metalicas.png', 'assets/img/productos_1.png', 'assets/img/productos_2.png'],
    longDesc: 'Mesa de soldadura fabricada en acero estructural de alta resistencia. La superficie ranurada permite fijar piezas con sargentos y escuadras. Diseñada para soportar el calor de la soldadura sin deformarse. Patas regulables en altura para nivelación perfecta.',
    specs: ['Superficie: 1200 x 600 mm (estándar)', 'Altura: 850 mm (regulable ±50mm)', 'Carga máxima: 500 kg', 'Material: Acero ST37', 'Espesor superficie: 10 mm', 'Tratamiento: Granallado + pintura epoxi'],
    videoUrl: '',
    visible: true
  },
  {
    id: 'banqueta-industrial',
    name: 'Banqueta Industrial Giratoria',
    category: 'asientos',
    badge: 'Nuevo',
    shortDesc: 'Banqueta robusta de acero con asiento giratorio. Para taller, mostrador y uso industrial general.',
    price: 42000,
    images: ['assets/img/soportes-para-cadenas.png', 'assets/img/productos_1.png'],
    longDesc: 'Banqueta industrial con base de acero de alta resistencia y asiento giratorio 360°. Regulable en altura mediante sistema de rosca. Base hexagonal antivuelco con pies de goma antideslizante.',
    specs: ['Altura asiento: 550–750 mm regulable', 'Diámetro base: 350 mm', 'Carga máxima: 180 kg', 'Rotación: 360° continua', 'Material estructura: Acero ST37', 'Acabado: Pintura epoxi negra'],
    videoUrl: '',
    visible: true
  },
  {
    id: 'mesa-trabajo-cajones',
    name: 'Mesa de Trabajo con Cajones',
    category: 'mesas',
    badge: '',
    shortDesc: 'Banco de trabajo completo con cajones metálicos deslizantes. Organización y robustez para el taller.',
    price: 128000,
    images: ['assets/img/bases-metalicas.png', 'assets/img/productos_2.png'],
    longDesc: 'Mesa de trabajo todo en uno con 3 cajones metálicos con guías de rodamientos. Superficie de MDF con reborde metálico protector. Estructura de acero cuadrado soldada para máxima rigidez.',
    specs: ['Dimensiones: 1500 x 600 x 900 mm', 'Cajones: 3 unidades (380 x 500 x 120 mm)', 'Capacidad cajón: 30 kg c/u', 'Material: Acero 1"x1" + MDF 25mm', 'Guías: Rodamientos telescópicos', 'Acabado: Pintura epoxi gris'],
    videoUrl: '',
    visible: true
  },
  {
    id: 'soporte-multiusos',
    name: 'Soporte Metálico Multiusos',
    category: 'soportes',
    badge: '',
    shortDesc: 'Soporte versátil para equipos, monitores, herramientas o accesorios. Regulable en altura y ángulo.',
    price: 35000,
    images: ['assets/img/soportes-para-cadenas.png'],
    longDesc: 'Soporte metálico de acero con múltiples regulaciones. Perfecto para montar equipos de medición, monitores, lámparas de taller o cualquier accesorio. Base con tornillos de fijación a mesa.',
    specs: ['Altura total: 300–600 mm', 'Cabezal articulado: 180°', 'Base: 150 x 150 mm', 'Capacidad: hasta 15 kg', 'Material: Acero 25 x 25 mm', 'Acabado: Cromado / Negro'],
    videoUrl: '',
    visible: true
  },
  {
    id: 'estante-modular',
    name: 'Estante Industrial Modular',
    category: 'almacenaje',
    badge: '',
    shortDesc: 'Sistema de estanterías metálicas resistentes. Configuración modular para garage, depósito y taller.',
    price: 68000,
    images: ['assets/img/bases-metalicas.png', 'assets/img/productos_1.png'],
    longDesc: 'Estantería industrial de acero de alta resistencia con sistema de encastre sin tornillos. Estantes regulables cada 50 mm. Ideal para organizar herramientas, insumos y piezas.',
    specs: ['Alto: 1980 mm', 'Ancho: 900 mm', 'Profundidad: 400 mm', 'Estantes: 5 niveles ajustables', 'Carga por estante: 120 kg', 'Material: Acero galvanizado'],
    videoUrl: '',
    visible: true
  },
  {
    id: 'caballete-metalico',
    name: 'Caballete Metálico de Corte',
    category: 'soportes',
    badge: '',
    shortDesc: 'Caballete resistente para corte de madera, metal y materiales de construcción. Fácil plegado.',
    price: 28000,
    images: ['assets/img/soportes-para-cadenas.png'],
    longDesc: 'Caballete de acero plegable, ideal para trabajos de corte y apoyo de materiales. Diseño en X con refuerzo central. Altura estándar 90 cm. Se vende en pares.',
    specs: ['Altura: 900 mm', 'Apertura máxima: 600 mm', 'Carga máxima: 300 kg (par)', 'Material: Ángulo 30x30x3 mm', 'Plegado: sí, con pasador', 'Precio: por unidad'],
    videoUrl: '',
    visible: true
  },
  {
    id: 'porta-herramientas',
    name: 'Porta Herramientas de Pared',
    category: 'almacenaje',
    badge: '',
    shortDesc: 'Panel organizador de herramientas para montaje en pared. Ganchos y soportes incluidos.',
    price: 22000,
    images: ['assets/img/bases-metalicas.png'],
    longDesc: 'Panel de acero perforado para organizar herramientas en la pared del taller. Incluye set de 20 ganchos y soportes de distintos tamaños. Fácil instalación con 4 tornillos.',
    specs: ['Dimensiones: 600 x 900 mm', 'Perforación: Ø 6 mm (paso 50mm)', 'Espesor chapa: 1.5 mm', 'Ganchos incluidos: 20 piezas', 'Material: PPGI (pre-pintado)', 'Color: Negro mate'],
    videoUrl: '',
    visible: true
  },
  {
    id: 'mesa-ajustable',
    name: 'Mesa Ajustable para Taller',
    category: 'mesas',
    badge: 'Premium',
    shortDesc: 'Mesa de altura regulable. Postura ergonómica para trabajo en taller y oficina técnica.',
    price: 185000,
    images: ['assets/img/bases-metalicas.png', 'assets/img/productos_1.png', 'assets/img/productos_2.png'],
    longDesc: 'Mesa con patas ajustables en altura mediante actuadores eléctricos. Memoria de 4 posiciones. Superficie de acero con terminación antirrayado. Control digital con display.',
    specs: ['Rango de altura: 650–1280 mm', 'Superficie: 1400 x 700 mm acero 3mm', 'Velocidad ajuste: 38 mm/s', 'Carga máxima: 120 kg', 'Memorias: 4 posiciones', 'Motor: dual 24V'],
    videoUrl: '',
    visible: true
  }
];

window.MetamasCatalogo = {
  getCatalogo() {
    try {
      const raw = localStorage.getItem(CATALOGO_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return CATALOGO_DEFAULT.map(p => ({ ...p }));
  },

  saveCatalogo(lista) {
    try {
      localStorage.setItem(CATALOGO_KEY, JSON.stringify(lista));
      return true;
    } catch (e) { return false; }
  },

  resetCatalogo() {
    localStorage.removeItem(CATALOGO_KEY);
    return CATALOGO_DEFAULT.map(p => ({ ...p }));
  },

  formatPrecio(n) {
    if (!n || n === 0) return 'Consultar';
    return '$' + Number(n).toLocaleString('es-AR');
  },

  generarId(nombre) {
    return nombre
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      + '-' + Date.now().toString(36);
  },

  getCategorias() {
    return ['mesas', 'asientos', 'soportes', 'almacenaje'];
  }
};
