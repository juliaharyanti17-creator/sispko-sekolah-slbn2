// ==========================================================================
// SIMPATIK SLBN 2 PELAIHARI - MAIN APPLICATION LOGIC (app.js)
// ==========================================================================

window.currentActiveTab = 'presensi';

document.addEventListener('DOMContentLoaded', function() {
    initAppEvents();
});

function initAppEvents() {
    const loginForm = document.getElementById('loginForm') || document.getElementById('login-form') || document.querySelector('form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            doLogin(e);
        });
    }
}

// --------------------------------------------------------------------------
// 1. SISTEM PERUBAHAN TAB & KONTEN HALAMAN
// --------------------------------------------------------------------------
window.switchTab = function(e, tabName) {
    if (e && e.preventDefault) e.preventDefault();
    if (!tabName) tabName = 'presensi';
    window.currentActiveTab = tabName;

    const modules = ['presensi', 'jurnal', 'rekap', 'evaluasi', 'master'];
    
    modules.forEach(function(mod) {
        const section = document.getElementById('modul-' + mod);
        const btn = document.getElementById('tab-btn-' + mod);

        if (section) {
            if (mod === tabName) {
                section.classList.remove('hidden');
                section.style.display = 'block';
            } else {
                section.classList.add('hidden');
                section.style.display = 'none';
            }
        }

        if (btn) {
            if (mod === tabName) {
                btn.className = "tab-btn w-full px-3.5 py-3 rounded-xl text-xs font-bold flex items-center justify-between bg-white text-indigo-900 shadow-md transition-all cursor-pointer";
            } else {
                btn.className = "tab-btn w-full px-3.5 py-3 rounded-xl text-xs font-bold flex items-center justify-between text-indigo-200 hover:bg-indigo-800/60 hover:text-white transition-all cursor-pointer";
            }
        }
    });

    // Render ulang data UI tab terpilih
    if (typeof window.refreshCurrentTabUI === 'function') {
        window.refreshCurrentTabUI();
    }

    // Jika pada tampilan seluler/tablet, tutup sidebar secara otomatis setelah menu diklik
    const sidebar = document.getElementById('sidebar-nav');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (window.innerWidth < 768 && sidebar && !sidebar.classList.contains('hidden')) {
        sidebar.classList.add('hidden');
        if (backdrop) backdrop.classList.add('hidden');
    }
};

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
    if (backdrop) backdrop.classList.toggle('hidden');
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
window.doLogin = function(e) {
    if (e && e.preventDefault) e.preventDefault();

    var usernameInput = document.getElementById('login-nama') || document.getElementById('username');
    var passwordInput = document.getElementById('login-password') || document.getElementById('password');

    var username = usernameInput ? usernameInput.value : '';
    var password = passwordInput ? passwordInput.value : '';

    handleLogin(username, password);
};

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
    
    if (typeof window.checkUserSession === 'function') window.checkUserSession();
    if (typeof triggerUIRender === 'function') triggerUIRender();
    
    window.switchTab(null, 'presensi');
    alert("✓ Berhasil masuk paksa sebagai Administrator!");
};

function handleLogin(username, password) {
    var uInput = (username || '').trim().toLowerCase();
    var pInput = (password || '').trim();

    if (!uInput || !pInput) {
        alert("Harap isi nama pengguna dan kata sandi!");
        return;
    }

    var users = window.appState.users || [];

    var foundUser = users.find(function(u) {
        var uName = (u.username || u.nama || '').trim().toLowerCase();
        var uPass = String(u.password || '').trim();
        return uName === uInput && uPass === pInput;
    });

    if (!foundUser && uInput === 'admin' && pInput === 'admin') {
        foundUser = { 
            id: 'admin-default', 
            nama: 'Administrator SLBN 2', 
            username: 'admin', 
            password: 'admin', 
            role: 'admin' 
        };
        
        var adminExists = users.some(u => (u.username || '').toLowerCase() === 'admin');
        if (!adminExists) {
            window.appState.users.push(foundUser);
            if (typeof window.saveUsersData === 'function') window.saveUsersData();
        }
    }

    if (foundUser) {
        window.appState.currentUser = foundUser;
        localStorage.setItem('sispko_session_user', JSON.stringify(foundUser));
        
        if (typeof window.checkUserSession === 'function') {
            window.checkUserSession();
        }
        if (typeof triggerUIRender === 'function') {
            triggerUIRender();
        }

        window.switchTab(null, 'presensi');
        alert("Berhasil masuk! Selamat datang, " + (foundUser.nama || foundUser.username));
    } else {
        alert("Nama pengguna atau kata sandi tidak cocok!");
    }
}

function handleLogout(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (confirm("Apakah Anda yakin ingin keluar dari aplikasi SIMPATIK?")) {
        window.appState.currentUser = null;
        localStorage.removeItem('sispko_session_user');
        
        if (typeof window.checkUserSession === 'function') {
            window.checkUserSession();
        } else {
            window.location.reload();
        }
    }
}

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
        const tr = document.createElement('tr');
        tr.className = "border-b hover:bg-slate-50";
        tr.innerHTML = `
            <td class="p-2 text-center w-8">${idx + 1}</td>
            <td class="p-2">${s.nisn || '-'}</td>
            <td class="p-2 font-semibold">${s.nama || '-'}</td>
            <td class="p-2 text-center">${s.ketunaan || '-'}</td>
            <td class="p-2">${s.kelas || '-'}</td>
            <td class="p-2 text-center">
                <button onclick="deleteStudent('${s.id}')" class="bg-rose-500 text-white px-2 py-1 rounded text-xs hover:bg-rose-600">Hapus</button>
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

    classes.forEach((c) => {
        const div = document.createElement('div');
        div.className = "flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-200 text-xs";
        div.innerHTML = `
            <span class="font-bold text-slate-700">${c.namaKelas || c.nama || '-'}</span>
            <button onclick="deleteClass('${c.id}')" class="text-rose-500 hover:text-rose-700 text-xs"><i class="fa-solid fa-trash"></i></button>
        `;
        container.appendChild(div);
    });
}

function renderUserList() {
    const tableBody = document.getElementById('master-users-table-body') || document.getElementById('userTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    const users = window.appState.users || [];

    users.forEach((u) => {
        const tr = document.createElement('tr');
        tr.className = "border-b hover:bg-slate-50";
        tr.innerHTML = `
            <td class="p-2 font-semibold">${u.nama || u.username}</td>
            <td class="p-2 text-center uppercase text-[10px] font-bold text-indigo-600">${u.role || 'Guru'}</td>
            <td class="p-2">${u.kelas || '-'}</td>
            <td class="p-2 text-center">
                <span class="text-emerald-500 font-bold text-xs">Aktif</span>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

window.renderJurnalList = function() {
    const tableBody = document.getElementById('jurnal-table-body');
    if (!tableBody) return;

    const journals = window.appState.journals || [];
    if (journals.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="9" class="p-4 text-center text-slate-400 font-medium">Belum ada riwayat jurnal mengajar.</td></tr>';
        return;
    }

    tableBody.innerHTML = journals.slice().reverse().map((j, idx) => `
        <tr class="border-b hover:bg-slate-50">
            <td class="p-3 text-center">${idx + 1}</td>
            <td class="p-3 font-semibold">${j.tanggal || '-'}</td>
            <td class="p-3">${j.guru || '-'}</td>
            <td class="p-3">${j.kelas || '-'}</td>
            <td class="p-3">${j.mapel || '-'}</td>
            <td class="p-3">${j.materi || j.kegiatan || '-'}</td>
            <td class="p-3 text-center">${j.filePdf ? '<i class="fa-solid fa-file-pdf text-rose-500"></i>' : '-'}</td>
            <td class="p-3 text-center"><span class="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold">Disetujui</span></td>
            <td class="p-3 text-center"><button class="text-indigo-600 hover:underline">Detail</button></td>
        </tr>
    `).join('');
};

window.renderPresensiForm = function() {
    console.log("✓ Modul Presensi siap.");
};

function resetForm(formId) {
    const form = document.getElementById(formId);
    if (form) form.reset();
}
