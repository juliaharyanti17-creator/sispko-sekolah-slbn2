// ==========================================================================
// MODUL KELOLA DATA MASTER SEKOLAH (DENGAN PAGINATION DI SEMUA BAGIAN & EDIT)
// SIMPATIK SLBN 2 PELAIHARI
// ==========================================================================

// Variabel Pengaturan Pagination Master untuk Semua Bagian
var masterPagination = {
    user: { page: 1, limit: 5 },
    kelas: { page: 1, limit: 5 },
    ketunaan: { page: 1, limit: 5 },
    siswa: { page: 1, limit: 10 }
};

function renderAllMasterData() {
    renderMasterUsers();
    renderMasterKelas();
    renderMasterKetunaan();
    renderMasterSiswa();
}

// Fungsi Ubah Jumlah Baris per Halaman (Limit) untuk Semua Bagian
function changeMasterLimit(type, selectElement) {
    var val = parseInt(selectElement.value);
    if (masterPagination[type]) {
        masterPagination[type].limit = val;
        masterPagination[type].page = 1;
        if (type === 'user') renderMasterUsers();
        if (type === 'kelas') renderMasterKelas();
        if (type === 'ketunaan') renderMasterKetunaan();
        if (type === 'siswa') renderMasterSiswa();
    }
}

// ==========================================================================
// 1. MANAJEMEN PENGGUNA / GURU (DENGAN PAGINATION & EDIT)
// ==========================================================================
function renderMasterUsers() {
    var tbody = document.getElementById('master-users-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    var users = (window.appState && window.appState.users) ? window.appState.users : [];
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="p-4 text-center text-slate-400 font-medium">Belum ada user terdaftar.</td></tr>';
        return;
    }

    var limit = masterPagination.user.limit || 5;
    var page = masterPagination.user.page || 1;
    var startIndex = (page - 1) * limit;
    var paginatedUsers = users.slice(startIndex, startIndex + limit);

    paginatedUsers.forEach(function(u) {
        var uId = u.id || u.username;
        var tr = document.createElement('tr');
        tr.className = "hover:bg-slate-50 transition";
        tr.innerHTML = `
            <td class="p-2 font-bold text-slate-800">${u.nama || u.username}<br><span class="text-[10px] text-slate-400 font-normal">Username: ${u.username}</span></td>
            <td class="p-2 text-center"><span class="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-md text-[10px] font-bold">${(u.role || 'GURU').toUpperCase()}</span></td>
            <td class="p-2 text-slate-600 text-[11px]">${u.kelasAmpuan || 'ALL'}</td>
            <td class="p-2 text-center space-x-1">
                <button onclick="openModalUser('${uId}')" class="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg text-[10px] font-bold cursor-pointer"><i class="fa-solid fa-pen"></i></button>
                <button onclick="handleDeleteUser('${uId}')" class="px-2 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg text-[10px] font-bold cursor-pointer"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function openModalUser(userId) {
    var modal = document.getElementById('modal-user');
    var title = document.getElementById('modal-user-title');
    var inNama = document.getElementById('user-nama-input');
    var inUser = document.getElementById('user-username-input');
    var inPass = document.getElementById('user-password-input');
    var inRole = document.getElementById('user-role-input');
    var editId = document.getElementById('user-edit-id');
    if (!modal) return;

    if (userId) {
        title.textContent = "Edit Data User / Guru";
        var u = (window.appState.users || []).find(function(item) { return (item.id === userId || item.username === userId); });
        if (u) {
            inNama.value = u.nama || '';
            inUser.value = u.username || '';
            inPass.value = u.password || '';
            inRole.value = (u.role || 'guru').toLowerCase();
            editId.value = u.id || u.username;
        }
    } else {
        title.textContent = "Tambah User / Guru Baru";
        inNama.value = '';
        inUser.value = '';
        inPass.value = '';
        inRole.value = 'guru';
        editId.value = '';
    }

    modal.classList.remove('hidden');
    modal.style.display = 'flex';
}

function closeModalUser() {
    var modal = document.getElementById('modal-user');
    if (modal) { modal.classList.add('hidden'); modal.style.display = 'none'; }
}

function handleSaveUser(e) {
    if (e) e.preventDefault();
    var nama = document.getElementById('user-nama-input').value.trim();
    var username = document.getElementById('user-username-input').value.trim();
    var password = document.getElementById('user-password-input').value.trim();
    var role = document.getElementById('user-role-input').value;
    var editId = document.getElementById('user-edit-id').value;

    if (!window.appState.users) window.appState.users = [];

    if (editId) {
        var u = window.appState.users.find(function(item) { return (item.id === editId || item.username === editId); });
        if (u) {
            u.nama = nama;
            u.username = username;
            u.password = password;
            u.role = role;
        }
        if (typeof showToast === 'function') showToast("User berhasil diperbarui.");
    } else {
        var newUser = {
            id: 'u_' + Date.now(),
            nama: nama,
            username: username,
            password: password,
            role: role,
            kelasAmpuan: 'ALL',
            mapelAmpuan: 'ALL'
        };
        window.appState.users.push(newUser);
        if (typeof showToast === 'function') showToast("User baru ditambahkan.");
    }

    if (typeof saveAppState === 'function') saveAppState();
    closeModalUser();
    renderAllMasterData();
}

function handleDeleteUser(userId) {
    if (confirm("Apakah Anda yakin ingin menghapus user ini?")) {
        window.appState.users = (window.appState.users || []).filter(function(u) { return (u.id !== userId && u.username !== userId); });
        if (typeof saveAppState === 'function') saveAppState();
        renderAllMasterData();
        if (typeof showToast === 'function') showToast("User berhasil dihapus.");
    }
}

// ==========================================================================
// 2. MANAJEMEN KELAS (DENGAN PAGINATION & EDIT)
// ==========================================================================
function renderMasterKelas() {
    var container = document.getElementById('master-kelas-list-container');
    if (!container) return;
    container.innerHTML = '';

    var classes = (window.appState && window.appState.classes) ? window.appState.classes : [];
    if (classes.length === 0) {
        container.innerHTML = '<div class="p-3 text-center text-slate-400 font-medium text-xs">Belum ada kelas terdaftar.</div>';
        return;
    }

    var limit = masterPagination.kelas.limit || 5;
    var page = masterPagination.kelas.page || 1;
    var startIndex = (page - 1) * limit;
    var paginatedClasses = classes.slice(startIndex, startIndex + limit);

    paginatedClasses.forEach(function(c) {
        var div = document.createElement('div');
        div.className = "flex justify-between items-center p-2.5 bg-white border border-slate-200 rounded-xl text-xs";
        div.innerHTML = `
            <div>
                <strong class="text-slate-800 font-bold">${c.name || c.nama}</strong>
                <span class="text-[10px] text-slate-500 block">ID: ${c.id}</span>
            </div>
            <div class="space-x-1">
                <button onclick="openModalClass('${c.id}')" class="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg text-[10px] font-bold cursor-pointer"><i class="fa-solid fa-pen"></i> Edit</button>
                <button onclick="handleDeleteClass('${c.id}')" class="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg text-[10px] font-bold cursor-pointer"><i class="fa-solid fa-trash"></i> Hapus</button>
            </div>
        `;
        container.appendChild(div);
    });
}

function openModalClass(classId) {
    var modal = document.getElementById('modal-kelas');
    var title = document.getElementById('modal-kelas-title');
    var input = document.getElementById('kelas-nama-input');
    var editId = document.getElementById('kelas-edit-id');
    if (!modal) return;

    if (classId) {
        title.textContent = "Edit Nama Kelas";
        var c = (window.appState.classes || []).find(function(item) { return item.id === classId; });
        if (c) {
            input.value = c.name || c.nama;
            editId.value = c.id;
        }
    } else {
        title.textContent = "Tambah Kelas Baru";
        input.value = "";
        editId.value = "";
    }

    modal.classList.remove('hidden');
    modal.style.display = 'flex';
}

function closeModalClass() {
    var modal = document.getElementById('modal-kelas');
    if (modal) { modal.classList.add('hidden'); modal.style.display = 'none'; }
}

function handleSaveClass(e) {
    if (e) e.preventDefault();
    var input = document.getElementById('kelas-nama-input');
    var editId = document.getElementById('kelas-edit-id');
    if (!input) return;

    var nama = input.value.trim();
    if (!nama) return;

    if (!window.appState.classes) window.appState.classes = [];

    if (editId.value) {
        var c = window.appState.classes.find(function(item) { return item.id === editId.value; });
        if (c) {
            c.name = nama;
            c.nama = nama;
        }
        if (typeof showToast === 'function') showToast("Kelas berhasil diperbarui.");
    } else {
        var newClass = { id: 'c_' + Date.now(), name: nama, nama: nama, tingkat: 'SLB' };
        window.appState.classes.push(newClass);
        if (typeof showToast === 'function') showToast("Kelas baru ditambahkan.");
    }

    if (typeof saveAppState === 'function') saveAppState();
    closeModalClass();
    renderAllMasterData();
}

function handleDeleteClass(classId) {
    if (confirm("Apakah Anda yakin ingin menghapus kelas ini?")) {
        window.appState.classes = (window.appState.classes || []).filter(function(c) { return c.id !== classId; });
        if (typeof saveAppState === 'function') saveAppState();
        renderAllMasterData();
        if (typeof showToast === 'function') showToast("Kelas berhasil dihapus.");
    }
}

// ==========================================================================
// 3. MANAJEMEN KETUNAAN (DENGAN PAGINATION & EDIT)
// ==========================================================================
function renderMasterKetunaan() {
    var tbody = document.getElementById('master-ketunaan-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    var ketunaanList = (window.appState && window.appState.ketunaanList) ? window.appState.ketunaanList : [];

    if (ketunaanList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="p-4 text-center text-slate-400 font-medium">Belum ada data ketunaan.</td></tr>';
        return;
    }

    var limit = masterPagination.ketunaan.limit || 5;
    var page = masterPagination.ketunaan.page || 1;
    var startIndex = (page - 1) * limit;
    var paginatedKetunaan = ketunaanList.slice(startIndex, startIndex + limit);

    paginatedKetunaan.forEach(function(item, indexOffset) {
        var idx = startIndex + indexOffset;
        var tr = document.createElement('tr');
        tr.className = "hover:bg-slate-50 transition";
        tr.innerHTML = `
            <td class="p-2 text-center text-slate-500 font-bold">${idx + 1}</td>
            <td class="p-2 font-bold text-slate-800">${item}</td>
            <td class="p-2 text-center space-x-1">
                <button onclick="openModalKetunaan(${idx})" class="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg text-[10px] font-bold cursor-pointer"><i class="fa-solid fa-pen"></i> Edit</button>
                <button onclick="handleDeleteKetunaan(${idx})" class="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg text-[10px] font-bold cursor-pointer"><i class="fa-solid fa-trash"></i> Hapus</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function openModalKetunaan(index) {
    var modal = document.getElementById('modal-ketunaan');
    var title = document.getElementById('modal-ketunaan-title');
    var input = document.getElementById('ketunaan-nama-input');
    var editIdx = document.getElementById('ketunaan-edit-index');

    if (!modal) return;

    if (typeof index === 'number' && index >= 0) {
        if (title) title.textContent = "Edit Kategori Ketunaan";
        var ketunaanList = window.appState.ketunaanList || [];
        if (input) input.value = ketunaanList[index] || '';
        if (editIdx) editIdx.value = index;
    } else {
        if (title) title.textContent = "Tambah Kategori Ketunaan";
        if (input) input.value = '';
        if (editIdx) editIdx.value = '';
    }

    modal.classList.remove('hidden');
    modal.style.display = 'flex';
}

function closeModalKetunaan() {
    var modal = document.getElementById('modal-ketunaan');
    if (modal) { modal.classList.add('hidden'); modal.style.display = 'none'; }
}

function handleSaveKetunaan(e) {
    if (e) e.preventDefault();
    var input = document.getElementById('ketunaan-nama-input');
    var editIdx = document.getElementById('ketunaan-edit-index');

    if (!input) return;
    var namaBaru = input.value.trim();
    if (!namaBaru) return;

    if (!window.appState.ketunaanList) {
        window.appState.ketunaanList = [];
    }

    var idx = editIdx.value !== '' ? parseInt(editIdx.value) : -1;

    if (idx >= 0) {
        window.appState.ketunaanList[idx] = namaBaru;
        if (typeof showToast === 'function') showToast("Ketunaan berhasil diperbarui.");
    } else {
        if (window.appState.ketunaanList.includes(namaBaru)) {
            alert("Kategori ketunaan tersebut sudah ada!");
            return;
        }
        window.appState.ketunaanList.push(namaBaru);
        if (typeof showToast === 'function') showToast("Ketunaan baru berhasil ditambahkan.");
    }

    if (typeof saveAppState === 'function') saveAppState();
    closeModalKetunaan();
    renderMasterKetunaan();
}

function handleDeleteKetunaan(index) {
    var ketunaanList = window.appState.ketunaanList || [];
    var target = ketunaanList[index];

    if (confirm(`Apakah Anda yakin ingin menghapus kategori ketunaan "${target}"?`)) {
        ketunaanList.splice(index, 1);
        window.appState.ketunaanList = ketunaanList;

        if (typeof saveAppState === 'function') saveAppState();
        renderMasterKetunaan();
        if (typeof showToast === 'function') showToast("Ketunaan berhasil dihapus.");
    }
}

// ==========================================================================
// 4. MANAJEMEN SISWA / MURID (DENGAN PAGINATION & EDIT)
// ==========================================================================
function renderMasterSiswa() {
    var tbody = document.getElementById('master-siswa-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    var students = (window.appState && window.appState.students) ? window.appState.students : [];
    if (students.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="p-4 text-center text-slate-400 font-medium">Belum ada data murid.</td></tr>';
        return;
    }

    var limit = masterPagination.siswa.limit || 10;
    var page = masterPagination.siswa.page || 1;
    var startIndex = (page - 1) * limit;
    var paginatedStudents = students.slice(startIndex, startIndex + limit);

    paginatedStudents.forEach(function(s, indexOffset) {
        var idx = startIndex + indexOffset;
        var namaKelasFormatted = typeof getClassName === 'function' ? getClassName(s.classId || s.kelas) : (s.classId || s.kelas || '-');
        var tr = document.createElement('tr');
        tr.className = "hover:bg-slate-50 transition";
        tr.innerHTML = `
            <td class="p-2 text-center text-slate-500 font-bold">${idx + 1}</td>
            <td class="p-2 font-semibold text-slate-600">${s.nisn || '-'}</td>
            <td class="p-2 font-bold text-slate-800">${s.nama || s.name}</td>
            <td class="p-2 text-center"><span class="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-md text-[10px] font-bold">${s.ketunaan || 'Umum'}</span></td>
            <td class="p-2 text-slate-700 font-semibold">${namaKelasFormatted}</td>
            <td class="p-2 text-center space-x-1">
                <button onclick="openModalStudent('${s.id}')" class="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg text-[10px] font-bold cursor-pointer"><i class="fa-solid fa-pen"></i> Edit</button>
                <button onclick="handleDeleteStudent('${s.id}')" class="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg text-[10px] font-bold cursor-pointer"><i class="fa-solid fa-trash"></i> Hapus</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function openModalStudent(studentId) {
    var modal = document.getElementById('modal-student');
    var title = document.getElementById('modal-student-title');
    var inNama = document.getElementById('student-nama-input');
    var inNisn = document.getElementById('student-nisn-input');
    var selectKelas = document.getElementById('student-kelas-input');
    var selectKetunaan = document.getElementById('student-ketunaan-input');
    var editId = document.getElementById('student-edit-id');
    if (!modal) return;

    selectKelas.innerHTML = '';
    (window.appState.classes || []).forEach(function(c) {
        var opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = c.name || c.nama;
        selectKelas.appendChild(opt);
    });

    selectKetunaan.innerHTML = '';
    (window.appState.ketunaanList || ["Tuna Netra", "Tuna Rungu", "Tuna Grahita", "Autis"]).forEach(function(k) {
        var opt = document.createElement('option');
        opt.value = k;
        opt.textContent = k;
        selectKetunaan.appendChild(opt);
    });

    if (studentId) {
        title.textContent = "Edit Data Murid";
        var s = (window.appState.students || []).find(function(item) { return item.id === studentId; });
        if (s) {
            inNama.value = s.nama || s.name || '';
            inNisn.value = s.nisn || '';
            selectKelas.value = s.classId || s.kelas || '';
            selectKetunaan.value = s.ketunaan || '';
            editId.value = s.id;
        }
    } else {
        title.textContent = "Tambah Murid Baru";
        inNama.value = '';
        inNisn.value = '';
        editId.value = '';
    }

    modal.classList.remove('hidden');
    modal.style.display = 'flex';
}

function closeModalStudent() {
    var modal = document.getElementById('modal-student');
    if (modal) { modal.classList.add('hidden'); modal.style.display = 'none'; }
}

function handleSaveStudent(e) {
    if (e) e.preventDefault();
    var nama = document.getElementById('student-nama-input').value.trim();
    var nisn = document.getElementById('student-nisn-input').value.trim();
    var classId = document.getElementById('student-kelas-input').value;
    var ketunaan = document.getElementById('student-ketunaan-input').value;
    var editId = document.getElementById('student-edit-id').value;

    if (!window.appState.students) window.appState.students = [];

    if (editId) {
        var s = window.appState.students.find(function(item) { return item.id === editId; });
        if (s) {
            s.nama = nama;
            s.name = nama;
            s.nisn = nisn || '-';
            s.classId = classId;
            s.ketunaan = ketunaan;
        }
        if (typeof showToast === 'function') showToast("Data murid berhasil diperbarui.");
    } else {
        var newStudent = {
            id: 's_' + Date.now(),
            nisn: nisn || '-',
            nama: nama,
            name: nama,
            ketunaan: ketunaan,
            classId: classId
        };
        window.appState.students.push(newStudent);
        if (typeof showToast === 'function') showToast("Murid baru berhasil ditambahkan.");
    }

    if (typeof saveAppState === 'function') saveAppState();
    closeModalStudent();
    renderAllMasterData();
}

function handleDeleteStudent(studentId) {
    if (confirm("Apakah Anda yakin ingin menghapus data murid ini?")) {
        window.appState.students = (window.appState.students || []).filter(function(s) { return s.id !== studentId; });
        if (typeof saveAppState === 'function') saveAppState();
        renderAllMasterData();
        if (typeof showToast === 'function') showToast("Data murid berhasil dihapus.");
    }
}
