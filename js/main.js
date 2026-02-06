(function(){
  const burger = document.querySelector('[data-burger]');
  const nav = document.querySelector('[data-nav]');
  if(!burger || !nav) return;

  const toggle = (ev) => {
    if (ev) {
      ev.preventDefault();
      ev.stopPropagation();
    }
    nav.classList.toggle('mobile-open');
    burger.setAttribute(
      'aria-expanded',
      nav.classList.contains('mobile-open') ? 'true' : 'false'
    );
  };

  // iOS Safari a veces no dispara el click si hay overlays/flex raros.
  // Soportamos touchend/pointerup además del click.
  burger.addEventListener('click', toggle);
  burger.addEventListener('touchend', toggle, { passive: false });
  burger.addEventListener('pointerup', toggle);
})();

(function(){
  const form = document.querySelector('form[data-rate-limit]');
  if(!form) return;

  const seconds = parseInt(form.getAttribute('data-rate-limit') || '30', 10);
  const key = 'metamas_last_submit_ms';
  const btn = form.querySelector('button[type="submit"]');

  function setButtonCountdown(msLeft){
    if(!btn) return;
    const s = Math.ceil(msLeft/1000);
    btn.disabled = true;
    const base = 'Enviar consulta';
    btn.textContent = `${base} (${s}s)`;
    const t = setInterval(() => {
      const now = Date.now();
      const last = parseInt(localStorage.getItem(key) || '0', 10);
      const left = (last + seconds*1000) - now;
      if(left <= 0){
        clearInterval(t);
        btn.disabled = false;
        btn.textContent = base;
      }else{
        btn.textContent = `${base} (${Math.ceil(left/1000)}s)`;
      }
    }, 250);
  }

  // If user reloads within the cooldown, keep it enforced
  try{
    const last = parseInt(localStorage.getItem(key) || '0', 10);
    const left = (last + seconds*1000) - Date.now();
    if(left > 0) setButtonCountdown(left);
  }catch(e){}

  form.addEventListener('submit', (e) => {
    try{
      const last = parseInt(localStorage.getItem(key) || '0', 10);
      const now = Date.now();
      const left = (last + seconds*1000) - now;

      if(left > 0){
        e.preventDefault();
        alert(`Esperá ${Math.ceil(left/1000)}s antes de volver a enviar.`);
        setButtonCountdown(left);
        return;
      }

      // lock and store timestamp before sending
      localStorage.setItem(key, String(now));
      if(btn){
        btn.disabled = true;
        btn.textContent = 'Enviando...';
      }
    }catch(err){}
  });
})();



/* ===== Animaciones y micro-interacciones ===== */
(function(){
  // Botones: efecto "spotlight" siguiendo el mouse
  const btns = document.querySelectorAll('.btn');
  btns.forEach(b=>{
    b.addEventListener('pointermove', (e)=>{
      const r = b.getBoundingClientRect();
      const mx = ((e.clientX - r.left) / r.width) * 100;
      const my = ((e.clientY - r.top) / r.height) * 100;
      b.style.setProperty('--mx', mx + '%');
      b.style.setProperty('--my', my + '%');
    });
  });

  // Scroll reveal con IntersectionObserver
  const targets = document.querySelectorAll([
    '.hero-left',
    '.hero-right',
    '.metrics .metric',
    '.section .h2',
    '.section .lead',
    '.card',
    '.tile',
    '.work-card',
    '.footer-main > *',
    '.footer-social-inner > *'
  ].join(','));

  // Marcar como "reveal" y setear delays (stagger por fila)
  targets.forEach((el, i)=>{
    if(!el.classList.contains('reveal')) el.classList.add('reveal');
    // stagger suave: 0-180ms
    const d = (i % 6) * 30;
    el.style.setProperty('--d', d + 'ms');
  });

  if(!('IntersectionObserver' in window)){
    document.querySelectorAll('.reveal').forEach(el=>el.classList.add('in'));
    return;
  }

  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -10% 0px' });

  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
})();


// --- Productos: modal de detalle ---
(() => {
  const modal = document.getElementById('productModal');
  if (!modal) return;

  const titleEl = document.getElementById('modalTitle');
  const descEl = document.getElementById('modalDesc');
  const imgEl = document.getElementById('modalImg');
  const stepsEl = document.getElementById('modalSteps');

  const PRODUCTS = {
    rolos: {
      title: 'Rolos para industria alimenticia',
      img: 'assets/img/rolos-para-industria-alimenticia.png',
      desc: 'Fabricación de rolos con buen acabado superficial y tolerancias controladas. Se entregan listos para montaje.',
      steps: [
        'Relevamiento de medidas, material y aplicación.',
        'Torneado / mecanizado CNC y control dimensional.',
        'Terminación superficial y verificación final.',
        'Embalaje y entrega según plazo acordado.'
      ]
    },
    cuerpo: {
      title: 'Cuerpo rolo deschalador',
      img: 'assets/img/cuerpo-rolo-deschalador.png',
      desc: 'Cuerpos mecanizados para equipos industriales, con geometrías y alojamientos precisos.',
      steps: [
        'Definición de plano o toma de medidas sobre muestra.',
        'Mecanizado CNC (desbaste y terminación).',
        'Ajustes y control dimensional por etapas.',
        'Entrega con trazabilidad básica del trabajo.'
      ]
    },
    adaptador: {
      title: 'Adaptador aspiración',
      img: 'assets/img/adaptador-aspiracion.png',
      desc: 'Adaptadores y transiciones para aspiración/ductos, optimizando caudal y montaje.',
      steps: [
        'Relevamiento de bocas, diámetros y condiciones de trabajo.',
        'Corte / conformado y soldadura donde aplique.',
        'Alineación, limpieza y terminación.',
        'Prueba de montaje y entrega.'
      ]
    },
    sinfin: {
      title: 'Sinfín de descarga con aporte antidesgaste',
      img: 'assets/img/sinfin-de-descarga.png',
      desc: 'Sinfines con refuerzos o aporte para mejorar la vida útil en zonas de desgaste.',
      steps: [
        'Selección de material y definición del aporte antidesgaste.',
        'Mecanizado y armado del conjunto.',
        'Aplicación de aporte / tratamiento según requerimiento.',
        'Control, balanceo (si aplica) y entrega.'
      ]
    },
    chasis: {
      title: 'Chasis para industria agrícola',
      img: 'assets/img/chasis-para-industria-agricola.png',
      desc: 'Estructuras y chasis robustos, pensados para uso intensivo y fácil mantenimiento.',
      steps: [
        'Despiece y cálculo de material.',
        'Corte y armado de estructura.',
        'Soldadura y control de escuadra/alineación.',
        'Terminación y preparación para pintura (si aplica).'
      ]
    },
    movilvap: {
      title: 'MOVILVAP',
      img: 'assets/img/movilvap.png',
      desc: 'Soluciones especiales: estructuras, soportes y conjuntos según proyecto.',
      steps: [
        'Definición del requerimiento (uso, cargas, medidas).',
        'Propuesta técnica y optimización de material.',
        'Fabricación y control por etapa.',
        'Entrega y soporte post-entrega.'
      ]
    },
    tubos: {
      title: 'Tubos para cárter',
      img: 'assets/img/tubos-para-carter.png',
      desc: 'Tubos y piezas conformadas, con terminación prolija y encastres controlados.',
      steps: [
        'Corte / conformado según especificación.',
        'Mecanizado de puntas / alojamientos si corresponde.',
        'Control de encastres y limpieza de bordes.',
        'Entrega lista para montaje.'
      ]
    },
    automotriz: {
      title: 'Piezas para la industria automotriz',
      img: 'assets/img/piezas-automotriz.png',
      desc: 'Piezas mecanizadas y conjuntos para producción, prototipos o reposición.',
      steps: [
        'Validación de plano/tolerancias y material.',
        'Proceso: CNC / soldadura / armado según pieza.',
        'Control dimensional y verificación final.',
        'Documentación básica y entrega.'
      ]
    },
    soportes: {
      title: 'Soportes para cadenas',
      img: 'assets/img/soportes-para-cadenas.png',
      desc: 'Soportes y anclajes diseñados para resistencia y montaje rápido.',
      steps: [
        'Definición de perforaciones y espesores.',
        'Corte y mecanizado.',
        'Soldadura y terminación (si aplica).',
        'Control final y entrega.'
      ]
    },
    bases: {
      title: 'Bases metálicas',
      img: 'assets/img/bases-metalicas.png',
      desc: 'Bases y gabinetes metálicos para instalaciones industriales. Terminación prolija y robustez.',
      steps: [
        'Relevamiento de medidas y puntos de fijación.',
        'Corte / plegado / armado.',
        'Soldadura y control.',
        'Terminación y entrega.'
      ]
    }
  };

  const openModal = (key) => {
    const p = PRODUCTS[key];
    if (!p) return;

    titleEl.textContent = p.title;
    descEl.textContent = p.desc;
    imgEl.src = p.img;
    imgEl.alt = p.title;

    stepsEl.innerHTML = '';
    p.steps.forEach(s => {
      const li = document.createElement('li');
      li.textContent = s;
      stepsEl.appendChild(li);
    });

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  // Delegation for cards
  document.addEventListener('click', (e) => {
    const closeBtn = e.target.closest('[data-modal-close]');
    if (closeBtn) return closeModal();

    const card = e.target.closest('.work-card--clickable');
    if (!card) return;

    const key = card.getAttribute('data-product');
    openModal(key);
  });

  // Doble click dentro del modal para cerrarlo rápido.
  document.addEventListener('dblclick', (e) => {
    if (!modal.classList.contains('is-open')) return;
    if (e.target.closest('#productModal')) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
    if ((e.key === 'Enter' || e.key === ' ') && document.activeElement?.classList?.contains('work-card--clickable')) {
      e.preventDefault();
      const key = document.activeElement.getAttribute('data-product');
      openModal(key);
    }
  });
})();
