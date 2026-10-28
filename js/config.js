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

var db = null;
var auth = null;

try {
    if (typeof firebase !== 'undefined') {
        firebase.initializeApp(firebaseConfig);
        db = firebase.database();
        auth = firebase.auth();
    }
} catch (err) {
    console.warn("Firebase gagal dimuat:", err);
}

const DEFAULT_MAPELS = [
    "Pendidikan Agama Islam", "PPKN", "Bahasa Indonesia", "Matematika", 
    "IPAS", "PJOK", "Seni Budaya", "Muatan Lokal", "Bina Diri", "Bahasa Inggris"
];

const DEFAULT_USERS = [
    { id: "u1", username: "admin", nama: "Administrator Sistem", role: "admin", classIds: [], assignedMapels: [] },
    { id: "u2", username: "kepsek", nama: "Maisyanti Disi Fatimah,S.Pd.I.,M.Pd", role: "kepsek", classIds: [], assignedMapels: [] },
    { id: "u3", username: "guru", nama: "Siti Rahmah, S.Pd.", role: "walikelas", classIds: ["K1", "K2"], assignedMapels: [] },
    { id: "u4", username: "gurumapel", nama: "Ahmad Rizky, S.Pd
