/* Minergy TIC - Funcionalidades principales (vanilla JS) */
(function(){
  const $ = (sel, ctx=document) => ctx.querySelector(sel);
  const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));

  // Utilidades Toast
  const toastContainer = $('#toastContainer') || (() => { const div=document.createElement('div'); div.id='toastContainer'; div.className='toast-container'; document.body.appendChild(div); return div; })();
  function showToast(message, type='success', timeout=3000){
    const t = document.createElement('div');
    t.className = `toast toast--${type}`;
    t.innerHTML = `<span><i class="fa-solid ${type==='success'?'fa-circle-check': type==='warning'?'fa-triangle-exclamation':'fa-circle-xmark'}"></i></span><div>${message}</div>`;
    toastContainer.appendChild(t);
    setTimeout(()=>{ t.remove(); }, timeout);
  }

  // Modal sencillo
  function openModal(id){ const m = document.getElementById(id); if(m){ m.classList.add('modal--open'); } }
  function closeModal(el){ const m = el.closest('.modal'); if(m){ m.classList.remove('modal--open'); } }

  // Sidebar toggle (móvil)
  const sidebar = $('#sidebar');
  const btnMenu = $('#btnMenu');
  btnMenu && btnMenu.addEventListener('click', ()=> sidebar && sidebar.classList.toggle('app-sidebar--open'));

  // Enlaces para abrir modal de detalle de alerta
  $$('[data-open-modal]').forEach(btn => {
    btn.addEventListener('click', (e)=>{
      const id = e.currentTarget.getAttribute('data-open-modal');
      const alertId = e.currentTarget.getAttribute('data-id') || 'N/A';
      const body = $('#detalleAlertaBody');
      if(body){
        body.innerHTML = `
          <p><strong>ID:</strong> ${alertId}</p>
          <p><strong>Tipo:</strong> Alerta de seguridad</p>
          <p><strong>Ubicación:</strong> Túnel 3-B · Sector C</p>
          <p><strong>Sensor:</strong> CO-17 · 45 ppm</p>
          <p><strong>Fecha:</strong> ${new Date().toLocaleString()}</p>
        `;
      }
      openModal(id);
    });
  });
  $$('[data-close-modal]').forEach(btn => btn.addEventListener('click', ()=> closeModal(btn)));
  $$('.modal').forEach(m => m.addEventListener('click', (e)=>{ if(e.target === m) m.classList.remove('modal--open'); }));

  // Resolver alerta (marcar como resuelta)
  $$('[data-resolver]').forEach(btn => btn.addEventListener('click', (e)=>{
    const card = e.currentTarget.closest('.alert-card');
    if(card){ card.classList.add('alert-card--resolved'); showToast('Alerta marcada como resuelta', 'success'); }
  }));

  // Botones que disparan toasts
  $$('[data-toast]').forEach(btn => btn.addEventListener('click', ()=> showToast(btn.getAttribute('data-toast')||'Acción realizada','success')));

  // Login: año y toggle contraseña y validación sencilla
  const year = $('#year'); if(year) year.textContent = new Date().getFullYear();
  const togglePwd = $('#togglePwd');
  const pwd = $('#password');
  togglePwd && togglePwd.addEventListener('click', ()=>{
    if(!pwd) return; const type = pwd.getAttribute('type')==='password'?'text':'password'; pwd.setAttribute('type', type);
    togglePwd.innerHTML = `<i class="fa-solid ${type==='password'?'fa-eye':'fa-eye-slash'}"></i>`;
  });
  const formLogin = $('#formLogin');
  formLogin && formLogin.addEventListener('submit', (e)=>{
    e.preventDefault();
    const email = $('#email');
    const valid = email && email.value.includes('@') && pwd && pwd.value.length >= 6;
    if(!valid){ showToast('Correo o contraseña inválidos', 'error'); return; }
    showToast('Acceso concedido', 'success');
    setTimeout(()=>{ window.location.href = './dashboard.html'; }, 800);
  });

  // Registro: abrir modal
  const registerLink = $('#registerLink');
  registerLink && registerLink.addEventListener('click', (e)=>{ e.preventDefault(); openModal('modalRegistro'); });
  const btnDoRegister = $('#btnDoRegister');
  btnDoRegister && btnDoRegister.addEventListener('click', ()=>{
    const name = $('#regNombre'), email = $('#regEmail'), pass = $('#regPwd');
    if(!name?.value || !email?.value.includes('@') || (pass?.value||'').length < 6){ showToast('Completa los datos correctamente', 'error'); return; }
    showToast('Cuenta creada. Inicia sesión', 'success');
    const mod = $('#modalRegistro'); mod && mod.classList.remove('modal--open');
  });

  // Olvidaste contraseña
  const forgotLink = $('#forgotLink');
  forgotLink && forgotLink.addEventListener('click', (e)=>{ e.preventDefault(); openModal('modalRecuperar'); });
  const btnDoForgot = $('#btnDoForgot');
  btnDoForgot && btnDoForgot.addEventListener('click', ()=>{
    const email = $('#fgEmail');
    if(!email?.value.includes('@')){ showToast('Ingresa un correo válido', 'error'); return; }
    showToast('Te enviamos un correo con instrucciones', 'success');
    const mod = $('#modalRecuperar'); mod && mod.classList.remove('modal--open');
  });

  // Filtros de alertas por severidad
  const alertsList = $('#alertsList');
  $$('[data-filter]').forEach(btn => btn.addEventListener('click', ()=>{
    const f = btn.getAttribute('data-filter');
    if(!alertsList) return;
    $$('#alertsList .alert-card').forEach(card => {
      const sev = card.getAttribute('data-sev');
      card.style.display = (f==='*' || sev===f) ? '' : 'none';
    });
  }));

  // Búsquedas en tablas (reportes y personal)
  function wireSearch(inputSel, tableSel){
    const input = $(inputSel), table = $(tableSel);
    if(!input || !table) return;
    input.addEventListener('input', ()=>{
      const q = input.value.toLowerCase();
      $$("tbody tr", table).forEach(tr => {
        tr.style.display = tr.textContent.toLowerCase().includes(q) ? '' : 'none';
      })
    });
  }
  wireSearch('#searchTableReport', '#tblReportes');
  wireSearch('#searchPersonal', '#tblPersonal');

  // Datos de ejemplo para Chart.js
  function makeLineChart(ctx, labels, datasets){
    if(!ctx || !window.Chart) return;
    new Chart(ctx, {
      type: 'line',
      data: { labels, datasets },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
    });
  }
  function makeBarChart(ctx, labels, data, color){
    if(!ctx || !window.Chart) return;
    new Chart(ctx, {
      type: 'bar',
      data: { labels, datasets: [{ label: 'Productividad', data, backgroundColor: color }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
  }
  function makeDoughnut(ctx, labels, data, colors){
    if(!ctx || !window.Chart) return;
    new Chart(ctx, { type: 'doughnut', data: { labels, datasets: [{ data, backgroundColor: colors }] }, options: { plugins: { legend: { position: 'bottom' } } } });
  }

  // Inicializar gráficos si existen en la página
  const chartGases = $('#chartGases');
  if(chartGases){
    chartGases.parentElement.style.height = '280px';
    makeLineChart(chartGases, ['00h','04h','08h','12h','16h','20h'], [
      { label: 'CO (ppm)', data: [18,22,45,28,21,19], borderColor: '#E74C3C', tension: .35 },
      { label: 'CO2 (ppm)', data: [650,710,760,720,680,640], borderColor: '#2C3E50', tension: .35 },
      { label: 'CH4 (% vol)', data: [0.8,1.0,2.1,1.3,0.9,0.7], borderColor: '#F39C12', tension: .35 }
    ]);
  }
  const chartProd = $('#chartProductividad');
  if(chartProd){
    chartProd.parentElement.style.height = '280px';
    makeBarChart(chartProd, ['Mañana','Tarde','Noche'], [82, 76, 88], '#27AE60');
  }

  const chartGasesMulti = $('#chartGasesMulti');
  if(chartGasesMulti){
    chartGasesMulti.parentElement.style.height = '320px';
    makeLineChart(chartGasesMulti, ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'], [
      { label: 'CO (ppm)', data: [20,24,31,26,29,22,18], borderColor: '#E74C3C', tension: .35 },
      { label: 'CO2 (ppm)', data: [690,720,760,740,710,700,680], borderColor: '#2C3E50', tension: .35 },
      { label: 'CH4 (% vol)', data: [0.8,1.2,1.5,1.1,1.3,0.9,0.7], borderColor: '#F39C12', tension: .35 }
    ]);
  }
  const chartProdReport = $('#chartProdReport');
  if(chartProdReport){
    chartProdReport.parentElement.style.height = '260px';
    makeBarChart(chartProdReport, ['Turno A','Turno B','Turno C'], [78, 85, 74], '#4A90E2');
  }
  const chartInc = $('#chartIncidentes');
  if(chartInc){
    chartInc.parentElement.style.height = '260px';
    makeDoughnut(chartInc, ['Gas', 'Mecánico', 'Eléctrico', 'Otros'], [12, 6, 4, 3], ['#E74C3C','#F39C12','#2C3E50','#BDC3C7']);
  }

  // Simulación de datos en tiempo real: variar KPIs
  const kpiPersonal = $('#kpiPersonal'), kpiAlertas = $('#kpiAlertas'), kpiSensores = $('#kpiSensores');
  if(kpiPersonal || kpiAlertas || kpiSensores){
    setInterval(()=>{
      if(kpiPersonal){ const base=245; const delta = (Math.random()>.5?1:-1)*Math.floor(Math.random()*3); kpiPersonal.textContent = String(base+delta); }
      if(kpiAlertas){ const num = 3 + (Math.random()>.7?1:0); kpiAlertas.textContent = String(num); }
      if(kpiSensores){ kpiSensores.textContent = `148/150`; }
    }, 5000);
  }

  // Llenar lista de personal en mapa (derecha)
  const listPersonal = $('#listPersonal');
  if(listPersonal){
    const personas = [
      { nombre:'Juan Pérez', ub:'Túnel 3 · C', check:'09:10', img: 11 },
      { nombre:'María Díaz', ub:'Túnel 2 · A', check:'09:05', img: 15 },
      { nombre:'Luis Gómez', ub:'Nivel 1 · B', check:'08:55', img: 23 },
      { nombre:'Karen Ramírez', ub:'Nivel 1 · A', check:'08:40', img: 31 },
      { nombre:'Fernando Ortega', ub:'Túnel 1 · C', check:'09:20', img: 27 },
    ];
    personas.forEach(p => {
      const card = document.createElement('div');
      card.className = 'card';
      card.style.flex = '1 1 100%';
      card.innerHTML = `
        <div class="u-between u-gap-12">
          <div class="u-flex u-gap-12">
            <img src="https://i.pravatar.cc/100?img=${p.img}" class="avatar" alt="" />
            <div><strong>${p.nombre}</strong><div class="small">${p.ub}</div><small>Último check-in ${p.check}</small></div>
          </div>
          <div>
            <button class="btn btn--small" data-ver-mapa>Ver ubicación</button>
          </div>
        </div>`;
      listPersonal.appendChild(card);
    });
  }

  // Generar filas extra de personal para llegar a ~15 si estamos en personal.html
  const tblPersonal = $('#tblPersonal tbody');
  if(tblPersonal){
    const extra = [
      ['#121 · Luis Gómez', 'En Mina', 'Túnel 1 · B', '30/10/2025 08:30', 'Casco, Linterna', 19, 'ok'],
      ['#211 · Karen Ramírez', 'En Mina', 'Nivel 1 · A', '30/10/2025 08:10', 'Casco', 31, 'ok'],
      ['#189 · Fernando Ortega', 'En Tránsito', 'Túnel 1 · C', '30/10/2025 09:05', 'Chaleco', 27, 'warn'],
      ['#167 · Camila Soto', 'Fuera', '—', '29/10/2025 19:20', '—', 33, 'ok'],
      ['#178 · Diego León', 'En Mina', 'Túnel 2 · B', '30/10/2025 08:55', 'Casco, Linterna', 37, 'ok'],
      ['#144 · Paula Viera', 'Fuera', '—', '29/10/2025 21:05', '—', 42, 'ok'],
      ['#233 · Raúl Méndez', 'En Mina', 'Nivel 1 · C', '30/10/2025 07:50', 'Casco', 45, 'ok'],
      ['#256 · Sofía Reyes', 'En Tránsito', 'Túnel 3 · A', '30/10/2025 09:12', 'Chaleco', 49, 'warn'],
      ['#302 · Pablo Núñez', 'Emergencia', 'Túnel 2 · C', '30/10/2025 09:18', 'Casco', 12, 'err'],
      ['#275 · Ana Ríos', 'En Mina', 'Túnel 2 · A', '30/10/2025 08:42', 'Casco', 14, 'ok'],
      ['#289 · José Torres', 'Fuera', '—', '29/10/2025 20:31', '—', 22, 'ok'],
      ['#315 · Laura Peña', 'En Mina', 'Túnel 3 · B', '30/10/2025 09:02', 'Casco, Linterna', 28, 'ok']
    ];
    extra.forEach(([nombre, estado, ubic, check, equipo, img, st])=>{
      const tr = document.createElement('tr');
      tr.className = st==='warn'?'row--warn':st==='err'?'row--err':'row--ok';
      tr.innerHTML = `
        <td><img src="https://i.pravatar.cc/100?img=${img}" alt="" class="app-header__avatar" /></td>
        <td>${nombre}</td>
        <td><span class="table__state ${st==='warn'?'state--warn':st==='err'?'state--err':'state--ok'}">${estado}</span></td>
        <td>${ubic}</td>
        <td>${check}</td>
        <td>${equipo}</td>
        <td>
          <button class="btn btn--small" data-ver-mapa>Ver en mapa</button>
          <button class="btn btn--dark btn--small" data-contactar>Contactar</button>
        </td>`;
      tblPersonal.appendChild(tr);
    });
  }

  // Exportar (simulado) y registrar entrada (simulado)
  $('#btnExport') && $('#btnExport').addEventListener('click', ()=> showToast('Exportación iniciada', 'success'));
  $('#btnEntrada') && $('#btnEntrada').addEventListener('click', ()=> showToast('Entrada registrada', 'success'));
  $('#btnPdf') && $('#btnPdf').addEventListener('click', ()=> showToast('Generando PDF...', 'success'));
  $('#btnExcel') && $('#btnExcel').addEventListener('click', ()=> showToast('Generando Excel...', 'success'));

  // Zoom simulado en mapas
  function wireZoom(containerId, inId, outId){
    const box = document.getElementById(containerId), zin = document.getElementById(inId), zout = document.getElementById(outId);
    if(!box || !zin || !zout) return;
    let scale = 1;
    const apply = () => { box.style.transform = `scale(${scale})`; box.style.transformOrigin = '50% 50%'; };
    zin.addEventListener('click', ()=> { scale = Math.min(1.5, scale+0.1); apply(); });
    zout.addEventListener('click', ()=> { scale = Math.max(0.8, scale-0.1); apply(); });
  }
  wireZoom('mapCanvas', 'zoomIn', 'zoomOut');
  wireZoom('mapCanvas2', 'zoomIn2', 'zoomOut2');

})();
