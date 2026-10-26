// Konfigurasi Firebase & Global State
const firebaseConfig = {
    apiKey: "AIzaSyDo7NJQTNqt2OyDjVetYajtR-g1dsWwj_8",
    authDomain: "sispko-sekolah.firebaseapp.com",
    databaseURL: "https://sispko-sekolah-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "sispko-sekolah",
    storageBucket: "sispko-sekolah.firebasestorage.app",
    messagingSenderId: "280921949204",
    appId: "1:280921949204:web:94781a66e1d16f72911301"
};

let db = null;
try {
    if (typeof firebase !== 'undefined') {
        firebase.initializeApp(firebaseConfig);
        db = firebase.database();
    }
} catch (err) {
    console.warn("Firebase gagal dimuat, beralih ke penyimpanan lokal.", err);
}

const DEFAULT_MAPELS = [
    "Pendidikan Agama Islam", "PPKN", "Bahasa Indonesia", "Matematika", 
    "IPAS", "PJOK", "Seni Budaya", "Muatan Lokal", "Bina Diri", "Bahasa Inggris"
];

const DEFAULT_USERS = [
    { id: "u1", username: "admin", nama: "Administrator Sistem", password: "admin123", role: "admin", classIds: [] },
    { id: "u2", username: "kepsek", nama: "Maisyanti Disi Fatimah,S.Pd.I.,M.Pd", password: "kepsek123", role: "kepsek", classIds: [] },
    { id: "u3", username: "guru", nama: "Siti Rahmah, S.Pd.", password: "guru123", role: "walikelas", classIds: ["K1", "K2"] }
];

let appState = {
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

let isInitialLoad = true;
let barChartInstance = null, pieChartInstance = null;

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

function showToast(msg, type = "success") {
    const toast = document.getElementById('toast-banner');
    const toastIcon = document.getElementById('toast-icon');
    if (!toast) return;
    document.getElementById('toast-msg').innerText = msg;

    if (type === "success") {
        toastIcon.className = "fa-solid fa-circle-check text-emerald-400 text-lg";
    } else {
        toastIcon.className = "fa-solid fa-triangle-exclamation text-amber-400 text-lg";
    }

    toast.classList.remove('hidden');
    setTimeout(() => { toast.classList.add('hidden'); }, 3000);
}

function getClassName(classId) {
    if (classId === 'Semua Kelas') return 'Semua Kelas';
    const found = (appState.classes || []).find(c => c.id === classId);
    return found ? found.name : classId;
}
