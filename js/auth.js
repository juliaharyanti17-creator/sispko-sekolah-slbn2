// Autentikasi, Session, & Navigasi Tab
window.onload = function() {
    var todayStr = new Date().toISOString().split('T')[0];
    if (document.getElementById('presensi-tanggal')) document.getElementById('presensi-tanggal').value = todayStr;
    if (document.getElementById('jurnal-tanggal')) document.getElementById('jurnal-tanggal').value = todayStr;

    setPresetEvalRange(null, 'today');
    setPresetRekapRange(null, 'today');

    document.querySelectorAll('.print-date-stamp').forEach(function(el) {
        el.innerText = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    });

    initCharts();

    if (auth) {
        auth.onAuthStateChanged(function(user) {
            if (user) {
                syncDatabaseListener();
            } else {
                appState.currentUser = null;
                localStorage.removeItem('sispko_session_user');
                document.getElementById('screen-app').classList.add('hidden');
                document.getElementById('screen-login').classList.remove('hidden');
            }
        });
    } else {
        checkSession(true);
    }
};

function syncDatabaseListener() {
    if (!db) return;

    db.ref('sispko_data').on('value', function(snapshot) {
        var data = snapshot.val();
        if (data) {
            appState.classes = data.classes || [];
            appState.students = data.students || [];
            appState.mapels = data.mapels || [...DEFAULT_MAPELS];
            appState.users = (data.users && data.users.length > 0) ? data.users : [...DEFAULT_USERS];
            appState.presensiRecords = data.presensiRecords || {};
            appState.journals = data.journals || [];
            appState.evaluations = data.evaluations || [];
        } else {
            saveAppState();
        }

        var currentFirebaseUser = auth ? auth.currentUser : null;
        if (currentFirebaseUser) {
            var userEmail = (currentFirebaseUser.email || "").toLowerCase();
            var cleanEmailUsername = userEmail.split('@')[0].trim();

            // 1. Cari kecocokan presisi di appState.users berdasarkan username atau format email
            var foundUser = (appState.users || []).find(function(u) {
                var uUsername = (u.username || "").trim().toLowerCase().replace(/\s+/g, '');
                var uEmail = formatUserEmail(u.username || u.nama).toLowerCase();
                return uUsername === cleanEmailUsername || uEmail === userEmail;
            });

            // 2. Jika tidak ditemukan di appState.users, cari di DEFAULT_USERS
            if (!foundUser) {
                foundUser = DEFAULT_USERS.find(function(u) {
                    var uUsername = (u.username || "").trim().toLowerCase().replace(/\s+/g, '');
                    var uEmail = formatUserEmail(u.username || u.nama).toLowerCase();
                    return uUsername === cleanEmailUsername || uEmail === userEmail;
                });
            }

            // 3. Fallback jika tidak ada di database master (default ke walikelas, BUKAN kepsek)
            if (!foundUser) {
                foundUser = {
                    id: "u_" + Date.now(),
                    username: cleanEmailUsername,
                    nama: cleanEmailUsername.toUpperCase(),
                    role: "walikelas",
                    classIds: [],
                    assignedMapels: []
                };
            }

            appState.currentUser = foundUser;
            localStorage.setItem('sispko_session_user', JSON.stringify(foundUser));
            
            var screenLogin = document.getElementById('screen-login');
            var screenApp = document.getElementById('screen-app');

            if (screenLogin) screenLogin.classList.add('hidden');
            if (screenApp) {
                screenApp.classList.remove('hidden');
                screenApp.classList.add('flex');
            }
            
            if (document.getElementById('user-display-name')) {
                document.getElementById('user-display-name').innerText = foundUser.nama;
            }
            if (document.getElementById('user-display-role')) {
                var roleLabel = foundUser.role.toUpperCase();
                if (foundUser.role === 'walikelas') roleLabel = 'WALI KELAS';
                if (foundUser.role === 'gurumapel') roleLabel = 'GURU MAPEL';
                if (foundUser.role === 'kepsek') roleLabel = 'KEPALA SEKOLAH';
                document.getElementById('user-display-role').innerText = roleLabel;
            }

            applyRolePermissions(isInitialLoad);
            isInitialLoad = false;
        }
    });
}

async function handleLogin(e) {
    if (e) e.preventDefault();
    var namaInput = document.getElementById('login-nama').value.trim();
    var passInput = document.getElementById('login-password').value.trim();

    if (!namaInput || !passInput) {
        alert("Username dan Password wajib diisi!");
        return;
    }

    var cleanInput = namaInput.toLowerCase().replace(/\s+/g, '');
    var email = formatUserEmail(cleanInput);

    if (!auth) {
        alert("Sistem Firebase Auth belum siap. Menggunakan mode lokal.");
        return;
    }

    try {
        // 1. Coba login biasa menggunakan Firebase Auth
        await auth.signInWithEmailAndPassword(email, passInput);
        showToast("Login berhasil!");
    } catch (error) {
        console.error("Login Error:", error);

        // 2. Jika akun belum terdaftar di Firebase Auth (user-not-found / invalid-credential)
        if (
            error.code === 'auth/user-not-found' || 
            error.code === 'auth/invalid-credential' || 
            error.code === 'auth/invalid-login-credentials'
        ) {
            // Cek apakah username terdaftar di Data Master lokal/Realtime Database
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

            // Jika username ada di Data Master, daftarkan otomatis ke Firebase Auth
            if (existingUser) {
                if (passInput.length < 6) {
                    alert("Password untuk akun ini minimal harus 6 karakter agar dapat terdaftar di sistem baru!");
                    return;
                }

                try {
                    await auth.createUserWithEmailAndPassword(email, passInput);
                    showToast("Akun berhasil didaftarkan & otomatis masuk!");
                    return;
                } catch (createErr) {
                    console.error("Auto-Register Error:", createErr);
                    if (createErr.code === 'auth/email-already-in-use') {
                        alert("Password yang Anda masukkan salah!");
                    } else if (createErr.code === 'auth/weak-password') {
                        alert("Password minimal harus 6 karakter!");
                    } else {
                        alert("Gagal membuat akun otomatis: " + createErr.message);
                    }
                    return;
                }
            } else {
                alert("Username/Nama Pengguna '" + namaInput + "' tidak ditemukan di database!");
            }
        } else if (error.code === 'auth/wrong-password') {
            alert("Password yang Anda masukkan salah!");
        } else {
            alert("Gagal Masuk: " + error.message);
        }
    }
}

function handleLogout(e) {
    if (e) e.preventDefault();
    if (auth) {
        auth.signOut().then(function() {
            showToast("Anda telah keluar dari aplikasi.");
        });
    } else {
        appState.currentUser = null;
        localStorage.removeItem('sispko_session_user');
        document.getElementById('screen-app').classList.add('hidden');
        document.getElementById('screen-login').classList.remove('hidden');
        showToast("Anda telah keluar dari aplikasi.");
    }
}

function checkSession(isInitial) {
    if (typeof isInitial === 'undefined') isInitial = false;
    var savedSession = localStorage.getItem('sispko_session_user');
    if (savedSession) {
        try {
            appState.currentUser = JSON.parse(savedSession);
            document.getElementById('screen-login').classList.add('hidden');
            document.getElementById('screen-app').classList.remove('hidden');
            document.getElementById('screen-app').classList.add('flex');
            document.getElementById('user-display-name').innerText = appState.currentUser.nama;
            
            var roleLabel = appState.currentUser.role.toUpperCase();
            if (appState.currentUser.role === 'walikelas') roleLabel = 'WALI KELAS';
            if (appState.currentUser.role === 'gurumapel') roleLabel = 'GURU MAPEL';
            if (appState.currentUser.role === 'kepsek') roleLabel = 'KEPALA SEKOLAH';
            document.getElementById('user-display-role').innerText = roleLabel;

            applyRolePermissions(isInitial);
        } catch (err) {
            localStorage.removeItem('sispko_session_user');
        }
    }
}

function applyRolePermissions(isInitial) {
    if (typeof isInitial === 'undefined') isInitial = false;
    if (!appState.currentUser) return;
    var role = appState.currentUser.role;
    var tabPresensi = document.getElementById('tab-btn-presensi');
    var tabJurnal = document.getElementById('tab-btn-jurnal');
    var tabRekap = document.getElementById('tab-btn-rekap');
    var tabEvaluasi = document.getElementById('tab-btn-evaluasi');
    var tabMaster = document.getElementById('tab-btn-master');

    if (tabPresensi) tabPresensi.style.display = 'flex';
    if (tabJurnal) tabJurnal.style.display = 'flex';
    if (tabRekap) tabRekap.style.display = 'flex';
    if (tabEvaluasi) tabEvaluasi.parentElement.style.display = 'block';
    if (tabMaster) tabMaster.style.display = 'flex';

    populateDropdowns();

    if (role === 'walikelas' || role === 'gurumapel') {
        if (tabRekap) tabRekap.style.display = 'none';
        if (tabEvaluasi) tabEvaluasi.parentElement.style.display = 'none';
        if (tabMaster) tabMaster.style.display = 'none';
        if (document.getElementById('jurnal-guru')) {
            document.getElementById('jurnal-guru').value = appState.currentUser.nama;
        }
        if (isInitial) switchTab(null, 'presensi');
    } else if (role === 'kepsek') {
        if (tabPresensi) tabPresensi.style.display = 'none';
        if (tabJurnal) tabJurnal.style.display = 'none';
        if (tabRekap) tabRekap.style.display = 'none';
        if (tabMaster) tabMaster.style.display = 'none';
        if (isInitial) switchTab(null, 'evaluasi');
    } else if (role === 'admin') {
        if (isInitial) switchTab(null, 'presensi');
    }
}

function switchTab(e, tabId) {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    appState.currentTab = tabId;
    var tabs = ['presensi', 'jurnal', 'rekap', 'evaluasi', 'master'];

    tabs.forEach(function(t) {
        var btn = document.getElementById('tab-btn-' + t);
        var section = document.getElementById('modul-' + t);
        if (t === tabId) {
            if (btn) btn.className = "tab-btn w-full px-3.5 py-3 rounded-xl text-xs font-bold flex items-center justify-between bg-white text-indigo-900 shadow-md transition-all cursor-pointer";
            if (section) section.classList.remove('hidden');
        } else {
            if (btn) btn.className = "tab-btn w-full px-3.5 py-3 rounded-xl text-xs font-bold flex items-center justify-between text-indigo-200 hover:bg-indigo-800/60 hover:text-white transition-all cursor-pointer";
            if (section) section.classList.add('hidden');
        }
    });

    if (window.innerWidth < 768) {
        var sidebar = document.getElementById('sidebar-nav');
        if (sidebar && !sidebar.classList.contains('hidden')) toggleMobileSidebar(null);
    }

    refreshCurrentTabUI();
}

function refreshCurrentTabUI() {
    if (appState.currentTab === 'presensi') loadPresensiTable();
    if (appState.currentTab === 'jurnal') {
        renderJurnalList();
        renderGuruFeedbackSection();
    }
    if (appState.currentTab === 'rekap') renderRekapModule();
    if (appState.currentTab === 'evaluasi') updateEvaluasiDashboard();
    if (appState.currentTab === 'master') {
        renderMasterUsersTable();
        renderMasterKelasList();
        renderMasterMapelList();
        renderMasterSiswaTable();
    }
}

function togglePasswordVisibility(e) {
    if (e) e.preventDefault();
    var passwordInput = document.getElementById('login-password');
    var icon = document.getElementById('toggle-password-icon');
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

function toggleMobileSidebar(e) {
    if (e) e.preventDefault();
    var sidebar = document.getElementById('sidebar-nav');
    var backdrop = document.getElementById('sidebar-backdrop');
    var icon = document.getElementById('mobile-hamburger-icon');

    if (sidebar.classList.contains('hidden')) {
        sidebar.classList.remove('hidden');
        sidebar.classList.add('flex');
        backdrop.classList.remove('hidden');
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-xmark');
    } else {
        sidebar.classList.add('hidden');
        sidebar.classList.remove('flex');
        backdrop.classList.add('hidden');
        icon.classList.remove('fa-xmark');
        icon.classList.add('fa-bars');
    }
}
