// ==========================================================================
// Autentikasi, Pengelolaan Sesi, Navigasi Tab, & Hak Akses SIMPATIK
// SLBN 2 PELAIHARI
// ==========================================================================

var isInitialLoad = true;

window.onload = function() {
    // Set default tanggal hari ini
    var todayStr = new Date().toISOString().split('T')[0];
    if (document.getElementById('presensi-tanggal')) document.getElementById('presensi-tanggal').value = todayStr;
    if (document.getElementById('jurnal-tanggal')) document.getElementById('jurnal-tanggal').value = todayStr;

    if (typeof setPresetEvalRange === 'function') setPresetEvalRange(null, 'today');
    if (typeof setPresetRekapRange === 'function') setPresetRekapRange(null, 'today');

    document.querySelectorAll('.print-date-stamp').forEach(function(el) {
        el.innerText = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    });

    if (typeof initCharts === 'function') initCharts();

    // Cek sesi login yang tersimpan
    checkSession(true);
};

// 1. FUNGSI PAKSA PERPINDAHAN TAMPILAN
function showAppScreen() {
    var screenLogin = document.getElementById('screen-login');
    var screenApp = document.getElementById('screen-app');

    if (screenLogin) {
        screenLogin.classList.add('hidden');
        screenLogin.style.setProperty('display', 'none', 'important');
    }
    if (screenApp) {
        screenApp.classList.remove('hidden');
        screenApp.classList.add('flex');
        screenApp.style.setProperty('display', 'flex', 'important');
    }
}

function showLoginScreen() {
    var screenLogin = document.getElementById('screen-login');
    var screenApp = document.getElementById('screen-app');

    if (screenApp) {
        screenApp.classList.add('hidden');
        screenApp.style.setProperty('display', 'none', 'important');
    }
    if (screenLogin) {
        screenLogin.classList.remove('hidden');
        screenLogin.style.setProperty('display', 'flex', 'important');
    }
}

// 2. FUNGSI LOGIN LOKAL (LANGSUNG MASUK TANPA TERTAN)
async function handleLogin(e) {
    if (e) e.preventDefault();
    var namaInput = document.getElementById('login-nama').value.trim();
    var passInput = document.getElementById('login-password').value.trim();

    if (!namaInput || !passInput) {
        alert("Username dan Password wajib diisi!");
        return;
    }

    var cleanInput = namaInput.toLowerCase().replace(/\s+/g, '');

    // Cari akun di data lokal
    var existingUser = (appState.users || []).find(function(u) {
        var uName = (u.username || "").trim().toLowerCase().replace(/\s+/g, '');
        var uNama = (u.nama || "").trim().toLowerCase().replace(/\s+/g, '');
        return uName === cleanInput || uNama === cleanInput;
    });

    if (!existingUser) {
        existingUser = DEFAULT_USERS.find(function(u) {
            var uName = (u.username || "").trim().toLowerCase().replace(/\s+/g, '');
            var uNama = (u.nama || "").trim().toLowerCase().replace(/\s+/g, '');
            return uName === cleanInput || uNama === cleanInput;
        });
    }

    if (existingUser) {
        appState.currentUser = existingUser;
        localStorage.setItem('sispko_session_user', JSON.stringify(existingUser));
        
        // PAKSA BUKA HALAMAN UTAMA
        showAppScreen();
        updateUserDisplayBadge(existingUser);
        applyRolePermissions(true);

        if (typeof showToast === 'function') showToast("Login berhasil!");
        return;
    } else {
        alert("Username/Nama Pengguna '" + namaInput + "' tidak ditemukan!");
    }
}

function handleLogout(e) {
    if (e) e.preventDefault();
    appState.currentUser = null;
    localStorage.removeItem('sispko_session_user');
    showLoginScreen();
    if (typeof showToast === 'function') showToast("Anda telah keluar.");
}

function checkSession(isInitial) {
    var savedSession = localStorage.getItem('sispko_session_user');
    if (savedSession) {
        try {
            appState.currentUser = JSON.parse(savedSession);
            showAppScreen();
            updateUserDisplayBadge(appState.currentUser);
            applyRolePermissions(isInitial);
        } catch (err) {
            localStorage.removeItem('sispko_session_user');
            showLoginScreen();
        }
    } else {
        showLoginScreen();
    }
}

function updateUserDisplayBadge(user) {
    if (!user) return;
    if (document.getElementById('user-display-name')) {
        document.getElementById('user-display-name').innerText = user.nama;
    }
    if (document.getElementById('user-display-role')) {
        var roleLabel = user.role.toUpperCase();
        if (user.role === 'walikelas') roleLabel = 'WALI KELAS';
        if (user.role === 'gurumapel') roleLabel = 'GURU MAPEL';
        if (user.role === 'kepsek') roleLabel = 'KEPALA SEKOLAH';
        document.getElementById('user-display-role').innerText = roleLabel;
    }
}

// 3. ATUR PERIZINAN PERAN (ROLE) & BUKA TAB AWAL
function applyRolePermissions(isInitial) {
    if (!appState.currentUser) return;
    var role = appState.currentUser.role;

    var tabPresensi = document.getElementById('tab-btn-presensi');
    var tabJurnal = document.getElementById('tab-btn-jurnal');
    var tabRekap = document.getElementById('tab-btn-rekap');
    var tabEvaluasi = document.getElementById('tab-btn-evaluasi');
    var tabMaster = document.getElementById('tab-btn-master');

    // Tampilkan tombol navigasi sesuai role
    if (tabPresensi) tabPresensi.style.display = 'flex';
    if (tabJurnal) tabJurnal.style.display = 'flex';
    if (tabRekap) tabRekap.style.display = 'flex';
    if (tabEvaluasi) tabEvaluasi.parentElement.style.display = 'block';
    if (tabMaster) tabMaster.style.display = 'flex';

    if (typeof populateDropdowns === 'function') populateDropdowns();

    // Arahkan ke tab awal sesuai peran
    if (role === 'walikelas' || role === 'gurumapel') {
        if (tabRekap) tabRekap.style.display = 'none';
        if (tabEvaluasi) tabEvaluasi.parentElement.style.display = 'none';
        if (tabMaster) tabMaster.style.display = 'none';
        if (document.getElementById('jurnal-guru')) {
            document.getElementById('jurnal-guru').value = appState.currentUser.nama;
        }
        switchTab(null, 'presensi');

    } else if (role === 'kepsek') {
        if (tabPresensi) tabPresensi.style.display = 'none';
        if (tabJurnal) tabJurnal.style.display = 'none';
        if (tabRekap) tabRekap.style.display = 'none';
        if (tabMaster) tabMaster.style.display = 'none';
        switchTab(null, 'evaluasi');

    } else if (role === 'admin') {
        switchTab(null, 'presensi');
    }
}

// 4. PERPINDAHAN TAB
function switchTab(e, tabId) {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    appState.currentTab = tabId;
    var tabs = ['presensi', 'jurnal', 'rekap', 'evaluasi', 'master'];

    tabs.forEach(function(t) {
        var btn = document.getElementById('tab-btn-' + t);
        var section = document.getElementById('modul-' + t);
        if (t === tabId) {
            if (btn) btn.className = "tab-btn w-full px-3.5 py-3 rounded-xl text-xs font-bold flex items-center justify-between bg-white text-indigo-900 shadow-md transition-all cursor-pointer";
            if (section) {
                section.classList.remove('hidden');
                section.style.setProperty('display', 'block', 'important');
            }
        } else {
            if (btn) btn.className = "tab-btn w-full px-3.5 py-3 rounded-xl text-xs font-bold flex items-center justify-between text-indigo-200 hover:bg-indigo-800/60 hover:text-white transition-all cursor-pointer";
            if (section) {
                section.classList.add('hidden');
                section.style.setProperty('display', 'none', 'important');
            }
        }
    });

    if (window.innerWidth < 768) {
        var sidebar = document.getElementById('sidebar-nav');
        if (sidebar && !sidebar.classList.contains('hidden')) toggleMobileSidebar(null);
    }

    if (typeof refreshCurrentTabUI === 'function') refreshCurrentTabUI();
}

function refreshCurrentTabUI() {
    if (appState.currentTab === 'presensi' && typeof loadPresensiTable === 'function') loadPresensiTable();
    if (appState.currentTab === 'jurnal' && typeof renderJurnalList === 'function') renderJurnalList();
    if (appState.currentTab === 'rekap' && typeof renderRekapModule === 'function') renderRekapModule();
    if (appState.currentTab === 'evaluasi' && typeof updateEvaluasiDashboard === 'function') updateEvaluasiDashboard();
    if (appState.currentTab === 'master') {
        if (typeof renderMasterUsersTable === 'function') renderMasterUsersTable();
        if (typeof renderMasterKelasList === 'function') renderMasterKelasList();
        if (typeof renderMasterMapelList === 'function') renderMasterMapelList();
        if (typeof renderMasterSiswaTable === 'function') renderMasterSiswaTable();
    }
}

function togglePasswordVisibility(e) {
    if (e) e.preventDefault();
    var passwordInput = document.getElementById('login-password');
    var icon = document.getElementById('toggle-password-icon');
    if (!passwordInput) return;

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        if (icon) {
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        }
    } else {
        passwordInput.type = 'password';
        if (icon) {
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }
}

function toggleMobileSidebar(e) {
    if (e) e.preventDefault();
    var sidebar = document.getElementById('sidebar-nav');
    var backdrop = document.getElementById('sidebar-backdrop');
    var icon = document.getElementById('mobile-hamburger-icon');

    if (!sidebar) return;

    if (sidebar.classList.contains('hidden')) {
        sidebar.classList.remove('hidden');
        sidebar.classList.add('flex');
        if (backdrop) backdrop.classList.remove('hidden');
        if (icon) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-xmark');
        }
    } else {
        sidebar.classList.add('hidden');
        sidebar.classList.remove('flex');
        if (backdrop) backdrop.classList.add('hidden');
        if (icon) {
            icon.classList.remove('fa-xmark');
            icon.classList.add('fa-bars');
        }
    }
}
