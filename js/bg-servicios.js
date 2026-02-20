(function () {
  var canvas = document.getElementById('metamas-bg');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');

  var W = 0, H = 0, scrollY = 0, raf;
  var CIRCUITS = [];
  var PARTICLES = [];
  var SPARKS = [];
  var LASERS = [{y:0.25,dir:1,speed:0.0015,pos:0.1},{y:0.65,dir:-1,speed:0.001,pos:0.7}];
  var ARCS = [{x:0.25,y:0.40},{x:0.72,y:0.22},{x:0.55,y:0.72}];
  var lastSpark = 0;

  var C = {
    bg: '#071c26',
    grid: 'rgba(15,115,145,0.07)',
    gridAcc: 'rgba(15,115,145,0.18)',
    gear: 'rgba(15,115,145,0.10)',
    gearStroke: 'rgba(15,115,145,0.22)',
    spark: ['#ff9900','#ffcc44','#ff6600','#ffffff','#ffee88']
  };

  var GEARS = [
    {x:0.07,y:0.12,r:75, teeth:12,speed:0.005, angle:0  },
    {x:0.93,y:0.09,r:50, teeth:8, speed:-0.008,angle:1.1},
    {x:0.86,y:0.54,r:95, teeth:16,speed:0.003, angle:0.5},
    {x:0.03,y:0.68,r:60, teeth:10,speed:-0.006,angle:2  },
    {x:0.48,y:0.93,r:70, teeth:11,speed:0.004, angle:0.8},
    {x:0.96,y:0.87,r:45, teeth:7, speed:-0.007,angle:1.5}
  ];

  function initCircuits() {
    CIRCUITS = [];
    var count = Math.floor(W / 140);
    for (var i = 0; i < count; i++) {
      var segs = [];
      var cx = Math.random() * W, cy = Math.random() * H * 2;
      var dirs = [[1,0],[-1,0],[0,1],[0,-1]];
      var dir = dirs[Math.floor(Math.random() * 4)];
      for (var s = 0; s < 6 + Math.random() * 6; s++) {
        var len = 40 + Math.random() * 120;
        segs.push({x: cx, y: cy});
        cx += dir[0] * len; cy += dir[1] * len;
        var perp = [[-dir[1], dir[0]], [dir[1], -dir[0]]];
        dir = perp[Math.floor(Math.random() * 2)];
      }
      CIRCUITS.push({segs: segs, speed: 0.2 + Math.random() * 0.4, pulse: Math.random() * Math.PI * 2});
    }
  }

  function initParticles() {
    PARTICLES = [];
    var count = Math.min(80, Math.floor(W * H / 14000));
    for (var i = 0; i < count; i++) {
      PARTICLES.push({
        x: Math.random() * W, y: Math.random() * H,
        r: 0.6 + Math.random() * 1.8,
        vx: (Math.random() - 0.5) * 0.25,
        vy: -0.1 - Math.random() * 0.2,
        alpha: 0.15 + Math.random() * 0.35,
        twinkle: Math.random() * Math.PI * 2,
        tSpeed: 0.01 + Math.random() * 0.02
      });
    }
  }

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    initCircuits();
    initParticles();
  }

  window.addEventListener('resize', resize);
  window.addEventListener('scroll', function() { scrollY = window.scrollY; }, {passive: true});
  resize();

  function drawGrid() {
    var offsetY = -scrollY * 0.08;
    var step = 48;
    ctx.strokeStyle = C.grid; ctx.lineWidth = 0.5;
    for (var x = 0; x < W; x += step) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
    for (var y = offsetY % step; y < H; y += step) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
    ctx.strokeStyle = C.gridAcc; ctx.lineWidth = 0.8;
    for (var x2 = 0; x2 < W; x2 += step*5) { ctx.beginPath(); ctx.moveTo(x2,0); ctx.lineTo(x2,H); ctx.stroke(); }
    for (var y2 = offsetY % (step*5); y2 < H; y2 += step*5) { ctx.beginPath(); ctx.moveTo(0,y2); ctx.lineTo(W,y2); ctx.stroke(); }
  }

  function drawGear(g, t) {
    var x = g.x*W, y = g.y*H - scrollY*0.15;
    var angle = g.angle + t*g.speed;
    var r = g.r, teeth = g.teeth;
    var toothH = r*0.22, toothW = (Math.PI*2/teeth)*0.38;
    ctx.save(); ctx.translate(x,y); ctx.rotate(angle);
    ctx.beginPath();
    for (var i = 0; i < teeth; i++) {
      var a0=(i/teeth)*Math.PI*2, a1=a0+toothW, a2=a0+(Math.PI*2/teeth)-toothW, a3=a0+Math.PI*2/teeth;
      ctx.lineTo(Math.cos(a0)*r, Math.sin(a0)*r);
      ctx.lineTo(Math.cos(a1)*(r+toothH), Math.sin(a1)*(r+toothH));
      ctx.lineTo(Math.cos(a2)*(r+toothH), Math.sin(a2)*(r+toothH));
      ctx.lineTo(Math.cos(a3)*r, Math.sin(a3)*r);
    }
    ctx.closePath();
    ctx.fillStyle = C.gear; ctx.strokeStyle = C.gearStroke; ctx.lineWidth = 1.5;
    ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(0,0,r*0.28,0,Math.PI*2);
    ctx.fillStyle = C.bg; ctx.fill(); ctx.strokeStyle = C.gearStroke; ctx.stroke();
    for (var i2 = 0; i2 < 6; i2++) {
      var a = (i2/6)*Math.PI*2;
      ctx.beginPath(); ctx.moveTo(Math.cos(a)*r*0.30, Math.sin(a)*r*0.30);
      ctx.lineTo(Math.cos(a)*r*0.75, Math.sin(a)*r*0.75);
      ctx.strokeStyle = C.gearStroke; ctx.lineWidth = 1; ctx.stroke();
    }
    ctx.restore();
  }

  function drawCircuits(t) {
    for (var ci = 0; ci < CIRCUITS.length; ci++) {
      var c = CIRCUITS[ci];
      var alpha = 0.06 + 0.06 * Math.sin(t*c.speed + c.pulse);
      var offsetY = -scrollY * 0.12;
      ctx.save(); ctx.translate(0, offsetY);
      ctx.strokeStyle = 'rgba(0,200,255,' + alpha + ')'; ctx.lineWidth = 1;
      ctx.beginPath();
      for (var si = 0; si < c.segs.length; si++) {
        if (si === 0) ctx.moveTo(c.segs[si].x, c.segs[si].y);
        else ctx.lineTo(c.segs[si].x, c.segs[si].y);
      }
      ctx.stroke();
      for (var si2 = 0; si2 < c.segs.length; si2++) {
        ctx.beginPath(); ctx.arc(c.segs[si2].x, c.segs[si2].y, 2.5, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(0,200,255,' + (alpha*2) + ')'; ctx.fill();
      }
      ctx.restore();
    }
  }

  function drawLasers(t) {
    var off = -scrollY * 0.12;
    for (var li = 0; li < LASERS.length; li++) {
      var l = LASERS[li];
      l.pos += l.speed * l.dir;
      if (l.pos > 1) l.dir = -1;
      if (l.pos < 0) l.dir = 1;
      var lx = l.pos * W, ly = l.y * H + off;
      var pulse = 0.5 + 0.5 * Math.sin(t * 8 + l.y * 20);
      var grad = ctx.createLinearGradient(lx, ly-80, lx, ly+80);
      grad.addColorStop(0, 'rgba(255,30,30,0)');
      grad.addColorStop(0.5, 'rgba(255,30,30,' + (0.55 + 0.3*pulse) + ')');
      grad.addColorStop(1, 'rgba(255,30,30,0)');
      ctx.beginPath(); ctx.moveTo(lx, ly-80); ctx.lineTo(lx, ly+80);
      ctx.strokeStyle = grad; ctx.lineWidth = 2; ctx.stroke();
      ctx.beginPath(); ctx.arc(lx, ly, 3+pulse*3, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(255,60,60,0.9)'; ctx.fill();
      ctx.beginPath(); ctx.arc(lx, ly, 12+pulse*6, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(255,30,30,0.12)'; ctx.fill();
    }
  }

  function drawWeldArcs() {
    var off = -scrollY * 0.10;
    for (var ai = 0; ai < ARCS.length; ai++) {
      var a = ARCS[ai];
      var ax = a.x*W, ay = a.y*H + off;
      var flicker = Math.random();
      if (flicker < 0.30) continue;
      var intensity = 0.35 + flicker * 0.45;
      var rad = ctx.createRadialGradient(ax, ay, 0, ax, ay, 32+flicker*20);
      rad.addColorStop(0, 'rgba(80,200,255,' + intensity + ')');
      rad.addColorStop(0.4, 'rgba(80,200,255,' + (intensity*0.25) + ')');
      rad.addColorStop(1, 'rgba(80,200,255,0)');
      ctx.beginPath(); ctx.arc(ax, ay, 32+flicker*20, 0, Math.PI*2);
      ctx.fillStyle = rad; ctx.fill();
      ctx.beginPath(); ctx.moveTo(ax, ay-45); ctx.lineTo(ax+(Math.random()-0.5)*4, ay);
      ctx.strokeStyle = 'rgba(80,200,255,' + (intensity*0.8) + ')';
      ctx.lineWidth = 1.5+flicker; ctx.stroke();
      if (flicker > 0.65 && Math.random() < 0.55) {
        for (var k = 0; k < 5; k++) {
          var angle = -Math.PI/2 + (Math.random()-0.5)*Math.PI;
          var spd = 2 + Math.random()*3.5;
          SPARKS.push({x:ax,y:ay,vx:Math.cos(angle)*spd,vy:Math.sin(angle)*spd-1.5,life:1,decay:0.04+Math.random()*0.04,r:1+Math.random()*2,color:C.spark[Math.floor(Math.random()*C.spark.length)],gravity:0.08,trail:[]});
        }
      }
    }
  }

  function drawCNCCoords(t) {
    var off = -scrollY * 0.07;
    var coords = [{x:0.07,y:0.12,ph:0},{x:0.88,y:0.45,ph:1.5}];
    for (var ci = 0; ci < coords.length; ci++) {
      var c = coords[ci];
      var cx = c.x*W, cy = c.y*H + off;
      var alpha = 0.45 + 0.20*Math.sin(t*0.8 + ci*2);
      ctx.save(); ctx.globalAlpha = alpha;
      ctx.beginPath(); ctx.roundRect(cx-58, cy-36, 116, 72, 8);
      ctx.fillStyle = 'rgba(15,115,145,0.12)';
      ctx.strokeStyle = 'rgba(0,200,255,0.35)'; ctx.lineWidth = 1;
      ctx.fill(); ctx.stroke();
      var X = (110 + Math.sin(t*0.3+c.ph)*50).toFixed(2);
      var Y = (45 + Math.cos(t*0.4+c.ph)*30).toFixed(2);
      ctx.font = '11px monospace'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillStyle = '#4af'; ctx.fillText('X: ' + X, cx-50, cy-28);
      ctx.fillStyle = '#4fa'; ctx.fillText('Y: ' + Y, cx-50, cy-6);
      ctx.fillStyle = '#fa4'; ctx.fillText('Z: -2.50', cx-50, cy+16);
      ctx.fillStyle = 'rgba(0,230,180,0.8)';
      ctx.fillText('S: ' + Math.floor(800+Math.sin(t)*200) + ' RPM', cx-50, cy+38);
      ctx.restore();
    }
  }

  function drawReticles(t) {
    var offsetY = -scrollY * 0.18;
    var reticles = [{x:0.18,y:0.42},{x:0.78,y:0.30},{x:0.62,y:0.82}];
    for (var ri = 0; ri < reticles.length; ri++) {
      var re = reticles[ri];
      var rx = re.x*W, ry = re.y*H + offsetY;
      var pulse = 0.3 + 0.2*Math.sin(t*0.8 + re.x*10);
      var size = 18;
      ctx.save(); ctx.globalAlpha = pulse;
      ctx.strokeStyle = 'rgba(15,200,230,0.6)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(rx-size,ry); ctx.lineTo(rx+size,ry);
      ctx.moveTo(rx,ry-size); ctx.lineTo(rx,ry+size); ctx.stroke();
      ctx.beginPath(); ctx.arc(rx,ry,size*0.7,0,Math.PI*2); ctx.stroke();
      ctx.beginPath(); ctx.rect(rx-4,ry-4,8,8); ctx.stroke();
      ctx.restore();
    }
  }

  function drawParticles() {
    var offsetY = -scrollY * 0.05;
    for (var pi = 0; pi < PARTICLES.length; pi++) {
      var p = PARTICLES[pi];
      p.x += p.vx; p.y += p.vy; p.twinkle += p.tSpeed;
      if (p.y < -10) { p.y = H+10; p.x = Math.random()*W; }
      if (p.x < -5) p.x = W+5;
      if (p.x > W+5) p.x = -5;
      var alpha = p.alpha * (0.6 + 0.4*Math.sin(p.twinkle));
      ctx.beginPath(); ctx.arc(p.x, p.y+offsetY, p.r, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(15,180,210,' + alpha + ')'; ctx.fill();
    }
  }

  function spawnSpark() {
    var origins = [{x:W*0.25,y:H*0.35},{x:W*0.72,y:H*0.22},{x:W*0.55,y:H*0.68},{x:W*0.10,y:H*0.60},{x:W*0.88,y:H*0.75}];
    var o = origins[Math.floor(Math.random() * origins.length)];
    for (var i = 0; i < 3 + Math.floor(Math.random()*5); i++) {
      var angle = Math.random()*Math.PI*2, speed = 1.5+Math.random()*3.5;
      SPARKS.push({x:o.x, y:o.y-scrollY*0.2, vx:Math.cos(angle)*speed, vy:Math.sin(angle)*speed-2, life:1, decay:0.025+Math.random()*0.04, r:1+Math.random()*2, color:C.spark[Math.floor(Math.random()*C.spark.length)], gravity:0.12, trail:[]});
    }
  }

  function drawSparks() {
    for (var i = SPARKS.length-1; i >= 0; i--) {
      var s = SPARKS[i];
      s.trail.push({x:s.x, y:s.y});
      if (s.trail.length > 6) s.trail.shift();
      s.vx *= 0.97; s.vy += s.gravity; s.x += s.vx; s.y += s.vy; s.life -= s.decay;
      if (s.life <= 0) { SPARKS.splice(i,1); continue; }
      for (var j = 1; j < s.trail.length; j++) {
        ctx.beginPath(); ctx.moveTo(s.trail[j-1].x,s.trail[j-1].y); ctx.lineTo(s.trail[j].x,s.trail[j].y);
        ctx.strokeStyle = s.color; ctx.globalAlpha = (j/s.trail.length)*s.life*0.5; ctx.lineWidth = 0.8; ctx.stroke();
      }
      ctx.globalAlpha = s.life;
      ctx.beginPath(); ctx.arc(s.x,s.y,s.r*s.life,0,Math.PI*2); ctx.fillStyle = s.color; ctx.fill();
      ctx.beginPath(); ctx.arc(s.x,s.y,s.r*3*s.life,0,Math.PI*2); ctx.fillStyle = s.color; ctx.globalAlpha = s.life*0.15; ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  function loop(ts) {
    var t = ts / 1000;
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle = C.bg; ctx.fillRect(0,0,W,H);
    drawGrid();
    drawCircuits(t);
    for (var gi = 0; gi < GEARS.length; gi++) drawGear(GEARS[gi], t);
    drawLasers(t);
    drawWeldArcs();
    drawCNCCoords(t);
    drawReticles(t);
    drawParticles();
    if (ts - lastSpark > 350) { spawnSpark(); lastSpark = ts; }
    drawSparks();
    raf = requestAnimationFrame(loop);
  }
  raf = requestAnimationFrame(loop);
})();
