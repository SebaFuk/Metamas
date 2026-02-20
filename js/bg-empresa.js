(function () {
  var canvas = document.getElementById('metamas-bg');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var W = 0, H = 0, scrollY = 0, raf;
  var CIRCUITS = [], PARTICLES = [], SPARKS = [];
  var lastSpark = 0;
  var C = { bg:'#071c26', grid:'rgba(15,115,145,0.07)', gridAcc:'rgba(15,115,145,0.18)', gear:'rgba(15,115,145,0.10)', gearStroke:'rgba(15,115,145,0.22)' };
  var GEARS = [{x:0.06,y:0.12,r:100,teeth:16,speed:0.002,angle:0},{x:0.94,y:0.08,r:70,teeth:12,speed:-0.004,angle:1.1},{x:0.88,y:0.55,r:120,teeth:20,speed:0.0015,angle:0.5},{x:0.03,y:0.70,r:80,teeth:13,speed:-0.003,angle:2},{x:0.50,y:0.92,r:90,teeth:14,speed:0.002,angle:0.8},{x:0.96,y:0.85,r:55,teeth:9,speed:-0.005,angle:1.5}];
  var HITOS = [2002,2006,2010,2014,2018,2022,2024];

  function initCircuits() {
    CIRCUITS = [];
    var count = Math.floor(W/140);
    for (var i=0;i<count;i++){var segs=[];var cx=Math.random()*W,cy=Math.random()*H*2;var dirs=[[1,0],[-1,0],[0,1],[0,-1]];var dir=dirs[Math.floor(Math.random()*4)];for(var s=0;s<6+Math.random()*6;s++){var len=40+Math.random()*120;segs.push({x:cx,y:cy});cx+=dir[0]*len;cy+=dir[1]*len;var perp=[[-dir[1],dir[0]],[dir[1],-dir[0]]];dir=perp[Math.floor(Math.random()*2)];}CIRCUITS.push({segs:segs,speed:0.2+Math.random()*0.4,pulse:Math.random()*Math.PI*2});}
  }
  function initParticles() {
    PARTICLES = [];
    var count=Math.min(80,Math.floor(W*H/14000));
    for(var i=0;i<count;i++)PARTICLES.push({x:Math.random()*W,y:Math.random()*H,r:0.6+Math.random()*1.8,vx:(Math.random()-0.5)*0.25,vy:-0.1-Math.random()*0.2,alpha:0.15+Math.random()*0.35,twinkle:Math.random()*Math.PI*2,tSpeed:0.01+Math.random()*0.02});
  }
  function resize(){W=canvas.width=window.innerWidth;H=canvas.height=window.innerHeight;initCircuits();initParticles();}
  window.addEventListener('resize',resize);
  window.addEventListener('scroll',function(){scrollY=window.scrollY;},{passive:true});
  resize();

  function drawGrid(){var o=-scrollY*0.08,s=48;ctx.strokeStyle=C.grid;ctx.lineWidth=0.5;for(var x=0;x<W;x+=s){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}for(var y=o%s;y<H;y+=s){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}ctx.strokeStyle=C.gridAcc;ctx.lineWidth=0.8;for(var x2=0;x2<W;x2+=s*5){ctx.beginPath();ctx.moveTo(x2,0);ctx.lineTo(x2,H);ctx.stroke();}for(var y2=o%(s*5);y2<H;y2+=s*5){ctx.beginPath();ctx.moveTo(0,y2);ctx.lineTo(W,y2);ctx.stroke();}}

  function drawGear(g,t){var x=g.x*W,y=g.y*H-scrollY*0.15,angle=g.angle+t*g.speed,r=g.r,teeth=g.teeth,toothH=r*0.22,toothW=(Math.PI*2/teeth)*0.38;ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.beginPath();for(var i=0;i<teeth;i++){var a0=(i/teeth)*Math.PI*2,a1=a0+toothW,a2=a0+(Math.PI*2/teeth)-toothW,a3=a0+Math.PI*2/teeth;ctx.lineTo(Math.cos(a0)*r,Math.sin(a0)*r);ctx.lineTo(Math.cos(a1)*(r+toothH),Math.sin(a1)*(r+toothH));ctx.lineTo(Math.cos(a2)*(r+toothH),Math.sin(a2)*(r+toothH));ctx.lineTo(Math.cos(a3)*r,Math.sin(a3)*r);}ctx.closePath();ctx.fillStyle=C.gear;ctx.strokeStyle=C.gearStroke;ctx.lineWidth=1.5;ctx.fill();ctx.stroke();ctx.beginPath();ctx.arc(0,0,r*0.28,0,Math.PI*2);ctx.fillStyle=C.bg;ctx.fill();ctx.strokeStyle=C.gearStroke;ctx.stroke();for(var i2=0;i2<6;i2++){var a=(i2/6)*Math.PI*2;ctx.beginPath();ctx.moveTo(Math.cos(a)*r*0.30,Math.sin(a)*r*0.30);ctx.lineTo(Math.cos(a)*r*0.75,Math.sin(a)*r*0.75);ctx.strokeStyle=C.gearStroke;ctx.lineWidth=1;ctx.stroke();}ctx.restore();}

  function drawCircuits(t){for(var ci=0;ci<CIRCUITS.length;ci++){var c=CIRCUITS[ci],alpha=0.06+0.06*Math.sin(t*c.speed+c.pulse),off=-scrollY*0.12;ctx.save();ctx.translate(0,off);ctx.strokeStyle='rgba(0,200,255,'+alpha+')';ctx.lineWidth=1;ctx.beginPath();for(var si=0;si<c.segs.length;si++){if(si===0)ctx.moveTo(c.segs[si].x,c.segs[si].y);else ctx.lineTo(c.segs[si].x,c.segs[si].y);}ctx.stroke();for(var si2=0;si2<c.segs.length;si2++){ctx.beginPath();ctx.arc(c.segs[si2].x,c.segs[si2].y,2.5,0,Math.PI*2);ctx.fillStyle='rgba(0,200,255,'+(alpha*2)+')';ctx.fill();}ctx.restore();}}

  function drawTimeline(t){var off=-scrollY*0.05,y=H*0.93+off,x0=W*0.05,x1=W*0.95;ctx.strokeStyle='rgba(200,160,40,0.30)';ctx.lineWidth=1.5;ctx.setLineDash([8,10]);ctx.beginPath();ctx.moveTo(x0,y);ctx.lineTo(x1,y);ctx.stroke();ctx.setLineDash([]);for(var i=0;i<HITOS.length;i++){var px=x0+(i/(HITOS.length-1))*(x1-x0),pulse=0.5+0.5*Math.sin(t*0.8+i*0.9);ctx.beginPath();ctx.moveTo(px,y-10);ctx.lineTo(px,y+10);ctx.strokeStyle='rgba(200,160,40,'+(0.45+0.2*pulse)+')';ctx.lineWidth=1.5;ctx.stroke();ctx.beginPath();ctx.arc(px,y,4+pulse*3,0,Math.PI*2);ctx.fillStyle='rgba(200,160,40,'+(0.20+0.25*pulse)+')';ctx.fill();ctx.font='10px Poppins,sans-serif';ctx.fillStyle='rgba(200,160,40,'+(0.55+0.2*pulse)+')';ctx.textAlign='center';ctx.fillText(HITOS[i],px,y+22);}}

  function drawReticles(t){var off=-scrollY*0.18;var rr=[{x:0.18,y:0.42},{x:0.78,y:0.30},{x:0.62,y:0.82}];for(var i=0;i<rr.length;i++){var re=rr[i],rx=re.x*W,ry=re.y*H+off,pulse=0.3+0.2*Math.sin(t*0.8+re.x*10),size=18;ctx.save();ctx.globalAlpha=pulse;ctx.strokeStyle='rgba(15,200,230,0.6)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(rx-size,ry);ctx.lineTo(rx+size,ry);ctx.moveTo(rx,ry-size);ctx.lineTo(rx,ry+size);ctx.stroke();ctx.beginPath();ctx.arc(rx,ry,size*0.7,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.rect(rx-4,ry-4,8,8);ctx.stroke();ctx.restore();}}

  function drawDataBadges(t){var off=-scrollY*0.12;var dd=[{x:0.14,y:0.26,text:'1600 m²'},{x:0.85,y:0.15,text:'3600 m²'},{x:0.50,y:0.75,text:'20+ años'},{x:0.90,y:0.58,text:'2 km'}];for(var i=0;i<dd.length;i++){var d=dd[i],cx=d.x*W,cy=d.y*H+off,alpha=0.35+0.20*Math.sin(t*0.5+i*1.3);ctx.save();ctx.globalAlpha=alpha;ctx.font='bold 12px Poppins,sans-serif';var tw=ctx.measureText(d.text).width+22;ctx.beginPath();ctx.roundRect(cx-tw/2,cy-13,tw,26,6);ctx.fillStyle='rgba(15,115,145,0.15)';ctx.strokeStyle='rgba(0,200,255,0.40)';ctx.lineWidth=1;ctx.fill();ctx.stroke();ctx.fillStyle='rgba(0,200,255,1)';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(d.text,cx,cy);ctx.restore();}}

  function drawParticles(){var off=-scrollY*0.05;for(var i=0;i<PARTICLES.length;i++){var p=PARTICLES[i];p.x+=p.vx;p.y+=p.vy;p.twinkle+=p.tSpeed;if(p.y<-10){p.y=H+10;p.x=Math.random()*W;}if(p.x<-5)p.x=W+5;if(p.x>W+5)p.x=-5;var alpha=p.alpha*(0.6+0.4*Math.sin(p.twinkle));ctx.beginPath();ctx.arc(p.x,p.y+off,p.r,0,Math.PI*2);ctx.fillStyle='rgba(15,180,210,'+alpha+')';ctx.fill();}}

  function spawnSpark(){var oo=[{x:W*0.25,y:H*0.35},{x:W*0.72,y:H*0.22},{x:W*0.55,y:H*0.68},{x:W*0.10,y:H*0.60},{x:W*0.88,y:H*0.75}];var o=oo[Math.floor(Math.random()*oo.length)];for(var i=0;i<3+Math.floor(Math.random()*5);i++){var angle=Math.random()*Math.PI*2,speed=1.5+Math.random()*3.5;SPARKS.push({x:o.x,y:o.y-scrollY*0.2,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed-2,life:1,decay:0.025+Math.random()*0.04,r:1+Math.random()*2,color:['#ffaa00','#ffcc44','#ffffff'][Math.floor(Math.random()*3)],gravity:0.12,trail:[]});}}
  function drawSparks(){for(var i=SPARKS.length-1;i>=0;i--){var s=SPARKS[i];s.trail.push({x:s.x,y:s.y});if(s.trail.length>6)s.trail.shift();s.vx*=0.97;s.vy+=s.gravity;s.x+=s.vx;s.y+=s.vy;s.life-=s.decay;if(s.life<=0){SPARKS.splice(i,1);continue;}for(var j=1;j<s.trail.length;j++){ctx.beginPath();ctx.moveTo(s.trail[j-1].x,s.trail[j-1].y);ctx.lineTo(s.trail[j].x,s.trail[j].y);ctx.strokeStyle=s.color;ctx.globalAlpha=(j/s.trail.length)*s.life*0.5;ctx.lineWidth=0.8;ctx.stroke();}ctx.globalAlpha=s.life;ctx.beginPath();ctx.arc(s.x,s.y,s.r*s.life,0,Math.PI*2);ctx.fillStyle=s.color;ctx.fill();ctx.beginPath();ctx.arc(s.x,s.y,s.r*3*s.life,0,Math.PI*2);ctx.fillStyle=s.color;ctx.globalAlpha=s.life*0.15;ctx.fill();ctx.globalAlpha=1;}}

  function loop(ts){var t=ts/1000;ctx.clearRect(0,0,W,H);ctx.fillStyle=C.bg;ctx.fillRect(0,0,W,H);drawGrid();drawCircuits(t);for(var gi=0;gi<GEARS.length;gi++)drawGear(GEARS[gi],t);drawTimeline(t);drawReticles(t);drawParticles();drawDataBadges(t);if(ts-lastSpark>350){spawnSpark();lastSpark=ts;}drawSparks();raf=requestAnimationFrame(loop);}
  raf=requestAnimationFrame(loop);
})();
