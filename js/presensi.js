// Modul Presensi & Rekapitulasi Presensi

function loadPresensiTable() {
    populatePresensiDropdowns();
    renderPresensiForm();
}

function populatePresensiDropdowns() {
    var user = appState.currentUser;
    if (!user) return;

    var selectKelas = document.getElementById('presensi-kelas-select');
    var selectMapel = document.getElementById('presensi-mapel-select');

    if (!selectKelas) return;

    // 1. FILTER PILIHAN KELAS
    var currentSelectedClass = selectKelas.value;
    selectKelas.innerHTML = '';
    
    var availableClasses = [];
    if (user.role === 'walikelas') {
        // Wali Kelas HANYA bisa memilih kelas yang diampu
        availableClasses = (appState.classes || []).filter(function(c) {
            return (user.classIds || []).includes(c.id);
        });
    } else {
        // Admin, Kepsek, dan Guru Mapel BISA memilih semua kelas
        availableClasses = appState.classes || [];
    }

    if (availableClasses.length === 0) {
        selectKelas.innerHTML = '<option value="">- Tidak ada kelas diampu -</option>';
    } else {
        availableClasses.forEach(function(c) {
            selectKelas.innerHTML += '<option value="' + c.id + '">' + c.name + '</option>';
        });
        if (currentSelectedClass && availableClasses.some(function(c) { return c.id === currentSelectedClass; })) {
            selectKelas.value = currentSelectedClass;
        }
    }

    // 2. FILTER PILIHAN MATA PELAJARAN (JIKA ADA DROPDOWN MAPEL DI PRESENSI)
    if (selectMapel) {
        var currentSelectedMapel = selectMapel.value;
        selectMapel.innerHTML = '';
        
        var availableMapels = [];
        if (user.role === 'gurumapel') {
            // Guru Mapel HANYA melihat mata pelajaran ampuannya
            availableMapels = user.assignedMapels || [];
        } else {
            // Wali Kelas / Admin melihat semua mata pelajaran
            availableMapels = appState.mapels || [];
        }

        if (availableMapels.length === 0) {
            selectMapel.innerHTML = '<option value="">- Tidak ada mapel diampu -</option>';
        } else {
            availableMapels.forEach(function(m) {
                selectMapel.innerHTML += '<option value="' + m + '">' + m + '</option>';
            });
            if (currentSelectedMapel && availableMapels.includes(currentSelectedMapel)) {
                selectMapel.value = currentSelectedMapel;
            }
        }
    }
}

function renderPresensiForm() {
    var selectKelas = document.getElementById('presensi-kelas-select');
    var inputTgl = document.getElementById('presensi-tanggal');
    var tbody = document.getElementById('presensi-table-body');

    if (!selectKelas || !inputTgl || !tbody) return;

    var classId = selectKelas.value;
    var tgl = inputTgl.value;

    tbody.innerHTML = '';

    if (!classId) {
        tbody.innerHTML = '<tr><td colspan="4" class="p-4 text-center text-slate-400 font-medium">Silakan pilih kelas terlebih dahulu.</td></tr>';
        return;
    }

    // Ambil siswa sesuai kelas
    var studentsInClass = (appState.students || []).filter(function(s) {
        return s.classId === classId;
    });

    if (studentsInClass.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="p-4 text-center text-slate-400 font-medium">Belum ada data siswa di kelas ini.</td></tr>';
        return;
    }

    // Ambil record presensi yang tersimpan
    var key = classId + "_" + tgl;
    var savedRecord = (appState.presensiRecords && appState.presensiRecords[key]) ? appState.presensiRecords[key] : {};

    studentsInClass.forEach(function(s, idx) {
        var status = savedRecord[s.id] || 'H'; // Default Hadir
        var tr = document.createElement('tr');
        tr.className = "hover:bg-slate-50 transition border-b border-slate-100";

        tr.innerHTML = 
            '<td class="p-3 text-center text-slate-500 font-bold">' + (idx + 1) + '</td>' +
            '<td class="p-3 font-semibold text-slate-800">' + s.nama + '<div class="text-[10px] text-slate-400">' + (s.ketunaan || '') + '</div></td>' +
            '<td class="p-3 text-center">' +
                '<div class="inline-flex rounded-xl p-1 bg-slate-100 gap-1 border border-slate-200">' +
                    '<label class="cursor-pointer px-2.5 py-1 rounded-lg text-xs font-bold transition ' + (status === 'H' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200') + '">' +
                        '<input type="radio" name="presensi_' + s.id + '" value="H" ' + (status === 'H' ? 'checked' : '') + ' onchange="renderPresensiForm()" class="hidden"> H' +
                    '</label>' +
                    '<label class="cursor-pointer px-2.5 py-1 rounded-lg text-xs font-bold transition ' + (status === 'S' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200') + '">' +
                        '<input type="radio" name="presensi_' + s.id + '" value="S" ' + (status === 'S' ? 'checked' : '') + ' onchange="renderPresensiForm()" class="hidden"> S' +
                    '</label>' +
                    '<label class="cursor-pointer px-2.5 py-1 rounded-lg text-xs font-bold transition ' + (status === 'I' ? 'bg-blue-500 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200') + '">' +
                        '<input type="radio" name="presensi_' + s.id + '" value="I" ' + (status === 'I' ? 'checked' : '') + ' onchange="renderPresensiForm()" class="hidden"> I' +
                    '</label>' +
                    '<label class="cursor-pointer px-2.5 py-1 rounded-lg text-xs font-bold transition ' + (status === 'A' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200') + '">' +
                        '<input type="radio" name="presensi_' + s.id + '" value="A" ' + (status === 'A' ? 'checked' : '') + ' onchange="renderPresensiForm()" class="hidden"> A' +
                    '</label>' +
                '</div>' +
            '</td>' +
            '<td class="p-3 text-center text-slate-400"><i class="fa-solid fa-circle-check text-emerald-500"></i></td>';

        tbody.appendChild(tr);
    });
}

function handleSavePresensi(e) {
    if (e) e.preventDefault();
    var selectKelas = document.getElementById('presensi-kelas-select');
    var inputTgl = document.getElementById('presensi-tanggal');

    if (!selectKelas || !inputTgl) return;

    var classId = selectKelas.value;
    var tgl = inputTgl.value;

    if (!classId) {
        alert("Pilih kelas terlebih dahulu!");
        return;
    }

    var key = classId + "_" + tgl;
    var record = {};

    var studentsInClass = (appState.students || []).filter(function(s) { return s.classId === classId; });
    studentsInClass.forEach(function(s) {
        var checkedRadio = document.querySelector('input[name="presensi_' + s.id + '"]:checked');
        if (checkedRadio) {
            record[s.id] = checkedRadio.value;
        } else {
            record[s.id] = 'H';
        }
    });

    if (!appState.presensiRecords) appState.presensiRecords = {};
    appState.presensiRecords[key] = record;

    saveAppState();
    showToast("Presensi kelas berhasil disimpan!");
}
