/* ============================================================
   PRODUCTOS-DATA.JS — METAMAS
   Capa de datos compartida entre admin y páginas públicas
   ============================================================ */

const PRODUCTOS_KEY = 'metamas_productos_v2';

const PRODUCTOS_DEFAULT = [
  {
    id: 'rolos',
    nombre: 'Rolos para industria alimenticia',
    descripcion: 'Piezas de precisión con terminación controlada para equipos de proceso. Trabajamos con tolerancias, repetibilidad y documentación básica.',
    proceso: ['Relevamiento de medidas y material.', 'Mecanizado CNC + controles por etapa.', 'Terminación / ajuste final y verificación.'],
    precio: 0,
    imagen: 'assets/img/rolos-industria-alimenticia.png',
    seccion: 'Industria Alimenticia',
    visible: true
  },
  {
    id: 'cuerpo',
    nombre: 'Cuerpo rolo deschalador',
    descripcion: 'Fabricación de cuerpos/portapiezas y componentes para líneas de proceso. Aseguramos concentricidad, alineación y montaje.',
    proceso: ['Corte y preparación de material.', 'Mecanizado de caras / alojamientos.', 'Control dimensional y prueba de ensamble.'],
    precio: 0,
    imagen: 'assets/img/cuerpo-rolo-deschalador.png',
    seccion: 'Industria Alimenticia',
    visible: true
  },
  {
    id: 'adaptador',
    nombre: 'Adaptador aspiración',
    descripcion: 'Adaptadores y transiciones para ductos/aspiración con ajuste limpio y terminación prolija.',
    proceso: ['Definición de bocas, espesores y material.', 'Corte / plegado / armado según diseño.', 'Soldadura y terminación.'],
    precio: 0,
    imagen: 'assets/img/adaptador-aspiracion.png',
    seccion: 'Piezas Especiales',
    visible: true
  },
  {
    id: 'sinfin',
    nombre: 'Sinfín de descarga con aporte antidesgaste',
    descripcion: 'Sinfines y transportadores con recargue/antidesgaste según aplicación. Balance entre durabilidad y costo.',
    proceso: ['Análisis de aplicación y material base.', 'Mecanizado + recargue antidesgaste.', 'Control de forma y verificación de dureza.'],
    precio: 0,
    imagen: 'assets/img/sinfin-descarga-antidesgaste.png',
    seccion: 'Industria Agrícola',
    visible: true
  },
  {
    id: 'chasis',
    nombre: 'Chasis para industria agrícola',
    descripcion: 'Estructura soldada robusta con control dimensional. Fabricación de chasis y bastidores para maquinaria.',
    proceso: ['Corte y preparación de perfiles.', 'Armado en plantilla y soldadura.', 'Control dimensional y terminación superficial.'],
    precio: 0,
    imagen: 'assets/img/chasis-industria-agricola.png',
    seccion: 'Industria Agrícola',
    visible: true
  },
  {
    id: 'movilvap',
    nombre: 'MOVILVAP',
    descripcion: 'Equipo móvil de vaporización. Desarrollo propio Metamas para aplicaciones industriales especiales.',
    proceso: ['Ingeniería y diseño a medida.', 'Fabricación integral.', 'Prueba funcional y entrega.'],
    precio: 0,
    imagen: 'assets/img/movilvap.png',
    seccion: 'Desarrollo Propio',
    visible: true
  },
  {
    id: 'tubos',
    nombre: 'Tubos para cárter',
    descripcion: 'Mecanizado de tubos y componentes para cárter con tolerancias ajustadas.',
    proceso: ['Selección de material y corte.', 'Mecanizado CNC interior y exterior.', 'Verificación dimensional y marcado.'],
    precio: 0,
    imagen: 'assets/img/tubos-para-carter.png',
    seccion: 'Industria Automotriz',
    visible: true
  },
  {
    id: 'automotriz',
    nombre: 'Piezas para la industria automotriz',
    descripcion: 'Piezas de alta precisión para la cadena automotriz. Tolerancias estrictas y trazabilidad de lote.',
    proceso: ['Recepción de plano/muestra.', 'Mecanizado CNC multiopéración.', 'Control por lote y documentación.'],
    precio: 0,
    imagen: 'assets/img/piezas-industria-automotriz.png',
    seccion: 'Industria Automotriz',
    visible: true
  },
  {
    id: 'soportes',
    nombre: 'Soportes para cadenas',
    descripcion: 'Soportes, guías y elementos de transmisión por cadena fabricados a medida.',
    proceso: ['Definición de cargas y material.', 'Mecanizado y/o soldadura según diseño.', 'Verificación y despacho.'],
    precio: 0,
    imagen: 'assets/img/soportes-para-cadenas.png',
    seccion: 'Transmisiones',
    visible: true
  },
  {
    id: 'bases',
    nombre: 'Bases metálicas',
    descripcion: 'Bases, sillas y estructuras de soporte en acero. Soldadura certificada y acabado según requerimiento.',
    proceso: ['Diseño / adaptación a medida del cliente.', 'Corte, conformado y soldadura.', 'Pintura / galvanizado según especificación.'],
    precio: 0,
    imagen: 'assets/img/bases-metalicas.png',
    seccion: 'Estructuras',
    visible: true
  }
];

/* ---- API pública ---- */
window.MetamasData = {
  getProductos() {
    try {
      const raw = localStorage.getItem(PRODUCTOS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return PRODUCTOS_DEFAULT.map(p => ({ ...p }));
  },

  saveProductos(lista) {
    try {
      localStorage.setItem(PRODUCTOS_KEY, JSON.stringify(lista));
      return true;
    } catch (e) {
      return false;
    }
  },

  resetProductos() {
    localStorage.removeItem(PRODUCTOS_KEY);
    return PRODUCTOS_DEFAULT.map(p => ({ ...p }));
  },

  formatPrecio(n) {
    if (!n || n === 0) return 'A cotizar';
    return '$' + Number(n).toLocaleString('es-AR');
  },

  generarId(nombre) {
    return nombre
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      + '-' + Date.now().toString(36);
  }
};
