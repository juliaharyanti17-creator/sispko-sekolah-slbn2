// Manajemen Data Master (Users, Kelas, Mapel, Siswa)

function renderMasterUsersTable() {
    var tbody = document.getElementById('master-users-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (!appState.users || appState.users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="p-4 text-center text-slate-400 font-medium">Belum ada data pengguna.</td></tr>';
        return;
    }

    appState.users.forEach(function(u) {
        var tr = document.createElement('tr');
        tr.className = "hover:bg-slate-50 transition border-b border-slate-100";

        var roleBadge = '';
        if (u.role === 'admin') roleBadge = '<span class="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-bold text-[10px]">ADMIN</span>';
        else if (u.role === 'kepsek') roleBadge = '<span class="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold text-[10px]">KEPSEK</span>';
        else if (u.role === 'walikelas') roleBadge = '<span class="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-bold text-[10px]">WALI KELAS</span>';
        else roleBadge = '<span class="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold text-[10px]">GURU MAPEL</span>';

        var detailAmpuan = '-';
        if (u.role === 'walikelas' && u.classIds && u.classIds.length > 0) {
            var namaKelas = u.classIds.map(function(cid) { return getClassName(cid); }).join(', ');
            detailAmpuan = 'Kelas: <strong>' + namaKelas + '</strong>';
        } else if (u.role === 'gurumapel' && u.assignedMapels && u.assignedMapels.length > 0) {
            detailAmpuan = 'Mapel: <strong>' + u.assignedMapels.join(', ') + '</strong>';
        }

        tr.innerHTML = 
            '<td class="p-3 font-semibold text-slate-800">' + u.nama + '<div class="text-[10px] text-slate-400">@' + (u.username || u.nama) + '</div></td>' +
            '<td class="p-3 text-center">' + roleBadge + '</td>' +
            '<td class="p-3 text-slate-600">' + detailAmpuan + '</td>' +
            '<td class="p-3 text-center">' +
                '<button type="button" onclick="handleDeleteUser(\'' + u.id + '\')" class="text-rose-600 hover:text-rose-800 p-1 rounded transition cursor-pointer" title="Hapus User"><i class="fa-solid fa-trash"></i></button>' +
            '</td>';
        tbody.appendChild(tr);
    });
}

function openModalUser(e) {
    if (e) e.preventDefault();
    document.getElementById('user-form-nama').value = '';
    document.getElementById('user-form-password').value = '';
    document.getElementById('user-form-role').value = 'walikelas';

    // Render checkbox kelas
    var containerKelas = document.getElementById('user-form-kelas-checkboxes');
    if (containerKelas) {
        containerKelas.innerHTML = '';
        (appState.classes || []).forEach(function(c) {
            var lbl = document.createElement('label');
            lbl.className = 'flex items-center gap-2 font-medium text-slate-700 cursor-pointer';
            lbl.innerHTML = '<input type="checkbox" name="user_kelas_opt" value="' + c.id + '" class="rounded text-indigo-600"> ' + c.name;
            containerKelas.appendChild(lbl);
        });
    }

    // Render checkbox mapel
    var containerMapel = document.getElementById('user-form-mapel-checkboxes');
    if (containerMapel) {
        containerMapel.innerHTML = '';
        (appState.mapels || []).forEach(function(m) {
            var lbl = document.createElement('label');
            lbl.className = 'flex items-center gap-2 font-medium text-slate-700 cursor-pointer';
            lbl.innerHTML = '<input type="checkbox" name="user_mapel_opt" value="' + m + '" class="rounded text-indigo-600"> ' + m;
            containerMapel.appendChild(lbl);
        });
    }

    toggleUserClassSelect();
    document.getElementById('modal-user').classList.remove('hidden');
}

function closeModalUser(e) {
    if (e) e.preventDefault();
    document.getElementById('modal-user').classList.add('hidden');
}

function toggleUserClassSelect() {
    var role = document.getElementById('user-form-role').value;
    var grpKelas = document.getElementById('group-user-kelas');
    var grpMapel = document.getElementById('group-user-mapel');

    if (grpKelas) grpKelas.classList.add('hidden');
    if (grpMapel) grpMapel.classList.add('hidden');

    if (role === 'walikelas') {
        if (grpKelas) grpKelas.classList.remove('hidden');
    } else if (role === 'gurumapel') {
        if (grpMapel) grpMapel.classList.remove('hidden');
    }
}

async function handleSaveUser(e) {
    if (e) e.preventDefault();

    var namaInput = document.getElementById('user-form-nama').value.trim();
    var passInput = document.getElementById('user-form-password').value.trim();
    var roleInput = document.getElementById('user-form-role').value;

    if (!namaInput || !passInput) {
        alert("Nama Pengguna dan Password wajib diisi!");
        return;
    }

    if (passInput.length < 6) {
        alert("Password minimal harus 6 karakter untuk standar keamanan Firebase!");
        return;
    }

    // Buat username bersih & email Firebase
    var cleanUsername = namaInput.trim().toLowerCase().replace(/\s+/g, '');
    var emailFirebase = formatUserEmail(cleanUsername);

    // Ambil data kelas/mapel yang dicentang
    var selectedClassIds = [];
    document.querySelectorAll('input[name="user_kelas_opt"]:checked').forEach(function(cb) {
        selectedClassIds.push(cb.value);
    });

    var selectedMapels = [];
    document.querySelectorAll('input[name="user_mapel_opt"]:checked').forEach(function(cb) {
        selectedMapels.push(cb.value);
    });

    // 1. Daftarkan akun ke Firebase Auth secara langsung
    try {
        if (auth) {
            await auth.createUserWithEmailAndPassword(emailFirebase, passInput);
        }
    } catch (authErr) {
        console.warn("Catatan Firebase Auth:", authErr);
        if (authErr.code === 'auth/email-already-in-use') {
            // Jika akun sudah ada di Firebase Auth, abaikan error dan lanjut simpan profil
        } else if (authErr.code === 'auth/weak-password') {
            alert("Password terlalu pendek! Gunakan minimal 6 karakter.");
            return;
        }
    }

    // 2. Simpan profil pengguna ke Realtime Database (appState.users)
    var newUser = {
        id: "u_" + Date.now(),
        username: cleanUsername,
        nama: namaInput,
        role: roleInput,
        classIds: selectedClassIds,
        assignedMapels: selectedMapels
    };

    var existIndex = (appState.users || []).findIndex(function(u) {
        return (u.username || u.nama || "").toLowerCase() === cleanUsername;
    });

    if (existIndex >= 0) {
        appState.users[existIndex] = newUser;
    } else {
        if (!appState.users) appState.users = [];
        appState.users.push(newUser);
    }

    saveAppState();
    closeModalUser();
    renderMasterUsersTable();
    showToast("Akun pengguna berhasil ditambahkan & siap digunakan login!");
}

function handleDeleteUser(userId) {
    if (!confirm("Apakah Anda yakin ingin menghapus akun pengguna ini?")) return;
    appState.users = (appState.users || []).filter(function(u) { return u.id !== userId; });
    saveAppState();
    renderMasterUsersTable();
    showToast("Akun pengguna berhasil dihapus.");
}

// Manajemen Kelas & Mapel
function renderMasterKelasList() {
    var container = document.getElementById('master-kelas-list-container');
    if (!container) return;
    container.innerHTML = '';

    (appState.classes || []).forEach(function(c) {
        var div = document.createElement('div');
        div.className = "flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold";
        div.innerHTML = 
            '<span><i class="fa-solid fa-door-open text-indigo-600 mr-2"></i>' + c.name + '</span>' +
            '<div class="flex items-center gap-1">' +
                '<button type="button" onclick="openModalKelas(\'' + c.id + '\', \'' + c.name + '\')" class="text-indigo-600 hover:text-indigo-800 p-1"><i class="fa-solid fa-pen"></i></button>' +
                '<button type="button" onclick="handleDeleteKelas(\'' + c.id + '\')" class="text-rose-600 hover:text-rose-800 p-1"><i class="fa-solid fa-trash"></i></button>' +
            '</div>';
        container.appendChild(div);
    });
}

function handleAddKelas(e) {
    if (e) e.preventDefault();
    var input = document.getElementById('input-nama-kelas-baru');
    var val = input.value.trim();
    if (!val) return;

    var newClass = {
        id: "K_" + Date.now(),
        name: val
    };

    if (!appState.classes) appState.classes = [];
    appState.classes.push(newClass);
    saveAppState();
    input.value = '';
    renderMasterKelasList();
    populateDropdowns();
    showToast("Kelas baru berhasil ditambahkan!");
}

function openModalKelas(id, currentName) {
    document.getElementById('edit-kelas-id').value = id;
    document.getElementById('edit-kelas-nama').value = currentName;
    document.getElementById('modal-edit-kelas').classList.remove('hidden');
}

function closeModalKelas(e) {
    if (e) e.preventDefault();
    document.getElementById('modal-edit-kelas').classList.add('hidden');
}

function handleSaveEditKelas(e) {
    if (e) e.preventDefault();
    var id = document.getElementById('edit-kelas-id').value;
    var newName = document.getElementById('edit-kelas-nama').value.trim();

    var target = (appState.classes || []).find(function(c) { return c.id === id; });
    if (target) {
        target.name = newName;
        saveAppState();
        renderMasterKelasList();
        populateDropdowns();
        closeModalKelas();
        showToast("Nama kelas berhasil diperbarui!");
    }
}

function handleDeleteKelas(classId) {
    if (!confirm("Apakah Anda yakin ingin menghapus kelas ini?")) return;
    appState.classes = (appState.classes || []).filter(function(c) { return c.id !== classId; });
    saveAppState();
    renderMasterKelasList();
    populateDropdowns();
    showToast("Kelas berhasil dihapus.");
}

function renderMasterMapelList() {
    var container = document.getElementById('master-mapel-list-container');
    if (!container) return;
    container.innerHTML = '';

    (appState.mapels || []).forEach(function(m, idx) {
        var div = document.createElement('div');
        div.className = "flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold";
        div.innerHTML = 
            '<span><i class="fa-solid fa-book text-amber-600 mr-2"></i>' + m + '</span>' +
            '<button type="button" onclick="handleDeleteMapel(' + idx + ')" class="text-rose-600 hover:text-rose-800 p-1"><i class="fa-solid fa-trash"></i></button>';
        container.appendChild(div);
    });
}

function handleAddMapel(e) {
    if (e) e.preventDefault();
    var input = document.getElementById('input-nama-mapel-baru');
    var val = input.value.trim();
    if (!val) return;

    if (!appState.mapels) appState.mapels = [];
    appState.mapels.push(val);
    saveAppState();
    input.value = '';
    renderMasterMapelList();
    populateDropdowns();
    showToast("Mata pelajaran baru berhasil ditambahkan!");
}

function handleDeleteMapel(idx) {
    if (!confirm("Hapus mata pelajaran ini?")) return;
    appState.mapels.splice(idx, 1);
    saveAppState();
    renderMasterMapelList();
    populateDropdowns();
    showToast("Mata pelajaran berhasil dihapus.");
}

// Manajemen Data Siswa
function renderMasterSiswaTable() {
    var tbody = document.getElementById('master-siswa-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    var searchVal = (document.getElementById('master-siswa-search') ? document.getElementById('master-siswa-search').value : '').toLowerCase();
    var filterKelas = document.getElementById('master-siswa-filter-kelas') ? document.getElementById('master-siswa-filter-kelas').value : 'ALL';

    var filtered = (appState.students || []).filter(function(s) {
        var matchSearch = s.nama.toLowerCase().includes(searchVal) || (s.nisn || '').toLowerCase().includes(searchVal) || (s.ketunaan || '').toLowerCase().includes(searchVal);
        var matchKelas = (filterKelas === 'ALL') || (s.classId === filterKelas);
        return matchSearch && matchKelas;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="p-4 text-center text-slate-400 font-medium">Data siswa tidak ditemukan.</td></tr>';
        return;
    }

    filtered.forEach(function(s, idx) {
        var tr = document.createElement('tr');
        tr.className = "hover:bg-slate-50 transition border-b border-slate-100";
        tr.innerHTML = 
            '<td class="p-3 text-center text-slate-500 font-bold">' + (idx + 1) + '</td>' +
            '<td class="p-3 font-semibold text-slate-700">' + (s.nisn || '-') + '</td>' +
            '<td class="p-3 font-bold text-slate-800">' + s.nama + '</td>' +
            '<td class="p-3 text-center"><span class="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-lg text-[10px] font-bold border border-indigo-200">' + (s.ketunaan || '-') + '</span></td>' +
            '<td class="p-3 text-slate-600 font-medium">' + getClassName(s.classId) + '</td>' +
            '<td class="p-3 text-center space-x-1">' +
                '<button type="button" onclick="openModalSiswa(event, \'' + s.id + '\')" class="text-indigo-600 hover:text-indigo-800 p-1" title="Edit"><i class="fa-solid fa-pen-to-square"></i></button>' +
                '<button type="button" onclick="handleDeleteSiswa(\'' + s.id + '\')" class="text-rose-600 hover:text-rose-800 p-1" title="Hapus"><i class="fa-solid fa-trash"></i></button>' +
            '</td>';
        tbody.appendChild(tr);
    });
}

function openModalSiswa(e, siswaId) {
    if (e) e.preventDefault();
    var formId = document.getElementById('siswa-form-id');
    var formNisn = document.getElementById('siswa-form-nisn');
    var formNama = document.getElementById('siswa-form-nama');
    var formKelas = document.getElementById('siswa-form-kelas');

    // Populate dropdown kelas
    if (formKelas) {
        formKelas.innerHTML = '';
        (appState.classes || []).forEach(function(c) {
            var opt = document.createElement('option');
            opt.value = c.id;
            opt.innerText = c.name;
            formKelas.appendChild(opt);
        });
    }

    // Reset checkboxes ketunaan
    document.querySelectorAll('input[name="ketunaan_opt"]').forEach(function(cb) { cb.checked = false; });

    if (siswaId) {
        document.getElementById('modal-siswa-title').innerText = "Edit Data Siswa";
        var s = (appState.students || []).find(function(item) { return item.id === siswaId; });
        if (s) {
            formId.value = s.id;
            formNisn.value = s.nisn || '';
            formNama.value = s.nama;
            formKelas.value = s.classId;

            if (s.ketunaan) {
                var listKet = s.ketunaan.split(', ');
                document.querySelectorAll('input[name="ketunaan_opt"]').forEach(function(cb) {
                    if (listKet.includes(cb.value)) cb.checked = true;
                });
            }
        }
    } else {
        document.getElementById('modal-siswa-title').innerText = "Tambah Siswa Baru";
        formId.value = '';
        formNisn.value = '';
        formNama.value = '';
    }

    document.getElementById('modal-siswa').classList.remove('hidden');
}

function closeModalSiswa(e) {
    if (e) e.preventDefault();
    document.getElementById('modal-siswa').classList.add('hidden');
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

    if (!nama) {
        alert("Nama siswa wajib diisi!");
        return;
    }

    var ketunaanStr = selectedKetunaan.join(', ') || 'Tuna Grahita';

    if (id) {
        var s = (appState.students || []).find(function(item) { return item.id === id; });
        if (s) {
            s.nisn = nisn;
            s.nama = nama;
            s.ketunaan = ketunaanStr;
            s.classId = classId;
        }
    } else {
        var newSiswa = {
            id: "s_" + Date.now(),
            nisn: nisn,
            nama: nama,
            ketunaan: ketunaanStr,
            classId: classId
        };
        if (!appState.students) appState.students = [];
        appState.students.push(newSiswa);
    }

    saveAppState();
    closeModalSiswa();
    renderMasterSiswaTable();
    showToast("Data siswa berhasil disimpan!");
}

function handleDeleteSiswa(siswaId) {
    if (!confirm("Hapus data siswa ini?")) return;
    appState.students = (appState.students || []).filter(function(s) { return s.id !== siswaId; });
    saveAppState();
    renderMasterSiswaTable();
    showToast("Data siswa berhasil dihapus.");
}

function populateDropdowns() {
    // Populate dropdowns di berbagai modul
    var pKelas = document.getElementById('presensi-kelas-select');
    var jKelas = document.getElementById('jurnal-kelas-select');
    var jMapel = document.getElementById('jurnal-mapel-select');
    var rKelas = document.getElementById('filter-rekap-kelas');
    var eKelas = document.getElementById('filter-eval-kelas');
    var mSiswaKelas = document.getElementById('master-siswa-filter-kelas');

    if (pKelas) {
        pKelas.innerHTML = '';
        (appState.classes || []).forEach(function(c) {
            pKelas.innerHTML += '<option value="' + c.id + '">' + c.name + '</option>';
        });
    }

    if (jKelas) {
        jKelas.innerHTML = '';
        (appState.classes || []).forEach(function(c) {
            jKelas.innerHTML += '<option value="' + c.id + '">' + c.name + '</option>';
        });
    }

    if (jMapel) {
        jMapel.innerHTML = '';
        (appState.mapels || []).forEach(function(m) {
            jMapel.innerHTML += '<option value="' + m + '">' + m + '</option>';
        });
    }

    if (rKelas) {
        rKelas.innerHTML = '<option value="ALL">Semua Kelas</option>';
        (appState.classes || []).forEach(function(c) {
            rKelas.innerHTML += '<option value="' + c.id + '">' + c.name + '</option>';
        });
    }

    if (eKelas) {
        eKelas.innerHTML = '<option value="ALL">Semua Kelas</option>';
        (appState.classes || []).forEach(function(c) {
            eKelas.innerHTML += '<option value="' + c.id + '">' + c.name + '</option>';
        });
    }

    if (mSiswaKelas) {
        mSiswaKelas.innerHTML = '<option value="ALL">Semua Kelas</option>';
        (appState.classes || []).forEach(function(c) {
            mSiswaKelas.innerHTML += '<option value="' + c.id + '">' + c.name + '</option>';
        });
    }
}
