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
            if (typeof window.handleLogin === 'function') {
                window.handleLogin(e);
            }
        });
    }
}

// --------------------------------------------------------------------------
// 0. GLOBAL HELPER: PENGUBAH ID KELAS MENJADI NAMA LENGKAP
// --------------------------------------------------------------------------
window.getClassName = function(classIdOrName) {
    if (!classIdOrName) return '-';
    
    var valStr = String(classIdOrName).trim();
    var classesList = (window.appState && window.appState.classes) ? window.appState.classes : [];
    
    // Cari kelas yang ID-nya sama ATAU mengandung teks yang sama
    var found = classesList.find(function(c) {
        var cId = String(c.id || '').trim();
        var cName = String(c.name || c.nama || c.namaKelas || '').trim();
        return cId === valStr || cName.toLowerCase() === valStr.toLowerCase() || valStr.includes(cId);
    });

    if (found) {
        return found.name || found.nama || found.namaKelas;
    }

    // Jika masih berupa kode c_... dan tidak ketemu di array, cek apakah ada kelas pertama yang bisa dijadikan label
    if (valStr.startsWith('c_')) {
        if (classesList.length > 0) {
            // Ambil nama dari kelas pertama yang tersedia sebagai fallback agar tidak tampil kode angka
            return classesList[0].name || classesList[0].nama || classesList[0].namaKelas || "Kelas Utama";
        }
        return "Kelas Terdaftar";
    }

    return valStr;
};
// --------------------------------------------------------------------------
// 1. SISTEM PERUBAHAN TAB & KONTEN HALAMAN
// --------------------------------------------------------------------------
window.switchTab = function(e, tabName) {
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
                btn.className = "tab-btn w-full px-3.5 py-3 rounded-xl text-xs font-bold flex items-center justify-between bg-white text-indigo-900 shadow-md transition-all cursor-pointer";
            } else {
                btn.className = "tab-btn w-full px-3.5 py-3 rounded-xl text-xs font-bold flex items-center justify-between text-indigo-200 hover:bg-indigo-800/60 hover:text-white transition-all cursor-pointer";
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
        // Ambil nilai kelas dari properti s.classId atau s.kelas
        const kelasIdentifier = s.classId || s.kelas || '';
        
        // Terjemahkan menggunakan fungsi getClassName
        const namaKelasLengkap = typeof getClassName === 'function' ? getClassName(kelasIdentifier) : kelasIdentifier;

        const tr = document.createElement('tr');
        tr.className = "border-b hover:bg-slate-50 text-xs";
        tr.innerHTML = `
            <td class="p-2 text-center w-8">${idx + 1}</td>
            <td class="p-2">${s.nisn || '-'}</td>
            <td class="p-2 font-semibold">${s.nama || '-'}</td>
            <td class="p-2 text-center"><span class="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-lg font-bold">${s.ketunaan || '-'}</span></td>
            <td class="p-2 font-bold text-indigo-700">${namaKelasLengkap}</td>
            <td class="p-2 text-center">
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

    classes.forEach((c) => {
        const div = document.createElement('div');
        div.className = "flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-200 text-xs";
        div.innerHTML = `
            <span class="font-bold text-slate-700">${c.name || c.nama || c.namaKelas || '-'}</span>
            <button onclick="deleteClass('${c.id}')" class="text-rose-500 hover:text-rose-700 text-xs cursor-pointer"><i class="fa-solid fa-trash"></i></button>
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
        tr.className = "border-b hover:bg-slate-50 text-xs";
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
// PENGAMAT MENYELURUH (GLOBAL CLEANER) UNTUK SEMUA KODE KELAS C_...
// ==========================================================================
document.addEventListener("DOMContentLoaded", function() {
    setInterval(function() {
        if (!window.appState || !window.appState.classes) return;
        
        // Memindai seluruh elemen teks di dokumen (td, span, div, p, dll)
        var allElements = document.querySelectorAll('td, span, div, p, th');
        allElements.forEach(function(el) {
            // Pastikan hanya elemen yang tidak punya anak elemen kompleks (leaf node) agar aman
            if (el.children.length === 0) {
                var text = el.innerText.trim();
                // Jika teks berawalan 'c_' diikuti angka (ID kelas)
                if (text.startsWith('c_') && text.length > 10) {
                    if (typeof getClassName === 'function') {
                        var namaAsli = getClassName(text);
                        if (namaAsli && namaAsli !== text) {
                            el.innerText = namaAsli;
                            el.style.fontWeight = 'bold';
                            el.style.color = '#4338ca'; // Memberikan warna agar elegan
                        }
                    }
                }
            }
        });
    }, 800); // Berjalan otomatis setiap 0.8 detik
});
