// ==================== AUTHENTICATION SYSTEM ====================
// Uses IndexedDB via db.js. Same UI behaviour as original.

(async function checkAuth() {
    await openDB();
    const currentUser = getSession();
    const path = window.location.pathname;

    if (path.includes('main.html') && !currentUser) {
        window.location.href = 'index.html';
        return;
    }
    if ((path.includes('index.html') || path.endsWith('/') || path === '') && currentUser) {
        window.location.href = 'main.html';
    }
})();

// ==================== FORM TOGGLES ====================

function showLoginForm() {
    document.getElementById('loginFormContainer').classList.add('active');
    document.getElementById('registerFormContainer').classList.remove('active');
    document.getElementById('loginTabBtn').classList.add('active');
    document.getElementById('registerTabBtn').classList.remove('active');
    document.getElementById('loginMessage').classList.remove('show');
    document.getElementById('registerMessage').classList.remove('show');
}

function showRegisterForm() {
    document.getElementById('registerFormContainer').classList.add('active');
    document.getElementById('loginFormContainer').classList.remove('active');
    document.getElementById('registerTabBtn').classList.add('active');
    document.getElementById('loginTabBtn').classList.remove('active');
    document.getElementById('loginMessage').classList.remove('show');
    document.getElementById('registerMessage').classList.remove('show');
}

// ==================== PASSWORD TOGGLE ====================

function togglePw(inputId, btn) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = '🙈';
    } else {
        input.type = 'password';
        btn.textContent = '👁';
    }
}

// ==================== LOGIN HANDLER ====================

async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const remember = document.getElementById('rememberMe').checked;
    const messageDiv = document.getElementById('loginMessage');
    const btn = document.getElementById('loginBtn');

    if (!email || !password) {
        showMessage(messageDiv, 'Please fill in all fields', 'error');
        return;
    }

    setLoading(btn, true, 'Signing in...');
    try {
        const user = await loginUser(email, password);
        setSession(user, remember);
        showMessage(messageDiv, 'Login successful! Redirecting...', 'success');
        setTimeout(() => { window.location.href = 'main.html'; }, 1200);
    } catch (err) {
        showMessage(messageDiv, err.message, 'error');
        setLoading(btn, false, 'Sign In');
    }
}

// ==================== REGISTER HANDLER ====================

async function handleRegister(event) {
    event.preventDefault();

    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    const messageDiv = document.getElementById('registerMessage');
    const btn = document.getElementById('registerBtn');

    if (!name || !email || !phone || !password || !confirmPassword) {
        showMessage(messageDiv, 'Please fill in all fields', 'error');
        return;
    }
    if (!email.includes('@') || !email.includes('.')) {
        showMessage(messageDiv, 'Please enter a valid email address', 'error');
        return;
    }
    if (!/^\d{10}$/.test(phone)) {
        showMessage(messageDiv, 'Please enter a valid 10-digit phone number', 'error');
        return;
    }
    if (password.length < 6) {
        showMessage(messageDiv, 'Password must be at least 6 characters', 'error');
        return;
    }
    if (password !== confirmPassword) {
        showMessage(messageDiv, 'Passwords do not match', 'error');
        return;
    }

    setLoading(btn, true, 'Creating account...');
    try {
        await registerUser({ name, email, phone, password });
        showMessage(messageDiv, 'Account created successfully! Redirecting to login...', 'success');
        document.getElementById('registerForm').reset();
        setTimeout(() => { showLoginForm(); }, 2000);
    } catch (err) {
        showMessage(messageDiv, err.message, 'error');
        setLoading(btn, false, 'Create Account');
    }
}

// ==================== LOGOUT ====================

function logout() {
    clearSession();
    window.location.href = 'index.html';
}

// ==================== DISPLAY USER INFO (main page) ====================

function displayUserInfo() {
    const currentUser = getSession();
    if (currentUser) {
        const banner = document.getElementById('userBanner');
        const bannerName = document.getElementById('bannerUserName');
        if (banner && bannerName) {
            bannerName.textContent = currentUser.name.split(' ')[0];
            banner.style.display = 'block';
        }
        const fullNameField = document.getElementById('fullName');
        const emailField = document.getElementById('email');
        const phoneField = document.getElementById('phone');
        if (fullNameField) fullNameField.value = currentUser.name;
        if (emailField) emailField.value = currentUser.email;
        if (phoneField) phoneField.value = currentUser.phone;
    }
}

// ==================== CONTACT FORM ====================

function handleContact(event) {
    event.preventDefault();
    const responseDiv = document.getElementById('contactResponse');
    responseDiv.textContent = 'Thank you for your message! We will get back to you soon.';
    responseDiv.className = 'contact-response success show';
    event.target.reset();
    setTimeout(() => { responseDiv.classList.remove('show'); }, 5000);
}

// ==================== HELPERS ====================

function showMessage(element, text, type) {
    element.textContent = text;
    element.className = 'auth-message ' + type + ' show';
}

function setLoading(btn, loading, label) {
    btn.disabled = loading;
    btn.textContent = label;
}

