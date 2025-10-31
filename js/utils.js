/**
 * Minergy TIC - Utilities
 */

export const $ = (sel, ctx = document) => ctx.querySelector(sel);
export const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

// Toast Notification
let toastContainer = $('#toastContainer');
if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toastContainer';
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
}

export function showToast(message, type = 'success', timeout = 3000) {
    const t = document.createElement('div');
    t.className = `toast toast--${type}`;
    t.innerHTML = `<span><i class="fa-solid ${type === 'success' ? 'fa-circle-check' : type === 'warning' ? 'fa-triangle-exclamation' : 'fa-circle-xmark'}"></i></span><div>${message}</div>`;
    toastContainer.appendChild(t);
    setTimeout(() => { t.remove(); }, timeout);
}

// Modal Control
export function openModal(id) {
    const m = document.getElementById(id);
    if (m) { m.classList.add('modal--open'); }
}

export function closeModal(el) {
    const m = el.closest('.modal');
    if (m) { m.classList.remove('modal--open'); }
}

// Initialize global modal listeners (close on click outside or close button)
export function initModals() {
    $$('[data-close-modal]').forEach(btn => btn.addEventListener('click', () => closeModal(btn)));
    $$('.modal').forEach(m => m.addEventListener('click', (e) => {
        if (e.target === m) m.classList.remove('modal--open');
    }));
}
