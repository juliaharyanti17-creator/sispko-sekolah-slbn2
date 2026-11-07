// ==========================================================================
// MODUL KELOLA DATA MASTER SEKOLAH (DENGAN PAGINATION, FILTER, & EDIT LENGKAP)
// SIMPATIK SLBN 2 PELAIHARI
// ==========================================================================

// Variabel Pengaturan Pagination Master untuk Semua Bagian
var masterPagination = {
    user: { page: 1, limit: 5 },
    kelas: { page: 1, limit: 5 },
    ketunaan: { page: 1, limit: 5 },
    siswa: { page: 1, limit: 10 },
    jadwal: { page: 1, limit: 5 }
};

function renderAllMasterData() {
    renderMasterUsers();
    renderMasterKelas();
    renderMasterKetunaan();
    renderMasterSiswa();
    renderMasterJadwal();
}

// Fungsi Ubah Jumlah Baris per Halaman (Limit) untuk Semua Bagian
function changeMasterLimit(type, selectElement) {
    var val = parseInt(selectElement.value);
    if (masterPagination[type]) {
        masterPagination[type].limit = val;
        masterPagination[type].page = 1; // Reset ke halaman 1
        if (type === 'user') renderMasterUsers();
        if (type === 'kelas') renderMasterKelas();
        if (type === 'ketunaan') renderMasterKetunaan();
        if (type === 'siswa') renderMasterSiswa();
        if (type === 'jadwal') renderMasterJadwal();
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
        renderMasterPaginationControls('user', 0, 1, 5);
        return;
    }

    var limit = masterPagination.user.limit || 5;
    var page = masterPagination.user.page || 1;
    var totalPages = Math.ceil(users.length / limit);
    if (page > totalPages) page = totalPages;
    if (page < 1) page = 1;
    masterPagination.user.page = page;

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
                <button onclick="openModalUser('${uId}')" class="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg text-[10px] font-bold cursor-pointer"><i class="fa-solid fa-pen"></i> Edit</button>
                <button onclick="handleDeleteUser('${uId}')" class="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg text-[10px] font-bold cursor-pointer"><i class="fa-solid fa-trash"></i> Hapus</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    renderMasterPaginationControls('user', users.length, page, limit);
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
        renderMasterPaginationControls('kelas', 0, 1, 5);
        return;
    }

    var limit = masterPagination.kelas.limit || 5;
    var page = masterPagination.kelas.page || 1;
    var totalPages = Math.ceil(classes.length / limit);
    if (page > totalPages) page = totalPages;
    if (page < 1) page = 1;
    masterPagination.kelas.page = page;

    var startIndex = (page - 1) * limit;
    var paginatedClasses = classes.slice(startIndex, startIndex + limit);

    var listWrapper = document.createElement('div');
    listWrapper.className = "space-y-1.5";

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
        listWrapper.appendChild(div);
    });
    container.appendChild(listWrapper);

    renderMasterPaginationControls('kelas', classes.length, page, limit);
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
        renderMasterPaginationControls('ketunaan', 0, 1, 5);
        return;
    }

    var limit = masterPagination.ketunaan.limit || 5;
    var page = masterPagination.ketunaan.page || 1;
    var totalPages = Math.ceil(ketunaanList.length / limit);
    if (page > totalPages) page = totalPages;
    if (page < 1) page = 1;
    masterPagination.ketunaan.page = page;

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

    renderMasterPaginationControls('ketunaan', ketunaanList.length, page, limit);
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
// 4. MANAJEMEN SISWA / MURID (DENGAN PAGINATION LENGKAP: 10 PER HALAMAN)
// ==========================================================================
function renderMasterSiswa() {
    var tbody = document.getElementById('master-siswa-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    var students = (window.appState && window.appState.students) ? window.appState.students : [];
    if (students.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="p-4 text-center text-slate-400 font-medium">Belum ada data murid.</td></tr>';
        renderMasterPaginationControls('siswa', 0, 1, 10);
        return;
    }

    var limit = masterPagination.siswa.limit || 10;
    var page = masterPagination.siswa.page || 1;
    var totalPages = Math.ceil(students.length / limit);
    if (page > totalPages) page = totalPages;
    if (page < 1) page = 1;
    masterPagination.siswa.page = page;

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

    renderMasterPaginationControls('siswa', students.length, page, limit);
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

// ==========================================================================
// 5. MANAJEMEN MASTER JADWAL & MAPEL HARIAN
// ==========================================================================
function getJadwalMasterList() {
    if (!window.appState.jadwalMaster) {
        window.appState.jadwalMaster = [];
    }
    return window.appState.jadwalMaster;
}

function renderMasterJadwal() {
    var tbody = document.getElementById('master-jadwal-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    var jadwalList = getJadwalMasterList();
    if (jadwalList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="p-4 text-center text-slate-400 font-medium">Belum ada data jadwal harian.</td></tr>';
        renderMasterPaginationControls('jadwal', 0, 1, 5);
        return;
    }

    var limit = masterPagination.jadwal.limit || 5;
    var page = masterPagination.jadwal.page || 1;
    var totalPages = Math.ceil(jadwalList.length / limit);
    if (page > totalPages) page = totalPages;
    if (page < 1) page = 1;
    masterPagination.jadwal.page = page;

    var startIndex = (page - 1) * limit;
    var paginatedJadwal = jadwalList.slice(startIndex, startIndex + limit);

    paginatedJadwal.forEach(function(j, indexOffset) {
        var idx = startIndex + indexOffset;
        var namaKelas = typeof getClassName === 'function' ? getClassName(j.classId) : j.classId;
        var tr = document.createElement('tr');
        tr.className = "hover:bg-slate-50 transition text-xs";
        tr.innerHTML = `
            <td class="p-2 text-center text-slate-500 font-bold">${idx + 1}</td>
            <td class="p-2 font-bold text-slate-800">${namaKelas}</td>
            <td class="p-2 text-center"><span class="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-md font-bold">${j.hari}</span></td>
            <td class="p-2 text-center">Jam Ke-${j.jamKe}</td>
            <td class="p-2 font-semibold text-slate-700">${j.mapel}</td>
            <td class="p-2 text-center space-x-1">
                <button onclick="openModalJadwal('${j.id}')" class="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg text-[10px] font-bold cursor-pointer"><i class="fa-solid fa-pen"></i> Edit</button>
                <button onclick="handleDeleteJadwal('${j.id}')" class="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg text-[10px] font-bold cursor-pointer"><i class="fa-solid fa-trash"></i> Hapus</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    renderMasterPaginationControls('jadwal', jadwalList.length, page, limit);
}

function openModalJadwal(jadwalId) {
    var modal = document.getElementById('modal-jadwal');
    var title = document.getElementById('modal-jadwal-title');
    var selectKelas = document.getElementById('jadwal-kelas-input');
    var selectHari = document.getElementById('jadwal-hari-input');
    var inputJam = document.getElementById('jadwal-jam-input');
    var inputMapel = document.getElementById('jadwal-mapel-input');
    var editId = document.getElementById('jadwal-edit-id');
    if (!modal) return;

    selectKelas.innerHTML = '';
    (window.appState.classes || []).forEach(function(c) {
        var opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = c.name || c.nama;
        selectKelas.appendChild(opt);
    });

    if (jadwalId) {
        title.textContent = "Edit Jadwal Harian";
        var list = getJadwalMasterList();
        var target = list.find(function(item) { return item.id === jadwalId; });
        if (target) {
            selectKelas.value = target.classId;
            selectHari.value = target.hari;
            inputJam.value = target.jamKe;
            inputMapel.value = target.mapel;
            editId.value = target.id;
        }
    } else {
        title.textContent = "Tambah Jadwal Harian Baru";
        inputJam.value = "1";
        inputMapel.value = "";
        editId.value = "";
    }

    modal.classList.remove('hidden');
    modal.style.display = 'flex';
}

function closeModalJadwal() {
    var modal = document.getElementById('modal-jadwal');
    if (modal) { modal.classList.add('hidden'); modal.style.display = 'none'; }
}

function handleSaveJadwal(e) {
    if (e) e.preventDefault();
    var classId = document.getElementById('jadwal-kelas-input').value;
    var hari = document.getElementById('jadwal-hari-input').value;
    var jamKe = document.getElementById('jadwal-jam-input').value;
    var mapel = document.getElementById('jadwal-mapel-input').value.trim();
    var editId = document.getElementById('jadwal-edit-id').value;

    var list = getJadwalMasterList();

    if (editId) {
        var target = list.find(function(item) { return item.id === editId; });
        if (target) {
            target.classId = classId;
            target.hari = hari;
            target.jamKe = jamKe;
            target.mapel = mapel;
        }
        if (typeof showToast === 'function') showToast("Jadwal berhasil diperbarui.");
    } else {
        var newJadwal = {
            id: 'j_' + Date.now(),
            classId: classId,
            hari: hari,
            jamKe: jamKe,
            mapel: mapel
        };
        list.push(newJadwal);
        if (typeof showToast === 'function') showToast("Jadwal baru berhasil ditambahkan.");
    }

    if (typeof saveAppState === 'function') saveAppState();
    closeModalJadwal();
    renderMasterJadwal();
}

function handleDeleteJadwal(jadwalId) {
    if (confirm("Apakah Anda yakin ingin menghapus jadwal ini?")) {
        window.appState.jadwalMaster = getJadwalMasterList().filter(function(item) { return item.id !== jadwalId; });
        if (typeof saveAppState === 'function') saveAppState();
        renderMasterJadwal();
        if (typeof showToast === 'function') showToast("Jadwal berhasil dihapus.");
    }
}

// ==========================================================================
// 6. HELPER PAGINATION UNIVERSAL UNTUK SEMUA BAGIAN MASTER
// ==========================================================================
function renderMasterPaginationControls(type, totalData, currentPage, limit) {
    var containerId = 'master-' + type + '-pagination-container';
    var container = document.getElementById(containerId);
    
    if (!container) {
        var targetEl = null;
        if (type === 'user') targetEl = document.getElementById('master-users-table-body');
        else if (type === 'kelas') targetEl = document.getElementById('master-kelas-list-container');
        else if (type === 'ketunaan') targetEl = document.getElementById('master-ketunaan-table-body');
        else if (type === 'siswa') targetEl = document.getElementById('master-siswa-table-body');
        else if (type === 'jadwal') targetEl = document.getElementById('master-jadwal-table-body');

        if (targetEl) {
            var wrapper = targetEl.closest('.bg-slate-50');
            if (wrapper) {
                container = document.createElement('div');
                container.id = containerId;
                container.className = "flex flex-col sm:flex-row items-center justify-between gap-2 pt-3 px-2 text-xs text-slate-600 border-t mt-3";
                wrapper.appendChild(container);
            }
        }
    }

    if (!container) return;

    if (totalData === 0) {
        container.innerHTML = '<div class="text-[11px] text-slate-400">Tidak ada data untuk ditampilkan</div>';
        return;
    }

    var totalPages = Math.ceil(totalData / limit) || 1;
    var startItem = (currentPage - 1) * limit + 1;
    var endItem = Math.min(currentPage * limit, totalData);

    container.innerHTML = `
        <div class="text-[11px] font-medium text-slate-500">
            Menampilkan <span class="font-bold text-slate-700">${startItem}</span> - <span class="font-bold text-slate-700">${endItem}</span> dari <span class="font-bold text-slate-700">${totalData}</span> data
        </div>
        <div class="flex items-center gap-1">
            <button onclick="changeMasterPage('${type}', ${currentPage - 1})" ${currentPage === 1 ? 'disabled class="px-3 py-1.5 rounded-lg border bg-slate-100 text-slate-300 cursor-not-allowed text-[11px] font-bold"' : 'class="px-3 py-1.5 rounded-lg border bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-bold cursor-pointer"'}>
                <i class="fa-solid fa-chevron-left mr-1"></i> Sebelumnya
            </button>
            <div class="px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-800 rounded-lg font-bold text-[11px]">
                Hal ${currentPage} dari ${totalPages}
            </div>
            <button onclick="changeMasterPage('${type}', ${currentPage + 1})" ${currentPage >= totalPages ? 'disabled class="px-3 py-1.5 rounded-lg border bg-slate-100 text-slate-300 cursor-not-allowed text-[11px] font-bold"' : 'class="px-3 py-1.5 rounded-lg border bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-bold cursor-pointer"'}>
                Selanjutnya <i class="fa-solid fa-chevron-right ml-1"></i>
            </button>
        </div>
    `;
}

function changeMasterPage(type, targetPage) {
    if (masterPagination[type]) {
        var dataList = [];
        if (type === 'user') dataList = window.appState.users || [];
        else if (type === 'kelas') dataList = window.appState.classes || [];
        else if (type === 'ketunaan') dataList = window.appState.ketunaanList || [];
        else if (type === 'siswa') dataList = window.appState.students || [];
        else if (type === 'jadwal') dataList = window.appState.jadwalMaster || [];

        var limit = masterPagination[type].limit || 5;
        var totalPages = Math.ceil(dataList.length / limit) || 1;

        if (targetPage >= 1 && targetPage <= totalPages) {
            masterPagination[type].page = targetPage;
            if (type === 'user') renderMasterUsers();
            else if (type === 'kelas') renderMasterKelas();
            else if (type === 'ketunaan') renderMasterKetunaan();
            else if (type === 'siswa') renderMasterSiswa();
            else if (type === 'jadwal') renderMasterJadwal();
        }
    }
}
