// ==========================================================================
// Modul Data Master SIMPATIK SLBN 2 PELAIHARI
// Version: Full Complete Master Data (Guru, Murid 10/Page, Kelas, Mapel, Ketunaan) - Modern UI
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
        div.className = "flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200";
        div.innerHTML = 
            '<span><i class="fa-solid fa-puzzle-piece text-indigo-600 dark:text-indigo-400 mr-2"></i>' + k + '</span>' +
            '<div class="flex items-center gap-1">' +
                '<button type="button" onclick="openModalEditKetunaan(' + idx + ')" class="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 p-1 cursor-pointer" title="Edit"><i class="fa-solid fa-pen"></i></button>' +
                '<button type="button" onclick="handleDeleteKetunaan(' + idx + ')" class="text-rose-600 hover:text-rose-800 dark:text-rose-400 dark:hover:text-rose-300 p-1 cursor-pointer" title="Hapus"><i class="fa-solid fa-trash"></i></button>' +
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
        lbl.className = 'flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300 cursor-pointer text-xs';
        lbl.innerHTML = '<input type="checkbox" name="ketunaan_opt" value="' + k + '" ' + isChecked + ' class="rounded text-indigo-600 dark:bg-slate-900 dark:border-slate-700"> ' + k;
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
        container.innerHTML = '<div class="text-xs text-slate-400 dark:text-slate-500 p-2 text-center font-medium">Belum ada data kelas.</div>';
        return;
    }

    classList.forEach(function(c, idx) {
        var div = document.createElement('div');
        div.className = "flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200";
        var className = c.name || c.nama || c.namaKelas || '';
        var classId = c.id || '';

        div.innerHTML = 
            '<span><i class="fa-solid fa-door-open text-indigo-600 dark:text-indigo-400 mr-2"></i>' + (idx + 1) + '. ' + className + '</span>' +
            '<div class="flex items-center gap-1">' +
                '<button type="button" onclick="moveClassOrder(' + idx + ', \'up\')" class="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 p-1 cursor-pointer" title="Pindah ke Atas"><i class="fa-solid fa-arrow-up"></i></button>' +
                '<button type="button" onclick="moveClassOrder(' + idx + ', \'down\')" class="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 p-1 cursor-pointer" title="Pindah ke Bawah"><i class="fa-solid fa-arrow-down"></i></button>' +
                '<button type="button" onclick="openModalEditKelas(\'' + classId + '\', ' + idx + ')" class="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 p-1 cursor-pointer" title="Edit"><i class="fa-solid fa-pen"></i></button>' +
                '<button type="button" onclick="handleDeleteKelas(\'' + classId + '\', ' + idx + ')" class="text-rose-600 hover:text-rose-800 dark:text-rose-400 dark:hover:text-rose-300 p-1 cursor-pointer" title="Hapus"><i class="fa-solid fa-trash"></i></button>' +
            '</div>';
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
    
    var exists = window.appState.classes.some(c => (c.name || c.nama || c.namaKelas || '').toLowerCase() === val.toLowerCase());
    if (exists) return alert("Kelas tersebut sudah ada!");

    window.appState.classes.push({ id: "c_" + Date.now(), name: val, nama: val, namaKelas: val });
    if (typeof saveAppState === 'function') saveAppState();
    input.value = '';
    renderMasterKelasList();
    if (typeof showToast === 'function') showToast("Kelas baru berhasil ditambahkan!");
}

function openModalEditKelas(classId, idx) {
    var classList = window.appState.classes || [];
    var target = classList.find(function(c) { return c.id === classId; }) || classList[idx];
    if (!target) return;

    var currentName = target.name || target.nama || target.namaKelas || '';
    var newName = prompt("Edit Nama Kelas:", currentName);
    if (newName === null) return;
    newName = newName.trim();
    if (!newName) return alert("Nama kelas tidak boleh kosong!");

    target.name = newName;
    target.nama = newName;
    target.namaKelas = newName;

    if (typeof saveAppState === 'function') saveAppState();
    renderMasterKelasList();
    if (typeof showToast === 'function') showToast("Nama kelas berhasil diperbarui!");
}

function moveClassOrder(index, direction) {
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
    renderMasterKelasList();
}

function handleDeleteKelas(classId, idx) {
    if (!confirm("Hapus kelas ini?")) return;
    if (classId) {
        window.appState.classes = (window.appState.classes || []).filter(function(c) { return c.id !== classId; });
    } else {
        window.appState.classes.splice(idx, 1);
    }
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
        container.innerHTML = '<div class="text-xs text-slate-400 dark:text-slate-500 p-2 text-center font-medium">Belum ada mata pelajaran.</div>';
        return;
    }

    subjectList.forEach(function(m, idx) {
        var div = document.createElement('div');
        div.className = "flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200";
        var mapelName = m.name || m.nama || '';
        var mapelId = m.id || '';

        div.innerHTML = 
            '<span><i class="fa-solid fa-book text-indigo-600 dark:text-indigo-400 mr-2"></i>' + mapelName + '</span>' +
            '<div class="flex items-center gap-1">' +
                '<button type="button" onclick="openModalEditMapel(\'' + mapelId + '\', ' + idx + ')" class="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 p-1 cursor-pointer" title="Edit"><i class="fa-solid fa-pen"></i></button>' +
                '<button type="button" onclick="handleDeleteMapel(\'' + mapelId + '\', ' + idx + ')" class="text-rose-600 hover:text-rose-800 dark:text-rose-400 dark:hover:text-rose-300 p-1 cursor-pointer" title="Hapus"><i class="fa-solid fa-trash"></i></button>' +
            '</div>';
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

    var exists = window.appState.subjects.some(m => (m.name || m.nama || '').toLowerCase() === val.toLowerCase());
    if (exists) return alert("Mata pelajaran tersebut sudah ada!");

    window.appState.subjects.push({ id: "m_" + Date.now(), name: val, nama: val });
    if (typeof saveAppState === 'function') saveAppState();
    input.value = '';
    renderMasterMapelList();
    if (typeof showToast === 'function') showToast("Mata pelajaran berhasil ditambahkan!");
}

function openModalEditMapel(mapelId, idx) {
    var subjectList = window.appState.subjects || [];
    var target = subjectList.find(function(s) { return s.id === mapelId; }) || subjectList[idx];
    if (!target) return;

    var currentName = target.name || target.nama || '';
    var newName = prompt("Edit Nama Mata Pelajaran:", currentName);
    if (newName === null) return;
    newName = newName.trim();
    if (!newName) return alert("Nama mata pelajaran tidak boleh kosong!");

    target.name = newName;
    target.nama = newName;

    if (typeof saveAppState === 'function') saveAppState();
    renderMasterMapelList();
    if (typeof showToast === 'function') showToast("Mata pelajaran berhasil diperbarui!");
}

function handleDeleteMapel(mapelId, idx) {
    if (!confirm("Hapus mata pelajaran ini?")) return;
    if (mapelId) {
        window.appState.subjects = (window.appState.subjects || []).filter(function(m) { return m.id !== mapelId; });
    } else {
        window.appState.subjects.splice(idx, 1);
    }
    if (typeof saveAppState === 'function') saveAppState();
    renderMasterMapelList();
    if (typeof showToast === 'function') showToast("Mata pelajaran berhasil dihapus.");
}

// --- 4. MANAJEMEN TABEL DATA MURID (10 ITEM PER HALAMAN - MODERN UI & AVATAR) ---
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
        tbody.innerHTML = '<tr><td colspan="6" class="p-8 text-center text-slate-400 dark:text-slate-500 font-medium italic">Data murid kosong atau tidak ditemukan. (Total terdaftar: ' + studentList.length + ')</td></tr>';
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
        var kelasIdentifier = s.classId || s.kelas || '';
        var namaKelasLengkap = (typeof getClassName === 'function') ? getClassName(kelasIdentifier) : kelasIdentifier;
        var namaSiswa = s.nama || s.name || '-';
        
        var initials = namaSiswa.split(' ').map(function(n) { return n[0]; }).slice(0, 2).join('').toUpperCase();
        if (!initials) initials = 'MS';

        var tr = document.createElement('tr');
        tr.className = "hover:bg-indigo-50/40 dark:hover:bg-slate-700/50 transition border-b border-slate-100 dark:border-slate-700/60 text-xs";
        tr.innerHTML = 
            '<td class="p-3 text-center text-slate-400 dark:text-slate-500 font-bold">' + realNumber + '</td>' +
            '<td class="p-3 font-mono text-slate-600 dark:text-slate-300 font-semibold">' + (s.nisn || '-') + '</td>' +
            '<td class="p-3">' +
                '<div class="flex items-center space-x-3">' +
                    '<div class="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 font-bold flex items-center justify-center text-[10px] shrink-0 border border-indigo-200 dark:border-indigo-800">' + initials + '</div>' +
                    '<div><p class="font-bold text-slate-800 dark:text-slate-200">' + namaSiswa + '</p></div>' +
                '</div>' +
            '</td>' +
            '<td class="p-3 text-center"><span class="bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-xl text-[10px] font-bold border border-indigo-200 dark:border-indigo-800">' + (s.ketunaan || '-') + '</span></td>' +
            '<td class="p-3 text-slate-600 dark:text-slate-300 font-medium">' + namaKelasLengkap + '</td>' +
            '<td class="p-3 text-center space-x-2">' +
                '<button type="button" onclick="openModalSiswa(event, \'' + (s.id || idx) + '\')" class="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 p-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition cursor-pointer" title="Edit"><i class="fa-solid fa-pen-to-square"></i></button>' +
                '<button type="button" onclick="handleDeleteSiswa(\'' + (s.id || idx) + '\')" class="text-rose-600 hover:text-rose-800 dark:text-rose-400 dark:hover:text-rose-300 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer" title="Hapus"><i class="fa-solid fa-trash"></i></button>' +
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
    navDiv.className = "flex flex-col sm:flex-row items-center justify-between pt-3 text-xs gap-2 border-t border-slate-100 dark:border-slate-700/60";
    
    navDiv.innerHTML = 
        '<div class="text-slate-500 dark:text-slate-400 font-medium">' +
            'Menampilkan <span class="font-bold text-slate-800 dark:text-slate-200">' + startItem + '</span> - <span class="font-bold text-slate-800 dark:text-slate-200">' + endItem + '</span> dari <span class="font-bold text-indigo-600 dark:text-indigo-400">' + totalItems + '</span> murid' +
        '</div>' +
        '<div class="flex items-center gap-1.5">' +
            '<button type="button" onclick="changeSiswaPage(' + (currentPage - 1) + ')" ' + (currentPage <= 1 ? 'disabled class="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-lg font-bold cursor-not-allowed"' : 'class="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-700 rounded-lg font-bold cursor-pointer transition"') + '><i class="fa-solid fa-chevron-left mr-1"></i> Prev</button>' +
            '<span class="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold rounded-lg border border-indigo-100 dark:border-indigo-800">Hal ' + currentPage + ' / ' + totalPages + '</span>' +
            '<button type="button" onclick="changeSiswaPage(' + (currentPage + 1) + ')" ' + (currentPage >= totalPages ? 'disabled class="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-lg font-bold cursor-not-allowed"' : 'class="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-700 rounded-lg font-bold cursor-pointer transition"') + '>Next <i class="fa-solid fa-chevron-right ml-1"></i></button>' +
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
            opt.innerText = c.name || c.nama || c.namaKelas;
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
            s.kelas = classId;
        }
    } else {
        var newMurid = {
            id: "s_" + Date.now(),
            nisn: nisn,
            nama: nama,
            ketunaan: ketunaanStr,
            classId: classId,
            kelas: classId
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
