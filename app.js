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

    // Pastikan 'evaluasi' terdaftar di dalam array modules agar tab dapat dibuka
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
    renderNotificationsUI();
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

// --------------------------------------------------------------------------
// FUNGSI PENDUKUNG NAVIGASI SUB-MENU & SIDEBAR
// --------------------------------------------------------------------------
window.toggleSubMenu = function(submenuId, iconId, tabName, e) {
    if (e && typeof e.preventDefault === 'function') {
        e.preventDefault();
    }
    var submenu = document.getElementById(submenuId);
    var icon = document.getElementById(iconId);
    
    if (submenu) {
        submenu.classList.toggle('hidden');
    }
    if (icon) {
        icon.classList.toggle('rotate-180');
    }
    if (tabName) {
        window.switchTab(null, tabName);
    }
};

window.scrollToSubSection = function(e, tabName, sectionId) {
    if (e && typeof e.preventDefault === 'function') {
        e.preventDefault();
    }
    window.switchTab(null, tabName);
    setTimeout(function() {
        var target = document.getElementById(sectionId);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    }, 100);
};

// ==========================================================================
// MODUL NOTIFIKASI OTOMATIS & PENGELOLAAN UI (SIMANTAP)
// ==========================================================================

function addSystemNotification(targetRoleOrUser, title, message, referenceId) {
    if (!window.appState) window.appState = {};
    if (!window.appState.notifications) window.appState.notifications = [];

    var newNotif = {
        id: "notif_" + Date.now(),
        target: String(targetRoleOrUser || '').trim().toLowerCase(),
        title: title,
        message: message,
        referenceId: referenceId || '',
        read: false, // Status awal belum terbaca
        createdAt: new Date().toISOString()
    };

    window.appState.notifications.push(newNotif);
    
    // Simpan permanen ke localStorage
    if (typeof saveAppState === 'function') {
        saveAppState();
    } else {
        localStorage.setItem('sispko_app_state', JSON.stringify(window.appState));
    }
    
    renderNotificationsUI();
}

function renderNotificationsUI() {
    var currentUser = window.appState && window.appState.currentUser ? window.appState.currentUser : null;
    if (!currentUser) return;

    var currentRole = (currentUser.role || '').toLowerCase();
    var currentNama = (currentUser.nama || currentUser.username || '').toLowerCase();
    var notifications = (window.appState && window.appState.notifications) ? window.appState.notifications : [];

    // FILTER KHUSUS: Kepsek hanya melihat target kepsek, Guru hanya melihat target namanya sendiri
    var myNotifs = notifications.filter(function(n) {
        if (!n) return false;
        var target = String(n.target || '').trim().toLowerCase();
        
        if (currentRole === 'admin') return true;
        
        if ((currentRole === 'kepsek' || currentRole === 'kepala sekolah') && 
            (target === 'kepsek' || target === 'kepala sekolah' || target === 'admin')) {
            return true;
        }
        
        // Pencocokan spesifik untuk akun guru pembuat jurnal yang disupervisi
        if (currentRole === 'walikelas' || currentRole === 'gurumapel' || currentRole === 'guru') {
            if (target === currentNama || target.includes(currentNama) || currentNama.includes(target)) {
                return true;
            }
        }
        
        return false;
    });

    // Hitung jumlah pesan yang belum dibaca untuk badge angka merah
    var unreadList = myNotifs.filter(function(n) { return !n.read; });
    var badge = document.getElementById('notif-badge');
    if (badge) {
        if (unreadList.length > 0) {
            badge.innerText = unreadList.length;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }

    var container = document.getElementById('notif-list-container');
    if (!container) return;
    container.innerHTML = '';

    // Ambil 10 notifikasi terbaru
    var recentNotifs = myNotifs.slice().reverse().slice(0, 10);

    if (recentNotifs.length === 0) {
        container.innerHTML = '<div class="p-4 text-center text-slate-400 font-medium">Tidak ada notifikasi baru.</div>';
        return;
    }

    recentNotifs.forEach(function(n) {
        var item = document.createElement('div');
        item.className = "p-3 hover:bg-slate-50 transition flex items-start gap-2.5 " + (n.read ? "opacity-60 bg-white" : "bg-indigo-50/40");
        
        var unreadDot = !n.read ? '<span class="w-2 h-2 rounded-full bg-indigo-600 mt-1 shrink-0"></span>' : '';
        
        item.innerHTML = `
            ${unreadDot}
            <div class="flex-1">
                <div class="font-bold text-slate-800 text-xs">${n.title}</div>
                <p class="text-slate-600 text-[11px] mt-0.5 leading-snug">${n.message}</p>
                <span class="text-[9px] text-slate-400 mt-1 block">${n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}</span>
            </div>
        `;
        container.appendChild(item);
    });
}

function toggleNotificationDropdown(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    var dropdown = document.getElementById('notif-dropdown');
    if (dropdown) {
        dropdown.classList.toggle('hidden');
        if (!dropdown.classList.contains('hidden')) {
            renderNotificationsUI();
        }
    }
}

function markAllNotificationsAsRead() {
    var currentUser = window.appState && window.appState.currentUser ? window.appState.currentUser : null;
    if (!currentUser) return;
    
    var currentRole = (currentUser.role || '').toLowerCase();
    var currentNama = (currentUser.nama || currentUser.username || '').toLowerCase();
    var notifications = (window.appState && window.appState.notifications) ? window.appState.notifications : [];

    notifications.forEach(function(n) {
        if (!n) return;
        var target = String(n.target || '').trim().toLowerCase();
        
        var isMatch = false;
        if (currentRole === 'admin') {
            isMatch = true;
        } else if ((currentRole === 'kepsek' || currentRole === 'kepala sekolah') && (target === 'kepsek' || target === 'kepala sekolah' || target === 'admin')) {
            isMatch = true;
        } else if (target === currentNama || target.includes(currentNama) || currentNama.includes(target)) {
            isMatch = true;
        }

        if (isMatch) {
            n.read = true;
        }
    });

    if (typeof saveAppState === 'function') {
        saveAppState();
    } else {
        localStorage.setItem('sispko_app_state', JSON.stringify(window.appState));
    }
    
    renderNotificationsUI();
}

// Tutup dropdown jika mengklik area di luar
document.addEventListener('click', function(e) {
    var dropdown = document.getElementById('notif-dropdown');
    if (dropdown && !dropdown.contains(e.target) && !e.target.closest('button[onclick*="toggleNotificationDropdown"]')) {
        dropdown.classList.add('hidden');
    }
});
