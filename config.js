// ==========================================================================
// CONFIGURATIONS & HYBRID STORAGE CONNECTOR - SIMPATIK SLBN 2 PELAIHARI
// ==========================================================================

// 1. Inisialisasi State Aplikasi Global (Default)
window.appState = {
    currentUser: null,
    users: [],
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
// 3. FUNGSI SIMPAN TERPISAH (PER CABANG DATA)
// ==========================================================================

// Fungsi utilitas untuk pencadangan lokal
function updateLocalBackup() {
    try {
        localStorage.setItem('simpatik_backup_state', JSON.stringify(window.appState));
    } catch(e) { console.error("Gagal backup lokal:", e); }
}

// Simpan KHUSUS Data Murid
window.saveStudentsData = function() {
    updateLocalBackup();
    if (typeof firebase !== 'undefined' && firebase.apps.length) {
        firebase.database().ref('simpatik_data/students').set(window.appState.students || [])
            .then(function() { console.log("✓ Data Murid berhasil disimpan ke cabang terpisah."); })
            .catch(function(err) { console.error("✕ Gagal simpan murid:", err); });
    }
};

// Simpan KHUSUS Data Kelas
window.saveClassesData = function() {
    updateLocalBackup();
    if (typeof firebase !== 'undefined' && firebase.apps.length) {
        firebase.database().ref('simpatik_data/classes').set(window.appState.classes || [])
            .then(function() { console.log("✓ Data Kelas berhasil disimpan ke cabang terpisah."); })
            .catch(function(err) { console.error("✕ Gagal simpan kelas:", err); });
    }
};

// Simpan KHUSUS Data Pengguna/Admin
window.saveUsersData = function() {
    updateLocalBackup();
    if (typeof firebase !== 'undefined' && firebase.apps.length) {
        firebase.database().ref('simpatik_data/users').set(window.appState.users || [])
            .then(function() { console.log("✓ Data Pengguna berhasil disimpan ke cabang terpisah."); })
            .catch(function(err) { console.error("✕ Gagal simpan pengguna:", err); });
    }
};

// Simpan KHUSUS Data Jurnal
window.saveJournalsData = function() {
    updateLocalBackup();
    if (typeof firebase !== 'undefined' && firebase.apps.length) {
        firebase.database().ref('simpatik_data/journals').set(window.appState.journals || [])
            .then(function() { console.log("✓ Data Jurnal berhasil disimpan ke cabang terpisah."); })
            .catch(function(err) { console.error("✕ Gagal simpan jurnal:", err); });
    }
};

// Simpan KHUSUS Data Presensi
window.savePresensiData = function() {
    updateLocalBackup();
    if (typeof firebase !== 'undefined' && firebase.apps.length) {
        firebase.database().ref('simpatik_data/presensi').set(window.appState.presensi || [])
            .then(function() { console.log("✓ Data Presensi berhasil disimpan ke cabang terpisah."); })
            .catch(function(err) { console.error("✕ Gagal simpan presensi:", err); });
    }
};

// Fungsi Simpan Master (menyimpan semua sekaligus - berguna untuk struktur awal)
window.saveAppState = function() {
    updateLocalBackup();
    if (typeof firebase === 'undefined' || !firebase.apps.length) {
        console.warn("Firebase offline. Data disimpan di LocalStorage.");
        return;
    }

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

    firebase.database().ref('simpatik_data').set(dataToSave)
        .then(function() { console.log("✓ Semua cabang data berhasil disinkronkan."); })
        .catch(function(err) { console.error("✕ Gagal menyimpan semua data:", err); });
};

// ==========================================================================
// 4. FUNGSI MUAT DATA SAAT REFRESH
// ==========================================================================
window.loadAppState = function(callback) {
    var savedSession = localStorage.getItem('sispko_session_user');
    if (savedSession) {
        try { window.appState.currentUser = JSON.parse(savedSession); } catch(e) {}
    }

    // Ambil data instan dari LocalStorage dulu
    var localBackup = localStorage.getItem('simpatik_backup_state');
    if (localBackup) {
        try {
            var parsedLocal = JSON.parse(localBackup);
            if (parsedLocal.students) window.appState.students = parsedLocal.students;
            if (parsedLocal.classes) window.appState.classes = parsedLocal.classes;
            if (parsedLocal.subjects) window.appState.subjects = parsedLocal.subjects;
            if (parsedLocal.users) window.appState.users = parsedLocal.users;
            if (parsedLocal.ketunaanList) window.appState.ketunaanList = parsedLocal.ketunaanList;
        } catch(e) {}
    }

    if (typeof firebase === 'undefined' || !firebase.apps.length) {
        triggerUIRender();
        if (callback) callback();
        return;
    }

    // Tarik data terbaru dan timpa memori lama
    firebase.database().ref('simpatik_data').once('value')
        .then(function(snapshot) {
            var data = snapshot.val();
            if (data) {
                window.appState.students = data.students || [];
                window.appState.journals = data.journals || [];
                window.appState.classes = data.classes || [];
                window.appState.subjects = data.subjects || [];
                window.appState.users = data.users || [];
                window.appState.presensi = data.presensi || [];
                window.appState.evaluations = data.evaluations || [];
                window.appState.ketunaanList = data.ketunaanList || window.appState.ketunaanList;
                
                updateLocalBackup();
                console.log("✓ Data Firebase berhasil dimuat sepenuhnya.");
            } else {
                console.warn("! Database Firebase kosong. Menyimpan data awal.");
                window.saveAppState();
            }

            triggerUIRender();
            if (callback) callback();
        })
        .catch(function(err) {
            console.error("✕ Gagal mengambil data Firebase:", err);
            triggerUIRender();
            if (callback) callback();
        });
};

function triggerUIRender() {
    if (typeof renderAllMasterData === 'function') renderAllMasterData();
    if (typeof renderJurnalList === 'function') renderJurnalList();
    if (typeof renderPresensiForm === 'function') renderPresensiForm();
}

document.addEventListener('DOMContentLoaded', function() {
    window.loadAppState();
});
        
