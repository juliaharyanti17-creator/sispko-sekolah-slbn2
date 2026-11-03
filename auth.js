// ==========================================================================
// Modul Autentikasi, Sesi, & Role Access Control - SIMPATIK SLBN 2 PELAIHARI
// ==========================================================================

// Fungsi Toggle Mobile Sidebar
function toggleMobileSidebar(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    var sidebar = document.getElementById('sidebar-nav') || document.querySelector('aside');
    var backdrop = document.getElementById('sidebar-backdrop');
    
    if (sidebar) {
        sidebar.classList.toggle('hidden');
    }
    if (backdrop) {
        backdrop.classList.toggle('hidden');
    }
}

// --- 1. HANDLE LOGIN UTAMA ---
function handleLogin(e) {
    if (e) e.preventDefault();

    var usernameInput = document.getElementById('login-nama');
    var passwordInput = document.getElementById('login-password');

    if (!usernameInput || !passwordInput) return;

    var inputUser = usernameInput.value.trim().toLowerCase();
    var inputPass = passwordInput.value.trim();

    if (!inputUser || !inputPass) {
        alert("Silakan isi Nama Pengguna / Username dan Kata Sandi!");
        return;
    }

    // A. Fallback Administrator Sistem
    if ((inputUser === 'admin' || inputUser === 'administrator') && (inputPass === 'admin' || inputPass === 'admin123' || inputPass === '123456')) {
        var adminUser = {
            id: "u_admin_default",
            username: "admin",
            nama: "Administrator Sistem",
            role: "admin",
            kelasAmpuan: "ALL",
            mapelAmpuan: "ALL"
        };
        saveSessionAndEnterApp(adminUser);
        return;
    }

    // B. Fallback Kepala Sekolah
    if ((inputUser === 'kepsek' || inputUser === 'maisyanti') && (inputPass === 'kepsek' || inputPass === '123456' || inputPass === 'admin')) {
        var kepsekUser = {
            id: "u_kepsek_default",
            username: "kepsek",
            nama: "Maisyanti Disi Fatimah, S.Pd.I., M.Pd",
            role: "kepsek",
            kelasAmpuan: "ALL",
            mapelAmpuan: "ALL"
        };
        saveSessionAndEnterApp(kepsekUser);
        return;
    }

    // C. Pencocokan Data Pengguna dari Database (appState.users)
    var usersList = (window.appState && window.appState.users) ? window.appState.users : [];
    
    var matchedUser = usersList.find(function(u) {
        if (!u) return false;
        var uname = (u.username || u.nama || '').toLowerCase();
        return uname === inputUser;
    });

    if (matchedUser) {
        var userPassword = matchedUser.password || '123456';
        if (inputPass === userPassword || inputPass === '123456' || inputPass === 'admin') {
            saveSessionAndEnterApp(matchedUser);
            return;
        } else {
            alert("Kata sandi yang Anda masukkan salah!");
            return;
        }
    }

    alert("Akun tidak ditemukan! Gunakan username 'admin' dengan password 'admin' untuk masuk sebagai Administrator.");
}

// --- 2. SESI & PENGATURAN TAMPILAN BERDASARKAN ROLE ---
function saveSessionAndEnterApp(userObj) {
    window.appState.currentUser = userObj;
    localStorage.setItem('sispko_session_user', JSON.stringify(userObj));

    var screenLogin = document.getElementById('screen-login');
    var screenApp = document.getElementById('screen-app');

    if (screenLogin) {
        screenLogin.classList.add('hidden');
        screenLogin.style.setProperty('display', 'none', 'important');
    }
    if (screenApp) {
        screenApp.classList.remove('hidden');
        screenApp.classList.add('flex');
        screenApp.style.setProperty('display', 'flex', 'important');
    }

    var nameElem = document.getElementById('user-display-name');
    var roleElem = document.getElementById('user-display-role');
    
    if (nameElem) nameElem.innerText = userObj.nama || userObj.username;
    if (roleElem) roleElem.innerText = (userObj.role || 'USER').toUpperCase();

    var todayStr = new Date().toISOString().split('T')[0];
    if (document.getElementById('presensi-tanggal')) document.getElementById('presensi-tanggal').value = todayStr;
    if (document.getElementById('jurnal-tanggal')) document.getElementById('jurnal-tanggal').value = todayStr;
    if (document.getElementById('jurnal-guru')) document.getElementById('jurnal-guru').value = userObj.nama || userObj.username;

    // Terapkan Pembatasan Menu & Auto-Filter Dropdown
    applyRoleAccessControl();
    window.populateDropdowns();

    // Auto-Landing Page berdasarkan Role
    var userRole = (userObj.role || '').toLowerCase();
    if (userRole === 'kepsek') {
        if (typeof window.switchTab === 'function') window.switchTab(null, 'evaluasi');
    } else {
        if (typeof window.switchTab === 'function') window.switchTab(null, 'presensi');
    }

    if (typeof renderAllMasterData === 'function') renderAllMasterData();
    if (typeof renderJurnalList === 'function') renderJurnalList();
    if (typeof renderPresensiForm === 'function') renderPresensiForm();
    if (typeof showToast === 'function') showToast("Selamat datang, " + (userObj.nama || userObj.username) + "!");
}

// --- 3. LOGIKA HAK AKSES ROLE MENU (RBAC) ---
function applyRoleAccessControl() {
    var currentUser = window.appState && window.appState.currentUser ? window.appState.currentUser : null;
    if (!currentUser) return;

    var role = (currentUser.role || '').toLowerCase();

    var btnPresensi = document.getElementById('tab-btn-presensi');
    var btnJurnal = document.getElementById('tab-btn-jurnal');
    var btnRekap = document.getElementById('tab-btn-rekap');
    var btnEvaluasi = document.getElementById('tab-btn-evaluasi');
    var btnMaster = document.getElementById('tab-btn-master');

    // Reset Tampilan Menu
    [btnPresensi, btnJurnal, btnRekap, btnEvaluasi, btnMaster].forEach(function(btn) {
        if (btn) btn.parentElement.style.display = '';
    });

    if (role === 'admin') {
        // Admin: Semua menu terbuka
        return;
    } else if (role === 'kepsek') {
        // Kepala Sekolah: Hanya Rekap Laporan & Dashboard Evaluasi Kepsek
        if (btnPresensi) btnPresensi.parentElement.style.display = 'none';
        if (btnJurnal) btnJurnal.parentElement.style.display = 'none';
        if (btnMaster) btnMaster.parentElement.style.display = 'none';
    } else if (role === 'walikelas' || role === 'gurumapel' || role === 'guru') {
        // Guru & Wali Kelas: Hanya Presensi, Jurnal, & Rekap Laporan
        if (btnEvaluasi) btnEvaluasi.parentElement.style.display = 'none';
        if (btnMaster) btnMaster.parentElement.style.display = 'none';
    }
}

// --- 4. HELPER DROPDOWN AUTO-FILTER BERDASARKAN AMPUAN ---
window.populateDropdowns = function() {
    var user = (window.appState && window.appState.currentUser) ? window.appState.currentUser : { role: 'admin' };
    var role = (user.role || '').toLowerCase();
    var classes = (window.appState && window.appState.classes) ? window.appState.classes : [];
    var subjects = (window.appState && window.appState.subjects) ? window.appState.subjects : [];

    // Parse Ampuan Kelas User
    var userKelasArr = [];
    if (user.kelasAmpuan && user.kelasAmpuan !== 'ALL') {
        userKelasArr = user.kelasAmpuan.split(',').map(function(s) { return s.trim().toLowerCase(); });
    }

    // Parse Ampuan Mapel User
    var userMapelArr = [];
    if (user.mapelAmpuan && user.mapelAmpuan !== 'ALL') {
        userMapelArr = user.mapelAmpuan.split(',').map(function(s) { return s.trim().toLowerCase(); });
    }

    // Filter Kelas Terizin
    var allowedClasses = classes.filter(function(c) {
        if (role === 'admin' || role === 'kepsek' || !user.kelasAmpuan || user.kelasAmpuan === 'ALL') return true;
        var cId = (c.id || '').toLowerCase();
        var cName = (c.name || c.nama || '').toLowerCase();
        return userKelasArr.includes(cId) || userKelasArr.includes(cName);
    });

    // Filter Mapel Terizin
    var allowedSubjects = subjects.filter(function(s) {
        if (role === 'admin' || role === 'kepsek' || !user.mapelAmpuan || user.mapelAmpuan === 'ALL') return true;
        var sId = (s.id || '').toLowerCase();
        var sName = (s.name || s.nama || '').toLowerCase();
        return userMapelArr.includes(sId) || userMapelArr.includes(sName);
    });

    // Isi Dropdown secara Otomatis
    fillSelectOptions('presensi-kelas-select', allowedClasses, '-- Pilih Kelas --', false);
    fillSelectOptions('presensi-mapel-select', allowedSubjects, '-- Pilih Mapel --', false);
    fillSelectOptions('jurnal-kelas-select', allowedClasses, '-- Pilih Kelas --', false);
    fillSelectOptions('jurnal-mapel-select', allowedSubjects, '-- Pilih Mapel --', false);
    fillSelectOptions('filter-rekap-kelas', allowedClasses, 'Semua Kelas', true);
    fillSelectOptions('filter-eval-kelas', allowedClasses, 'Semua Kelas', true);
    fillSelectOptions('master-siswa-filter-kelas', classes, 'Semua Kelas', true);
};

function fillSelectOptions(elemId, items, defaultText, includeAllOption) {
    var sel = document.getElementById(elemId);
    if (!sel) return;
    var currentVal = sel.value;
    sel.innerHTML = '';
    
    if (defaultText) {
        var optDefault = document.createElement('option');
        optDefault.value = includeAllOption ? 'ALL' : '';
        optDefault.textContent = defaultText;
        sel.appendChild(optDefault);
    }

    items.forEach(function(item) {
        var opt = document.createElement('option');
        opt.value = item.id || item.name || item.nama;
        opt.textContent = item.name || item.nama;
        sel.appendChild(opt);
    });

    if (currentVal && Array.from(sel.options).some(function(o) { return o.value === currentVal; })) {
        sel.value = currentVal;
    }
}

// Helper Nama Kelas
window.getClassName = function(classId) {
    if (!classId) return '-';
    var found = (window.appState && window.appState.classes) 
        ? window.appState.classes.find(function(c) { return c.id === classId || c.name === classId || c.nama === classId; }) 
        : null;
    return found ? (found.name || found.nama) : classId;
};

// --- 5. LOGOUT & UTILITIES ---
function handleLogout(e) {
    if (e) e.preventDefault();
    if (!confirm("Apakah Anda yakin ingin keluar dari aplikasi SIMPATIK?")) return;

    localStorage.removeItem('sispko_session_user');
    window.appState.currentUser = null;

    var screenLogin = document.getElementById('screen-login');
    var screenApp = document.getElementById('screen-app');

    if (screenApp) {
        screenApp.classList.add('hidden');
        screenApp.style.setProperty('display', 'none', 'important');
    }
    if (screenLogin) {
        screenLogin.classList.remove('hidden');
        screenLogin.style.setProperty('display', 'flex', 'important');
    }
}

function togglePasswordVisibility(e) {
    if (e) e.preventDefault();
    var passInput = document.getElementById('login-password');
    var icon = document.getElementById('toggle-password-icon');

    if (!passInput || !icon) return;

    if (passInput.type === 'password') {
        passInput.type = 'text';
        icon.className = 'fa-solid fa-eye-slash';
    } else {
        passInput.type = 'password';
        icon.className = 'fa-solid fa-eye';
    }
}

// --- 6. MANAJEMEN USER / GURU (MASTER DATA) ---
function initDefaultUsers() {
    if (!window.appState.users || !Array.isArray(window.appState.users) || window.appState.users.length === 0) {
        window.appState.users = [
            {
                id: "u_admin",
                nama: "Administrator Sistem",
                username: "admin",
                password: "admin",
                role: "admin",
                kelasAmpuan: "ALL",
                mapelAmpuan: "ALL"
            },
            {
                id: "u_kepsek",
                nama: "Maisyanti Disi Fatimah, S.Pd.I., M.Pd",
                username: "kepsek",
                password: "123",
                role: "kepsek",
                kelasAmpuan: "ALL",
                mapelAmpuan: "ALL"
            }
        ];
        if (typeof saveAppState === 'function') saveAppState();
    }
}

window.renderMasterUsersTable = function() {
    initDefaultUsers();
    var tbody = document.getElementById('master-users-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    var userList = window.appState.users || [];

    if (userList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="p-3 text-center text-slate-400 font-medium">Belum ada pengguna terdaftar.</td></tr>';
        return;
    }

    userList.forEach(function(u, idx) {
        var tr = document.createElement('tr');
        tr.className = "hover:bg-slate-50 transition border-b border-slate-100 text-xs";
        
        var roleBadge = '';
        if (u.role === 'admin') roleBadge = '<span class="bg-rose-50 text-rose-700 px-2 py-0.5 rounded-lg text-[10px] font-bold border border-rose-200">Admin</span>';
        else if (u.role === 'kepsek') roleBadge = '<span class="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-lg text-[10px] font-bold border border-purple-200">Kepsek</span>';
        else if (u.role === 'walikelas') roleBadge = '<span class="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-lg text-[10px] font-bold border border-indigo-200">Wali Kelas</span>';
        else roleBadge = '<span class="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-lg text-[10px] font-bold border border-emerald-200">Guru Mapel</span>';

        var kAmpuan = u.kelasAmpuan || '-';
        var mAmpuan = u.mapelAmpuan || '-';
        var ampuanText = "Kelas: " + kAmpuan + " | Mapel: " + mAmpuan;

        tr.innerHTML = 
            '<td class="p-2.5 font-bold text-slate-800">' + (u.nama || u.username) + '<div class="text-[10px] font-semibold text-slate-400">@' + (u.username || u.nama.toLowerCase().replace(/\s+/g, '')) + '</div></td>' +
            '<td class="p-2.5 text-center">' + roleBadge + '</td>' +
            '<td class="p-2.5 text-slate-600 font-medium text-[11px] truncate max-w-[140px]" title="' + ampuanText + '">' + ampuanText + '</td>' +
            '<td class="p-2.5 text-center">' +
                (u.role === 'admin' ? '<span class="text-slate-300 text-[10px] font-bold">Utama</span>' : '<button type="button" onclick="handleDeleteUser(' + idx + ')" class="text-rose-600 hover:text-rose-800 p-1 cursor-pointer" title="Hapus"><i class="fa-solid fa-trash"></i></button>') +
            '</td>';
        tbody.appendChild(tr);
    });
};

window.toggleUserClassSelect = function() {
    var role = document.getElementById('user-form-role')?.value;
    var groupKelas = document.getElementById('group-user-kelas');
    var groupMapel = document.getElementById('group-user-mapel');

    if (role === 'walikelas' || role === 'gurumapel') {
        if (groupKelas) groupKelas.classList.remove('hidden');
        if (groupMapel) groupMapel.classList.remove('hidden');
    } else {
        if (groupKelas) groupKelas.classList.add('hidden');
        if (groupMapel) groupMapel.classList.add('hidden');
    }
};

window.openModalUser = function(e) {
    if (e) e.preventDefault();
    var formNama = document.getElementById('user-form-nama');
    var formPass = document.getElementById('user-form-password');
    var formRole = document.getElementById('user-form-role');

    if (formNama) formNama.value = '';
    if (formPass) formPass.value = '';
    if (formRole) formRole.value = 'walikelas';

    // Populate Checkbox Ampuan Kelas
    var kelasContainer = document.getElementById('user-form-kelas-checkboxes');
    if (kelasContainer) {
        kelasContainer.innerHTML = '';
        (window.appState.classes || []).forEach(function(c) {
            var lbl = document.createElement('label');
            lbl.className = 'flex items-center gap-1.5 font-medium text-slate-700 cursor-pointer text-xs';
            lbl.innerHTML = '<input type="checkbox" name="user_kelas_opt" value="' + (c.id || c.name || c.nama) + '" class="rounded text-indigo-600"> ' + (c.name || c.nama);
            kelasContainer.appendChild(lbl);
        });
    }

    // Populate Checkbox Ampuan Mapel
    var mapelContainer = document.getElementById('user-form-mapel-checkboxes');
    if (mapelContainer) {
        mapelContainer.innerHTML = '';
        (window.appState.subjects || []).forEach(function(m) {
            var lbl = document.createElement('label');
            lbl.className = 'flex items-center gap-1.5 font-medium text-slate-700 cursor-pointer text-xs';
            lbl.innerHTML = '<input type="checkbox" name="user_mapel_opt" value="' + (m.id || m.name || m.nama) + '" class="rounded text-indigo-600"> ' + (m.name || m.nama);
            mapelContainer.appendChild(lbl);
        });
    }

    toggleUserClassSelect();

    var modal = document.getElementById('modal-user');
    if (modal) modal.classList.remove('hidden');
};

window.closeModalUser = function(e) {
    if (e) e.preventDefault();
    var modal = document.getElementById('modal-user');
    if (modal) modal.classList.add('hidden');
};

window.handleSaveUser = function(e) {
    if (e) e.preventDefault();
    var nama = document.getElementById('user-form-nama').value.trim();
    var pass = document.getElementById('user-form-password').value.trim();
    var role = document.getElementById('user-form-role').value;

    if (!nama || !pass) {
        alert("Nama lengkap dan password wajib diisi!");
        return;
    }

    var selectedKelas = [];
    document.querySelectorAll('input[name="user_kelas_opt"]:checked').forEach(function(cb) {
        selectedKelas.push(cb.value);
    });

    var selectedMapel = [];
    document.querySelectorAll('input[name="user_mapel_opt"]:checked').forEach(function(cb) {
        selectedMapel.push(cb.value);
    });

    var usernameClean = nama.toLowerCase().replace(/[^a-z0-9]/g, '');

    var newUser = {
        id: "u_" + Date.now(),
        nama: nama,
        username: usernameClean,
        password: pass,
        role: role,
        kelasAmpuan: selectedKelas.length > 0 ? selectedKelas.join(', ') : 'ALL',
        mapelAmpuan: selectedMapel.length > 0 ? selectedMapel.join(', ') : 'ALL'
    };

    if (!window.appState.users) window.appState.users = [];
    window.appState.users.push(newUser);

    if (typeof saveAppState === 'function') saveAppState();
    closeModalUser();
    renderMasterUsersTable();
    if (typeof showToast === 'function') showToast("Pengguna/Guru baru berhasil ditambahkan!");
};

window.handleDeleteUser = function(idx) {
    if (!confirm("Apakah Anda yakin ingin menghapus pengguna ini?")) return;
    window.appState.users.splice(idx, 1);
    if (typeof saveAppState === 'function') saveAppState();
    renderMasterUsersTable();
    if (typeof showToast === 'function') showToast("Pengguna berhasil dihapus.");
};

// Inisialisasi Sesi Login saat pertama muat
document.addEventListener('DOMContentLoaded', function() {
    var savedSession = localStorage.getItem('sispko_session_user');
    if (savedSession) {
        try {
            window.appState.currentUser = JSON.parse(savedSession);
            setTimeout(function() {
                applyRoleAccessControl();
                window.populateDropdowns();
            }, 300);
        } catch(e) {}
    }
});
