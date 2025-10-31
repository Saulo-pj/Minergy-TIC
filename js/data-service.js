/**
 * Minergy TIC - Data Service
 * Manages LocalStorage "Database"
 */

const DB_KEY = 'minergy_db';

// Initial Schema
const EMPTY_DB = {
    users: [],
    personnel: [],
    alerts: []
};

export async function initDatabase() {
    if (!localStorage.getItem(DB_KEY)) {
        console.log('Initializing Database...');
        try {
            // Load initial data from JSONs
            const [personnelRes, alertsRes] = await Promise.all([
                fetch('./data/personnel.json'),
                fetch('./data/alerts.json')
            ]);

            const personnel = await personnelRes.json();
            const alerts = await alertsRes.json();

            const db = { ...EMPTY_DB, personnel, alerts };
            saveDB(db);
            console.log('Database initialized.');
        } catch (e) {
            console.error('Error initializing DB:', e);
            saveDB(EMPTY_DB);
        }
    }
}

function getDB() {
    const str = localStorage.getItem(DB_KEY);
    return str ? JSON.parse(str) : EMPTY_DB;
}

function saveDB(db) {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
}

// --- Personnel API ---
export async function getPersonnel() {
    return getDB().personnel;
}

// --- Alerts API ---
export async function getAlerts() {
    return getDB().alerts;
}

// --- Users/Auth API ---
export async function getUsers() {
    return getDB().users;
}

export async function registerUser(user) {
    const db = getDB();
    // Check if email exists
    if (db.users.find(u => u.email === user.email)) {
        throw new Error('El correo ya está registrado');
    }
    db.users.push(user);
    saveDB(db);
    return user;
}

export async function loginUser(email, password) {
    const db = getDB();
    const user = db.users.find(u => u.email === email && u.password === password);
    if (!user) {
        throw new Error('Credenciales inválidas');
    }
    return user;
}

export async function updateUserRole(email, newRole) {
    const db = getDB();
    const userIndex = db.users.findIndex(u => u.email === email);
    if (userIndex === -1) throw new Error('Usuario no encontrado');

    db.users[userIndex].role = newRole;
    saveDB(db);
    return db.users[userIndex];
}

export async function deleteUser(email) {
    const db = getDB();
    const newUsers = db.users.filter(u => u.email !== email);
    if (newUsers.length === db.users.length) throw new Error('Usuario no encontrado');

    db.users = newUsers;
    saveDB(db);
    return true;
}
