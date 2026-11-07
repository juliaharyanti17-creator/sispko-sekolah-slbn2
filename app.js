// ==========================================================================
// SIMPATIK SLBN 2 PELAIHARI - MAIN APPLICATION LOGIC (app.js)
// ==========================================================================

// 1. Inisialisasi Tab Aktif & Fungsi Navigasi Utama (Anti-Conflict)
window.currentActiveTab = window.currentActiveTab || 'presensi';

window.switchTab = function(e, tabName) {
    if (e && typeof e.preventDefault === 'function') {
        e.preventDefault();
    }
    if (!tabName) tabName = 'presensi';
    window.currentActiveTab = tabName;

    if (typeof window.applyRoleAccessControl === 'function') {
        window.applyRoleAccessControl();
    }

    var modules = ['presensi', 'jurnal', 'rekap', 'evaluasi', 'master'];
    
    modules.forEach(function(mod) {
        var section = document.getElementById('modul-' + mod);
        var btn = document.getElementById('tab-btn-' + mod);

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

    // Otomatis tutup sidebar pada perangkat mobile setelah menu dipilih
    var sidebar = document.getElementById('sidebar-nav');
    var backdrop = document.getElementById('sidebar-backdrop');
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

document.addEventListener('DOMContentLoaded', function() {
    initAppEvents();
});

function initAppEvents() {
    var loginForm = document.getElementById('loginForm') || document.getElementById('login-form') || document.querySelector('form');
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
// 2. GLOBAL HELPER: TOAST NOTIFICATION & PENGUBAH ID KELAS/MAPEL
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
// 3. REFRESH UI & NAVIGASI PENDUKUNG
// --------------------------------------------------------------------------
window.refreshCurrentTabUI = function() {
    try {
        if (window.currentActiveTab === 'presensi' && typeof renderPresensiForm === 'function') {
            renderPresensiForm();
        } else if (window.currentActiveTab === 'jurnal' && typeof renderJurnalTable === 'function') {
            renderJurnalTable();
        } else if (window.currentActiveTab === 'master' && typeof renderAllMasterData === 'function') {
            renderAllMasterData(); // <--- Pastikan baris ini ada di sini!
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
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    var sidebar = document.getElementById('sidebar-nav');
    var backdrop = document.getElementById('sidebar-backdrop');
    
    if (sidebar) sidebar.classList.toggle('hidden');
    if (backdrop) backdrop.classList.add('hidden');
};

window.toggleSubMenu = function(submenuId, iconId, tabName, e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    var submenu = document.getElementById(submenuId);
    var icon = document.getElementById(iconId);
    
    if (submenu) submenu.classList.toggle('hidden');
    if (icon) icon.classList.toggle('rotate-180');
    if (tabName) window.switchTab(null, tabName);
};

window.scrollToSubSection = function(e, tabName, sectionId) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    window.switchTab(null, tabName);
    setTimeout(function() {
        var target = document.getElementById(sectionId);
        if (target) target.scrollIntoView({ behavior: 'smooth' });
    }, 100);
};

// --------------------------------------------------------------------------
// 4. OTENTIKASI PENGGUNA
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
// 5. RENDER DATA KE UI & TABEL MASTER
// --------------------------------------------------------------------------
window.renderAllMasterData = function() {
    renderStudentList();
    renderClassList();
    renderUserList();
};

function renderStudentList() {
    var tableBody = document.getElementById('master-siswa-table-body') || document.getElementById('studentTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    var students = window.appState.students || [];

    if (students.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-slate-400">Belum ada data murid.</td></tr>';
        return;
    }

    students.forEach(function(s, idx) {
        var kelasIdentifier = s.classId || s.kelas || '';
        var namaKelasLengkap = typeof getClassName === 'function' ? getClassName(kelasIdentifier) : kelasIdentifier;

        var tr = document.createElement('tr');
        tr.className = "border-b hover:bg-slate-50 text-xs";
        tr.innerHTML = 
            '<td class="p-2 text-center w-8">' + (idx + 1) + '</td>' +
            '<td class="p-2">' + (s.nisn || '-') + '</td>' +
            '<td class="p-2 font-semibold">' + (s.nama || '-') + '</td>' +
            '<td class="p-2 text-center"><span class="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-lg font-bold">' + (s.ketunaan || '-') + '</span></td>' +
            '<td class="p-2 font-bold text-indigo-700">' + namaKelasLengkap + '</td>' +
            '<td class="p-2 text-center space-x-1">' +
                '<button onclick="editStudent(\'' + s.id + '\')" class="bg-amber-500 text-white px-2 py-1 rounded text-xs hover:bg-amber-600 cursor-pointer">Edit</button>' +
                '<button onclick="deleteStudent(\'' + s.id + '\')" class="bg-rose-500 text-white px-2 py-1 rounded text-xs hover:bg-rose-600 cursor-pointer">Hapus</button>' +
            '</td>';
        tableBody.appendChild(tr);
    });
}

function renderClassList() {
    var container = document.getElementById('master-kelas-list-container') || document.getElementById('classTableBody');
    if (!container) return;

    container.innerHTML = '';
    var classes = window.appState.classes || [];

    if (classes.length === 0) {
        container.innerHTML = '<p class="text-xs text-slate-400 p-2">Belum ada kelas.</p>';
        return;
    }

    classes.forEach(function(c, idx) {
        var div = document.createElement('div');
        div.className = "flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-200 text-xs mb-1";
        div.innerHTML = 
            '<span class="font-bold text-slate-700">' + (idx + 1) + '. ' + (c.name || c.nama || c.namaKelas || '-') + '</span>' +
            '<div class="space-x-1">' +
                '<button onclick="moveClassOrder(' + idx + ', \'up\')" title="Pindah Ke Atas" class="bg-slate-200 hover:bg-slate-300 px-2 py-1 rounded text-xs cursor-pointer"><i class="fa-solid fa-arrow-up"></i></button>' +
                '<button onclick="moveClassOrder(' + idx + ', \'down\')" title="Pindah Ke Bawah" class="bg-slate-200 hover:bg-slate-300 px-2 py-1 rounded text-xs cursor-pointer"><i class="fa-solid fa-arrow-down"></i></button>' +
                '<button onclick="editClass(\'' + c.id + '\')" class="bg-amber-500 text-white px-2.5 py-1 rounded text-xs hover:bg-amber-600 cursor-pointer">Edit</button>' +
                '<button onclick="deleteClass(\'' + c.id + '\')" class="bg-rose-500 text-white px-2.5 py-1 rounded text-xs hover:bg-rose-600 cursor-pointer">Hapus</button>' +
            '</div>';
        container.appendChild(div);
    });
}

function renderUserList() {
    var tableBody = document.getElementById('master-users-table-body') || document.getElementById('userTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    var users = window.appState.users || [];

    if (users.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-slate-400">Belum ada data user.</td></tr>';
        return;
    }

    users.forEach(function(u) {
        var userKelas = u.classId || u.kelas || '';
        var namaKelasUser = userKelas.startsWith('c_') && typeof getClassName === 'function' ? getClassName(userKelas) : (userKelas || '-');

        var tr = document.createElement('tr');
        tr.className = "border-b hover:bg-slate-50 text-xs";
        tr.innerHTML = 
            '<td class="p-2 font-semibold">' + (u.nama || u.username || '-') + '</td>' +
            '<td class="p-2 text-center uppercase text-[10px] font-bold text-indigo-600">' + (u.role || 'Guru') + '</td>' +
            '<td class="p-2">' + namaKelasUser + '</td>' +
            '<td class="p-2 text-center"><span class="text-emerald-500 font-bold text-xs">Aktif</span></td>' +
            '<td class="p-2 text-center space-x-1">' +
                '<button onclick="editUser(\'' + (u.id || u.username) + '\')" class="bg-amber-500 text-white px-2 py-1 rounded text-xs hover:bg-amber-600 cursor-pointer">Edit</button>' +
                '<button onclick="deleteUser(\'' + (u.id || u.username) + '\')" class="bg-rose-500 text-white px-2 py-1 rounded text-xs hover:bg-rose-600 cursor-pointer">Hapus</button>' +
            '</td>';
        tableBody.appendChild(tr);
    });
}

// --------------------------------------------------------------------------
// 6. FITUR EDIT & PINDAH URUTAN KELAS
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
    var form = document.getElementById(formId);
    if (form) form.reset();
}
