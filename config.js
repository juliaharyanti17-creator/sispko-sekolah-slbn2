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
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

// 3. Fungsi Simpan State (Hybrid: Firebase + LocalStorage Backup)
window.saveAppState = function() {
    // Selalu simpan backup aman ke LocalStorage browser terlebih dahulu
    try {
        localStorage.setItem('simpatik_backup_state', JSON.stringify(window.appState));
    } catch(e) {
        console.error("Gagal menyimpan ke LocalStorage:", e);
    }

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
        .then(function() {
            console.log("✓ Data SIMPATIK berhasil disinkronkan ke Firebase.");
        })
        .catch(function(err) {
            console.error("✕ Gagal menyimpan ke Firebase:", err);
        });
};

// 4. Fungsi Muat Data Saat Refresh (Mendukung Fallback LocalStorage)
window.loadAppState = function(callback) {
    var savedSession = localStorage.getItem('sispko_session_user');
    if (savedSession) {
        try { window.appState.currentUser = JSON.parse(savedSession); } catch(e) {}
    }

    // Ambil dulu dari LocalStorage sebagai pertahanan pertama agar data instan muncul
    var localBackup = localStorage.getItem('simpatik_backup_state');
    if (localBackup) {
        try {
            var parsedLocal = JSON.parse(localBackup);
            if (parsedLocal.students && parsedLocal.students.length > 0) {
                window.appState.students = parsedLocal.students;
            }
            if (parsedLocal.classes && parsedLocal.classes.length > 0) window.appState.classes = parsedLocal.classes;
            if (parsedLocal.subjects && parsedLocal.subjects.length > 0) window.appState.subjects = parsedLocal.subjects;
            if (parsedLocal.users && parsedLocal.users.length > 0) window.appState.users = parsedLocal.users;
            if (parsedLocal.ketunaanList && parsedLocal.ketunaanList.length > 0) window.appState.ketunaanList = parsedLocal.ketunaanList;
        } catch(e) {}
    }

    if (typeof firebase === 'undefined' || !firebase.apps.length) {
        triggerUIRender();
        if (callback) callback();
        return;
    }

    // Tarik data terbaru dari Firebase
    firebase.database().ref('simpatik_data').once('value')
        .then(function(snapshot) {
            var data = snapshot.val();
            if (data) {
                if (data.students && data.students.length > 0) window.appState.students = data.students;
                if (data.journals) window.appState.journals = data.journals;
                if (data.classes && data.classes.length > 0) window.appState.classes = data.classes;
                if (data.subjects && data.subjects.length > 0) window.appState.subjects = data.subjects;
                if (data.users && data.users.length > 0) window.appState.users = data.users;
                if (data.presensi) window.appState.presensi = data.presensi;
                if (data.evaluations) window.appState.evaluations = data.evaluations;
                if (data.ketunaanList) window.appState.ketunaanList = data.ketunaanList;
                
                // Perbarui backup local storage dengan data firebase terbaru
                localStorage.setItem('simpatik_backup_state', JSON.stringify(window.appState));
                console.log("✓ Data Firebase berhasil dimuat sepenuhnya.");
            } else {
                console.warn("! Database Firebase kosong. Menyimpan data default/lokal ke Firebase.");
                window.saveAppState();
            }

            triggerUIRender();
            if (callback) callback();
        })
        .catch(function(err) {
            console.error("✕ Gagal mengambil data Firebase. Menggunakan LocalStorage:", err);
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