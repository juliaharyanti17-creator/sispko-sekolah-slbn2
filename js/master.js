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

    // Filter mapel berdasarkan role user yang login
    let mapelOptions = '';
    let availableMapels = appState.mapels || [];
    
    if (appState.currentUser && appState.currentUser.role === 'gurumapel') {
        availableMapels = appState.currentUser.assignedMapels || [];
    } else if (appState.currentUser && appState.currentUser.role === 'walikelas') {
        // Wali Kelas tidak menampilkan mapel yang khusus diampu oleh Guru Mapel
        const allSpecialMapels = [];
        (appState.users || []).forEach(u => {
            if (u.role === 'gurumapel' && u.assignedMapels) {
                allSpecialMapels.push(...u.assignedMapels);
            }
        });
        availableMapels = availableMapels.filter(m => !allSpecialMapels.includes(m));
    }

    availableMapels.forEach(m => { mapelOptions += `<option value="${m}">${m}</option>`; });
    if (jurnalMapelSelect) jurnalMapelSelect.innerHTML = mapelOptions || `<option value="">Belum Ada Mapel</option>`;
    if (evalTargetMapelSelect) evalTargetMapelSelect.innerHTML = `<option value="Semua Mapel">Semua Mapel / General</option>` + mapelOptions;

    const guruList = (appState.users || []).filter(u => u.role === 'walikelas' || u.role === 'gurumapel');
    let guruOptions = '';
    guruList.forEach(g => { guruOptions += `<option value="${g.nama}">${g.nama}</option>`; });
    if (evalTargetGuruSelect) evalTargetGuruSelect.innerHTML = guruOptions || `<option value="">Belum Ada Guru Registered</option>`;
    if (filterFeedGuruSelect) filterFeedGuruSelect.innerHTML = `<option value="ALL">Semua Guru</option>` + guruOptions;

    updateTargetKelasDropdown();
    renderUserFormClassCheckboxes();
    renderUserFormMapelCheckboxes();
}

function renderUserFormMapelCheckboxes() {
    const container = document.getElementById('user-form-mapel-checkboxes');
    if (!container) return;
    container.innerHTML = '';
    (appState.mapels || []).forEach(m => {
        const label = document.createElement('label');
        label.className = "flex items-center gap-2 font-medium text-slate-700 cursor-pointer";
        label.innerHTML = `<input type="checkbox" name="user_mapel_opt" value="${m}" class="rounded text-indigo-600"> ${m}`;
        container.appendChild(label);
    });
}

function openModalUser(e) {
    if (e) e.preventDefault();
    document.getElementById('user-form-nama').value = '';
    document.getElementById('user-form-password').value = '';
    document.getElementById('user-form-role').value = 'walikelas';
    document.querySelectorAll('input[name="user_class_opt"]').forEach(cb => cb.checked = false);
    document.querySelectorAll('input[name="user_mapel_opt"]').forEach(cb => cb.checked = false);
    toggleUserClassSelect();
    document.getElementById('modal-user').classList.remove('hidden');
}

function closeModalUser(e) {
    if (e) e.preventDefault();
    document.getElementById('modal-user').classList.add('hidden');
}

function toggleUserClassSelect() {
    const role = document.getElementById('user-form-role').value;
    const groupKelas = document.getElementById('group-user-kelas');
    const groupMapel = document.getElementById('group-user-mapel');
    
    if (role === 'walikelas') {
        if (groupKelas) groupKelas.classList.remove('hidden');
        if (groupMapel) groupMapel.classList.add('hidden');
    } else if (role === 'gurumapel') {
        if (groupKelas) groupKelas.classList.add('hidden');
        if (groupMapel) groupMapel.classList.remove('hidden');
    } else {
        if (groupKelas) groupKelas.classList.add('hidden');
        if (groupMapel) groupMapel.classList.add('hidden');
    }
}

function handleSaveUser(e) {
    if (e) e.preventDefault();
    const nama = document.getElementById('user-form-nama').value.trim();
    const password = document.getElementById('user-form-password').value.trim();
    const role = document.getElementById('user-form-role').value;

    const selectedClassIds = role === 'walikelas' 
        ? Array.from(document.querySelectorAll('input[name="user_class_opt"]:checked')).map(cb => cb.value)
        : [];

    const selectedMapels = role === 'gurumapel'
        ? Array.from(document.querySelectorAll('input[name="user_mapel_opt"]:checked')).map(cb => cb.value)
        : [];

    const newUser = { 
        id: "u" + Date.now(), 
        username: nama.toLowerCase().replace(/\s+/g, ''), 
        nama, 
        password, 
        role, 
        classIds: selectedClassIds,
        assignedMapels: selectedMapels
    };

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
    if (!tbody) return;
    tbody.innerHTML = '';
    (appState.users || []).forEach((u) => {
        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-50 transition";
        let roleBadge = 'bg-emerald-100 text-emerald-800';
        if (u.role === 'admin') roleBadge = 'bg-indigo-100 text-indigo-700';
        else if (u.role === 'kepsek') roleBadge = 'bg-amber-100 text-amber-800';
        else if (u.role === 'gurumapel') roleBadge = 'bg-purple-100 text-purple-800';
        
        let assignedInfo = '-';
        if (u.role === 'walikelas') {
            const cList = u.classIds || (u.classId ? [u.classId] : []);
            assignedInfo = 'Kelas: ' + (cList.map(id => getClassName(id)).join(', ') || 'Belum diatur');
        } else if (u.role === 'gurumapel') {
            assignedInfo = 'Mapel: ' + ((u.assignedMapels || []).join(', ') || 'Belum diatur');
        }

        tr.innerHTML = `
            <td class="p-3 font-bold text-slate-800">${u.nama}</td>
            <td class="p-3 text-center"><span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${roleBadge}">${u.role}</span></td>
            <td class="p-3 text-slate-600">${assignedInfo}</td>
            <td class="p-3 text-center">
                <button type="button" onclick="deleteUser(event, '${u.id}')" class="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer" title="Hapus User">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}
