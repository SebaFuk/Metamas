/* Page logic for servicios.html — extracted from inline script */
(function(){
  /* Sanitizador XSS mínimo para datos de Supabase */
  function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}

  var DEFAULT_SERVICIOS=[
    {id:'estampado',nombre:'Estampado',items:['Balancines','Prensas hidráulicas']},
    {id:'tornos-cnc',nombre:'Tornos CNC',items:['Tornos CNC']},
    {id:'mecanizados-cnc',nombre:'Mecanizados CNC',items:['Tornos paralelos con regla digital','Tornería automática','Rectificadora universal']},
    {id:'soldaduras',nombre:'Soldaduras',items:['Soldadura MIG','Soldadura TIG','Soldadura con electrodos','Soldadura de punto']},
    {id:'centro-mecanizados',nombre:'Centro de mecanizados',items:['Fresado CNC','Perforado y roscado','Series y repetitividad']},
    {id:'plegados',nombre:'Plegados',items:['Corte y plegado de chapa','Guillotina y plegadora CNC']}
  ];

  function renderServicios(lista){
    var grid=document.getElementById('servicios-grid');
    if(!lista||!lista.length){grid.innerHTML='<div style="grid-column:1/-1;text-align:center;padding:40px;opacity:.5">No hay servicios disponibles.</div>';return}
    grid.innerHTML=lista.map(function(s){
      var items=(s.items||[]).map(function(i){return '<li>'+esc(i)+'</li>'}).join('');
      return '<div class="tile"><span class="badge">Servicio</span><h3>'+esc(s.nombre)+'</h3><ul class="service-list">'+items+'</ul></div>';
    }).join('');
  }

  if(window.MetamasDB){
    window.MetamasDB.getData('servicios').then(function(data){
      renderServicios(Array.isArray(data)&&data.length?data:DEFAULT_SERVICIOS);
    }).catch(function(){
      renderServicios(DEFAULT_SERVICIOS);
    });
    window.MetamasDB.subscribe('servicios', function(newData){
      if(Array.isArray(newData)&&newData.length) renderServicios(newData);
    });
  } else {
    renderServicios(DEFAULT_SERVICIOS);
  }
})();
