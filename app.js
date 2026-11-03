// ==========================================================================
// SIMPATIK SLBN 2 PELAIHARI - MAIN APPLICATION LOGIC (app.js)
// ==========================================================================

document.addEventListener('DOMContentLoaded', function() {
    initAppEvents();
});

// --------------------------------------------------------------------------
// 1. INISIALISASI & EVENT LISTENERS FORM
// --------------------------------------------------------------------------
function initAppEvents() {
    // Form Login Event
    const loginForm = document.getElementById('loginForm') || document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const usernameInput = document.getElementById('username') || document.getElementById('loginUsername');
            const passwordInput = document.getElementById('password') || document.getElementById('loginPassword');
            
            const username = usernameInput ? usernameInput.value.trim() : '';
            const password = passwordInput ? passwordInput.value.trim() : '';

            handleLogin(username, password);
        });
    }

    // Tombol Logout Event
    const logoutBtn = document.getElementById('logoutBtn') || document.getElementById('btnLogout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleLogout();
        });
    }

    // Form Tambah / Edit Murid Event
    const studentForm = document.getElementById('studentForm') || document.getElementById('formStudent');
    if (studentForm) {
        studentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveStudentForm();
        });
    }

    // Form Tambah / Edit Kelas Event
    const classForm = document.getElementById('classForm') || document.getElementById('formClass');
    if (classForm) {
        classForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveClassForm();
        });
    }

    // Form Jurnal Event
    const journalForm = document.getElementById('journalForm') || document.getElementById('formJournal');
    if (journalForm) {
        journalForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveJournalForm();
        });
    }

    // Form Presensi Event
    const presensiForm = document.getElementById('presensiForm') || document.getElementById('formPresensi');
    if (presensiForm) {
        presensiForm.addEventListener('submit', function(e) {
            e.preventDefault();
            savePresensiForm();
        });
    }
}

// --------------------------------------------------------------------------
// 2. OTENTIKASI & SESI PENGGUNA (SISTEM PERTAHANAN REFRESH)
// --------------------------------------------------------------------------
function handleLogin(username, password) {
    if (!username || !password) {
        alert("Harap isi nama pengguna dan kata sandi!");
        return;
    }

    const users = window.appState.users || [];
    
    // Cari pengguna berdasarkan username & password
    let foundUser = users.find(u => (u.username === username || u.nama === username) && u.password === password);

    // Fallback akun admin default jika data pengguna di database masih kosong
    if (!foundUser && users.length === 0 && username === 'admin' && password === 'admin') {
        foundUser = { id: 'admin-default', nama: 'Administrator SLBN 2', username: 'admin', role: 'admin' };
        window.appState.users.push(foundUser);
        if (typeof window.saveUsersData === 'function') window.saveUsersData();
    }

    if (foundUser) {
        window.appState.currentUser = foundUser;
        
        // KUNCI UTAMA: Simpan sesi ke LocalStorage agar tidak ter-logout saat refresh!
        localStorage.setItem('sispko_session_user', JSON.stringify(foundUser));
        
        // Perbarui Tampilan UI secara instan
        if (typeof window.checkUserSession === 'function') {
            window.checkUserSession();
        }
        
        if (typeof triggerUIRender === 'function') {
            triggerUIRender();
        }

        alert("Berhasil masuk! Selamat datang, " + (foundUser.nama || foundUser.username));
    } else {
        alert("Nama pengguna atau kata sandi tidak cocok!");
    }
}

function handleLogout() {
    if (confirm("Apakah Anda yakin ingin keluar dari aplikasi SIMPATIK?")) {
        window.appState.currentUser = null;
        localStorage.removeItem('sispko_session_user');
        
        if (typeof window.checkUserSession === 'function') {
            window.checkUserSession();
        } else {
            window.location.reload();
        }
    }
}

// --------------------------------------------------------------------------
// 3. KELOLA DATA MASTER MURID
// --------------------------------------------------------------------------
function saveStudentForm() {
    const idInput = document.getElementById('studentId');
    const nisnInput = document.getElementById('studentNisn');
    const nameInput = document.getElementById('studentName');
    const classInput = document.getElementById('studentClass');
    const ketunaanInput = document.getElementById('studentKetunaan');

    const name = nameInput ? nameInput.value.trim() : '';
    if (!name) {
        alert("Nama murid wajib diisi!");
        return;
    }

    const studentData = {
        id: (idInput && idInput.value) ? idInput.value : 'std_' + Date.now(),
        nisn: nisnInput ? nisnInput.value.trim() : '',
        nama: name,
        kelas: classInput ? classInput.value : '',
        ketunaan: ketunaanInput ? ketunaanInput.value : '',
        updatedAt: new Date().toISOString()
    };

    const index = window.appState.students.findIndex(s => s.id === studentData.id);
    if (index >= 0) {
        window.appState.students[index] = studentData;
    } else {
        window.appState.students.push(studentData);
    }

    // Simpan KHUSUS ke cabang murid Firebase & LocalStorage
    if (typeof window.saveStudentsData === 'function') {
        window.saveStudentsData();
    } else {
        window.saveAppState();
    }

    renderStudentList();
    resetForm('studentForm');
    alert("✓ Data murid berhasil disimpan!");
}

function deleteStudent(id) {
    if (confirm("Apakah Anda yakin ingin menghapus data murid ini?")) {
        window.appState.students = window.appState.students.filter(s => s.id !== id);
        
        if (typeof window.saveStudentsData === 'function') {
            window.saveStudentsData();
        } else {
            window.saveAppState();
        }
        
        renderStudentList();
    }
}

// --------------------------------------------------------------------------
// 4. KELOLA DATA MASTER KELAS
// --------------------------------------------------------------------------
function saveClassForm() {
    const idInput = document.getElementById('classId');
    const nameInput = document.getElementById('className');
    const waliInput = document.getElementById('classWali');

    const name = nameInput ? nameInput.value.trim() : '';
    if (!name) {
        alert("Nama kelas wajib diisi!");
        return;
    }

    const classData = {
        id: (idInput && idInput.value) ? idInput.value : 'cls_' + Date.now(),
        namaKelas: name,
        waliKelas: waliInput ? waliInput.value.trim() : ''
    };

    const index = window.appState.classes.findIndex(c => c.id === classData.id);
    if (index >= 0) {
        window.appState.classes[index] = classData;
    } else {
        window.appState.classes.push(classData);
    }

    if (typeof window.saveClassesData === 'function') {
        window.saveClassesData();
    } else {
        window.saveAppState();
    }

    renderClassList();
    resetForm('classForm');
    alert("✓ Data kelas berhasil disimpan!");
}

function deleteClass(id) {
    if (confirm("Hapus data kelas ini?")) {
        window.appState.classes = window.appState.classes.filter(c => c.id !== id);
        if (typeof window.saveClassesData === 'function') {
            window.saveClassesData();
        } else {
            window.saveAppState();
        }
        renderClassList();
    }
}

// --------------------------------------------------------------------------
// 5. KELOLA JURNAL & PRESENSI
// --------------------------------------------------------------------------
function saveJournalForm() {
    const dateInput = document.getElementById('journalDate');
    const classInput = document.getElementById('journalClass');
    const activityInput = document.getElementById('journalActivity');

    const journalData = {
        id: 'jrn_' + Date.now(),
        tanggal: dateInput ? dateInput.value : new Date().toISOString().split('T')[0],
        kelas: classInput ? classInput.value : '',
        kegiatan: activityInput ? activityInput.value : '',
        guru: window.appState.currentUser ? window.appState.currentUser.nama : 'Guru'
    };

    window.appState.journals.push(journalData);

    if (typeof window.saveJournalsData === 'function') {
        window.saveJournalsData();
    } else {
        window.saveAppState();
    }

    renderJurnalList();
    resetForm('journalForm');
    alert("✓ Jurnal berhasil disimpan!");
}

function savePresensiForm() {
    const dateInput = document.getElementById('presensiDate');
    const classInput = document.getElementById('presensiClass');

    const presensiData = {
        id: 'prs_' + Date.now(),
        tanggal: dateInput ? dateInput.value : new Date().toISOString().split('T')[0],
        kelas: classInput ? classInput.value : '',
        recordedBy: window.appState.currentUser ? window.appState.currentUser.nama : 'Guru'
    };

    window.appState.presensi.push(presensiData);

    if (typeof window.savePresensiData === 'function') {
        window.savePresensiData();
    } else {
        window.saveAppState();
    }

    renderPresensiForm();
    alert("✓ Data presensi berhasil dicatat!");
}

// --------------------------------------------------------------------------
// 6. RENDER DATA KE UI / TABEL
// --------------------------------------------------------------------------
window.renderAllMasterData = function() {
    renderStudentList();
    renderClassList();
    renderUserList();
};

function renderStudentList() {
    const tableBody = document.getElementById('studentTableBody') || document.getElementById('tableBodyStudents');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    const students = window.appState.students || [];

    if (students.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-gray-500">Belum ada data murid.</td></tr>';
        return;
    }

    students.forEach((s, idx) => {
        const tr = document.createElement('tr');
        tr.className = "border-b hover:bg-gray-50";
        tr.innerHTML = `
            <td class="py-2 px-3 text-center">${idx + 1}</td>
            <td class="py-2 px-3">${s.nisn || '-'}</td>
            <td class="py-2 px-3 font-semibold">${s.nama || '-'}</td>
            <td class="py-2 px-3">${s.kelas || '-'}</td>
            <td class="py-2 px-3">${s.ketunaan || '-'}</td>
            <td class="py-2 px-3 text-center">
                <button onclick="deleteStudent('${s.id}')" class="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600">Hapus</button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

function renderClassList() {
    const tableBody = document.getElementById('classTableBody') || document.getElementById('tableBodyClasses');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    const classes = window.appState.classes || [];

    if (classes.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-gray-500">Belum ada data kelas.</td></tr>';
        return;
    }

    classes.forEach((c, idx) => {
        const tr = document.createElement('tr');
        tr.className = "border-b hover:bg-gray-50";
        tr.innerHTML = `
            <td class="py-2 px-3 text-center">${idx + 1}</td>
            <td class="py-2 px-3 font-semibold">${c.namaKelas || '-'}</td>
            <td class="py-2 px-3">${c.waliKelas || '-'}</td>
            <td class="py-2 px-3 text-center">
                <button onclick="deleteClass('${c.id}')" class="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600">Hapus</button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

function renderUserList() {
    const tableBody = document.getElementById('userTableBody') || document.getElementById('tableBodyUsers');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    const users = window.appState.users || [];

    users.forEach((u, idx) => {
        const tr = document.createElement('tr');
        tr.className = "border-b hover:bg-gray-50";
        tr.innerHTML = `
            <td class="py-2 px-3 text-center">${idx + 1}</td>
            <td class="py-2 px-3 font-semibold">${u.nama || '-'}</td>
            <td class="py-2 px-3">${u.username || '-'}</td>
            <td class="py-2 px-3">${u.role || 'Guru'}</td>
        `;
        tableBody.appendChild(tr);
    });
}

window.renderJurnalList = function() {
    const journalContainer = document.getElementById('journalContainer') || document.getElementById('listJurnal');
    if (!journalContainer) return;

    const journals = window.appState.journals || [];
    if (journals.length === 0) {
        journalContainer.innerHTML = '<p class="text-gray-500 text-sm">Belum ada catatan jurnal.</p>';
        return;
    }

    journalContainer.innerHTML = journals.slice().reverse().map(j => `
        <div class="p-3 bg-white shadow-sm rounded border mb-2">
            <div class="flex justify-between text-xs text-gray-500 mb-1">
                <span>${j.tanggal} - Kelas ${j.kelas}</span>
                <span>Oleh: ${j.guru}</span>
            </div>
            <p class="text-sm font-medium text-gray-800">${j.kegiatan}</p>
        </div>
    `).join('');
};

window.renderPresensiForm = function() {
    console.log("Presensi UI siap.");
};

// --------------------------------------------------------------------------
// 7. HELPER FUNCTIONS
// --------------------------------------------------------------------------
function resetForm(formId) {
    const form = document.getElementById(formId);
    if (form) form.reset();
}
