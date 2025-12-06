import { $, $$, showToast, openModal, closeModal } from './utils.js';
import { getAlerts, getPersonnel } from './data-service.js';

export async function initUI() {
    // Sidebar Toggle + overlay handling
    const sidebar = $('#sidebar');
    const btnMenu = $('#btnMenu');
    const sidebarBackdrop = $('#sidebarBackdrop');
    const mainContent = document.querySelector('main');

    const setSidebarState = (open) => {
        if (!sidebar) return;
        sidebar.classList.toggle('app-sidebar--open', open);
        document.body.classList.toggle('sidebar-open', open);
        if (btnMenu) {
            btnMenu.setAttribute('aria-expanded', open ? 'true' : 'false');
        }
        if (sidebarBackdrop) {
            sidebarBackdrop.setAttribute('aria-hidden', open ? 'false' : 'true');
        }
    };

    const closeSidebar = () => setSidebarState(false);

    if (btnMenu) {
        btnMenu.addEventListener('click', () => {
            const shouldOpen = sidebar && !sidebar.classList.contains('app-sidebar--open');
            setSidebarState(Boolean(shouldOpen));
        });
    }

    sidebarBackdrop?.addEventListener('click', closeSidebar);
    mainContent?.addEventListener('click', () => {
        if (sidebar?.classList.contains('app-sidebar--open')) {
            closeSidebar();
        }
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && sidebar?.classList.contains('app-sidebar--open')) {
            closeSidebar();
        }
    });

    setSidebarState(false);

    // Render Alerts
    const alertsList = $('#alertList');
    if (alertsList) {
        const alerts = await getAlerts();
        if (alerts.length > 0) {
            alertsList.innerHTML = alerts.map(a => `
        <article class="alert-card alert-card--${a.severity} card" data-sev="${a.severity}">
          <h3>${a.title}</h3>
          <p>${a.description}</p>
          <div class="alert-card__meta">${a.time}</div>
          <div class="alert-card__actions u-flex u-gap-8">
            <button class="btn btn--dark btn--small" data-open-modal="detalleAlerta" data-id="${a.id}">Ver detalles</button>
            <button class="btn btn--warning btn--small" data-toast="Notificado">Notificar</button>
            <button class="btn btn--success btn--small" data-resolver>Resolver</button>
          </div>
        </article>
      `).join('');
            attachAlertListeners();
        }
    }

    // Render Personnel Table
    const tblPersonal = $('#tblPersonal tbody');
    if (tblPersonal) {
        const personnel = await getPersonnel();
        tblPersonal.innerHTML = personnel.map(p => `
      <tr class="${p.status === 'warn' ? 'row--warn' : p.status === 'err' ? 'row--err' : 'row--ok'}">
        <td><img src="https://i.pravatar.cc/100?img=${p.img}" alt="" class="app-header__avatar" /></td>
        <td>${p.nombre}</td>
        <td><span class="table__state ${p.status === 'warn' ? 'state--warn' : p.status === 'err' ? 'state--err' : 'state--ok'}">${p.estado}</span></td>
        <td>${p.ub}</td>
        <td>${p.check}</td>
        <td>${p.equipo}</td>
        <td>
          <button class="btn btn--small" data-ver-mapa>Ver en mapa</button>
          <button class="btn btn--dark btn--small" data-contactar>Contactar</button>
        </td>
      </tr>
    `).join('');
    }

    // Search Functionality
    wireSearch('#searchTableReport', '#tblReportes');
    wireSearch('#searchPersonal', '#tblPersonal');

    // KPI Simulation
    initKPISimulation();
}

function attachAlertListeners() {
    $$('[data-open-modal]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-open-modal');
            const alertId = e.currentTarget.getAttribute('data-id') || 'N/A';
            const body = $('#detalleAlertaBody');
            if (body) {
                body.innerHTML = `
          <p><strong>ID:</strong> ${alertId}</p>
          <p><strong>Fecha:</strong> ${new Date().toLocaleString()}</p>
          <p>Detalles cargados del sistema...</p>
        `;
            }
            openModal(id);
        });
    });

    $$('[data-resolver]').forEach(btn => btn.addEventListener('click', (e) => {
        const card = e.currentTarget.closest('.alert-card');
        if (card) {
            card.classList.add('alert-card--resolved');
            showToast('Alerta marcada como resuelta', 'success');
        }
    }));

    $$('[data-toast]').forEach(btn => btn.addEventListener('click', () => showToast(btn.getAttribute('data-toast') || 'Acción realizada', 'success')));
}

function wireSearch(inputSel, tableSel) {
    const input = $(inputSel), table = $(tableSel);
    if (!input || !table) return;
    input.addEventListener('input', () => {
        const q = input.value.toLowerCase();
        $$("tbody tr", table).forEach(tr => {
            tr.style.display = tr.textContent.toLowerCase().includes(q) ? '' : 'none';
        })
    });
}

function initKPISimulation() {
    const kpiPersonal = $('#kpiPersonal'), kpiAlertas = $('#kpiAlertas'), kpiSensores = $('#kpiSensores');
    if (kpiPersonal || kpiAlertas || kpiSensores) {
        setInterval(() => {
            if (kpiPersonal) { const base = 245; const delta = (Math.random() > .5 ? 1 : -1) * Math.floor(Math.random() * 3); kpiPersonal.textContent = String(base + delta); }
            if (kpiAlertas) { const num = 3 + (Math.random() > .7 ? 1 : 0); kpiAlertas.textContent = String(num); }
            if (kpiSensores) { kpiSensores.textContent = `148/150`; }
        }, 5000);
    }
}
