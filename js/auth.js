// Autentikasi, Session, & Navigasi Tab
window.onload = function() {
    const todayStr = new Date().toISOString().split('T')[0];
    if (document.getElementById('presensi-tanggal')) document.getElementById('presensi-tanggal').value = todayStr;
    if (document.getElementById('jurnal-tanggal')) document.getElementById('jurnal-tanggal').value = todayStr;

    setPresetEvalRange(null, 'today');
    setPresetRekapRange(null, 'today');

    document.querySelectorAll('.print-date-stamp').forEach(el => {
        el.innerText = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    });

    initCharts();

    if (db) {
        db.ref('sispko_data').on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                appState.classes = data.classes || [];
                appState.students = data.students || [];
                appState.mapels = data.mapels || [...DEFAULT_MAPELS];
                appState.users = (data.users && data.users.length > 0) ? data.users : [...DEFAULT_USERS];
                appState.presensiRecords = data.presensiRecords || {};
                appState.journals = data.journals || [];
                appState.evaluations = data.evaluations || [];
            }
            
            if (isInitialLoad) {
                populateDropdowns();
                checkSession(true);
                isInitialLoad = false;
            } else {
                refreshCurrentTabUI();
            }
        });
    } else {
        const localData = localStorage.getItem('sispko_local_backup');
        if (localData) {
            try { appState = JSON.parse(localData); } catch (e) { console.error(e); }
        }
        if (!appState.users || appState.users.length === 0) appState.users = [...DEFAULT_USERS];
        populateDropdowns();
        checkSession(true);
        isInitialLoad = false;
    }
};

function handleLogin(e) {
    if (e) e.preventDefault();
    const namaInput = document.getElementById('login-nama').value.trim().toLowerCase();
    const passInput = document.getElementById('login-password').value.trim();
    const userList = (appState.users && appState.users.length > 0) ? appState.users : DEFAULT_USERS;

    const user = userList.find(u => {
        const matchName = u.nama ? u.nama.toLowerCase() === namaInput : false;
        const matchUsername = u.username ? u.username.toLowerCase() === namaInput : false;
        return (matchName || matchUsername) && u.password === passInput;
    });

    if (user) {
        appState.currentUser = user;
        localStorage.setItem('sispko_session_user', JSON.stringify(user));
        document.getElementById('screen-login').classList.add('hidden');
        document.getElementById('screen-app').classList.remove('hidden');
        document.getElementById('screen-app').classList.add('flex');
        document.getElementById('user-display-name').innerText = user.nama;
        document.getElementById('user-display-role').innerText = user.role;

        applyRolePermissions(true);
        showToast(`Selamat datang, ${user.nama}!`);
    } else {
        alert("Nama pengguna/username atau password salah!");
    }
}

function handleLogout(e) {
    if (e) e.preventDefault();
    appState.currentUser = null;
    localStorage.removeItem('sispko_session_user');
    document.getElementById('screen-app').classList.add('hidden');
    document.getElementById('screen-login').classList.remove('hidden');
    showToast("Anda telah keluar dari aplikasi.");
}

function checkSession(isInitial = false) {
    const savedSession = localStorage.getItem('sispko_session_user');
    if (savedSession) {
        try {
            appState.currentUser = JSON.parse(savedSession);
            document.getElementById('screen-login').classList.add('hidden');
            document.getElementById('screen-app').classList.remove('hidden');
            document.getElementById('screen-app').classList.add('flex');
            document.getElementById('user-display-name').innerText = appState.currentUser.nama;
            document.getElementById('user-display-role').innerText = appState.currentUser.role;

            applyRolePermissions(isInitial);
        } catch (err) {
            localStorage.removeItem('sispko_session_user');
        }
    }
}

function applyRolePermissions(isInitial = false) {
    if (!appState.currentUser) return;
    const role = appState.currentUser.role;
    const tabPresensi = document.getElementById('tab-btn-presensi');
    const tabJurnal = document.getElementById('tab-btn-jurnal');
    const tabRekap = document.getElementById('tab-btn-rekap');
    const tabEvaluasi = document.getElementById('tab-btn-evaluasi');
    const tabMaster = document.getElementById('tab-btn-master');

    tabPresensi.style.display = 'flex';
    tabJurnal.style.display = 'flex';
    if (tabRekap) tabRekap.style.display = 'flex';
    if (tabEvaluasi) tabEvaluasi.parentElement.style.display = 'block';
    tabMaster.style.display = 'flex';

    populateDropdowns();

    if (role === 'walikelas') {
        if (tabRekap) tabRekap.style.display = 'none';
        if (tabEvaluasi) tabEvaluasi.parentElement.style.display = 'none';
        tabMaster.style.display = 'none';
        if(document.getElementById('jurnal-guru')) {
            document.getElementById('jurnal-guru').value = appState.currentUser.nama;
        }
        if (isInitial) switchTab(null, 'presensi');
    } else if (role === 'kepsek') {
        tabPresensi.style.display = 'none';
        tabJurnal.style.display = 'none';
        if (tabRekap) tabRekap.style.display = 'none';
        tabMaster.style.display = 'none';
        if (isInitial) switchTab(null, 'evaluasi');
    } else if (role === 'admin') {
        if (isInitial) switchTab(null, 'presensi');
    }
}

function switchTab(e, tabId) {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    appState.currentTab = tabId;
    const tabs = ['presensi', 'jurnal', 'rekap', 'evaluasi', 'master'];

    tabs.forEach(t => {
        const btn = document.getElementById(`tab-btn-${t}`);
        const section = document.getElementById(`modul-${t}`);
        if (t === tabId) {
            if (btn) btn.className = "tab-btn w-full px-3.5 py-3 rounded-xl text-xs font-bold flex items-center justify-between bg-white text-indigo-900 shadow-md transition-all cursor-pointer";
            if (section) section.classList.remove('hidden');
        } else {
            if (btn) btn.className = "tab-btn w-full px-3.5 py-3 rounded-xl text-xs font-bold flex items-center justify-between text-indigo-200 hover:bg-indigo-800/60 hover:text-white transition-all cursor-pointer";
            if (section) section.classList.add('hidden');
        }
    });

    if (window.innerWidth < 768) {
        const sidebar = document.getElementById('sidebar-nav');
        if (!sidebar.classList.contains('hidden')) toggleMobileSidebar(null);
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
    const passwordInput = document.getElementById('login-password');
    const icon = document.getElementById('toggle-password-icon');
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
    const sidebar = document.getElementById('sidebar-nav');
    const backdrop = document.getElementById('sidebar-backdrop');
    const icon = document.getElementById('mobile-hamburger-icon');

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
