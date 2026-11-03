// ==========================================================================
// CONFIGURATIONS & HYBRID STORAGE CONNECTOR - SIMPATIK SLBN 2 PELAIHARI
// ==========================================================================

// 1. Inisialisasi State Aplikasi Global
window.appState = {
    currentUser: null,
    users: [
        { id: 'admin-default', nama: 'Administrator SLBN 2', username: 'admin', password: 'admin', role: 'admin' }
    ],
    classes: [],
    subjects: [],
    students: [],
    journals: [],
    presensi: [],
    evaluations: [],
    ketunaanList: [
        "Tuna Netra", "Tuna Rungu", "Tuna Grahita", "Tuna Grahita Sedang",
        "Tuna Daksa", "Autis", "Down Syndrome", "Hiperaktif", "Kesulitan Belajar"
    ]
};

// 2. Konfigurasi SDK Firebase Realtime Database
const firebaseConfig = {
  apiKey: "AIzaSyDo7HJQTNgH2OyOjVetYajtR-gIdsWwj_0",
  authDomain: "sispko-sekolah.firebaseapp.com",
  databaseURL: "https://sispko-sekolah-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "sispko-sekolah",
  storageBucket: "sispko-sekolah.firebasestorage.app",
  messagingSenderId: "280921949204",
  appId: "1:280921949204:web:94781a66e1d16f72911301",
  measurementId: "G-NHZLZGTSD0"
};

// Cegah Inisialisasi Ganda Firebase
if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// ==========================================================================
// 3. FUNGSI PENANGANAN SESI LOGIN & TAMPILAN (COCOK DENGAN INDEX.HTML)
// ==========================================================================
window.checkUserSession = function() {
    // Tangkap elemen layar sesuai ID yang ada di index.html
    var loginSection = document.getElementById('screen-login') || document.getElementById('loginSection');
    var mainDashboard = document.getElementById('screen-app') || document.getElementById('mainDashboard');

    // Tangkap elemen profil pengguna di sidebar
    var nameElem = document.getElementById('user-display-name');
    var roleElem = document.getElementById('user-display-role');

    if (window.appState && window.appState.currentUser) {
        // Sesi Aktif: Sembunyikan Layar Login, Tampilkan Dashboard Utama
        if (loginSection) {
            loginSection.style.setProperty('display', 'none', 'important');
            loginSection.classList.add('hidden');
        }
        if (mainDashboard) {
            mainDashboard.style.setProperty('display', 'flex', 'important');
            mainDashboard.classList.remove('hidden');
            mainDashboard.classList.add('flex');
        }

        // Tampilkan Nama & Role Pengguna di Sidebar
        if (nameElem) nameElem.textContent = window.appState.currentUser.nama || window.appState.currentUser.username;
        if (roleElem) roleElem.textContent = (window.appState.currentUser.role || 'ADMIN').toUpperCase();
        
        console.log("✓ Sesi login aktif untuk:", window.appState.currentUser.username || window.appState.currentUser.nama);
    } else {
        // Sesi Belum Ada: Tampilkan Layar Login, Sembunyikan Dashboard
        if (loginSection) {
            loginSection.style.setProperty('display', 'flex', 'important');
            loginSection.classList.remove('hidden');
        }
        if (mainDashboard) {
            mainDashboard.style.setProperty('display', 'none', 'important');
            mainDashboard.classList.add('hidden');
        }
    }
};

// ==========================================================================
// 4. FUNGSI SIMPAN TERPISAH (PER CABANG DATA)
// ==========================================================================
function updateLocalBackup() {
    try {
        localStorage.setItem('simpatik_backup_state', JSON.stringify(window.appState));
    } catch(e) { console.error("Gagal backup lokal:", e); }
}

window.saveStudentsData = function() {
    updateLocalBackup();
    if (typeof firebase !== 'undefined' && firebase.apps.length) {
        firebase.database().ref('simpatik_data/students').set(window.appState.students || []);
    }
};

window.saveClassesData = function() {
    updateLocalBackup();
    if (typeof firebase !== 'undefined' && firebase.apps.length) {
        firebase.database().ref('simpatik_data/classes').set(window.appState.classes || []);
    }
};

window.saveUsersData = function() {
    updateLocalBackup();
    if (typeof firebase !== 'undefined' && firebase.apps.length) {
        firebase.database().ref('simpatik_data/users').set(window.appState.users || []);
    }
};

window.saveJournalsData = function() {
    updateLocalBackup();
    if (typeof firebase !== 'undefined' && firebase.apps.length) {
        firebase.database().ref('simpatik_data/journals').set(window.appState.journals || []);
    }
};

window.savePresensiData = function() {
    updateLocalBackup();
    if (typeof firebase !== 'undefined' && firebase.apps.length) {
        firebase.database().ref('simpatik_data/presensi').set(window.appState.presensi || []);
    }
};

window.saveAppState = function() {
    updateLocalBackup();
    if (typeof firebase === 'undefined' || !firebase.apps.length) return;

    var dataToSave = {
        users: window.appState.users || [],
        classes: window.appState.classes || [],
        subjects: window.appState.subjects || [],
        students: window.appState.students || [],
        journals: window.appState.journals || [],
        presensi: window.appState.presensi || [],
        evaluations: window.appState.evaluations || [],
        ketunaanList: window.appState.ketunaanList || []
    };

    firebase.database().ref('simpatik_data').set(dataToSave);
};

// ==========================================================================
// 5. FUNGSI MUAT DATA SAAT REFRESH
// ==========================================================================
window.loadAppState = function(callback) {
    var savedSession = localStorage.getItem('sispko_session_user');
    if (savedSession) {
        try { window.appState.currentUser = JSON.parse(savedSession); } catch(e) {}
    }

    var localBackup = localStorage.getItem('simpatik_backup_state');
    if (localBackup) {
        try {
            var parsedLocal = JSON.parse(localBackup);
            if (parsedLocal.students) window.appState.students = parsedLocal.students;
            if (parsedLocal.classes) window.appState.classes = parsedLocal.classes;
            if (parsedLocal.subjects) window.appState.subjects = parsedLocal.subjects;
            if (parsedLocal.users && parsedLocal.users.length > 0) window.appState.users = parsedLocal.users;
            if (parsedLocal.journals) window.appState.journals = parsedLocal.journals;
            if (parsedLocal.presensi) window.appState.presensi = parsedLocal.presensi;
            if (parsedLocal.evaluations) window.appState.evaluations = parsedLocal.evaluations;
            if (parsedLocal.ketunaanList) window.appState.ketunaanList = parsedLocal.ketunaanList;
        } catch(e) {}
    }

    if (typeof firebase === 'undefined' || !firebase.apps.length) {
        triggerUIRender();
        if (callback) callback();
        return;
    }

    firebase.database().ref('simpatik_data').once('value')
        .then(function(snapshot) {
            var data = snapshot.val();
            if (data) {
                window.appState.students = data.students || [];
                window.appState.journals = data.journals || [];
                window.appState.classes = data.classes || [];
                window.appState.subjects = data.subjects || [];
                window.appState.users = (data.users && data.users.length > 0) ? data.users : window.appState.users;
                window.appState.presensi = data.presensi || [];
                window.appState.evaluations = data.evaluations || [];
                window.appState.ketunaanList = data.ketunaanList || window.appState.ketunaanList;
                
                updateLocalBackup();
            } else {
                window.saveAppState();
            }

            triggerUIRender();
            if (callback) callback();
        })
        .catch(function(err) {
            triggerUIRender();
            if (callback) callback();
        });
};

function triggerUIRender() {
    window.checkUserSession();
    if (typeof renderAllMasterData === 'function') renderAllMasterData();
    if (typeof renderJurnalList === 'function') renderJurnalList();
    if (typeof renderPresensiForm === 'function') renderPresensiForm();
}

document.addEventListener('DOMContentLoaded', function() {
    window.loadAppState();
});
