// ==========================================================================
// SIMPATIK SLBN 2 PELAIHARI - MAIN APPLICATION LOGIC (app.js)
// ==========================================================================

// Deklarasi Darurat Global agar fungsi switchTab langsung siap dipanggil
window.switchTab = window.switchTab || function(e, tabName) {
    if (e && e.preventDefault) e.preventDefault();
    if (!tabName) tabName = 'presensi';
    window.currentActiveTab = tabName;

    if (typeof applyRoleAccessControl === 'function') {
        applyRoleAccessControl();
    }

    const modules = ['presensi', 'jurnal', 'rekap', 'evaluasi', 'master'];
    
    modules.forEach(function(mod) {
        const section = document.getElementById('modul-' + mod);
        const btn = document.getElementById('tab-btn-' + mod);

        if (section) {
            if (mod === tabName) {
                section.classList.remove('hidden');
                section.style.setProperty('display', 'block', 'important');
            } else {
                section.classList.add('hidden');
                section.style.setProperty('display', 'none', 'important');
            }
        }

        if (btn) {
            if (mod === tabName) {
                btn.className = "tab-btn w-full px-3.5 py-3 rounded-2xl text-xs font-bold flex items-center justify-between bg-white text-indigo-900 shadow-md transition-all duration-300 transform scale-[1.02] cursor-pointer";
            } else {
                btn.className = "tab-btn w-full px-3.5 py-3 rounded-2xl text-xs font-bold flex items-center justify-between text-indigo-200 hover:bg-white/10 hover:text-white transition-all duration-300 hover:translate-x-1 border border-white/5 hover:border-white/10 cursor-pointer";
            }
        }
    });

    const sidebar = document.getElementById('sidebar-nav');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (window.innerWidth < 768 && sidebar && !sidebar.classList.contains('hidden')) {
        sidebar.classList.add('hidden');
        if (backdrop) backdrop.classList.add('hidden');
    }

    try {
        if (typeof window.refreshCurrentTabUI === 'function') {
            window.refreshCurrentTabUI();
        }
    } catch (err) {
        console.warn("Peringatan saat render data modul:", err);
    }
};

window.currentActiveTab = 'presensi';

document.addEventListener('DOMContentLoaded', function() {
    initAppEvents();
});

function initAppEvents() {
    const loginForm = document.getElementById('loginForm') || document.getElementById('login-form') || document.querySelector('form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (typeof window.handleLogin === 'function') {
                window.handleLogin(e);
            }
        });
    }
}

// --------------------------------------------------------------------------
// 0. GLOBAL HELPER: TOAST NOTIFICATION & PENGUBAH ID KELAS/MAPEL
// --------------------------------------------------------------------------
window.showToast = function(msg) {
    var toast = document.getElementById('toast-banner');
    var msgElem = document.getElementById('toast-msg');
    if (!toast || !msgElem) {
        console.log("Toast:", msg);
        return;
    }
    msgElem.textContent = msg;
    toast.classList.remove('hidden');
    toast.style.display = 'flex';
    
    setTimeout(function() {
        toast.classList.add('hidden');
        toast.style.display = 'none';
    }, 3000);
};

window.getClassName = function(classIdOrName) {
    if (!classIdOrName) return '-';
    
    var valStr = String(classIdOrName).trim();
    var classesList = (window.appState && window.appState.classes) ? window.appState.classes : [];
    
    var found = classesList.find(function(c) {
        var cId = String(c.id || '').trim();
        var cName = String(c.name || c.nama || c.namaKelas || '').trim();
        return cId === valStr || cName.toLowerCase() === valStr.toLowerCase();
    });

    if (found) {
        return found.name || found.nama || found.namaKelas || valStr;
    }

    if (valStr.startsWith('c_') && classesList.length > 0) {
        var partial = classesList.find(function(c) { return String(c.id).includes(valStr) || valStr.includes(String(c.id)); });
        if (partial) {
            return partial.name || partial.nama || partial.namaKelas;
        }
    }

    return valStr;
};

window.getSubjectName = function(subjectIdOrName) {
    if (!subjectIdOrName) return '-';
    
    var valStr = String(subjectIdOrName).trim();
    var subjectsList = (window.appState && window.appState.subjects) ? window.appState.subjects : [];
    
    var found = subjectsList.find(function(s) {
        var sId = String(s.id || '').trim();
        var sName = String(s.name || s.nama || '').trim();
        return sId === valStr || sName.toLowerCase() === valStr.toLowerCase();
    });

    if (found) {
        return found.name || found.nama || valStr;
    }

    return valStr;
};

// --------------------------------------------------------------------------
// 1. REFRESH UI & NAVIGASI PENDUKUNG
// --------------------------------------------------------------------------
window.refreshCurrentTabUI = function() {
    try {
        if (window.currentActiveTab === 'presensi' && typeof renderPresensiForm === 'function') {
            renderPresensiForm();
        } else if (window.currentActiveTab === 'jurnal' && typeof renderJurnalList === 'function') {
            renderJurnalList();
        } else if (window.currentActiveTab === 'master' && typeof renderAllMasterData === 'function') {
            renderAllMasterData();
        } else if (window.currentActiveTab === 'rekap' && typeof renderRekapModule === 'function') {
            renderRekapModule();
        } else if (window.currentActiveTab === 'evaluasi' && typeof updateEvaluasiDashboard === 'function') {
            updateEvaluasiDashboard();
        }
    } catch(err) {
        console.error("Gagal memperbarui UI Tab:", err);
    }
};

window.toggleMobileSidebar = function(e) {
    if (e && e.preventDefault) e.preventDefault();
    const sidebar = document.getElementById('sidebar-nav');
    const backdrop = document.getElementById('sidebar-backdrop');
    
    if (sidebar) sidebar.classList.toggle('hidden');
    if (backdrop) backdrop.classList.add('hidden');
};

window.toggleSubMenu = function(submenuId, iconId, tabName, e) {
    if (e && e.preventDefault) e.preventDefault();
    const submenu = document.getElementById(submenuId);
    const icon = document.getElementById(iconId);
    
    if (submenu) submenu.classList.toggle('hidden');
    if (icon) icon.classList.toggle('rotate-180');
    if (tabName) window.switchTab(null, tabName);
};

window.scrollToSubSection = function(e, tabName, sectionId) {
    if (e && e.preventDefault) e.preventDefault();
    window.switchTab(null, tabName);
    setTimeout(function() {
        const target = document.getElementById(sectionId);
        if (target) target.scrollIntoView({ behavior: 'smooth' });
    }, 100);
};

// --------------------------------------------------------------------------
// 2. OTENTIKASI PENGGUNA
// --------------------------------------------------------------------------
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
    
    if (typeof window.applyRoleAccessControl === 'function') window.applyRoleAccessControl();
    window.switchTab(null, 'presensi');
    alert("✓ Berhasil masuk paksa sebagai Administrator!");
};

// --------------------------------------------------------------------------
// 3. RENDER DATA KE UI & TABEL MASTER
// --------------------------------------------------------------------------
window.renderAllMasterData = function() {
    renderStudentList();
    renderClassList();
    renderUserList();
};

function renderStudentList() {
    const tableBody = document.getElementById('master-siswa-table-body') || document.getElementById('studentTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    const students = window.appState.students || [];

    if (students.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-slate-400">Belum ada data murid.</td></tr>';
        return;
    }

    students.forEach((s, idx) => {
        const kelasIdentifier = s.classId || s.kelas || '';
        const namaKelasLengkap = typeof getClassName === 'function' ? getClassName(kelasIdentifier) : kelasIdentifier;

        const tr = document.createElement('tr');
        tr.className = "border-b hover:bg-slate-50 text-xs";
        tr.innerHTML = `
            <td class="p-2 text-center w-8">${idx + 1}</td>
            <td class="p-2">${s.nisn || '-'}</td>
            <td class="p-2 font-semibold">${s.nama || '-'}</td>
            <td class="p-2 text-center"><span class="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-lg font-bold">${s.ketunaan || '-'}</span></td>
            <td class="p-2 font-bold text-indigo-700">${namaKelasLengkap}</td>
            <td class="p-2 text-center space-x-1">
                <button onclick="editStudent('${s.id}')" class="bg-amber-500 text-white px-2 py-1 rounded text-xs hover:bg-amber-600 cursor-pointer">Edit</button>
                <button onclick="deleteStudent('${s.id}')" class="bg-rose-500 text-white px-2 py-1 rounded text-xs hover:bg-rose-600 cursor-pointer">Hapus</button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

function renderClassList() {
    const container = document.getElementById('master-kelas-list-container') || document.getElementById('classTableBody');
    if (!container) return;

    container.innerHTML = '';
    const classes = window.appState.classes || [];

    if (classes.length === 0) {
        container.innerHTML = '<p class="text-xs text-slate-400 p-2">Belum ada kelas.</p>';
        return;
    }

    classes.forEach((c, idx) => {
        const div = document.createElement('div');
        div.className = "flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-200 text-xs mb-1";
        div.innerHTML = `
            <span class="font-bold text-slate-700">${idx + 1}. ${c.name || c.nama || c.namaKelas || '-'}</span>
            <div class="space-x-1">
                <button onclick="moveClassOrder(${idx}, 'up')" title="Pindah Ke Atas" class="bg-slate-200 hover:bg-slate-300 px-2 py-1 rounded text-xs cursor-pointer"><i class="fa-solid fa-arrow-up"></i></button>
                <button onclick="moveClassOrder(${idx}, 'down')" title="Pindah Ke Bawah" class="bg-slate-200 hover:bg-slate-300 px-2 py-1 rounded text-xs cursor-pointer"><i class="fa-solid fa-arrow-down"></i></button>
                <button onclick="editClass('${c.id}')" class="bg-amber-500 text-white px-2.5 py-1 rounded text-xs hover:bg-amber-600 cursor-pointer">Edit</button>
                <button onclick="deleteClass('${c.id}')" class="bg-rose-500 text-white px-2.5 py-1 rounded text-xs hover:bg-rose-600 cursor-pointer">Hapus</button>
            </div>
        `;
        container.appendChild(div);
    });
}

function renderUserList() {
    const tableBody = document.getElementById('master-users-table-body') || document.getElementById('userTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    const users = window.appState.users || [];

    if (users.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-slate-400">Belum ada data user.</td></tr>';
        return;
    }

    users.forEach((u) => {
        const userKelas = u.classId || u.kelas || '';
        const namaKelasUser = userKelas.startsWith('c_') && typeof getClassName === 'function' ? getClassName(userKelas) : (userKelas || '-');

        const tr = document.createElement('tr');
        tr.className = "border-b hover:bg-slate-50 text-xs";
        tr.innerHTML = `
            <td class="p-2 font-semibold">${u.nama || u.username || '-'}</td>
            <td class="p-2 text-center uppercase text-[10px] font-bold text-indigo-600">${u.role || 'Guru'}</td>
            <td class="p-2">${namaKelasUser}</td>
            <td class="p-2 text-center"><span class="text-emerald-500 font-bold text-xs">Aktif</span></td>
            <td class="p-2 text-center space-x-1">
                <button onclick="editUser('${u.id || u.username}')" class="bg-amber-500 text-white px-2 py-1 rounded text-xs hover:bg-amber-600 cursor-pointer">Edit</button>
                <button onclick="deleteUser('${u.id || u.username}')" class="bg-rose-500 text-white px-2 py-1 rounded text-xs hover:bg-rose-600 cursor-pointer">Hapus</button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

// --------------------------------------------------------------------------
// 4. FITUR EDIT & PINDAH URUTAN KELAS
// --------------------------------------------------------------------------
window.moveClassOrder = function(index, direction) {
    if (!window.appState || !window.appState.classes) return;
    var classes = window.appState.classes;

    if (direction === 'up' && index > 0) {
        var temp = classes[index];
        classes[index] = classes[index - 1];
        classes[index - 1] = temp;
    } else if (direction === 'down' && index < classes.length - 1) {
        var temp = classes[index];
        classes[index] = classes[index + 1];
        classes[index + 1] = temp;
    } else {
        return;
    }

    if (typeof saveAppState === 'function') saveAppState();
    renderClassList();
    if (typeof populateDropdowns === 'function') populateDropdowns();
};

window.editClass = function(classId) {
    var classes = window.appState.classes || [];
    var targetClass = classes.find(function(c) { return c.id === classId; });
    if (!targetClass) return;

    var currentName = targetClass.name || targetClass.nama || targetClass.namaKelas || '';
    var newName = prompt("Ubah Nama Kelas:", currentName);
    if (newName !== null && newName.trim() !== "") {
        targetClass.name = newName.trim();
        targetClass.nama = newName.trim();
        targetClass.namaKelas = newName.trim();

        if (typeof saveAppState === 'function') saveAppState();
        renderAllMasterData();
        if (typeof populateDropdowns === 'function') populateDropdowns();
        alert("✓ Nama kelas berhasil diperbarui!");
    }
};

window.editUser = function(userId) {
    var users = window.appState.users || [];
    var targetUser = users.find(function(u) { return (u.id === userId || u.username === userId); });
    if (!targetUser) return;

    var newNama = prompt("Ubah Nama Guru / Pengguna:", targetUser.nama || targetUser.username || '');
    if (newNama === null) return;

    var newRole = prompt("Ubah Role (admin / guru / kepsek):", targetUser.role || 'guru');
    if (newRole === null) return;

    targetUser.nama = newNama.trim();
    targetUser.role = newRole.trim().toLowerCase();

    if (typeof saveAppState === 'function') saveAppState();
    renderAllMasterData();
    alert("✓ Data pengguna/guru berhasil diperbarui!");
};

window.editStudent = function(studentId) {
    var students = window.appState.students || [];
    var targetStudent = students.find(function(s) { return s.id === studentId; });
    if (!targetStudent) return;

    var newNama = prompt("Ubah Nama Murid:", targetStudent.nama || '');
    if (newNama === null) return;

    var newNisn = prompt("Ubah NISN:", targetStudent.nisn || '');
    if (newNisn === null) return;

    var newKetunaan = prompt("Ubah Ketunaan:", targetStudent.ketunaan || '');
    if (newKetunaan === null) return;

    targetStudent.nama = newNama.trim();
    targetStudent.nisn = newNisn.trim();
    targetStudent.ketunaan = newKetunaan.trim();

    if (typeof saveAppState === 'function') saveAppState();
    renderStudentList();
    alert("✓ Data murid berhasil diperbarui!");
};

window.renderPresensiForm = function() {
    if (typeof window.populateDropdowns === 'function') {
        window.populateDropdowns();
    }
    if (typeof loadPresensiTable === 'function') {
        loadPresensiTable();
    }
};

function resetForm(formId) {
    const form = document.getElementById(formId);
    if (form) form.reset();
}

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
    presensiRecords: {}, // Terhubung dengan modul presensi.js
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

if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// ==========================================================================
// 3. FUNGSI SESI LOGIN & TAMPILAN DASHBOARD
// ==========================================================================
window.checkUserSession = function() {
    var loginSection = document.getElementById('screen-login') || document.getElementById('loginSection');
    var mainDashboard = document.getElementById('screen-app') || document.getElementById('mainDashboard');

    var nameElem = document.getElementById('user-display-name');
    var roleElem = document.getElementById('user-display-role');

    if (window.appState && window.appState.currentUser) {
        if (loginSection) {
            loginSection.style.display = 'none';
            loginSection.classList.add('hidden');
        }
        
        if (mainDashboard) {
            mainDashboard.style.display = 'flex';
            mainDashboard.classList.remove('hidden');
        }

        if (nameElem) nameElem.textContent = window.appState.currentUser.nama || window.appState.currentUser.username;
        if (roleElem) roleElem.textContent = (window.appState.currentUser.role || 'ADMIN').toUpperCase();
        
        if (typeof window.switchTab === 'function') {
            window.switchTab(null, window.currentActiveTab || 'presensi');
        }

        console.log("✓ Sesi login aktif untuk:", window.appState.currentUser.username || window.appState.currentUser.nama);
    } else {
        if (loginSection) {
            loginSection.style.display = 'flex';
            loginSection.classList.remove('hidden');
        }
        if (mainDashboard) {
            mainDashboard.style.display = 'none';
            mainDashboard.classList.add('hidden');
        }
    }
};

// ==========================================================================
// 4. FUNGSI PENYIMPANAN DATA LOKAL & FIREBASE
// ==========================================================================
function updateLocalBackup() {
    try {
        localStorage.setItem('simpatik_backup_state', JSON.stringify(window.appState));
    } catch(e) { console.error("Gagal backup lokal:", e); }
}

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
        presensiRecords: window.appState.presensiRecords || {},
        evaluations: window.appState.evaluations || [],
        ketunaanList: window.appState.ketunaanList || []
    };

    firebase.database().ref('simpatik_data').set(dataToSave);
};

window.savePresensiData = function() {
    updateLocalBackup();
    if (typeof firebase !== 'undefined' && firebase.apps.length) {
        firebase.database().ref('simpatik_data/presensiRecords').set(window.appState.presensiRecords || {});
    }
};

// ==========================================================================
// 5. FUNGSI PEMUATAN DATA (LOAD APP STATE)
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
            if (parsedLocal.presensiRecords) window.appState.presensiRecords = parsedLocal.presensiRecords;
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
                window.appState.presensiRecords = data.presensiRecords || {};
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
