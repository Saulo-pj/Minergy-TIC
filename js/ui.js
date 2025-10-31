import { $, $$, showToast, openModal, closeModal } from './utils.js';
import { getAlerts, getPersonnel, getUsers, updateUserRole, deleteUser } from './data-service.js';

export async function initUI() {
    // Sidebar Toggle
    const sidebar = $('#sidebar');
    const btnMenu = $('#btnMenu');
    if (btnMenu && sidebar) {
        btnMenu.addEventListener('click', () => sidebar.classList.toggle('app-sidebar--open'));
    }

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

    // Admin / Config Button (Show Users)
    // Only show if current user is admin
    const currentUserStr = sessionStorage.getItem('currentUser');
    const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
    const isAdmin = currentUser && currentUser.role === 'admin';

    const btnConfig = $$('.app-sidebar__link').find(el => el.textContent.includes('Configuración'));

    if (btnConfig) {
        if (!isAdmin) {
            btnConfig.parentElement.style.display = 'none';
        } else {
            btnConfig.parentElement.style.display = ''; // Ensure it's visible if admin
            btnConfig.addEventListener('click', async (e) => {
                e.preventDefault();
                const users = await getUsers();
                const tbody = $('#tblUsers tbody');
                if (tbody) {
                    tbody.innerHTML = users.length ? users.map(u => `
            <tr>
              <td>${u.name || 'N/A'}</td>
              <td>${u.email}</td>
              <td>
                <select class="input input--search" style="padding: 4px; height: auto;" onchange="window.updateRole('${u.email}', this.value)">
                  <option value="user" ${u.role === 'user' ? 'selected' : ''}>Usuario</option>
                  <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Admin</option>
                </select>
              </td>
              <td>${u.date ? new Date(u.date).toLocaleDateString() : 'N/A'}</td>
              <td>
                <button class="btn btn--danger btn--small" onclick="window.removeUser('${u.email}')"><i class="fa-solid fa-trash"></i></button>
              </td>
            </tr>
          `).join('') : '<tr><td colspan="5">No hay usuarios registrados</td></tr>';
                }
                openModal('modalAdmin');
            });
        }
    }

    // Expose updateRole and removeUser globally
    window.updateRole = async (email, newRole) => {
        try {
            await updateUserRole(email, newRole);
            showToast(`Rol de ${email} actualizado a ${newRole}`, 'success');
        } catch (e) {
            showToast('Error actualizando rol', 'error');
        }
    };

    window.removeUser = async (email) => {
        if (!confirm(`¿Estás seguro de eliminar a ${email}?`)) return;
        try {
            await deleteUser(email);
            showToast('Usuario eliminado', 'success');
            // Refresh table if modal is open (hacky but works for prototype)
            const btn = $$('.app-sidebar__link').find(el => el.textContent.includes('Configuración'));
            if (btn) btn.click();
        } catch (e) {
            showToast('Error eliminando usuario', 'error');
        }
    };

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
