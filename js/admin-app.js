/* Admin panel logic — extracted from admin.html */
const db = window.MetamasDB;
let productosData=[], catalogoData=[], serviciosData=[];
let srvEditingId=null;
let toastTimer, editingId=null, photoData=null, catEditingId=null, catFotosArray=[], deleteCallback=null;

/* ── Utils ── */
function showToast(msg,type='success'){const t=document.getElementById('admin-toast');t.textContent=({success:'✅',error:'❌',info:'🔄'}[type]||'')+' '+msg;t.className=`admin-toast show ${type}`;clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),3500)}
function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')}
function setSyncState(s){const d=document.getElementById('sync-dot'),t=document.getElementById('sync-text');if(s==='live'){d.className='sync-dot';t.textContent='En vivo'}if(s==='syncing'){d.className='sync-dot syncing';t.textContent='Guardando...'}if(s==='error'){d.className='sync-dot error';t.textContent='Sin conexión'}}
function spinBtn(id,spinnerId,on){document.getElementById(id).disabled=on;document.getElementById(spinnerId).style.display=on?'block':'none'}

/* ── Arranque ── */
async function init(){try{const s=await db.getSession();document.getElementById('splash').classList.add('hidden');if(s){showApp(s)}else{showLogin()}}catch(e){document.getElementById('splash').classList.add('hidden');showLogin()}}
function showLogin(){document.getElementById('login-screen').classList.add('show')}
function showApp(session){document.getElementById('login-screen').classList.remove('show');document.getElementById('app').classList.add('show');const el=document.getElementById('session-email-info');if(el)el.textContent=`Sesión activa: ${session.user.email}`;initApp()}

/* ── Login ── */
document.getElementById('login-btn').addEventListener('click',doLogin);
document.getElementById('login-pass').addEventListener('keydown',e=>{if(e.key==='Enter')doLogin()});
document.getElementById('login-email').addEventListener('keydown',e=>{if(e.key==='Enter')document.getElementById('login-pass').focus()});
async function doLogin(){
  /* ── Brute force protection ── */
  const LOCK_KEY = 'mm_admin_lock', ATT_KEY = 'mm_admin_att', MAX_ATT = 3, LOCK_MIN = 15;
  try{
    const lockUntil = parseInt(localStorage.getItem(LOCK_KEY)||'0');
    if(lockUntil && Date.now() < lockUntil){
      const mins = Math.ceil((lockUntil - Date.now())/60000);
      const errEl = document.getElementById('login-error');
      errEl.textContent = `Demasiados intentos fallidos. Esperá ${mins} minuto${mins>1?'s':''}.`;
      errEl.classList.add('show'); return;
    }
  }catch(e){}

  const email=document.getElementById('login-email').value.trim();
  const pass=document.getElementById('login-pass').value;
  const errEl=document.getElementById('login-error');
  errEl.classList.remove('show');
  spinBtn('login-btn','login-spinner',true);
  document.getElementById('login-btn-text').textContent='Verificando...';
  try{
    const data=await db.login(email,pass);
    try{ localStorage.removeItem(ATT_KEY); localStorage.removeItem(LOCK_KEY); }catch(e){}
    showApp(data.session);
  }
  catch(e){
    try{
      const att = parseInt(localStorage.getItem(ATT_KEY)||'0') + 1;
      localStorage.setItem(ATT_KEY, att);
      if(att >= MAX_ATT){
        localStorage.setItem(LOCK_KEY, Date.now() + LOCK_MIN*60*1000);
        errEl.textContent = `Cuenta bloqueada por ${LOCK_MIN} minutos por seguridad.`;
      } else {
        const remaining = MAX_ATT - att;
        errEl.textContent = `Email o contraseña incorrectos. ${remaining} intento${remaining!==1?'s':''} restante${remaining!==1?'s':''}.`;
      }
    }catch(ex){}
    errEl.classList.add('show');
  }
  finally{spinBtn('login-btn','login-spinner',false);document.getElementById('login-btn-text').textContent='Ingresar de forma segura →'}
}

/* ── Logout ── */
async function doLogout(){await db.logout();location.reload()}
document.getElementById('logout-btn').addEventListener('click',doLogout);

/* ── App principal ── */
async function initApp(){
  // Función centralizada para cambiar panel (desktop sidebar + mobile nav)
  function switchPanel(panelName){
    document.querySelectorAll('.sidebar-item').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.mn-btn').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
    const sidebarBtn=document.querySelector(`.sidebar-item[data-panel="${panelName}"]`);
    const mobileBtn=document.querySelector(`.mn-btn[data-panel="${panelName}"]`);
    if(sidebarBtn)sidebarBtn.classList.add('active');
    if(mobileBtn)mobileBtn.classList.add('active');
    const panel=document.getElementById('panel-'+panelName);
    if(panel){panel.classList.add('active');panel.scrollIntoView({behavior:'smooth',block:'start'});}
  }
  document.querySelectorAll('.sidebar-item').forEach(btn=>btn.addEventListener('click',()=>switchPanel(btn.dataset.panel)));
  document.querySelectorAll('.mn-btn').forEach(btn=>btn.addEventListener('click',()=>switchPanel(btn.dataset.panel)));
  document.getElementById('search-input').addEventListener('input',e=>renderProductos(e.target.value));
  document.getElementById('cat-search-input').addEventListener('input',e=>renderCatalogo(e.target.value));
  document.getElementById('btn-add-producto').addEventListener('click',()=>openModal(null));
  document.getElementById('btn-add-catalogo').addEventListener('click',()=>openCatModal(null));
  document.getElementById('btn-reset-prod').addEventListener('click',resetProductos);
  document.getElementById('btn-reset-cat').addEventListener('click',resetCatalogo);
  document.getElementById('btn-reset-srv').addEventListener('click',resetServicios);
  document.getElementById('logout-btn-2').addEventListener('click',doLogout);
  initModal(); initCatModal(); initConfirm(); initSrvModal(); initContactConfig();
  await Promise.all([loadProductos(),loadCatalogo(),loadServicios(),loadContactConfig()]);
  /* Tiempo real */
  db.subscribe('productos',v=>{if(v){productosData=v;renderProductos(document.getElementById('search-input').value);showToast('Productos actualizados','info')}});
  db.subscribe('catalogo',v=>{if(v){catalogoData=v;renderCatalogo(document.getElementById('cat-search-input').value);showToast('Catálogo actualizado','info')}});
  db.subscribe('servicios',v=>{if(v&&Array.isArray(v)&&v.length>0){serviciosData=v;renderServicios();showToast('Servicios actualizados','info')}});
  db.subscribe('contact_config',v=>{if(v){renderContactPreview(v);showToast('Datos de contacto actualizados 🌐','info')}});
  setSyncState('live');
}

/* ── Productos: carga ── */
async function loadProductos(){try{const d=await db.getData('productos');productosData=d||window.MetamasData.getProductos();renderProductos()}catch(e){productosData=window.MetamasData.getProductos();renderProductos();setSyncState('error')}}

function renderProductos(filter=''){
  const q=filter.toLowerCase().trim();
  const filtered=q?productosData.filter(p=>p.nombre.toLowerCase().includes(q)||(p.seccion||'').toLowerCase().includes(q)):productosData;
  document.getElementById('stat-total').textContent=productosData.length;
  document.getElementById('stat-visible').textContent=productosData.filter(p=>p.visible).length;
  document.getElementById('stat-precio').textContent=productosData.filter(p=>p.precio>0).length;
  const c=document.getElementById('products-list');
  if(!filtered.length){c.innerHTML=`<div class="empty-state"><div class="empty-state-icon">📦</div><h3>Sin resultados</h3></div>`;return}
  c.innerHTML=filtered.map(p=>{
    const imgEl=p.imagen?`<img class="product-row-img" src="${esc(p.imagen)}" onerror="this.outerHTML='<div class=\\'product-row-img placeholder\\'>📦</div>'">`:`<div class="product-row-img placeholder">📦</div>`;
    const precio=p.precio>0?`<span class="product-row-price">$${Number(p.precio).toLocaleString('es-AR')}</span>`:`<span class="product-row-price cotizar">A cotizar</span>`;
    const status=p.visible?`<span class="badge-status visible">● Visible</span>`:`<span class="badge-status hidden">● Oculto</span>`;
    return `<div class="product-row"><div>${imgEl}</div><div><div class="product-row-name">${esc(p.nombre)}</div></div><div class="col-section"><span class="product-row-section">${esc(p.seccion||'—')}</span></div><div>${precio}</div><div class="col-status">${status}</div><div class="row-actions"><button class="btn-icon edit" onclick="openModal('${esc(p.id)}')" title="Editar"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button><button class="btn-icon danger" onclick="confirmDelete('${esc(p.id)}','${esc(p.nombre)}','prod')" title="Eliminar"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg></button></div></div>`;
  }).join('');
}

async function saveProductos(lista){setSyncState('syncing');try{await db.setData('productos',lista);productosData=lista;setSyncState('live')}catch(e){setSyncState('error');throw e}}
async function resetProductos(){if(!confirm('¿Restaurar productos a los valores por defecto? Se aplicará a todos los visitantes.'))return;const d=window.MetamasData.resetProductos();await saveProductos(d);renderProductos();showToast('Productos restaurados')}

/* ── Modal producto ── */
function initModal(){
  document.getElementById('modal-cancel').addEventListener('click',closeModal);
  document.getElementById('modal-overlay').addEventListener('click',e=>{if(e.target===document.getElementById('modal-overlay'))closeModal()});
  document.getElementById('modal-save').addEventListener('click',saveProducto);
  document.getElementById('btn-add-step').addEventListener('click',()=>{const l=document.getElementById('proceso-list');const d=document.createElement('div');d.className='proceso-item';d.innerHTML=`<input type="text" placeholder="Paso ${l.children.length+1}..."/><button class="btn-remove-step" type="button" onclick="this.closest('.proceso-item').remove()">×</button>`;l.appendChild(d);d.querySelector('input').focus()});
  const fi=document.getElementById('f-foto');
  fi.addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;if(f.size>2*1024*1024){showToast('Imagen demasiado grande (máx 2 MB)','error');return}const r=new FileReader();r.onload=ev=>{photoData=ev.target.result;document.getElementById('photo-preview').src=photoData;document.getElementById('photo-preview').classList.add('show');document.getElementById('photo-placeholder').style.display='none';document.getElementById('f-foto-url').value=''};r.readAsDataURL(f)});
  const area=document.getElementById('photo-area');
  area.addEventListener('dragover',e=>{e.preventDefault();area.classList.add('dragover')});
  area.addEventListener('dragleave',()=>area.classList.remove('dragover'));
  area.addEventListener('drop',e=>{e.preventDefault();area.classList.remove('dragover');const f=e.dataTransfer.files[0];if(f&&f.type.startsWith('image/')){const r=new FileReader();r.onload=ev=>{photoData=ev.target.result;document.getElementById('photo-preview').src=photoData;document.getElementById('photo-preview').classList.add('show');document.getElementById('photo-placeholder').style.display='none'};r.readAsDataURL(f)}});
}

window.openModal=function(id){
  editingId=id||null;photoData=null;
  const p=id?productosData.find(x=>x.id===id):null;
  document.getElementById('modal-title').textContent=p?'Editar Producto':'Nuevo Producto';
  document.getElementById('f-nombre').value=p?p.nombre:'';
  document.getElementById('f-seccion').value=p?(p.seccion||''):'';
  document.getElementById('f-precio').value=p?(p.precio||0):0;
  document.getElementById('f-descripcion').value=p?(p.descripcion||''):'';
  document.getElementById('f-visible').value=p?String(p.visible!==false):'true';
  document.getElementById('f-foto-url').value=(p&&p.imagen&&!p.imagen.startsWith('data:'))?p.imagen:'';
  const prev=document.getElementById('photo-preview'),ph=document.getElementById('photo-placeholder');
  if(p&&p.imagen){prev.src=p.imagen;prev.classList.add('show');ph.style.display='none'}else{prev.src='';prev.classList.remove('show');ph.style.display=''}
  document.getElementById('proceso-list').innerHTML=(p?(p.proceso||[]):['','','']).map((s,i)=>`<div class="proceso-item"><input type="text" placeholder="Paso ${i+1}..." value="${esc(s)}"/><button class="btn-remove-step" type="button" onclick="this.closest('.proceso-item').remove()">×</button></div>`).join('');
  document.getElementById('modal-overlay').classList.add('open');
  document.getElementById('f-nombre').focus();
};

function closeModal(){document.getElementById('modal-overlay').classList.remove('open');editingId=null;photoData=null;document.getElementById('f-foto').value=''}

async function saveProducto(){
  const nombre=document.getElementById('f-nombre').value.trim();
  if(!nombre){showToast('El nombre es obligatorio','error');return}
  spinBtn('modal-save','save-spinner',true);
  try{
    const imagen=photoData||document.getElementById('f-foto-url').value.trim()||'';
    const producto={id:editingId||window.MetamasData.generarId(nombre),nombre,seccion:document.getElementById('f-seccion').value.trim(),precio:parseFloat(document.getElementById('f-precio').value)||0,descripcion:document.getElementById('f-descripcion').value.trim(),imagen,proceso:Array.from(document.querySelectorAll('#proceso-list .proceso-item input')).map(i=>i.value.trim()).filter(Boolean),visible:document.getElementById('f-visible').value==='true'};
    const lista=editingId?productosData.map(p=>p.id===editingId?producto:p):[...productosData,producto];
    await saveProductos(lista);renderProductos(document.getElementById('search-input').value);closeModal();
    showToast(editingId?'Producto actualizado 🌐':'Producto publicado 🌐');
  }catch(e){showToast('Error al guardar. Verificá la conexión.','error')}
  finally{spinBtn('modal-save','save-spinner',false)}
}

/* ── Catálogo: carga ── */
async function loadCatalogo(){try{const d=await db.getData('catalogo');catalogoData=d||window.MetamasCatalogo.getCatalogo();renderCatalogo()}catch(e){catalogoData=window.MetamasCatalogo.getCatalogo();renderCatalogo()}}

function renderCatalogo(filter=''){
  const CAT={mesas:'Mesas',asientos:'Asientos',soportes:'Soportes',almacenaje:'Almacenaje',otro:'Otro'};
  const q=filter.toLowerCase().trim();
  const filtered=q?catalogoData.filter(p=>p.name.toLowerCase().includes(q)||(p.category||'').toLowerCase().includes(q)):catalogoData;
  document.getElementById('cat-stat-total').textContent=catalogoData.length;
  document.getElementById('cat-stat-visible').textContent=catalogoData.filter(p=>p.visible!==false).length;
  document.getElementById('cat-stat-precio').textContent=catalogoData.filter(p=>p.price>0).length;
  const c=document.getElementById('catalogo-list');
  if(!filtered.length){c.innerHTML=`<div class="empty-state"><div class="empty-state-icon">📚</div><h3>Sin resultados</h3></div>`;return}
  c.innerHTML=filtered.map(p=>{
    const img0=p.images&&p.images.length?p.images[0]:'';
    const imgEl=img0?`<img class="product-row-img" src="${esc(img0)}" onerror="this.outerHTML='<div class=\\'product-row-img placeholder\\'>📦</div>'">`:`<div class="product-row-img placeholder">📦</div>`;
    const precio=p.price>0?`<span class="product-row-price">$${Number(p.price).toLocaleString('es-AR')}</span>`:`<span class="product-row-price cotizar">Consultar</span>`;
    const status=p.visible!==false?`<span class="badge-status visible">● Visible</span>`:`<span class="badge-status hidden">● Oculto</span>`;
    return `<div class="product-row" style="grid-template-columns:60px 1fr 120px 130px 90px 110px"><div>${imgEl}</div><div><div class="product-row-name">${esc(p.name)}</div>${p.badge?`<span style="font-size:11px;background:rgba(224,85,0,.15);color:#e05500;padding:2px 7px;border-radius:4px;font-weight:600">${esc(p.badge)}</span>`:''}</div><div class="col-section"><span class="product-row-section">${esc(CAT[p.category]||p.category||'—')}</span></div><div>${precio}</div><div class="col-status">${status}</div><div class="row-actions"><button class="btn-icon edit" onclick="openCatModal('${esc(p.id)}')" title="Editar"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button><button class="btn-icon danger" onclick="confirmDelete('${esc(p.id)}','${esc(p.name)}','cat')" title="Eliminar"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg></button></div></div>`;
  }).join('');
}

async function saveCatalogo(lista){setSyncState('syncing');try{await db.setData('catalogo',lista);catalogoData=lista;setSyncState('live')}catch(e){setSyncState('error');throw e}}
async function resetCatalogo(){if(!confirm('¿Restaurar catálogo a los valores por defecto?'))return;const d=window.MetamasCatalogo.resetCatalogo();await saveCatalogo(d);renderCatalogo();showToast('Catálogo restaurado')}

/* ── Modal catálogo ── */
function initCatModal(){
  document.getElementById('cat-modal-cancel').addEventListener('click',closeCatModal);
  document.getElementById('cat-modal-overlay').addEventListener('click',e=>{if(e.target===document.getElementById('cat-modal-overlay'))closeCatModal()});
  document.getElementById('cat-modal-save').addEventListener('click',saveCatItem);
  document.getElementById('cf-btn-add-spec').addEventListener('click',()=>{const l=document.getElementById('cf-specs-list');const d=document.createElement('div');d.className='proceso-item';d.innerHTML=`<input type="text" placeholder="Ej: Material: Acero ST37"/><button class="btn-remove-step" type="button" onclick="this.closest('.proceso-item').remove()">×</button>`;l.appendChild(d);d.querySelector('input').focus()});
  const fi=document.getElementById('cf-foto-input');
  fi.addEventListener('change',e=>{Array.from(e.target.files).forEach(f=>{if(f.size>2*1024*1024){showToast('Una imagen supera 2 MB','error');return}const r=new FileReader();r.onload=ev=>{catFotosArray.push(ev.target.result);renderCatFotos()};r.readAsDataURL(f)});fi.value=''});
  const area=document.getElementById('cf-photo-area');
  area.addEventListener('dragover',e=>{e.preventDefault();area.classList.add('dragover')});
  area.addEventListener('dragleave',()=>area.classList.remove('dragover'));
  area.addEventListener('drop',e=>{e.preventDefault();area.classList.remove('dragover');Array.from(e.dataTransfer.files).filter(f=>f.type.startsWith('image/')).forEach(f=>{const r=new FileReader();r.onload=ev=>{catFotosArray.push(ev.target.result);renderCatFotos()};r.readAsDataURL(f)})});
}

function renderCatFotos(){
  document.getElementById('cf-fotos-preview').innerHTML=catFotosArray.map((src,i)=>`<div class="cat-foto-thumb"><img src="${esc(src)}"/><button class="remove-foto" onclick="catFotosArray.splice(${i},1);renderCatFotos()">×</button>${i===0?'<div class="cat-foto-principal">PRINCIPAL</div>':''}</div>`).join('');
}

window.openCatModal=function(id){
  catEditingId=id||null;catFotosArray=[];
  const p=id?catalogoData.find(x=>x.id===id):null;
  document.getElementById('cat-modal-title').textContent=p?'Editar ítem de Catálogo':'Nuevo ítem de Catálogo';
  document.getElementById('cf-nombre').value=p?p.name:'';
  document.getElementById('cf-categoria').value=p?(p.category||'mesas'):'mesas';
  document.getElementById('cf-badge').value=p?(p.badge||''):'';
  document.getElementById('cf-precio').value=p?(p.price||0):0;
  document.getElementById('cf-shortdesc').value=p?(p.shortDesc||''):'';
  document.getElementById('cf-longdesc').value=p?(p.longDesc||''):'';
  document.getElementById('cf-video').value=p?(p.videoUrl||''):'';
  document.getElementById('cf-visible').value=p?String(p.visible!==false):'true';
  document.getElementById('cf-foto-urls').value='';
  if(p&&p.images)catFotosArray=[...p.images];
  renderCatFotos();
  document.getElementById('cf-specs-list').innerHTML=(p?(p.specs||[]):[]).map(s=>`<div class="proceso-item"><input type="text" value="${esc(s)}" placeholder="Especificación..."/><button class="btn-remove-step" type="button" onclick="this.closest('.proceso-item').remove()">×</button></div>`).join('');
  document.getElementById('cat-modal-overlay').classList.add('open');
  document.getElementById('cf-nombre').focus();
};

function closeCatModal(){document.getElementById('cat-modal-overlay').classList.remove('open');catEditingId=null;catFotosArray=[]}

async function saveCatItem(){
  const nombre=document.getElementById('cf-nombre').value.trim();
  if(!nombre){showToast('El nombre es obligatorio','error');return}
  spinBtn('cat-modal-save','cat-save-spinner',true);
  try{
    const urlsExtra=document.getElementById('cf-foto-urls').value.trim();
    let fotos=[...catFotosArray];
    if(urlsExtra)urlsExtra.split(',').map(u=>u.trim()).filter(Boolean).forEach(u=>{if(!fotos.includes(u))fotos.push(u)});
    if(!fotos.length)fotos=['assets/img/bases-metalicas.png'];
    const specs=Array.from(document.querySelectorAll('#cf-specs-list .proceso-item input')).map(i=>i.value.trim()).filter(Boolean);
    const item={id:catEditingId||window.MetamasCatalogo.generarId(nombre),name:nombre,category:document.getElementById('cf-categoria').value,badge:document.getElementById('cf-badge').value.trim(),price:parseFloat(document.getElementById('cf-precio').value)||0,shortDesc:document.getElementById('cf-shortdesc').value.trim(),longDesc:document.getElementById('cf-longdesc').value.trim(),images:fotos,specs,videoUrl:document.getElementById('cf-video').value.trim(),visible:document.getElementById('cf-visible').value==='true'};
    const lista=catEditingId?catalogoData.map(p=>p.id===catEditingId?item:p):[...catalogoData,item];
    await saveCatalogo(lista);renderCatalogo(document.getElementById('cat-search-input').value);closeCatModal();
    showToast(catEditingId?'Ítem actualizado 🌐':'Ítem publicado 🌐');
  }catch(e){showToast('Error al guardar. Verificá la conexión.','error')}
  finally{spinBtn('cat-modal-save','cat-save-spinner',false)}
}

/* ── Confirmar eliminar ── */
function initConfirm(){
  document.getElementById('confirm-cancel').addEventListener('click',()=>{document.getElementById('confirm-overlay').classList.remove('open');deleteCallback=null});
  document.getElementById('confirm-ok').addEventListener('click',async()=>{
    if(!deleteCallback)return;
    spinBtn('confirm-ok','delete-spinner',true);
    try{await deleteCallback()}finally{spinBtn('confirm-ok','delete-spinner',false);document.getElementById('confirm-overlay').classList.remove('open');deleteCallback=null}
  });
}
window.confirmDelete=function(id,nombre,tipo){
  document.getElementById('confirm-msg').textContent=`¿Eliminar "${nombre}"? Se reflejará en el sitio para todos los usuarios de inmediato.`;
  document.getElementById('confirm-overlay').classList.add('open');
  deleteCallback=async()=>{
    if(tipo==='prod'){await saveProductos(productosData.filter(p=>p.id!==id));renderProductos(document.getElementById('search-input').value);showToast('Producto eliminado del sitio 🌐')}
    else if(tipo==='cat'){await saveCatalogo(catalogoData.filter(p=>p.id!==id));renderCatalogo(document.getElementById('cat-search-input').value);showToast('Ítem eliminado del catálogo 🌐')}
    else if(tipo==='srv'){await saveServicios(serviciosData.filter(s=>s.id!==id));renderServicios();showToast('Servicio eliminado 🌐')}
  };
};

/* ════════════════════════════════════════
   SERVICIOS
═══════════════════════════════════════ */
const DEFAULT_SERVICIOS=[
  {id:'estampado',nombre:'Estampado',items:['Balancines','Prensas hidráulicas']},
  {id:'tornos-cnc',nombre:'Tornos CNC',items:['Tornos CNC']},
  {id:'mecanizados-cnc',nombre:'Mecanizados CNC',items:['Tornos paralelos con regla digital','Tornería automática','Rectificadora universal']},
  {id:'soldaduras',nombre:'Soldaduras',items:['Soldadura MIG','Soldadura TIG','Soldadura con electrodos','Soldadura de punto']},
  {id:'centro-mecanizados',nombre:'Centro de mecanizados',items:['Fresado CNC','Perforado y roscado','Series y repetitividad']},
  {id:'plegados',nombre:'Plegados',items:['Corte y plegado de chapa','Guillotina y plegadora CNC']}
];

async function loadServicios(){
  // Deshabilitar el botón mientras carga para evitar race conditions
  const addBtn=document.getElementById('btn-add-servicio');
  if(addBtn){addBtn.disabled=true;addBtn.style.opacity='0.5';}
  try{
    const raw=await db.getData('servicios');
    // Tratar null, undefined O array vacío como "sin datos" → usar defaults
    serviciosData=(Array.isArray(raw)&&raw.length>0)?raw:DEFAULT_SERVICIOS;
    renderServicios();
  }catch(e){
    serviciosData=DEFAULT_SERVICIOS;
    renderServicios();
    setSyncState('error');
  }finally{
    if(addBtn){addBtn.disabled=false;addBtn.style.opacity='';}
  }
}

function renderServicios(){
  document.getElementById('srv-stat-total').textContent=serviciosData.length;
  document.getElementById('srv-stat-items').textContent=serviciosData.reduce((a,s)=>a+(s.items||[]).length,0);
  const c=document.getElementById('servicios-list');
  if(!serviciosData.length){c.innerHTML='<div class="empty-state"><div class="empty-state-icon">🔧</div><h3>Sin servicios</h3><p>Agregá tu primer servicio con el botón de arriba.</p></div>';return}
  c.innerHTML=serviciosData.map(s=>`
    <div class="product-row" style="grid-template-columns:1fr 2fr 110px">
      <div style="font-weight:600;font-size:14px">${esc(s.nombre)}</div>
      <div style="font-size:13px;color:var(--text-soft)">${(s.items||[]).map(i=>`<span style="display:inline-block;margin:2px 4px 2px 0;padding:2px 8px;background:rgba(255,255,255,.06);border-radius:4px">${esc(i)}</span>`).join('')}</div>
      <div class="row-actions">
        <button class="btn-icon edit" onclick="openSrvModal('${esc(s.id)}')" title="Editar">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button class="btn-icon danger" onclick="confirmDelete('${esc(s.id)}','${esc(s.nombre)}','srv')" title="Eliminar">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
        </button>
      </div>
    </div>`).join('');
}

async function saveServicios(lista){
  setSyncState('syncing');
  try{await db.setData('servicios',lista);serviciosData=lista;setSyncState('live')}
  catch(e){setSyncState('error');throw e}
}

async function resetServicios(){
  if(!confirm('¿Restaurar los servicios originales? Se reemplazarán los actuales para todos los visitantes.'))return;
  await saveServicios(DEFAULT_SERVICIOS);
  renderServicios();
  showToast('Servicios restaurados 🌐');
}

function initSrvModal(){
  document.getElementById('srv-modal-cancel').addEventListener('click',closeSrvModal);
  document.getElementById('srv-modal-overlay').addEventListener('click',e=>{if(e.target===document.getElementById('srv-modal-overlay'))closeSrvModal()});
  document.getElementById('btn-add-servicio').addEventListener('click',()=>openSrvModal(null));
  document.getElementById('sf-btn-add-item').addEventListener('click',addSrvItem);
  document.getElementById('srv-modal-save').addEventListener('click',saveSrvItem);
}

function addSrvItem(value=''){
  const list=document.getElementById('sf-items-list');
  const div=document.createElement('div');
  div.className='proceso-item';
  div.innerHTML=`<input type="text" placeholder="Ej: Soldadura MIG" value="${esc(value)}"/><button class="btn-remove-step" type="button" onclick="this.closest('.proceso-item').remove()">×</button>`;
  list.appendChild(div);
  div.querySelector('input').focus();
}

window.openSrvModal=function(id){
  srvEditingId=id;
  const s=id?serviciosData.find(x=>x.id===id):null;
  document.getElementById('srv-modal-title').textContent=s?'Editar servicio':'Nuevo servicio';
  document.getElementById('sf-nombre').value=s?s.nombre:'';
  const list=document.getElementById('sf-items-list');
  list.innerHTML='';
  (s?s.items||[]:[''])  .forEach(i=>addSrvItem(i));
  document.getElementById('srv-modal-overlay').classList.add('open');
  document.getElementById('sf-nombre').focus();
};

function closeSrvModal(){document.getElementById('srv-modal-overlay').classList.remove('open');srvEditingId=null}

async function saveSrvItem(){
  const nombre=document.getElementById('sf-nombre').value.trim();
  if(!nombre){showToast('El nombre del servicio es obligatorio','error');return}
  spinBtn('srv-modal-save','srv-save-spinner',true);
  try{
    const items=Array.from(document.querySelectorAll('#sf-items-list .proceso-item input')).map(i=>i.value.trim()).filter(Boolean);
    const genId=s=>s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
    const id=srvEditingId||(genId(nombre)+'-'+Date.now());
    const srv={id,nombre,items};
    const lista=srvEditingId?serviciosData.map(s=>s.id===srvEditingId?srv:s):[...serviciosData,srv];
    await saveServicios(lista);renderServicios();closeSrvModal();
    showToast(srvEditingId?'Servicio actualizado 🌐':'Servicio publicado 🌐');
  }catch(e){showToast('Error al guardar','error')}
  finally{spinBtn('srv-modal-save','srv-save-spinner',false)}
}


/* ══════════════════════════════════════════════════════════════
   MÓDULO: CONFIGURACIÓN DE CONTACTO
   ══════════════════════════════════════════════════════════════ */

const CONTACT_DEFAULTS = {
  phone: '5493412622980',
  phone_display: '341 262-2980',
  email: 'metalurgicamassaccesi@yahoo.com.ar'
};

let contactData = { ...CONTACT_DEFAULTS };

/* ── Cargar desde Supabase ── */
async function loadContactConfig() {
  try {
    const saved = await db.getData('contact_config');
    if (saved && saved.phone && saved.email) {
      contactData = { ...CONTACT_DEFAULTS, ...saved };
    }
    renderContactPreview(contactData);
    fillContactForm(contactData);
  } catch(e) {
    renderContactPreview(CONTACT_DEFAULTS);
    fillContactForm(CONTACT_DEFAULTS);
  }
}

/* ── Renderizar tarjeta de preview ── */
function renderContactPreview(cfg) {
  const phoneEl = document.getElementById('cprev-phone');
  const emailEl = document.getElementById('cprev-email');
  const waBtn   = document.getElementById('cprev-test-wa');
  const mailBtn = document.getElementById('cprev-test-mail');
  if (!phoneEl) return;
  phoneEl.textContent = `+54 ${cfg.phone_display || cfg.phone}`;
  emailEl.textContent = cfg.email;
  waBtn.href   = `https://wa.me/${cfg.phone}`;
  mailBtn.href = `mailto:${cfg.email}`;
}

/* ── Rellenar campos del formulario ── */
function fillContactForm(cfg) {
  const phoneIn   = document.getElementById('cef-phone');
  const displayIn = document.getElementById('cef-phone-display');
  const emailIn   = document.getElementById('cef-email');
  if (!phoneIn) return;
  phoneIn.value   = cfg.phone        || '';
  displayIn.value = cfg.phone_display|| '';
  emailIn.value   = cfg.email        || '';
}

/* ── Mostrar feedback ── */
function showContactFeedback(msg, type = 'ok') {
  const el = document.getElementById('cef-feedback');
  if (!el) return;
  el.textContent = (type === 'ok' ? '✅ ' : '❌ ') + msg;
  el.className = `cef-feedback ${type}`;
  el.style.display = 'flex';
  setTimeout(() => { el.style.display = 'none'; }, 5000);
}

/* ── Validaciones básicas ── */
function validateContactForm(phone, display, email) {
  if (!/^\d{8,15}$/.test(phone))
    return 'El número de WhatsApp debe tener entre 8 y 15 dígitos (solo números, sin espacios ni +).';
  if (!display.trim())
    return 'El texto visible del teléfono no puede estar vacío.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return 'El email no tiene un formato válido.';
  return null;
}

/* ── Guardar en Supabase ── */
async function saveContactConfig() {
  const phone   = document.getElementById('cef-phone').value.trim().replace(/\D/g,'');
  const display = document.getElementById('cef-phone-display').value.trim();
  const email   = document.getElementById('cef-email').value.trim().toLowerCase();

  const err = validateContactForm(phone, display, email);
  if (err) { showContactFeedback(err, 'err'); return; }

  const saveBtn = document.getElementById('btn-save-contact');
  const saveTxt = document.getElementById('btn-save-contact-txt');
  const spinner = document.getElementById('contact-save-spinner');

  saveBtn.disabled = true;
  saveTxt.textContent = 'Guardando…';
  spinner.style.display = 'inline-block';

  try {
    const cfg = { phone, phone_display: display, email };
    await db.setData('contact_config', cfg);
    contactData = cfg;
    renderContactPreview(cfg);
    showContactFeedback('¡Cambios publicados en todo el sitio en tiempo real! 🌐', 'ok');
    showToast('Contacto actualizado 🌐');
  } catch(e) {
    showContactFeedback('Error al guardar. Revisá tu conexión e intentá de nuevo.', 'err');
  } finally {
    saveBtn.disabled = false;
    saveTxt.textContent = 'Guardar y publicar';
    spinner.style.display = 'none';
  }
}

/* ── Restaurar defaults ── */
function resetContactConfig() {
  document.getElementById('confirm-msg').textContent =
    '¿Restaurar los datos de contacto originales? El teléfono y email volverán a los valores con los que se armó el sitio.';
  document.getElementById('confirm-overlay').classList.add('open');
  deleteCallback = async () => {
    await db.setData('contact_config', CONTACT_DEFAULTS);
    contactData = { ...CONTACT_DEFAULTS };
    renderContactPreview(contactData);
    fillContactForm(contactData);
    showContactFeedback('Valores originales restaurados.', 'ok');
    showToast('Contacto restaurado');
  };
}

/* ── Init listeners ── */
function initContactConfig() {
  document.getElementById('btn-save-contact').addEventListener('click', saveContactConfig);
  document.getElementById('btn-reset-contact').addEventListener('click', resetContactConfig);

  // Auto-limpiar el campo phone (solo dígitos)
  document.getElementById('cef-phone').addEventListener('input', function() {
    this.value = this.value.replace(/\D/g,'');
  });
}

init();
