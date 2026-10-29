// 1. Konfigurasi Gemini AI (Khusus Chatbot AI SIMPATIK)
const CONFIG = {
    GEMINI_API_KEY: "AQ.Ab8RN6KL5nLxo1l10NN5Z6u-HvvsCIZZ74664yXM_h5rLLvjRA",
    GEMINI_MODEL: "gemini-1.5-flash"
};

// 2. Konfigurasi Firebase (Dari Firebase Console Proyek SISPKO-Sekolah)
const firebaseConfig = {
    apiKey: "AIzaSyDo7HJQTNg8S14pGZ32lATh_PllI4X1yO8", // Salin penuh apiKey asli dari Firebase Console
    authDomain: "sispko-sekolah-slbn2.firebaseapp.com",
    databaseURL: "https://sispko-sekolah-slbn2-default-rtdb.firebaseio.com",
    projectId: "sispko-sekolah-slbn2",
    storageBucket: "sispko-sekolah-slbn2.appspot.com",
    messagingSenderId: "280921949204",
    appId: "1:280921949204:web:94781a66e1d16f72911301",
    measurementId: "G-NHZLZ0J8N1"
};

// Inisialisasi Firebase App
if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

var auth = (typeof firebase !== 'undefined' && firebase.auth) ? firebase.auth() : null;
var db = (typeof firebase !== 'undefined' && firebase.database) ? firebase.database() : null;

try {
    if (typeof firebase !== 'undefined') {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        db = firebase.database();
        auth = firebase.auth();
    }
} catch (err) {
    console.warn("Firebase gagal dimuat:", err);
}

var DEFAULT_MAPELS = [
    "Pendidikan Agama Islam", "PPKN", "Bahasa Indonesia", "Matematika", 
    "IPAS", "PJOK", "Seni Budaya", "Muatan Lokal", "Bina Diri", "Bahasa Inggris"
];

var DEFAULT_USERS = [
    { id: "u1", username: "admin", nama: "Administrator Sistem", role: "admin", classIds: [], assignedMapels: [] },
    { id: "u2", username: "kepsek", nama: "Maisyanti Disi Fatimah,S.Pd.I.,M.Pd", role: "kepsek", classIds: [], assignedMapels: [] },
    { id: "u3", username: "guru", nama: "Siti Rahmah, S.Pd.", role: "walikelas", classIds: ["K1", "K2"], assignedMapels: [] },
    { id: "u4", username: "gurumapel", nama: "Ahmad Rizky, S.Pd.", role: "gurumapel", classIds: [], assignedMapels: ["PJOK"] }
];

var appState = {
    classes: [{ id: "K1", name: "Kelas I A" }, { id: "K2", name: "Kelas II B" }],
    students: [],
    mapels: [...DEFAULT_MAPELS],
    users: [...DEFAULT_USERS],
    presensiRecords: {},
    journals: [],
    evaluations: [],
    currentUser: null,
    currentTab: 'presensi'
};

var isInitialLoad = true;
var barChartInstance = null, pieChartInstance = null;

function formatUserEmail(username) {
    if (!username) return "admin@slbn2pelaihari.sch.id";
    var cleanUsername = username.trim().toLowerCase().replace(/\s+/g, '');
    return cleanUsername + "@slbn2pelaihari.sch.id";
}

function saveAppState() {
    if (db) {
        db.ref('sispko_data').set({
            classes: appState.classes,
            students: appState.students,
            mapels: appState.mapels,
            users: appState.users,
            presensiRecords: appState.presensiRecords,
            journals: appState.journals,
            evaluations: appState.evaluations
        });
    } else {
        localStorage.setItem('sispko_local_backup', JSON.stringify(appState));
    }
}

function showToast(msg, type) {
    if (!type) type = "success";
    var toast = document.getElementById('toast-banner');
    var toastIcon = document.getElementById('toast-icon');
    if (!toast) return;
    document.getElementById('toast-msg').innerText = msg;

    if (type === "success") {
        toastIcon.className = "fa-solid fa-circle-check text-emerald-400 text-lg";
    } else {
        toastIcon.className = "fa-solid fa-triangle-exclamation text-amber-400 text-lg";
    }

    toast.classList.remove('hidden');
    setTimeout(function() { toast.classList.add('hidden'); }, 3000);
}

function getClassName(classId) {
    if (classId === 'Semua Kelas') return 'Semua Kelas';
    var found = (appState.classes || []).find(function(c) { return c.id === classId; });
    return found ? found.name : classId;
}
