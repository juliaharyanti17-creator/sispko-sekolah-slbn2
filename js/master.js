// Logika Pengaturan Master Data (User, Kelas, Mapel, Siswa)
function populateDropdowns() {
    const presensiClassSelect = document.getElementById('presensi-kelas-select');
    const jurnalClassSelect = document.getElementById('jurnal-kelas-select');
    const jurnalMapelSelect = document.getElementById('jurnal-mapel-select');
    const filterEvalKelasSelect = document.getElementById('filter-eval-kelas');
    const filterRekapKelasSelect = document.getElementById('filter-rekap-kelas');
    const filterJurnalSelect = document.getElementById('filter-jurnal-kelas');
    const evalJurnalFilterKelas = document.getElementById('eval-jurnal-filter-kelas');
    const filterMasterSiswaSelect = document.getElementById('master-siswa-filter-kelas');
    const formSiswaKelasSelect = document.getElementById('siswa-form-kelas');
    const evalTargetGuruSelect = document.getElementById('eval-input-target-guru');
    const evalTargetMapelSelect = document.getElementById('eval-input-target-mapel');
    const filterFeedGuruSelect = document.getElementById('filter-feed-guru');

    let allClassOptions = '';
    (appState.classes || []).forEach(c => {
        allClassOptions += `<option value="${c.id}">${c.name}</option>`;
    });

    let teacherClassOptions = '';
    if (appState.currentUser && appState.currentUser.role === 'walikelas') {
        const teacherClassIds = appState.currentUser.classIds || (appState.currentUser.classId ? [appState.currentUser.classId] : []);
        const filteredClasses = (appState.classes || []).filter(c => teacherClassIds.includes(c.id));
        filteredClasses.forEach(c => { teacherClassOptions += `<option value="${c.id}">${c.name}</option>`; });
    } else {
        teacherClassOptions = allClassOptions;
    }

    if (presensiClassSelect) presensiClassSelect.innerHTML = teacherClassOptions || `<option value="">Tidak ada kelas diampu</option>`;
    if (jurnalClassSelect) jurnalClassSelect.innerHTML = teacherClassOptions || `<option value="">Tidak ada kelas diampu</option>`;
    if (formSiswaKelasSelect) formSiswaKelasSelect.innerHTML = allClassOptions || `<option value="">Belum Ada Kelas</option>`;
    
    if (filterJurnalSelect) {
        filterJurnalSelect.innerHTML = (appState.currentUser && appState.currentUser.role === 'walikelas')
            ? `<option value="ALL">Semua Kelas Tanggungan</option>` + teacherClassOptions
            : `<option value="ALL">Semua Kelas</option>` + allClassOptions;
    }

    if (evalJurnalFilterKelas) evalJurnalFilterKelas.innerHTML = `<option value="ALL">Semua Kelas</option>` + allClassOptions;
    if (filterMasterSiswaSelect) filterMasterSiswaSelect.innerHTML = `<option value="ALL">Semua Kelas</option>` + allClassOptions;
    if (filterEvalKelasSelect) filterEvalKelasSelect.innerHTML = `<option value="ALL">Semua Kelas</option>` + allClassOptions;
    if (filterRekapKelasSelect) filterRekapKelasSelect.innerHTML = `<option value="ALL">Semua Kelas</option>` + allClassOptions;

    let mapelOptions = '';
    (appState.mapels || []).forEach(m => { mapelOptions += `<option value="${m}">${m}</option>`; });
    if (jurnalMapelSelect) jurnalMapelSelect.innerHTML = mapelOptions || `<option value="">Belum Ada Mapel</option>`;
    if (evalTargetMapelSelect) evalTargetMapelSelect.innerHTML = `<option value="Semua Mapel">Semua Mapel / General</option>` + mapelOptions;

    const guruList = (appState.users || []).filter(u => u.role === 'walikelas');
    let guruOptions = '';
    guruList.forEach(g => { guruOptions += `<option value="${g.nama}">${g.nama}</option>`; });
    if (evalTargetGuruSelect) evalTargetGuruSelect.innerHTML = guruOptions || `<option value="">Belum Ada Guru Registered</option>`;
    if (filterFeedGuruSelect) filterFeedGuruSelect.innerHTML = `<option value="ALL">Semua Guru</option>` + guruOptions;

    updateTargetKelasDropdown();
    renderUserFormClassCheckboxes();
}

function updateTargetKelasDropdown() {
    const evalTargetGuruSelect = document.getElementById('eval-input-target-guru');
    const evalTargetKelasSelect = document.getElementById('eval-input-target-kelas');
    if (!evalTargetGuruSelect || !evalTargetKelasSelect) return;

    const selectedGuruName = evalTargetGuruSelect.value;
    const guruUser = (appState.users || []).find(u => u.nama === selectedGuruName);
    evalTargetKelasSelect.innerHTML = '';

    if (guruUser && guruUser.role === 'walikelas') {
        const classIds = guruUser.classIds || (guruUser.classId ? [guruUser.classId] : []);
        if (classIds.length > 0) {
            evalTargetKelasSelect.innerHTML = `<option value="Semua Kelas">Semua Kelas Diampu</option>`;
            classIds.forEach(cId => { evalTargetKelasSelect.innerHTML += `<option value="${cId}">${getClassName(cId)}</option>`; });
        } else {
            evalTargetKelasSelect.innerHTML = `<option value="Semua Kelas">Semua Kelas / General</option>`;
        }
    } else {
        evalTargetKelasSelect.innerHTML = `<option value="Semua Kelas">Semua Kelas / General</option>`;
    }
}

function renderUserFormClassCheckboxes() {
    const container = document.getElementById('user-form-kelas-checkboxes');
    if (!container) return;
    container.innerHTML = '';
    (appState.classes || []).forEach(c => {
        const label = document.createElement('label');
        label.className = "flex items-center gap-2 font-medium text-slate-700 cursor-pointer";
        label.innerHTML = `<input type="checkbox" name="user_class_opt" value="${c.id}" class="rounded text-indigo-600"> ${c.name}`;
        container.appendChild(label);
    });
}

function openModalUser(e) {
    if (e) e.preventDefault();
    document.getElementById('user-form-nama').value = '';
    document.getElementById('user-form-password').value = '';
    document.getElementById('user-form-role').value = 'walikelas';
    document.querySelectorAll('input[name="user_class_opt"]').forEach(cb => cb.checked = false);
    toggleUserClassSelect();
    document.getElementById('modal-user').classList.remove('hidden');
}

function closeModalUser(e) {
    if (e) e.preventDefault();
    document.getElementById('modal-user').classList.add('hidden');
}

function toggleUserClassSelect() {
    const role = document.getElementById('user-form-role').value;
    const group = document.getElementById('group-user-kelas');
    if (role === 'walikelas') group.classList.remove('hidden');
    else group.classList.add('hidden');
}

function handleSaveUser(e) {
    if (e) e.preventDefault();
    const nama = document.getElementById('user-form-nama').value.trim();
    const password = document.getElementById('user-form-password').value.trim();
    const role = document.getElementById('user-form-role').value;

    const selectedClassIds = role === 'walikelas' 
        ? Array.from(document.querySelectorAll('input[name="user_class_opt"]:checked')).map(cb => cb.value)
        : [];

    const newUser = { id: "u" + Date.now(), username: nama.toLowerCase().replace(/\s+/g, ''), nama, password, role, classIds: selectedClassIds };
    if (!appState.users) appState.users = [];
    appState.users.push(newUser);
    saveAppState();
    populateDropdowns();
    renderMasterUsersTable();
    closeModalUser(e);
    showToast(`Akun "${nama}" berhasil ditambahkan!`);
}

function renderMasterUsersTable() {
    const tbody = document.getElementById('master-users-table-body');
    tbody.innerHTML = '';
    (appState.users || []).forEach((u) => {
        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-50 transition";
        const roleBadge = u.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : (u.role === 'kepsek' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800');
        
        let assignedClasses = '-';
        if (u.role === 'walikelas') {
            const cList = u.classIds || (u.classId ? [u.classId] : []);
            assignedClasses = cList.map(id => getClassName(id)).join(', ') || 'Belum diatur';
        }

        tr.innerHTML = `
            <td class="p-3 font-bold text-slate-800">${u.nama}</td>
            <td class="p-3 text-center"><span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${roleBadge}">${u.role}</span></td>
            <td class="p-3 text-slate-600">${assignedClasses}</td>
            <td class="p-3 text-center">
                <button type="button" onclick="deleteUser(event, '${u.id}')" class="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer" title="Hapus User">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function deleteUser(e, id) {
    if (e) e.preventDefault();
    if (confirm("Apakah Anda yakin ingin menghapus akun pengguna ini?")) {
        appState.users = appState.users.filter(u => u.id !== id);
        saveAppState();
        populateDropdowns();
        renderMasterUsersTable();
        showToast("Akun berhasil dihapus.");
    }
}

function handleAddKelas(e) {
    if (e) e.preventDefault();
    const input = document.getElementById('input-nama-kelas-baru');
    const nameVal = input.value.trim();
    if (nameVal) {
        const newClass = { id: "K" + Date.now(), name: nameVal };
        if (!appState.classes) appState.classes = [];
        appState.classes.push(newClass);
        saveAppState();
        populateDropdowns();
        renderMasterKelasList();
        input.value = '';
        showToast(`Kelas "${nameVal}" ditambahkan!`);
    }
}

function renderMasterKelasList() {
    const container = document.getElementById('master-kelas-list-container');
    container.innerHTML = '';
    (appState.classes || []).forEach(c => {
        const studentCount = (appState.students || []).filter(s => s.classId === c.id).length;
        const div = document.createElement('div');
        div.className = "flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs";
        div.innerHTML = `
            <div><strong class="text-slate-800 font-bold block">${c.name}</strong><span class="text-[10px] text-slate-400 font-medium">${studentCount} Siswa</span></div>
            <div class="flex items-center gap-1.5">
                <button type="button" onclick="openModalEditKelas(event, '${c.id}', '${c.name}')" class="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg"><i class="fa-solid fa-pen-to-square"></i></button>
                <button type="button" onclick="deleteKelas(event, '${c.id}', '${c.name}')" class="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"><i class="fa-solid fa-trash-can"></i></button>
            </div>
        `;
        container.appendChild(div);
    });
}

function openModalEditKelas(e, id, currentName) {
    if (e) e.preventDefault();
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
    const id = document.getElementById('edit-kelas-id').value;
    const newName = document.getElementById('edit-kelas-nama').value.trim();
    const targetClass = (appState.classes || []).find(c => c.id === id);
    if (targetClass && newName) {
        targetClass.name = newName;
        saveAppState();
        populateDropdowns();
        renderMasterKelasList();
        renderMasterSiswaTable();
        closeModalKelas(e);
        showToast(`Nama kelas diperbarui!`);
    }
}

function deleteKelas(e, id, className) {
    if (e) e.preventDefault();
    const studentCount = (appState.students || []).filter(s => s.classId === id).length;
    if (studentCount > 0) {
        alert(`Tidak dapat menghapus kelas karena masih ada ${studentCount} siswa.`);
        return;
    }
    if (confirm(`Hapus kelas "${className}"?`)) {
        appState.classes = (appState.classes || []).filter(c => c.id !== id);
        saveAppState();
        populateDropdowns();
        renderMasterKelasList();
        showToast(`Kelas dihapus.`);
    }
}

function handleAddMapel(e) {
    if (e) e.preventDefault();
    const input = document.getElementById('input-nama-mapel-baru');
    const nameVal = input.value.trim();
    if (nameVal) {
        if (!appState.mapels) appState.mapels = [];
        if (!appState.mapels.includes(nameVal)) {
            appState.mapels.push(nameVal);
            saveAppState();
            populateDropdowns();
            renderMasterMapelList();
            input.value = '';
            showToast(`Mata pelajaran ditambahkan!`);
        }
    }
}

function renderMasterMapelList() {
    const container = document.getElementById('master-mapel-list-container');
    container.innerHTML = '';
    (appState.mapels || []).forEach((m) => {
        const div = document.createElement('div');
        div.className = "flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs";
        div.innerHTML = `<span class="text-slate-800 font-bold">${m}</span><button type="button" onclick="deleteMapel(event, '${m}')" class="p-1 text-rose-500 hover:bg-rose-50 rounded-lg"><i class="fa-solid fa-trash-can"></i></button>`;
        container.appendChild(div);
    });
}

function deleteMapel(e, mapelName) {
    if (e) e.preventDefault();
    if (confirm(`Hapus mata pelajaran "${mapelName}"?`)) {
        appState.mapels = (appState.mapels || []).filter(m => m !== mapelName);
        saveAppState();
        populateDropdowns();
        renderMasterMapelList();
        showToast(`Mapel dihapus.`);
    }
}

function renderMasterSiswaTable() {
    const filterKelas = document.getElementById('master-siswa-filter-kelas').value;
    const searchText = document.getElementById('master-siswa-search').value.toLowerCase();
    const tbody = document.getElementById('master-siswa-table-body');

    let filtered = (appState.students || []).filter(s => {
        const matchKelas = filterKelas === 'ALL' || s.classId === filterKelas;
        const matchSearch = s.name.toLowerCase().includes(searchText) || s.nisn.includes(searchText);
        return matchKelas && matchSearch;
    });

    tbody.innerHTML = '';
    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-slate-400 font-medium">Tidak ada data siswa.</td></tr>`;
        return;
    }

    filtered.forEach((s, idx) => {
        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-50 transition";
        tr.innerHTML = `
            <td class="p-3 text-center text-slate-400 font-bold">${idx + 1}</td>
            <td class="p-3 font-semibold text-slate-600">${s.nisn}</td>
            <td class="p-3 font-extrabold text-slate-800">${s.name}</td>
            <td class="p-3 text-center"><span class="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[10px]">${s.ketunaan || '-'}</span></td>
            <td class="p-3"><span class="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold text-[10px]">${getClassName(s.classId)}</span></td>
            <td class="p-3 text-center space-x-1">
                <button type="button" onclick="openModalSiswa(event, '${s.id}')" class="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg"><i class="fa-solid fa-user-pen"></i></button>
                <button type="button" onclick="deleteSiswa(event, '${s.id}', '${s.name}')" class="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"><i class="fa-solid fa-trash-can"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function openModalSiswa(e, id = null) {
    if (e) e.preventDefault();
    const modal = document.getElementById('modal-siswa');
    const title = document.getElementById('modal-siswa-title');
    const formKelasSelect = document.getElementById('siswa-form-kelas');

    formKelasSelect.innerHTML = (appState.classes || []).map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    const checkboxes = document.querySelectorAll('input[name="ketunaan_opt"]');
    checkboxes.forEach(cb => cb.checked = false);

    if (id) {
        const student = (appState.students || []).find(s => s.id === id);
        if (student) {
            title.innerHTML = `<i class="fa-solid fa-user-pen text-indigo-600 mr-1.5"></i> Edit Data Siswa SLB`;
            document.getElementById('siswa-form-id').value = student.id;
            document.getElementById('siswa-form-nisn').value = student.nisn;
            document.getElementById('siswa-form-nama').value = student.name;
            document.getElementById('siswa-form-kelas').value = student.classId;

            if (student.ketunaan) {
                const savedKetunaanList = student.ketunaan.split(', ').map(item => item.trim());
                checkboxes.forEach(cb => { if (savedKetunaanList.includes(cb.value)) cb.checked = true; });
            }
        }
    } else {
        title.innerHTML = `<i class="fa-solid fa-user-plus text-emerald-600 mr-1.5"></i> Tambah Siswa Baru SLB`;
        document.getElementById('siswa-form-id').value = '';
        document.getElementById('siswa-form-nisn').value = '';
        document.getElementById('siswa-form-nama').value = '';
        if (appState.classes && appState.classes.length > 0) {
            document.getElementById('siswa-form-kelas').value = appState.classes[0].id;
        }
    }
    modal.classList.remove('hidden');
}

function closeModalSiswa(e) {
    if (e) e.preventDefault();
    document.getElementById('modal-siswa').classList.add('hidden');
}

function handleSaveSiswa(e) {
    if (e) e.preventDefault();
    const id = document.getElementById('siswa-form-id').value;
    const nisn = document.getElementById('siswa-form-nisn').value.trim();
    const name = document.getElementById('siswa-form-nama').value.trim();
    const classId = document.getElementById('siswa-form-kelas').value;

    const selectedKetunaan = Array.from(document.querySelectorAll('input[name="ketunaan_opt"]:checked'))
        .map(cb => cb.value).join(', ') || 'Belum diisi';

    if (id) {
        const student = (appState.students || []).find(s => s.id === id);
        if (student) {
            student.nisn = nisn; student.name = name; student.ketunaan = selectedKetunaan; student.classId = classId;
            showToast(`Data siswa diperbarui!`);
        }
    } else {
        const newStudent = { id: "S" + Date.now(), nisn, name, ketunaan: selectedKetunaan, classId };
        if (!appState.students) appState.students = [];
        appState.students.push(newStudent);
        showToast(`Siswa baru ditambahkan!`);
    }

    saveAppState();
    renderMasterSiswaTable();
    renderMasterKelasList();
    closeModalSiswa(e);
}

function deleteSiswa(e, id, name) {
    if (e) e.preventDefault();
    if (confirm(`Hapus data siswa "${name}"?`)) {
        appState.students = (appState.students || []).filter(s => s.id !== id);
        saveAppState();
        renderMasterSiswaTable();
        renderMasterKelasList();
        showToast(`Data siswa dihapus.`);
    }
}
