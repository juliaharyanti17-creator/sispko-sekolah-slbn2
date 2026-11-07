// ==========================================================================
// MODUL KELOLA DATA MASTER SEKOLAH (KELAS, USER, SISWA, & KETUNAAN)
// SIMPATIK SLBN 2 PELAIHARI
// ==========================================================================

function renderAllMasterData() {
    renderMasterKelas();
    renderMasterUsers();
    renderMasterSiswa();
    renderMasterKetunaan(); // Sinkronisasi render tabel ketunaan
}

// ==========================================================================
// 1. MANAJEMEN KELAS
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

    classes.forEach(function(c, idx) {
        var div = document.createElement('div');
        div.className = "flex justify-between items-center p-2.5 bg-white border border-slate-200 rounded-xl text-xs";
        div.innerHTML = `
            <div>
                <strong class="text-slate-800 font-bold">${c.name || c.nama}</strong>
                <span class="text-[10px] text-slate-500 block">Tingkat: ${c.tingkat || 'SLB'}</span>
            </div>
            <div class="space-x-1">
                <button onclick="handleDeleteClass('${c.id}')" class="px-2 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg text-[10px] font-bold cursor-pointer">Hapus</button>
            </div>
        `;
        container.appendChild(div);
    });
}

function openModalClass() {
    var namaKelas = prompt("Masukkan Nama Kelas Baru (Contoh: Kelas 1 SDLB):");
    if (!namaKelas) return;

    if (!window.appState.classes) window.appState.classes = [];
    var newClass = {
        id: 'c_' + Date.now(),
        name: namaKelas.trim(),
        tingkat: 'SLB'
    };

    window.appState.classes.push(newClass);
    if (typeof saveAppState === 'function') saveAppState();
    renderAllMasterData();
    if (typeof showToast === 'function') showToast("Kelas berhasil ditambahkan.");
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
// 2. MANAJEMEN PENGGUNA / GURU
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

    users.forEach(function(u, idx) {
        var tr = document.createElement('tr');
        tr.className = "hover:bg-slate-50 transition";
        tr.innerHTML = `
            <td class="p-2 font-bold text-slate-800">${u.nama || u.username}<br><span class="text-[10px] text-slate-400 font-normal">Username: ${u.username}</span></td>
            <td class="p-2 text-center"><span class="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-md text-[10px] font-bold">${(u.role || 'GURU').toUpperCase()}</span></td>
            <td class="p-2 text-slate-600 text-[11px]">${u.kelasAmpuan || 'ALL'}</td>
            <td class="p-2 text-center">
                <button onclick="handleDeleteUser('${u.id || u.username}')" class="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg text-[10px] font-bold cursor-pointer">Hapus</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function openModalUser() {
    var nama = prompt("Masukkan Nama Lengkap Guru / User:");
    if (!nama) return;
    var username = prompt("Masukkan Username untuk login:");
    if (!username) return;
    var password = prompt("Masukkan Kata Sandi:");
    if (!password) return;
    var role = prompt("Masukkan Role (admin / kepsek / guru):", "guru");

    if (!window.appState.users) window.appState.users = [];
    var newUser = {
        id: 'u_' + Date.now(),
        nama: nama.trim(),
        username: username.trim(),
        password: password.trim(),
        role: role ? role.trim().toLowerCase() : 'guru',
        kelasAmpuan: 'ALL',
        mapelAmpuan: 'ALL'
    };

    window.appState.users.push(newUser);
    if (typeof saveAppState === 'function') saveAppState();
    renderAllMasterData();
    if (typeof showToast === 'function') showToast("User baru berhasil ditambahkan.");
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
// 3. MANAJEMEN SISWA / MURID
// ==========================================================================
function renderMasterSiswa() {
    var tbody = document.getElementById('master-siswa-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    var students = (window.appState && window.appState.students) ? window.appState.students : [];
    if (students.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="p-4 text-center text-slate-400 font-medium">Belum ada data murid. Silakan tambahkan murid baru.</td></tr>';
        return;
    }

    students.forEach(function(s, idx) {
        var namaKelasFormatted = typeof getClassName === 'function' ? getClassName(s.classId || s.kelas) : (s.classId || s.kelas || '-');
        var tr = document.createElement('tr');
        tr.className = "hover:bg-slate-50 transition";
        tr.innerHTML = `
            <td class="p-2 text-center text-slate-500 font-bold">${idx + 1}</td>
            <td class="p-2 font-semibold text-slate-600">${s.nisn || '-'}</td>
            <td class="p-2 font-bold text-slate-800">${s.nama || s.name}</td>
            <td class="p-2 text-center"><span class="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-md text-[10px] font-bold">${s.ketunaan || 'Umum'}</span></td>
            <td class="p-2 text-slate-700 font-semibold">${namaKelasFormatted}</td>
            <td class="p-2 text-center">
                <button onclick="handleDeleteStudent('${s.id}')" class="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg text-[10px] font-bold cursor-pointer">Hapus</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function openModalStudent() {
    var nama = prompt("Masukkan Nama Lengkap Murid:");
    if (!nama) return;
    var nisn = prompt("Masukkan NISN Murid (Opsional):", "-");
    var ketunaan = prompt("Masukkan Jenis Ketunaan (Contoh: Autis, Tuna Netra):", "Tuna Grahita");
    
    var classes = window.appState.classes || [];
    if (classes.length === 0) {
        alert("Harap buat kelas terlebih dahulu sebelum menambahkan murid!");
        return;
    }
    var classId = classes[0].id; // Default ke kelas pertama

    if (!window.appState.students) window.appState.students = [];
    var newStudent = {
        id: 's_' + Date.now(),
        nisn: nisn ? nisn.trim() : '-',
        nama: nama.trim(),
        ketunaan: ketunaan ? ketunaan.trim() : 'Umum',
        classId: classId
    };

    window.appState.students.push(newStudent);
    if (typeof saveAppState === 'function') saveAppState();
    renderAllMasterData();
    if (typeof showToast === 'function') showToast("Murid berhasil ditambahkan.");
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
// 4. MANAJEMEN KETUNAAN (TABEL KETUNAAN DINAMIS)
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

    ketunaanList.forEach(function(item, idx) {
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
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
    }
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

    if (typeof saveAppState === 'function') {
        saveAppState();
    }

    closeModalKetunaan();
    renderMasterKetunaan();
}

function handleDeleteKetunaan(index) {
    var ketunaanList = window.appState.ketunaanList || [];
    var target = ketunaanList[index];

    if (confirm(`Apakah Anda yakin ingin menghapus kategori ketunaan "${target}"?`)) {
        ketunaanList.splice(index, 1);
        window.appState.ketunaanList = ketunaanList;

        if (typeof saveAppState === 'function') {
            saveAppState();
        }

        renderMasterKetunaan();
        if (typeof showToast === 'function') showToast("Ketunaan berhasil dihapus.");
    }
}
