// Hamburger / mobile menu — robust (works on iOS + desktop)
(() => {
  let isOpen = false;

  const getEls = () => ({
    burger: document.querySelector('[data-burger]'),
    header: document.querySelector('.site-header'),
    mobileMenu: document.querySelector('.mobilemenu')
  });

  const setOpen = (val) => {
    const { burger, header, mobileMenu } = getEls();
    if (!burger || !mobileMenu) return;

    isOpen = Boolean(val);
    mobileMenu.classList.toggle('is-open', isOpen);
    if (header) header.classList.toggle('menu-open', isOpen);
    document.body.classList.toggle('no-scroll', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
  };

  const toggle = () => setOpen(!isOpen);

  // Click/tap on burger
  document.addEventListener('click', (e) => {
    const burgerBtn = e.target.closest('[data-burger]');
    if (burgerBtn) {
      e.preventDefault();
      e.stopPropagation();
      toggle();
      return;
    }

    // Close when clicking outside the menu
    if (isOpen) {
      const insideMenu = e.target.closest('.mobilemenu');
      if (!insideMenu) setOpen(false);
    }
  }, true);

  // Close when clicking a link inside the menu
  document.addEventListener('click', (e) => {
    if (!isOpen) return;
    const link = e.target.closest('.mobilemenu a');
    if (link) setOpen(false);
  }, true);

  // Close on ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setOpen(false);
  });

  // If the DOM loads with no burger/menu, do nothing.
  // If they exist later, the delegated listeners above still work.
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


/* ============================================================
   ANIMACIONES AVANZADAS — METAMAS
   ============================================================ */





/* --- Topbar scroll shrink --- */
(function(){
  const topbar = document.querySelector('.topbar');
  if (!topbar) return;
  const onScroll = () => {
    topbar.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* --- Scroll Reveal con IntersectionObserver --- */
(function(){
  const selectors = [
    '.section h2',
    '.section > .container > p',
    '.tile',
    '.work-card',
    '.metric',
    '.split .tile',
    '.footer-cols > div',
  ];

  const els = document.querySelectorAll(selectors.join(','));
  els.forEach((el, i) => {
    if (el.classList.contains('hero-left') || el.classList.contains('hero-right')) return;
    el.classList.add('reveal');
    el.style.setProperty('--d', (i % 5) * 60 + 'ms');
  });

  // H2 headings: from-left
  document.querySelectorAll('.section h2').forEach(h => {
    h.classList.add('from-left');
  });

  // Work cards: scale-in
  document.querySelectorAll('.work-card').forEach(c => {
    c.classList.remove('from-left');
    c.classList.add('scale-in');
  });

  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
    return;
  }

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
})();

/* --- Botones: spotlight mouse + ripple click --- */
(function(){
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('pointermove', e => {
      const r = btn.getBoundingClientRect();
      btn.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
      btn.style.setProperty('--my', ((e.clientY - r.top)  / r.height * 100) + '%');
    });

    btn.addEventListener('pointerdown', e => {
      const r = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(r.width, r.height) * 2;
      ripple.className = 'ripple';
      ripple.style.cssText = `
        width:${size}px; height:${size}px;
        top:${e.clientY - r.top - size/2}px;
        left:${e.clientX - r.left - size/2}px;
      `;
      btn.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });
})();

/* --- Cards: tilt 3D al mover el mouse --- */
(function(){
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  document.querySelectorAll('.work-card, .tile').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const cx = r.left + r.width  / 2;
      const cy = r.top  + r.height / 2;
      const dx = (e.clientX - cx) / (r.width  / 2);
      const dy = (e.clientY - cy) / (r.height / 2);
      card.style.transform = `perspective(600px) rotateY(${dx * 5}deg) rotateX(${-dy * 5}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

/* --- Contador animado para las métricas --- */
(function(){
  // Si hay textos con números en las métricas, los animamos
  const metrics = document.querySelectorAll('.metric b');
  if (!metrics.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      io.unobserve(el);
      el.style.transition = 'opacity 0.5s ease';
      el.style.opacity = '0';
      setTimeout(() => { el.style.opacity = '1'; }, 50);
    });
  }, { threshold: 0.5 });

  metrics.forEach(m => io.observe(m));
})();

/* --- Partículas sutiles en el hero (canvas) --- */
(function(){
  const hero = document.querySelector('.hero');
  if (!hero || window.matchMedia('(max-width: 980px)').matches) return;

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;opacity:0.35;';
  hero.style.position = 'relative';
  hero.prepend(canvas);

  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  const resize = () => {
    W = canvas.width  = hero.offsetWidth;
    H = canvas.height = hero.offsetHeight;
  };
  window.addEventListener('resize', resize);
  resize();

  // Crear partículas
  for (let i = 0; i < 55; i++) {
    particles.push({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.5 + 0.4,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.6 + 0.2,
    });
  }

  const COLORS = ['#0F7391', '#066381', '#7ecfdf'];

  (function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = COLORS[Math.floor(Math.random()*COLORS.length)];
      ctx.globalAlpha = p.alpha;
      ctx.fill();
    });

    // Líneas entre partículas cercanas
    for (let i = 0; i < particles.length; i++) {
      for (let j = i+1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = '#0F7391';
          ctx.globalAlpha = (1 - dist/100) * 0.18;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  })();
})();

