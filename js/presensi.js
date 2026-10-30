// Modul Presensi & Rekapitulasi Presensi

function loadPresensiTable() {
    populatePresensiDropdowns();
    renderPresensiForm();
}

function populatePresensiDropdowns() {
    var user = appState.currentUser;
    var selectKelas = document.getElementById('presensi-kelas-select');
    var selectMapel = document.getElementById('presensi-mapel-select');

    if (!selectKelas) return;

    var currentSelectedClass = selectKelas.value;
    selectKelas.innerHTML = '';
    
    var availableClasses = [];
    if (user && user.role === 'walikelas' && user.classIds && user.classIds.length > 0) {
        availableClasses = (appState.classes || []).filter(function(c) {
            return user.classIds.includes(c.id);
        });
    } else {
        availableClasses = appState.classes || [];
    }

    if (availableClasses.length === 0) {
        selectKelas.innerHTML = '<option value="">- Tidak ada kelas -</option>';
    } else {
        availableClasses.forEach(function(c) {
            var opt = document.createElement('option');
            opt.value = c.id;
            opt.innerText = c.name;
            selectKelas.appendChild(opt);
        });

        if (currentSelectedClass && availableClasses.some(function(c) { return c.id === currentSelectedClass; })) {
            selectKelas.value = currentSelectedClass;
        } else if (availableClasses.length > 0) {
            selectKelas.value = availableClasses[0].id;
        }
    }

    if (selectMapel) {
        var currentSelectedMapel = selectMapel.value;
        selectMapel.innerHTML = '';
        
        var availableMapels = [];
        if (user && user.role === 'gurumapel' && user.assignedMapels && user.assignedMapels.length > 0) {
            availableMapels = user.assignedMapels;
        } else {
            availableMapels = appState.mapels || DEFAULT_MAPELS;
        }

        if (availableMapels.length === 0) {
            selectMapel.innerHTML = '<option value="">- Tidak ada mapel -</option>';
        } else {
            availableMapels.forEach(function(m) {
                var opt = document.createElement('option');
                opt.value = m;
                opt.innerText = m;
                selectMapel.appendChild(opt);
            });
            if (currentSelectedMapel && availableMapels.includes(currentSelectedMapel)) {
                selectMapel.value = currentSelectedMapel;
            } else if (availableMapels.length > 0) {
                selectMapel.value = availableMapels[0];
            }
        }
    }
}

function renderPresensiForm() {
    var selectKelas = document.getElementById('presensi-kelas-select');
    var selectMapel = document.getElementById('presensi-mapel-select');
    var inputTgl = document.getElementById('presensi-tanggal');
    var tbody = document.getElementById('presensi-table-body');

    if (!selectKelas || !inputTgl || !tbody) return;

    var classId = selectKelas.value;
    var tgl = inputTgl.value;
    var user = appState.currentUser;
    var mapel = (selectMapel && user && user.role === 'gurumapel') ? selectMapel.value : '';

    tbody.innerHTML = '';

    if (!classId) {
        tbody.innerHTML = '<tr><td colspan="5" class="p-4 text-center text-slate-400 font-medium">Silakan pilih kelas terlebih dahulu.</td></tr>';
        return;
    }

    // Ambil daftar siswa berdasarkan ID Kelas
    var studentsInClass = (appState.students || []).filter(function(s) {
        return s.classId === classId;
    });

    if (studentsInClass.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="p-4 text-center text-slate-400 font-medium">Belum ada data siswa di kelas ini. Memuat data default...</td></tr>';
        return;
    }

    var keyInduk = classId + "_" + tgl;
    var keyMapel = classId + "_" + tgl + "_" + (mapel ? mapel.replace(/\s+/g, '') : '');

    var recordInduk = (appState.presensiRecords && appState.presensiRecords[keyInduk]) ? appState.presensiRecords[keyInduk] : {};
    var recordMapel = (mapel && appState.presensiRecords && appState.presensiRecords[keyMapel]) ? appState.presensiRecords[keyMapel] : null;

    var countH = 0, countS = 0, countI = 0, countA = 0;

    studentsInClass.forEach(function(s, idx) {
        var studentName = s.nama || s.name || s.namaSiswa || "Siswa " + (idx + 1);
        var studentNisn = (s.nisn && s.nisn !== 'undefined') ? s.nisn : '';
        var studentKetunaan = s.ketunaan || s.jenisKebutuhan || '-';

        var status = 'H';
        if (recordMapel && recordMapel[s.id]) {
            status = recordMapel[s.id];
        } else if (recordInduk && recordInduk[s.id]) {
            status = recordInduk[s.id];
        }

        if (status === 'H') countH++;
        else if (status === 'S') countS++;
        else if (status === 'I') countI++;
        else if (status === 'A') countA++;

        var tr = document.createElement('tr');
        tr.className = "hover:bg-slate-50 transition border-b border-slate-100";

        var nisnDisplay = studentNisn ? '<div class="text-[10px] text-slate-400 font-normal">' + studentNisn + '</div>' : '';

        tr.innerHTML = 
            '<td class="p-3 text-center text-slate-500 font-bold">' + (idx + 1) + '</td>' +
            '<td class="p-3 font-semibold text-slate-800">' + nisnDisplay + '<div class="font-bold text-slate-800">' + studentName + '</div></td>' +
            '<td class="p-3 text-slate-600 text-xs font-medium">' + studentKetunaan + '</td>' +
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

    if (document.getElementById('summary-hadir')) document.getElementById('summary-hadir').innerText = countH;
    if (document.getElementById('summary-sakit')) document.getElementById('summary-sakit').innerText = countS;
    if (document.getElementById('summary-izin')) document.getElementById('summary-izin').innerText = countI;
    if (document.getElementById('summary-alpa')) document.getElementById('summary-alpa').innerText = countA;
    if (document.getElementById('summary-total')) document.getElementById('summary-total').innerText = studentsInClass.length;
}

function handleSavePresensi(e) {
    if (e) e.preventDefault();
    var selectKelas = document.getElementById('presensi-kelas-select');
    var selectMapel = document.getElementById('presensi-mapel-select');
    var inputTgl = document.getElementById('presensi-tanggal');

    if (!selectKelas || !inputTgl) return;

    var classId = selectKelas.value;
    var tgl = inputTgl.value;
    var user = appState.currentUser;
    var mapel = (selectMapel && user && user.role === 'gurumapel') ? selectMapel.value : '';

    if (!classId) {
        alert("Pilih kelas terlebih dahulu!");
        return;
    }

    var key = classId + "_" + tgl;
    if (mapel) {
        key = classId + "_" + tgl + "_" + mapel.replace(/\s+/g, '');
    }

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
    showToast(mapel ? "Presensi mapel " + mapel + " berhasil disimpan!" : "Presensi harian berhasil disimpan!");
}
