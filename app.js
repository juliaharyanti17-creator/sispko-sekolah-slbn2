// ==========================================================================
// SIMPATIK SLBN 2 PELAIHARI - MAIN APPLICATION LOGIC (app.js)
// ==========================================================================

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
// HELPER: TOAST & NAMA KELAS/MAPEL
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

    if (found) return found.name || found.nama || found.namaKelas || valStr;
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

    if (found) return found.name || found.nama || valStr;
    return valStr;
};

window.refreshCurrentTabUI = function() {
    try {
        if (window.currentActiveTab === 'presensi' && typeof renderPresensiForm === 'function') {
            renderPresensiForm();
        } else if (window.currentActiveTab === 'jurnal' && typeof renderJurnalTable === 'function') {
            renderJurnalTable();
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
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    var sidebar = document.getElementById('sidebar-nav');
    var backdrop = document.getElementById('sidebar-backdrop');
    if (sidebar) sidebar.classList.toggle('hidden');
    if (backdrop) backdrop.classList.add('hidden');
};

window.forceLoginAdmin = function() {
    var adminUser = { id: 'admin-default', nama: 'Administrator SLBN 2', username: 'admin', password: 'admin', role: 'admin' };
    window.appState.currentUser = adminUser;
    localStorage.setItem('sispko_session_user', JSON.stringify(adminUser));
    if (typeof window.applyRoleAccessControl === 'function') window.applyRoleAccessControl();
    window.switchTab(null, 'presensi');
    alert("✓ Berhasil masuk paksa sebagai Administrator!");
};

window.renderAllMasterData = function() {
    if (typeof renderMasterUsers === 'function') renderMasterUsers();
    if (typeof renderMasterKelas === 'function') renderMasterKelas();
    if (typeof renderMasterKetunaan === 'function') renderMasterKetunaan();
    if (typeof renderMasterSiswa === 'function') renderMasterSiswa();
    if (typeof renderMasterSubjects === 'function') renderMasterSubjects();
    if (typeof renderMasterJadwal === 'function') renderMasterJadwal();
};

window.renderPresensiForm = function() {
    if (typeof window.populateDropdowns === 'function') window.populateDropdowns();
    if (typeof loadPresensiTable === 'function') loadPresensiTable();
};

// DIPERBAIKI: Mencegah dropdown ampuan hilang saat role diubah di modal user
window.toggleUserClassSelect = function() {
    var groupKelas = document.getElementById('group-user-kelas');
    var groupMapel = document.getElementById('group-user-mapel');
    if (groupKelas) {
        groupKelas.style.display = 'block';
        groupKelas.classList.remove('hidden');
    }
    if (groupMapel) {
        groupMapel.style.display = 'block';
        groupMapel.classList.remove('hidden');
    }
};
