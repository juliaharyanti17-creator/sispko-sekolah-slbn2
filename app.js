// ==========================================================================
// SIMPATIK SLBN 2 PELAIHARI - MAIN APPLICATION LOGIC (app.js)
// ==========================================================================

document.addEventListener('DOMContentLoaded', function() {
    initAppEvents();
});

function initAppEvents() {
    const loginForm = document.getElementById('loginForm') || document.getElementById('login-form') || document.querySelector('form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            doLogin(e);
        });
    }
}

// --------------------------------------------------------------------------
// OTENTIKASI & SESI PENGGUNA
// --------------------------------------------------------------------------
window.doLogin = function(e) {
    if (e && e.preventDefault) e.preventDefault();

    var usernameInput = document.getElementById('login-nama') || document.getElementById('username') || document.getElementById('loginUsername');
    var passwordInput = document.getElementById('login-password') || document.getElementById('password') || document.getElementById('loginPassword');

    var username = usernameInput ? usernameInput.value : '';
    var password = passwordInput ? passwordInput.value : '';

    handleLogin(username, password);
};

window.forceLoginAdmin = function() {
    var adminUser = { 
        id: 'admin-default', 
        nama: 'Administrator SLBN 2', 
        username: 'admin', 
        password: 'admin', 
        role: 'admin' 
    };
    
    window.appState.currentUser = adminUser;
    localStorage.setItem('sispko_session_user', JSON.stringify(adminUser));
    
    if (typeof window.checkUserSession === 'function') window.checkUserSession();
    if (typeof triggerUIRender === 'function') triggerUIRender();
    
    alert("✓ Berhasil masuk paksa sebagai Administrator!");
};

function handleLogin(username, password) {
    var uInput = (username || '').trim().toLowerCase();
    var pInput = (password || '').trim();

    if (!uInput || !pInput) {
        alert("Harap isi nama pengguna dan kata sandi!");
        return;
    }

    var users = window.appState.users || [];

    // 1. Cari pengguna
    var foundUser = users.find(function(u) {
        var uName = (u.username || u.nama || '').trim().toLowerCase();
        var uPass = String(u.password || '').trim();
        return uName === uInput && uPass === pInput;
    });

    // 2. Fallback Akses Darurat Admin
    if (!foundUser && uInput === 'admin' && pInput === 'admin') {
        foundUser = { 
            id: 'admin-default', 
            nama: 'Administrator SLBN 2', 
            username: 'admin', 
            password: 'admin', 
            role: 'admin' 
        };
        
        var adminExists = users.some(u => (u.username || '').toLowerCase() === 'admin');
        if (!adminExists) {
            window.appState.users.push(foundUser);
            if (typeof window.saveUsersData === 'function') window.saveUsersData();
        }
    }

    // 3. Eksekusi Pengalihan Layar Login ke Dashboard
    if (foundUser) {
        window.appState.currentUser = foundUser;
        localStorage.setItem('sispko_session_user', JSON.stringify(foundUser));
        
        // Alihkan antarmuka secara langsung
        if (typeof window.checkUserSession === 'function') {
            window.checkUserSession();
        }
        if (typeof triggerUIRender === 'function') {
            triggerUIRender();
        }

        alert("Berhasil masuk! Selamat datang, " + (foundUser.nama || foundUser.username));
    } else {
        alert("Nama pengguna atau kata sandi tidak cocok!");
    }
}

function handleLogout(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (confirm("Apakah Anda yakin ingin keluar dari aplikasi SIMPATIK?")) {
        window.appState.currentUser = null;
        localStorage.removeItem('sispko_session_user');
        
        if (typeof window.checkUserSession === 'function') {
            window.checkUserSession();
        } else {
            window.location.reload();
        }
    }
}
