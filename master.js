// ==========================================================================
// Modul Data Master SIMPATIK SLBN 2 PELAIHARI
// Version: Full Complete Master Data (Guru, Murid 10/Page, Kelas, Mapel, Ketunaan)
// ==========================================================================

// --- GLOBAL PAGINATION STATE UNTUK DATA MURID ---
window.siswaPagination = {
    currentPage: 1,
    pageSize: 10
};

// --- 1. MANAJEMEN JENIS KETUNAAN ---
function initKetunaanList() {
    if (!window.appState) window.appState = {};
    if (!window.appState.ketunaanList || !Array.isArray(window.appState.ketunaanList) || window.appState.ketunaanList.length === 0) {
        window.appState.ketunaanList = [
            "Tuna Netra", "Tuna Rungu", "Tuna Grahita", "Tuna Grahita Sedang",
            "Tuna Daksa", "Autis", "Down Syndrome", "Hiperaktif", "Kesulitan Belajar"
        ];
        if (typeof saveAppState === 'function') saveAppState();
    }
}

function renderMasterKetunaanList() {
    initKetunaanList();
    var container = document.getElementById('master-ketunaan-list-container');
    if (!container) return;
    container.innerHTML = '';

    (window.appState.ketunaanList || []).forEach(function(k, idx) {
        if (!k) return;
        var div = document.createElement('div');
        div.className = "flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold";
        div.innerHTML = 
            '<span><i class="fa-solid fa-puzzle-piece text-indigo-600 mr-2"></i>' + k + '</span>' +
            '<div class="flex items-center gap-1">' +
                '<button type="button" onclick="openModalEditKetunaan(' + idx + ')" class="text-indigo-600 hover:text-indigo-800 p-1 cursor-pointer" title="Edit"><i class="fa-solid fa-pen"></i></button>' +
                '<button type="button" onclick="handleDeleteKetunaan(' + idx + ')" class="text-rose-600 hover:text-rose-800 p-1 cursor-pointer" title="Hapus"><i class="fa-solid fa-trash"></i></button>' +
            '</div>';
        container.appendChild(div);
    });
}

function handleAddKetunaan(e) {
    if (e) e.preventDefault();
    initKetunaanList();
    var input = document.getElementById('input-nama-ketunaan-baru');
    if (!input) return;
    var val = input.value.trim();

    if (!val) return alert("Nama jenis ketunaan tidak boleh kosong!");
    if (window.appState.ketunaanList.includes(val)) return alert("Jenis ketunaan sudah ada di daftar!");

    window.appState.ketunaanList.push(val);
    if (typeof saveAppState === 'function') saveAppState();
    input.value = '';
    renderMasterKetunaanList();
    if (typeof showToast === 'function') showToast("Jenis ketunaan baru berhasil ditambahkan!");
}

function openModalEditKetunaan(idx) {
    initKetunaanList();
    var currentVal = window.appState.ketunaanList[idx];
    if (!currentVal) return;
    var newVal = prompt("Edit Jenis Ketunaan:", currentVal);
    if (newVal === null) return;
    newVal = newVal.trim();
    if (!newVal) return alert("Nama tidak boleh kosong!");

    window.appState.ketunaanList[idx] = newVal;
    if (typeof saveAppState === 'function') saveAppState();
    renderMasterKetunaanList();
    if (typeof showToast === 'function') showToast("Jenis ketunaan berhasil diperbarui!");
}

function handleDeleteKetunaan(idx) {
    initKetunaanList();
    var currentVal = window.appState.ketunaanList[idx];
    if (!confirm("Hapus jenis ketunaan '" + currentVal + "'?")) return;
    window.appState.ketunaanList.splice(idx, 1);
    if (typeof saveAppState === 'function') saveAppState();
    renderMasterKetunaanList();
    if (typeof showToast === 'function') showToast("Jenis ketunaan berhasil dihapus.");
}

function populateKetunaanCheckboxes(selectedValues) {
    initKetunaanList();
    var container = document.getElementById('siswa-form-ketunaan-checkboxes');
    if (!container) return;
    container.innerHTML = '';

    var selectedList = Array.isArray(selectedValues) ? selectedValues : (selectedValues ? selectedValues.split(', ') : []);

    (window.appState.ketunaanList || []).forEach(function(k) {
        var isChecked = selectedList.includes(k) ? 'checked' : '';
        var lbl = document.createElement('label');
        lbl.className = 'flex items-center gap-1.5 font-medium text-slate-700 cursor-pointer text-xs';
        lbl.innerHTML = '<input type="checkbox" name="ketunaan_opt" value="' + k + '" ' + isChecked + ' class="rounded text-indigo-600"> ' + k;
        container.appendChild(lbl);
    });
}

// --- 2. MANAJEMEN DATA KELAS ---
function renderMasterKelasList() {
    var container = document.getElementById('master-kelas-list-container');
    if (!container) return;
    container.innerHTML = '';

    var classList = (window.appState && window.appState.classes) ? window.appState.classes : [];
    if (classList.length === 0) {
        container.innerHTML = '<div class="text-xs text-slate-400 p-2 text-center font-medium">Belum ada data kelas.</div>';
        return;
    }

    classList.forEach(function(c, idx) {
        var div = document.createElement('div');
        div.className = "flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold";
        div.innerHTML = 
            '<span><i class="fa-solid fa-door-open text-indigo-600 mr-2"></i>' + (c.name || c.nama) + '</span>' +
            '<button type="button" onclick="handleDeleteKelas(' + idx + ')" class="text-rose-600 hover:text-rose-800 p-1 cursor-pointer" title="Hapus"><i class="fa-solid fa-trash"></i></button>';
        container.appendChild(div);
    });
}

function handleAddKelas(e) {
    if (e) e.preventDefault();
    var input = document.getElementById('input-nama-kelas-baru');
    if (!input) return;
    var val = input.value.trim();

    if (!val) return alert("Nama kelas tidak boleh kosong!");
    if (!window.appState.classes) window.appState.classes = [];
    
    var exists = window.appState.classes.some(c => (c.name || c.nama).toLowerCase() === val.toLowerCase());
    if (exists) return alert("Kelas tersebut sudah ada!");

    window.appState.classes.push({ id: "c_" + Date.now(), name: val });
    if (typeof saveAppState === 'function') saveAppState();
    input.value = '';
    renderMasterKelasList();
    if (typeof showToast === 'function') showToast("Kelas baru berhasil ditambahkan!");
}

function handleDeleteKelas(idx) {
    if (!confirm("Hapus kelas ini?")) return;
    window.appState.classes.splice(idx, 1);
    if (typeof saveAppState === 'function') saveAppState();
    renderMasterKelasList();
    if (typeof showToast === 'function') showToast("Kelas berhasil dihapus.");
}

// --- 3. MANAJEMEN MATA PELAJARAN ---
function renderMasterMapelList() {
    var container = document.getElementById('master-mapel-list-container');
    if (!container) return;
    container.innerHTML = '';

    var subjectList = (window.appState && window.appState.subjects) ? window.appState.subjects : [];
    if (subjectList.length === 0) {
        container.innerHTML = '<div class="text-xs text-slate-400 p-2 text-center font-medium">Belum ada mata pelajaran.</div>';
        return;
    }

    subjectList.forEach(function(m, idx) {
        var div = document.createElement('div');
        div.className = "flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold";
        div.innerHTML = 
            '<span><i class="fa-solid fa-book text-indigo-600 mr-2"></i>' + (m.name || m.nama) + '</span>' +
            '<button type="button" onclick="handleDeleteMapel(' + idx + ')" class="text-rose-600 hover:text-rose-800 p-1 cursor-pointer" title="Hapus"><i class="fa-solid fa-trash"></i></button>';
        container.appendChild(div);
    });
}

function handleAddMapel(e) {
    if (e) e.preventDefault();
    var input = document.getElementById('input-nama-mapel-baru');
    if (!input) return;
    var val = input.value.trim();

    if (!val) return alert("Nama mata pelajaran tidak boleh kosong!");
    if (!window.appState.subjects) window.appState.subjects = [];

    var exists = window.appState.subjects.some(m => (m.name || m.nama).toLowerCase() === val.toLowerCase());
    if (exists) return alert("Mata pelajaran tersebut sudah ada!");

    window.appState.subjects.push({ id: "m_" + Date.now(), name: val });
    if (typeof saveAppState === 'function') saveAppState();
    input.value = '';
    renderMasterMapelList();
    if (typeof showToast === 'function') showToast("Mata pelajaran berhasil ditambahkan!");
}

function handleDeleteMapel(idx) {
    if (!confirm("Hapus mata pelajaran ini?")) return;
    window.appState.subjects.splice(idx, 1);
    if (typeof saveAppState === 'function') saveAppState();
    renderMasterMapelList();
    if (typeof showToast === 'function') showToast("Mata pelajaran berhasil dihapus.");
}

// --- 4. MANAJEMEN TABEL DATA MURID (10 ITEM PER HALAMAN) ---
function renderMasterSiswaTable() {
    var tbody = document.getElementById('master-siswa-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    var studentList = (window.appState && Array.isArray(window.appState.students)) ? window.appState.students : [];

    var searchInput = document.getElementById('master-siswa-search');
    var filterKelasInput = document.getElementById('master-siswa-filter-kelas');

    var searchVal = searchInput ? searchInput.value.toLowerCase().trim() : '';
    var filterKelas = filterKelasInput ? filterKelasInput.value : 'ALL';

    var filtered = studentList.filter(function(s) {
        if (!s) return false;
        var namaMurid = (s.nama || s.name || '').toLowerCase();
        var nisnMurid = (s.nisn || '').toLowerCase();
        var ketunaanMurid = (s.ketunaan || '').toLowerCase();

        var matchSearch = searchVal === '' || namaMurid.includes(searchVal) || nisnMurid.includes(searchVal) || ketunaanMurid.includes(searchVal);
        var matchKelas = (filterKelas === 'ALL' || filterKelas === '') || (s.classId === filterKelas || s.kelas === filterKelas);
        return matchSearch && matchKelas;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="p-4 text-center text-slate-400 font-medium">Data murid kosong / tidak ditemukan. (Total terdaftar: ' + studentList.length + ')</td></tr>';
        renderSiswaPaginationControls(0, 0, 0);
        return;
    }

    var pageSize = window.siswaPagination.pageSize || 10;
    var totalPages = Math.ceil(filtered.length / pageSize);

    if (window.siswaPagination.currentPage < 1) window.siswaPagination.currentPage = 1;
    if (window.siswaPagination.currentPage > totalPages) window.siswaPagination.currentPage = totalPages;

    var startIndex = (window.siswaPagination.currentPage - 1) * pageSize;
    var endIndex = Math.min(startIndex + pageSize, filtered.length);
    var pagedStudents = filtered.slice(startIndex, endIndex);

    pagedStudents.forEach(function(s, idx) {
        var realNumber = startIndex + idx + 1;
        var tr = document.createElement('tr');
        tr.className = "hover:bg-slate-50 transition border-b border-slate-100 text-xs";
        tr.innerHTML = 
            '<td class="p-3 text-center text-slate-500 font-bold">' + realNumber + '</td>' +
            '<td class="p-3 font-semibold text-slate-700">' + (s.nisn || '-') + '</td>' +
            '<td class="p-3 font-bold text-slate-800">' + (s.nama || s.name || '-') + '</td>' +
            '<td class="p-3 text-center"><span class="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-lg text-[10px] font-bold border border-indigo-200">' + (s.ketunaan || '-') + '</span></td>' +
            '<td class="p-3 text-slate-600 font-medium">' + (s.classId || s.kelas || 'Belum diatur') + '</td>' +
            '<td class="p-3 text-center space-x-1">' +
                '<button type="button" onclick="openModalSiswa(event, \'' + (s.id || idx) + '\')" class="text-indigo-600 hover:text-indigo-800 p-1 cursor-pointer" title="Edit"><i class="fa-solid fa-pen-to-square"></i></button>' +
                '<button type="button" onclick="handleDeleteSiswa(\'' + (s.id || idx) + '\')" class="text-rose-600 hover:text-rose-800 p-1 cursor-pointer" title="Hapus"><i class="fa-solid fa-trash"></i></button>' +
            '</td>';
        tbody.appendChild(tr);
    });

    renderSiswaPaginationControls(filtered.length, startIndex + 1, endIndex);
}

function renderSiswaPaginationControls(totalItems, startItem, endItem) {
    var parent = document.getElementById('master-siswa-table-body')?.closest('.space-y-3') || document.getElementById('master-siswa-table-body')?.parentElement;
    if (!parent) return;

    var existingNav = document.getElementById('siswa-pagination-container');
    if (existingNav) existingNav.remove();

    if (totalItems === 0) return;

    var pageSize = window.siswaPagination.pageSize || 10;
    var totalPages = Math.ceil(totalItems / pageSize);
    var currentPage = window.siswaPagination.currentPage;

    var navDiv = document.createElement('div');
    navDiv.id = 'siswa-pagination-container';
    navDiv.className = "flex flex-col sm:flex-row items-center justify-between pt-3 text-xs gap-2 border-t border-slate-100";
    
    navDiv.innerHTML = 
        '<div class="text-slate-500 font-medium">' +
            'Menampilkan <span class="font-bold text-slate-800">' + startItem + '</span> - <span class="font-bold text-slate-800">' + endItem + '</span> dari <span class="font-bold text-indigo-600">' + totalItems + '</span> murid' +
        '</div>' +
        '<div class="flex items-center gap-1.5">' +
            '<button type="button" onclick="changeSiswaPage(' + (currentPage - 1) + ')" ' + (currentPage <= 1 ? 'disabled class="px-2.5 py-1 bg-slate-100 text-slate-400 rounded-lg font-bold cursor-not-allowed"' : 'class="px-2.5 py-1 bg-white border border-slate-200 text-indigo-600 hover:bg-indigo-50 rounded-lg font-bold cursor-pointer transition"') + '><i class="fa-solid fa-chevron-left mr-1"></i> Prev</button>' +
            '<span class="px-3 py-1 bg-indigo-50 text-indigo-700 font-bold rounded-lg border border-indigo-100">Hal ' + currentPage + ' / ' + totalPages + '</span>' +
            '<button type="button" onclick="changeSiswaPage(' + (currentPage + 1) + ')" ' + (currentPage >= totalPages ? 'disabled class="px-2.5 py-1 bg-slate-100 text-slate-400 rounded-lg font-bold cursor-not-allowed"' : 'class="px-2.5 py-1 bg-white border border-slate-200 text-indigo-600 hover:bg-indigo-50 rounded-lg font-bold cursor-pointer transition"') + '>Next <i class="fa-solid fa-chevron-right ml-1"></i></button>' +
        '</div>';

    parent.appendChild(navDiv);
}

function changeSiswaPage(newPage) {
    var studentList = window.appState.students || [];
    var pageSize = window.siswaPagination.pageSize || 10;
    var totalPages = Math.ceil(studentList.length / pageSize);

    if (newPage >= 1 && newPage <= totalPages) {
        window.siswaPagination.currentPage = newPage;
        renderMasterSiswaTable();
    }
}

function openModalSiswa(e, siswaId) {
    if (e) e.preventDefault();
    var formId = document.getElementById('siswa-form-id');
    var formNisn = document.getElementById('siswa-form-nisn');
    var formNama = document.getElementById('siswa-form-nama');
    var formKelas = document.getElementById('siswa-form-kelas');

    if (formKelas) {
        formKelas.innerHTML = '<option value="">-- Pilih Kelas --</option>';
        (window.appState.classes || []).forEach(function(c) {
            var opt = document.createElement('option');
            opt.value = c.id || c.name;
            opt.innerText = c.name || c.nama;
            formKelas.appendChild(opt);
        });
    }

    if (siswaId) {
        if (document.getElementById('modal-siswa-title')) document.getElementById('modal-siswa-title').innerText = "Edit Data Murid";
        var s = (window.appState.students || []).find(function(item) { return item.id === siswaId || item === siswaId; });
        if (s) {
            if (formId) formId.value = s.id || siswaId;
            if (formNisn) formNisn.value = s.nisn || '';
            if (formNama) formNama.value = s.nama || s.name || '';
            if (formKelas) formKelas.value = s.classId || s.kelas || '';
            populateKetunaanCheckboxes(s.ketunaan);
        }
    } else {
        if (document.getElementById('modal-siswa-title')) document.getElementById('modal-siswa-title').innerText = "Tambah Murid Baru";
        if (formId) formId.value = '';
        if (formNisn) formNisn.value = '';
        if (formNama) formNama.value = '';
        populateKetunaanCheckboxes([]);
    }

    var modal = document.getElementById('modal-siswa');
    if (modal) modal.classList.remove('hidden');
}

function closeModalSiswa(e) {
    if (e) e.preventDefault();
    var modal = document.getElementById('modal-siswa');
    if (modal) modal.classList.add('hidden');
}

function handleSaveSiswa(e) {
    if (e) e.preventDefault();
    var id = document.getElementById('siswa-form-id').value;
    var nisn = document.getElementById('siswa-form-nisn').value.trim();
    var nama = document.getElementById('siswa-form-nama').value.trim();
    var classId = document.getElementById('siswa-form-kelas').value;

    var selectedKetunaan = [];
    document.querySelectorAll('input[name="ketunaan_opt"]:checked').forEach(function(cb) {
        selectedKetunaan.push(cb.value);
    });

    if (!nama) return alert("Nama murid wajib diisi!");

    var ketunaanStr = selectedKetunaan.join(', ') || 'Tuna Grahita';

    if (id) {
        var s = (window.appState.students || []).find(function(item) { return item.id === id; });
        if (s) {
            s.nisn = nisn;
            s.nama = nama;
            s.ketunaan = ketunaanStr;
            s.classId = classId;
        }
    } else {
        var newMurid = {
            id: "s_" + Date.now(),
            nisn: nisn,
            nama: nama,
            ketunaan: ketunaanStr,
            classId: classId
        };
        if (!window.appState.students) window.appState.students = [];
        window.appState.students.push(newMurid);
    }

    if (typeof saveAppState === 'function') saveAppState();
    closeModalSiswa();
    renderMasterSiswaTable();
    if (typeof showToast === 'function') showToast("Data murid berhasil disimpan!");
}

function handleDeleteSiswa(siswaId) {
    if (!confirm("Hapus data murid ini?")) return;
    window.appState.students = (window.appState.students || []).filter(function(s) { return s.id !== siswaId; });
    if (typeof saveAppState === 'function') saveAppState();
    renderMasterSiswaTable();
    if (typeof showToast === 'function') showToast("Data murid berhasil dihapus.");
}

// --- 5. INITIALIZE ALL MASTER DATA ---
window.renderAllMasterData = function() {
    initKetunaanList();
    renderMasterKetunaanList();
    renderMasterKelasList();
    renderMasterMapelList();
    renderMasterSiswaTable();
    if (typeof renderMasterUsersTable === 'function') renderMasterUsersTable();
};

document.addEventListener('DOMContentLoaded', function() {
    window.renderAllMasterData();
});
// ==========================================================================
// Fungsi Render Master Data Kelas dengan Filter Limit (10, 25, 50, All)
// ==========================================================================
window.renderMasterKelasTable = function() {
    var container = document.getElementById('master-kelas-list-container');
    if (!container) return;
    container.innerHTML = '';

    var classList = (window.appState && window.appState.classes) ? window.appState.classes : [];

    if (classList.length === 0) {
        container.innerHTML = '<div class="text-xs text-slate-400 text-center py-2">Belum ada data kelas.</div>';
        return;
    }

    // 1. Ambil nilai dari dropdown filter limit di HTML
    var limitSelect = document.getElementById('filter-limit-kelas');
    var limitValue = limitSelect ? limitSelect.value : '10';

    // 2. Batasi jumlah data yang akan dirender sesuai pilihan filter
    var displayedList = classList;
    if (limitValue !== 'ALL') {
        var limit = parseInt(limitValue) || 10;
        displayedList = classList.slice(0, limit);
    }

    // 3. Render data kelas ke dalam container
    displayedList.forEach(function(cls, idx) {
        var itemDiv = document.createElement('div');
        itemDiv.className = "flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium";
        
        var className = cls.name || cls.nama || '';
        var classId = cls.id || '';

        itemDiv.innerHTML = 
            '<div class="flex items-center gap-2">' +
                '<span class="text-slate-400 font-bold">' + (idx + 1) + '.</span>' +
                '<span class="text-slate-800 font-bold">' + className + '</span>' +
            '</div>' +
            '<div class="flex items-center gap-1">' +
                '<button type="button" onclick="openModalEditKelas(\'' + classId + '\')" class="text-indigo-600 hover:text-indigo-800 p-1" title="Edit"><i class="fa-solid fa-pen"></i></button>' +
                '<button type="button" onclick="handleDeleteKelas(\'' + classId + '\')" class="text-rose-600 hover:text-rose-800 p-1" title="Hapus"><i class="fa-solid fa-trash"></i></button>' +
            '</div>';
        
        container.appendChild(itemDiv);
    });
};