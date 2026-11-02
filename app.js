// ==========================================================================
// Modul Aplikasi Utama & Navigasi - SIMPATIK SLBN 2 PELAIHARI
// Version: Validated Clean Build with populateDropdowns
// ==========================================================================

// --- 1. FUNGSI NAVIGASI TAB UTAMA (UNIVERSAL) ---
window.switchTab = function(param1, param2) {
    var event = null;
    var tabName = '';

    if (param1 && typeof param1 === 'object' && typeof param1.preventDefault === 'function') {
        event = param1;
        tabName = param2;
    } else {
        tabName = param1;
        event = param2;
    }

    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    if (!tabName) return;

    // Sembunyikan semua modul section di dalam main
    var sections = document.querySelectorAll('main > section');
    sections.forEach(function(sec) {
        sec.classList.add('hidden');
        sec.style.setProperty('display', 'none', 'important');
    });

    // Tampilkan modul yang dituju
    var target = document.getElementById('modul-' + tabName) || document.getElementById(tabName);
    if (target) {
        target.classList.remove('hidden');
        target.style.setProperty('display', 'block', 'important');
    }

    // Perbarui status aktif tombol sidebar
    document.querySelectorAll('aside nav .tab-btn').forEach(function(btn) {
        btn.classList.remove('bg-white', 'text-indigo-900', 'shadow-md');
        btn.classList.add('text-indigo-200');
    });

    if (event && event.currentTarget) {
        event.currentTarget.classList.remove('text-indigo-200', 'hover:bg-indigo-800/60');
        event.currentTarget.classList.add('bg-white', 'text-indigo-900', 'shadow-md');
    }

    // Segarkan dropdown pilihan kelas & mapel setiap kali pindah tab
    if (typeof window.populateDropdowns === 'function') {
        window.populateDropdowns();
    }

    // Panggil fungsi render khusus modul
    if (tabName === 'master' && typeof renderAllMasterData === 'function') renderAllMasterData();
    if (tabName === 'presensi' && typeof renderPresensiForm === 'function') renderPresensiForm();
    if (tabName === 'jurnal' && typeof renderJurnalList === 'function') renderJurnalList();
    if (tabName === 'rekap' && typeof renderRekapModule === 'function') renderRekapModule();
    if (tabName === 'evaluasi' && typeof updateEvaluasiDashboard === 'function') updateEvaluasiDashboard();

    // Tutup sidebar otomatis di perangkat mobile
    var sidebar = document.getElementById('sidebar-nav');
    var backdrop = document.getElementById('sidebar-backdrop');
    if (sidebar && window.innerWidth < 768) {
        sidebar.classList.add('hidden', '-translate-x-full');
    }
    if (backdrop) {
        backdrop.classList.add('hidden');
    }
};

// --- 2. FUNGSI PENGISIAN OTOMATIS DROPDOWN KELAS & MAPEL ---
window.populateDropdowns = function() {
    var classes = (window.appState && window.appState.classes) ? window.appState.classes : [];
    var subjects = (window.appState && window.appState.subjects) ? window.appState.subjects : [];

    // Daftar ID elemen select kelas
    var selectClassIds = [
        'presensi-kelas-select', 
        'jurnal-kelas-select', 
        'filter-rekap-kelas', 
        'filter-eval-kelas', 
        'master-siswa-filter-kelas',
        'siswa-form-kelas'
    ];

    selectClassIds.forEach(function(id) {
        var el = document.getElementById(id);
        if (!el) return;
        
        var currentVal = el.value;
        el.innerHTML = '';

        if (id !== 'filter-rekap-kelas' && id !== 'filter-eval-kelas' && id !== 'master-siswa-filter-kelas') {
            var defaultOpt = document.createElement('option');
            defaultOpt.value = '';
            defaultOpt.textContent = '-- Pilih Kelas --';
            el.appendChild(defaultOpt);
        } else {
            var allOpt = document.createElement('option');
            allOpt.value = 'ALL';
            allOpt.textContent = 'Semua Kelas';
            el.appendChild(allOpt);
        }

        classes.forEach(function(cls) {
            var opt = document.createElement('option');
            opt.value = cls.id || cls.name || cls.nama;
            opt.textContent = cls.name || cls.nama;
            el.appendChild(opt);
        });

        if (currentVal) el.value = currentVal;
    });

    // Daftar ID elemen select mata pelajaran
    var selectSubjectIds = ['presensi-mapel-select', 'jurnal-mapel-select'];
    selectSubjectIds.forEach(function(id) {
        var el = document.getElementById(id);
        if (!el) return;

        var currentVal = el.value;
        el.innerHTML = '';

        var defaultOpt = document.createElement('option');
        defaultOpt.value = '';
        defaultOpt.textContent = '-- Pilih Mata Pelajaran --';
        el.appendChild(defaultOpt);

        subjects.forEach(function(subj) {
            var opt = document.createElement('option');
            opt.value = subj.id || subj.name || subj.nama;
            opt.textContent = subj.name || subj.nama;
            el.appendChild(opt);
        });

        if (currentVal) el.value = currentVal;
    });
};

// --- 3. FUNGSI TOGGLE SUB-MENU SIDEBAR ---
window.toggleSubMenu = function(submenuId, chevronId, targetTab, event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    if (targetTab) {
        window.switchTab(targetTab, event);
    }

    var submenu = document.getElementById(submenuId);
    var chevron = document.getElementById(chevronId);

    if (submenu) {
        submenu.classList.toggle('hidden');
    }
    if (chevron) {
        chevron.classList.toggle('rotate-180');
    }
};

// --- 4. FUNGSI TOGGLE MOBILE SIDEBAR ---
window.toggleMobileSidebar = function(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    var sidebar = document.getElementById('sidebar-nav');
    var backdrop = document.getElementById('sidebar-backdrop');
    
    if (sidebar) {
        sidebar.classList.toggle('hidden');
        sidebar.classList.toggle('-translate-x-full');
    }
    
    if (backdrop) {
        backdrop.classList.add('hidden');
    }
};

// --- 5. SCROLL KE SUB-SECTION KHUSUS DI EVALUASI ---
window.scrollToSubSection = function(event, tabName, elementId) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    window.switchTab(tabName, event);
    
    setTimeout(function() {
        var el = document.getElementById(elementId);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 100);
};

// --- 6. PENGAMAN HAK AKSES ROLE (RBAC) & TAMPILAN SIDEBAR ---
window.applyRoleAccessControl = function() {
    var currentUser = window.appState && window.appState.currentUser ? window.appState.currentUser : null;
    if (!currentUser) return;

    var role = (currentUser.role || '').toLowerCase();

    var sidebar = document.getElementById('sidebar-nav');
    if (sidebar) {
        sidebar.classList.remove('hidden');
        sidebar.style.setProperty('display', 'flex', 'important');
    }

    var menuPresensi = document.getElementById('tab-btn-presensi');
    var menuJurnal = document.getElementById('tab-btn-jurnal');
    var menuRekap = document.getElementById('tab-btn-rekap');
    var menuEvaluasi = document.getElementById('tab-btn-evaluasi')?.closest('div') || document.getElementById('tab-btn-evaluasi');
    var menuMaster = document.getElementById('tab-btn-master');

    if (role === 'admin') {
        showEl(menuPresensi);
        showEl(menuJurnal);
        showEl(menuRekap);
        showEl(menuEvaluasi);
        showEl(menuMaster);
    } 
    else if (role === 'walikelas' || role === 'gurumapel' || role === 'guru') {
        showEl(menuPresensi);
        showEl(menuJurnal);
        hideEl(menuRekap);
        hideEl(menuEvaluasi);
        hideEl(menuMaster);
    } 
    else if (role === 'kepsek') {
        hideEl(menuPresensi);
        hideEl(menuJurnal);
        showEl(menuRekap);
        showEl(menuEvaluasi);
        hideEl(menuMaster);
    }
};

function showEl(element) {
    if (element) {
        element.style.display = '';
        element.classList.remove('hidden');
    }
}

function hideEl(element) {
    if (element) {
        element.style.display = 'none';
        element.classList.add('hidden');
    }
}

// --- 7. INISIALISASI SAAT HALAMAN DIMUAT ---
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        document.querySelectorAll('button, a').forEach(function(el) {
            el.style.pointerEvents = 'auto';
            el.style.cursor = 'pointer';
        });
        var backdrop = document.getElementById('sidebar-backdrop');
        if (backdrop) backdrop.classList.add('hidden');

        var savedSession = localStorage.getItem('sispko_session_user');
        if (savedSession) {
            try {
                window.appState.currentUser = JSON.parse(savedSession);
                window.applyRoleAccessControl();
            } catch(e) {}
        }
        
        if (typeof window.populateDropdowns === 'function') {
            window.populateDropdowns();
        }
    }, 300);
});