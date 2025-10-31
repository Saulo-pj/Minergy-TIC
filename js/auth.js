import { $, showToast, openModal, closeModal } from './utils.js';
import { loginUser, registerUser } from './data-service.js';

export function initAuth() {
    // Login: Year
    const year = $('#year');
    if (year) year.textContent = new Date().getFullYear();

    // Toggle Password
    const togglePwd = $('#togglePwd');
    const pwd = $('#password');
    if (togglePwd && pwd) {
        togglePwd.addEventListener('click', () => {
            const type = pwd.getAttribute('type') === 'password' ? 'text' : 'password';
            pwd.setAttribute('type', type);
            togglePwd.innerHTML = `<i class="fa-solid ${type === 'password' ? 'fa-eye' : 'fa-eye-slash'}"></i>`;
        });
    }

    // Login Form
    const formLogin = $('#formLogin');
    if (formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = $('#email').value;
            const password = $('#password').value;

            try {
                const user = await loginUser(email, password);
                sessionStorage.setItem('currentUser', JSON.stringify(user));
                showToast('Acceso concedido', 'success');
                setTimeout(() => { window.location.href = './dashboard.html'; }, 800);
            } catch (err) {
                showToast(err.message, 'error');
            }
        });
    }

    // Register Link
    const registerLink = $('#registerLink');
    if (registerLink) {
        registerLink.addEventListener('click', (e) => {
            e.preventDefault();
            openModal('modalRegistro');
        });
    }

    // Register Submit
    const btnDoRegister = $('#btnDoRegister');
    if (btnDoRegister) {
        btnDoRegister.addEventListener('click', async () => {
            const name = $('#regNombre')?.value;
            const email = $('#regEmail')?.value;
            const password = $('#regPwd')?.value;
            const role = $('#regRole')?.value || 'user';

            if (!name || !email?.includes('@') || (password || '').length < 6) {
                showToast('Completa los datos correctamente (pass min 6 chars)', 'error');
                return;
            }

            try {
                await registerUser({ name, email, password, role, date: new Date().toISOString() });
                showToast('Cuenta creada. Inicia sesión', 'success');
                const mod = $('#modalRegistro');
                if (mod) mod.classList.remove('modal--open');
            } catch (err) {
                showToast(err.message, 'error');
            }
        });
    }

    // Forgot Password Link
    const forgotLink = $('#forgotLink');
    if (forgotLink) {
        forgotLink.addEventListener('click', (e) => {
            e.preventDefault();
            openModal('modalRecuperar');
        });
    }

    // Forgot Password Submit
    const btnDoForgot = $('#btnDoForgot');
    if (btnDoForgot) {
        btnDoForgot.addEventListener('click', () => {
            const email = $('#fgEmail');
            if (!email?.value.includes('@')) {
                showToast('Ingresa un correo válido', 'error');
                return;
            }
            showToast('Te enviamos un correo con instrucciones', 'success');
            const mod = $('#modalRecuperar');
            if (mod) mod.classList.remove('modal--open');
        });
    }
}
