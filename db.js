// ==================== CAMPUSREADS — IndexedDB DATABASE ====================

const DB_NAME = 'CampusReadsDB';
const DB_VERSION = 1;
let db = null;

function openDB() {
    return new Promise((resolve, reject) => {
        if (db) return resolve(db);
        const req = indexedDB.open(DB_NAME, DB_VERSION);

        req.onupgradeneeded = (e) => {
            const database = e.target.result;

            // Users store — email indexed
            if (!database.objectStoreNames.contains('users')) {
                const users = database.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
                users.createIndex('email', 'email', { unique: true });
            }

            // Orders store — per user, sortable by date
            if (!database.objectStoreNames.contains('orders')) {
                const orders = database.createObjectStore('orders', { keyPath: 'orderId' });
                orders.createIndex('userEmail', 'userEmail', { unique: false });
                orders.createIndex('createdAt', 'createdAt', { unique: false });
            }

            // Carts store — persisted per user
            if (!database.objectStoreNames.contains('carts')) {
                database.createObjectStore('carts', { keyPath: 'userEmail' });
            }
        };

        req.onsuccess = (e) => { db = e.target.result; resolve(db); };
        req.onerror = () => reject(req.error);
    });
}

// ==================== USERS ====================

async function registerUser(userData) {
    const database = await openDB();
    return new Promise((resolve, reject) => {
        const tx = database.transaction('users', 'readwrite');
        const store = tx.objectStore('users');
        const check = store.index('email').get(userData.email);
        check.onsuccess = () => {
            if (check.result) return reject(new Error('An account with this email already exists'));
            const add = store.add({ ...userData, createdAt: new Date().toISOString() });
            add.onsuccess = () => resolve({ success: true });
            add.onerror = () => reject(add.error);
        };
        check.onerror = () => reject(check.error);
    });
}

async function loginUser(email, password) {
    const database = await openDB();
    return new Promise((resolve, reject) => {
        const tx = database.transaction('users', 'readonly');
        const req = tx.objectStore('users').index('email').get(email);
        req.onsuccess = () => {
            const user = req.result;
            if (!user) return reject(new Error('No account found with this email'));
            if (user.password !== password) return reject(new Error('Incorrect password'));
            const { password: _, ...safeUser } = user;
            resolve(safeUser);
        };
        req.onerror = () => reject(req.error);
    });
}

// ==================== ORDERS ====================

async function saveOrder(orderData) {
    const database = await openDB();
    return new Promise((resolve, reject) => {
        const tx = database.transaction('orders', 'readwrite');
        const req = tx.objectStore('orders').add(orderData);
        req.onsuccess = () => resolve(orderData);
        req.onerror = () => reject(req.error);
    });
}

async function getOrdersByUser(userEmail) {
    const database = await openDB();
    return new Promise((resolve, reject) => {
        const tx = database.transaction('orders', 'readonly');
        const req = tx.objectStore('orders').index('userEmail').getAll(userEmail);
        req.onsuccess = () => resolve(
            req.result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        );
        req.onerror = () => reject(req.error);
    });
}

// ==================== CARTS ====================

async function saveCart(userEmail, cartItems) {
    const database = await openDB();
    return new Promise((resolve, reject) => {
        const tx = database.transaction('carts', 'readwrite');
        const req = tx.objectStore('carts').put({ userEmail, items: cartItems });
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
    });
}

async function loadCart(userEmail) {
    const database = await openDB();
    return new Promise((resolve, reject) => {
        const tx = database.transaction('carts', 'readonly');
        const req = tx.objectStore('carts').get(userEmail);
        req.onsuccess = () => resolve(req.result ? req.result.items : []);
        req.onerror = () => reject(req.error);
    });
}

async function clearCartDB(userEmail) {
    const database = await openDB();
    return new Promise((resolve, reject) => {
        const tx = database.transaction('carts', 'readwrite');
        const req = tx.objectStore('carts').delete(userEmail);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
    });
}

// ==================== SESSION ====================

function getSession() {
    return JSON.parse(
        sessionStorage.getItem('cr_user') ||
        localStorage.getItem('cr_user') ||
        'null'
    );
}

function setSession(user, remember) {
    const data = JSON.stringify(user);
    sessionStorage.setItem('cr_user', data);
    if (remember) localStorage.setItem('cr_user', data);
}

function clearSession() {
    sessionStorage.removeItem('cr_user');
    localStorage.removeItem('cr_user');
}