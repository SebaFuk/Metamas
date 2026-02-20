/* FONDO METALÚRGICO ANIMADO — PARALLAX + CANVAS
   Temática: chispas de soldadura, engranajes, grilla técnica,
   partículas de metal, líneas de circuito.
   ============================================================ */
(function () {
  const canvas = document.getElementById('metamas-bg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const C = {
    bg:        '#071c26',
    grid:      'rgba(15,115,145,0.07)',
    gridAcc:   'rgba(15,115,145,0.18)',
    gear:      'rgba(15,115,145,0.10)',
    gearStroke:'rgba(15,115,145,0.22)',
    circuit:   'rgba(0,200,255,0.10)',
    spark:     ['#ff9900','#ffcc44','#ff6600','#ffffff','#ffee88'],
    particle:  'rgba(15,115,145,0.35)',
  };

  let W, H, scrollY = 0, raf;

  /* ---- resize ---- */
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  /* ---- scroll parallax ---- */
  window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });

  /* ==== ENGRANAJES ==== */
  const GEARS = [
    { x:0.08, y:0.15, r:90,  teeth:14, speed:0.003,  angle:0   },
    { x:0.92, y:0.10, r:60,  teeth:10, speed:-0.005, angle:1.1 },
    { x:0.85, y:0.55, r:110, teeth:18, speed:0.002,  angle:0.5 },
    { x:0.04, y:0.72, r:70,  teeth:11, speed:-0.004, angle:2   },
    { x:0.50, y:0.95, r:80,  teeth:13, speed:0.003,  angle:0.8 },
    { x:0.95, y:0.88, r:50,  teeth:8,  speed:-0.006, angle:1.5 },
  ];

  function drawGear(g, t) {
    const x = g.x * W;
    const y = g.y * H - scrollY * 0.15;
    const angle = g.angle + t * g.speed;
    const r = g.r, teeth = g.teeth;
    const toothH = r * 0.22, toothW = (Math.PI * 2 / teeth) * 0.38;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    /* cuerpo */
    ctx.beginPath();
    for (let i = 0; i < teeth; i++) {
      const a0 = (i / teeth) * Math.PI * 2;
      const a1 = a0 + toothW;
      const a2 = a0 + (Math.PI * 2 / teeth) - toothW;
      const a3 = a0 + Math.PI * 2 / teeth;
      ctx.lineTo(Math.cos(a0) * r,       Math.sin(a0) * r);
      ctx.lineTo(Math.cos(a1) * (r+toothH), Math.sin(a1) * (r+toothH));
      ctx.lineTo(Math.cos(a2) * (r+toothH), Math.sin(a2) * (r+toothH));
      ctx.lineTo(Math.cos(a3) * r,       Math.sin(a3) * r);
    }
    ctx.closePath();
    ctx.fillStyle   = C.gear;
    ctx.strokeStyle = C.gearStroke;
    ctx.lineWidth   = 1.5;
    ctx.fill();
    ctx.stroke();

    /* agujero central */
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.28, 0, Math.PI * 2);
    ctx.fillStyle = C.bg;
    ctx.fill();
    ctx.strokeStyle = C.gearStroke;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    /* rayos internos */
    ctx.strokeStyle = C.gearStroke;
    ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * r * 0.30, Math.sin(a) * r * 0.30);
      ctx.lineTo(Math.cos(a) * r * 0.75, Math.sin(a) * r * 0.75);
      ctx.stroke();
    }

    ctx.restore();
  }

  /* ==== GRILLA TÉCNICA ==== */
  function drawGrid(t) {
    const offsetY = -scrollY * 0.08;
    const step = 48;

    /* líneas menores */
    ctx.strokeStyle = C.grid;
    ctx.lineWidth = 0.5;
    for (let x = 0; x < W; x += step) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = (offsetY % step); y < H; y += step) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    /* líneas mayores cada 5 */
    ctx.strokeStyle = C.gridAcc;
    ctx.lineWidth = 0.8;
    for (let x = 0; x < W; x += step * 5) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = (offsetY % (step * 5)); y < H; y += step * 5) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
  }

  /* ==== LÍNEAS DE CIRCUITO ==== */
  const CIRCUITS = [];
  function initCircuits() {
    CIRCUITS.length = 0;
    const count = Math.floor(W / 140);
    for (let i = 0; i < count; i++) {
      const segs = [];
      let cx = Math.random() * W, cy = Math.random() * H * 2;
      const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
      let dir = dirs[Math.floor(Math.random() * 4)];
      for (let s = 0; s < 6 + Math.random() * 6; s++) {
        const len = 40 + Math.random() * 120;
        segs.push({ x: cx, y: cy, dx: dir[0], dy: dir[1], len });
        cx += dir[0] * len; cy += dir[1] * len;
        /* giro 90° */
        const perp = [[-dir[1], dir[0]], [dir[1], -dir[0]]];
        dir = perp[Math.floor(Math.random() * 2)];
      }
      CIRCUITS.push({ segs, speed: 0.2 + Math.random() * 0.4, pulse: Math.random() * Math.PI * 2 });
    }
  }
  initCircuits();
  window.addEventListener('resize', initCircuits);

  function drawCircuits(t) {
    CIRCUITS.forEach(c => {
      const alpha = 0.06 + 0.06 * Math.sin(t * c.speed + c.pulse);
      const offsetY = -scrollY * 0.12;
      ctx.save();
      ctx.translate(0, offsetY);
      ctx.strokeStyle = `rgba(0,200,255,${alpha})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      c.segs.forEach((s, i) => {
        if (i === 0) ctx.moveTo(s.x, s.y);
        else ctx.lineTo(s.x, s.y);
      });
      ctx.stroke();

      /* nodos */
      c.segs.forEach(s => {
        ctx.beginPath();
        ctx.arc(s.x, s.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,200,255,${alpha * 2})`;
        ctx.fill();
      });
      ctx.restore();
    });
  }

  /* ==== PARTÍCULAS FLOTANTES (metal / polvo) ==== */
  const PARTICLES = [];
  function initParticles() {
    PARTICLES.length = 0;
    const count = Math.min(80, Math.floor(W * H / 14000));
    for (let i = 0; i < count; i++) {
      PARTICLES.push({
        x:     Math.random() * W,
        y:     Math.random() * H,
        r:     0.6 + Math.random() * 1.8,
        vx:    (Math.random() - 0.5) * 0.25,
        vy:    -0.1 - Math.random() * 0.2,
        alpha: 0.15 + Math.random() * 0.35,
        twinkle: Math.random() * Math.PI * 2,
        tSpeed:  0.01 + Math.random() * 0.02,
      });
    }
  }
  initParticles();
  window.addEventListener('resize', initParticles);

  function drawParticles(t) {
    const offsetY = -scrollY * 0.05;
    PARTICLES.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.twinkle += p.tSpeed;
      if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
      if (p.x < -5)  p.x = W + 5;
      if (p.x > W+5) p.x = -5;

      const alpha = p.alpha * (0.6 + 0.4 * Math.sin(p.twinkle));
      ctx.beginPath();
      ctx.arc(p.x, p.y + offsetY, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(15,180,210,${alpha})`;
      ctx.fill();
    });
  }

  /* ==== CHISPAS DE SOLDADURA ==== */
  const SPARKS = [];
  function spawnSpark() {
    /* posiciones fijas tipo "puntos de soldadura" */
    const origins = [
      { x: W * 0.25, y: H * 0.35 },
      { x: W * 0.72, y: H * 0.22 },
      { x: W * 0.55, y: H * 0.68 },
      { x: W * 0.10, y: H * 0.60 },
      { x: W * 0.88, y: H * 0.75 },
    ];
    const o = origins[Math.floor(Math.random() * origins.length)];
    const count = 3 + Math.floor(Math.random() * 5);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 3.5;
      SPARKS.push({
        x:     o.x,
        y:     o.y - scrollY * 0.2,
        vx:    Math.cos(angle) * speed,
        vy:    Math.sin(angle) * speed - 2,
        life:  1,
        decay: 0.025 + Math.random() * 0.04,
        r:     1 + Math.random() * 2,
        color: C.spark[Math.floor(Math.random() * C.spark.length)],
        gravity: 0.12,
        trail: [],
      });
    }
  }

  function drawSparks() {
    for (let i = SPARKS.length - 1; i >= 0; i--) {
      const s = SPARKS[i];
      s.trail.push({ x: s.x, y: s.y, life: s.life });
      if (s.trail.length > 6) s.trail.shift();

      s.vx *= 0.97;
      s.vy += s.gravity;
      s.x  += s.vx;
      s.y  += s.vy;
      s.life -= s.decay;

      if (s.life <= 0) { SPARKS.splice(i, 1); continue; }

      /* estela */
      if (s.trail.length > 1) {
        for (let j = 1; j < s.trail.length; j++) {
          ctx.beginPath();
          ctx.moveTo(s.trail[j-1].x, s.trail[j-1].y);
          ctx.lineTo(s.trail[j].x,   s.trail[j].y);
          ctx.strokeStyle = s.color;
          ctx.globalAlpha = (j / s.trail.length) * s.life * 0.5;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }

      /* punto brillante */
      ctx.globalAlpha = s.life;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r * s.life, 0, Math.PI * 2);
      ctx.fillStyle = s.color;
      ctx.fill();

      /* halo */
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r * 3 * s.life, 0, Math.PI * 2);
      ctx.fillStyle = s.color;
      ctx.globalAlpha = s.life * 0.15;
      ctx.fill();

      ctx.globalAlpha = 1;
    }
  }

  /* ==== CRUZ DE MIRA / RETÍCULA (detalle técnico) ==== */
  function drawReticles(t) {
    const offsetY = -scrollY * 0.18;
    const reticles = [
      { x: 0.18, y: 0.42 },
      { x: 0.78, y: 0.30 },
      { x: 0.62, y: 0.82 },
    ];
    reticles.forEach(re => {
      const rx = re.x * W;
      const ry = re.y * H + offsetY;
      const pulse = 0.3 + 0.2 * Math.sin(t * 0.8 + re.x * 10);
      const size  = 18;

      ctx.save();
      ctx.globalAlpha = pulse;
      ctx.strokeStyle = 'rgba(15,200,230,0.6)';
      ctx.lineWidth = 1;

      /* cruz */
      ctx.beginPath();
      ctx.moveTo(rx - size, ry); ctx.lineTo(rx + size, ry);
      ctx.moveTo(rx, ry - size); ctx.lineTo(rx, ry + size);
      ctx.stroke();

      /* círculo exterior */
      ctx.beginPath();
      ctx.arc(rx, ry, size * 0.7, 0, Math.PI * 2);
      ctx.stroke();

      /* cuadrado interior */
      ctx.beginPath();
      ctx.rect(rx - 4, ry - 4, 8, 8);
      ctx.stroke();

      ctx.restore();
    });
  }

  /* ==== LOOP PRINCIPAL ==== */
  let lastSpark = 0;
  function loop(ts) {
    const t = ts / 1000;
    ctx.clearRect(0, 0, W, H);

    /* fondo base */
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, W, H);

    drawGrid(t);
    drawCircuits(t);
    GEARS.forEach(g => drawGear(g, t));
    drawParticles(t);
    drawReticles(t);

    /* chispas cada ~350ms */
    if (ts - lastSpark > 350) {
      spawnSpark();
      lastSpark = ts;
    }
    drawSparks();

    raf = requestAnimationFrame(loop);
  }

  raf = requestAnimationFrame(loop);
})();
