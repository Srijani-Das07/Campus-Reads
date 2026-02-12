// ==================== AUTHENTICATION SYSTEM ====================

// User database (stored in localStorage)
let users = JSON.parse(localStorage.getItem('campusreads_users')) || [];

// Current logged in user
let currentUser = JSON.parse(localStorage.getItem('campusreads_current_user')) || null;

// ==================== INITIAL CHECK ====================

// Check if user is already logged in
(function checkAuth() {
    // If we're on the main page and no user is logged in, redirect to login
    if (window.location.pathname.includes('main.html') && !currentUser) {
        window.location.href = 'index.html';
    }
    
    // If we're on the login page and user is already logged in, redirect to main
    if (window.location.pathname.includes('index.html') && currentUser) {
        window.location.href = 'main.html';
    }
    
    // Update UI if on main page
    if (window.location.pathname.includes('main.html') && currentUser) {
        displayUserInfo();
    }
})();

// ==================== FORM TOGGLES ====================

function showLoginForm() {
    document.getElementById('loginFormContainer').classList.add('active');
    document.getElementById('registerFormContainer').classList.remove('active');
    document.getElementById('loginTabBtn').classList.add('active');
    document.getElementById('registerTabBtn').classList.remove('active');
    
    // Clear messages
    document.getElementById('loginMessage').classList.remove('show');
    document.getElementById('registerMessage').classList.remove('show');
}

function showRegisterForm() {
    document.getElementById('registerFormContainer').classList.add('active');
    document.getElementById('loginFormContainer').classList.remove('active');
    document.getElementById('registerTabBtn').classList.add('active');
    document.getElementById('loginTabBtn').classList.remove('active');
    
    // Clear messages
    document.getElementById('loginMessage').classList.remove('show');
    document.getElementById('registerMessage').classList.remove('show');
}

// ==================== LOGIN HANDLER ====================

function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const messageDiv = document.getElementById('loginMessage');
    
    // Validation
    if (!email || !password) {
        showMessage(messageDiv, 'Please fill in all fields', 'error');
        return;
    }
    
    // Find user
    const user = users.find(u => u.email === email);
    
    if (!user) {
        showMessage(messageDiv, 'No account found with this email', 'error');
        return;
    }
    
    if (user.password !== password) {
        showMessage(messageDiv, 'Incorrect password', 'error');
        return;
    }
    
    // Login successful
    currentUser = {
        name: user.name,
        email: user.email,
        phone: user.phone
    };
    
    localStorage.setItem('campusreads_current_user', JSON.stringify(currentUser));
    
    showMessage(messageDiv, 'Login successful! Redirecting...', 'success');
    
    // Redirect to main page
    setTimeout(() => {
        window.location.href = 'main.html';
    }, 1500);
}

// ==================== REGISTER HANDLER ====================

function handleRegister(event) {
    event.preventDefault();
    
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    const messageDiv = document.getElementById('registerMessage');
    
    // Validation
    if (!name || !email || !phone || !password || !confirmPassword) {
        showMessage(messageDiv, 'Please fill in all fields', 'error');
        return;
    }
    
    // Email validation
    if (!email.includes('@') || !email.includes('.')) {
        showMessage(messageDiv, 'Please enter a valid email address', 'error');
        return;
    }
    
    // Phone validation
    if (!/^\d{10}$/.test(phone)) {
        showMessage(messageDiv, 'Please enter a valid 10-digit phone number', 'error');
        return;
    }
    
    // Password validation
    if (password.length < 6) {
        showMessage(messageDiv, 'Password must be at least 6 characters', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showMessage(messageDiv, 'Passwords do not match', 'error');
        return;
    }
    
    // Check if email already exists
    if (users.some(u => u.email === email)) {
        showMessage(messageDiv, 'An account with this email already exists', 'error');
        return;
    }
    
    // Create new user
    const newUser = {
        id: Date.now(),
        name,
        email,
        phone,
        password,
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('campusreads_users', JSON.stringify(users));
    
    showMessage(messageDiv, 'Account created successfully! Redirecting to login...', 'success');
    
    // Clear form
    document.getElementById('registerForm').reset();
    
    // Switch to login form after 2 seconds
    setTimeout(() => {
        showLoginForm();
    }, 2000);
}

// ==================== LOGOUT HANDLER ====================

function logout() {
    // Clear current user
    currentUser = null;
    localStorage.removeItem('campusreads_current_user');
    
    // Clear cart
    localStorage.removeItem('campusreads_cart');
    
    // Redirect to login page
    window.location.href = 'index.html';
}

// ==================== DISPLAY USER INFO ON MAIN PAGE ====================

function displayUserInfo() {
    if (currentUser) {
        const banner = document.getElementById('userBanner');
        const bannerName = document.getElementById('bannerUserName');
        
        if (banner && bannerName) {
            bannerName.textContent = currentUser.name.split(' ')[0]; // First name only
            banner.style.display = 'block';
        }
        
        // Pre-fill order form with user info
        const fullNameField = document.getElementById('fullName');
        const emailField = document.getElementById('email');
        const phoneField = document.getElementById('phone');
        
        if (fullNameField) fullNameField.value = currentUser.name;
        if (emailField) emailField.value = currentUser.email;
        if (phoneField) phoneField.value = currentUser.phone;
    }
}

// ==================== HELPER FUNCTIONS ====================

function showMessage(element, text, type) {
    element.textContent = text;
    element.className = 'auth-message ' + type + ' show';
}

// ==================== CONTACT FORM HANDLER ====================

function handleContact(event) {
    event.preventDefault();
    const responseDiv = document.getElementById('contactResponse');
    
    responseDiv.textContent = 'Thank you for your message! We will get back to you soon.';
    responseDiv.className = 'contact-response success show';
    
    event.target.reset();
    
    setTimeout(() => {
        responseDiv.classList.remove('show');
    }, 5000);
}

