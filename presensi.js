// ==========================================================================
// Modul Presensi Murid SIMPATIK SLBN 2 PELAIHARI (Alur Presensi Terpusat & Warisan Otomatis)
// ==========================================================================

function renderPresensiForm() {
    // Otomatis set tanggal ke hari ini jika input tanggal masih kosong
    var tanggalInput = document.getElementById('presensi-tanggal');
    if (tanggalInput && !tanggalInput.value) {
        var todayStr = new Date().toISOString().split('T')[0];
        tanggalInput.value = todayStr;
    }

    if (typeof window.populateDropdowns === 'function') {
        window.populateDropdowns();
    }
    loadPresensiTable();
}

function loadPresensiTable() {
    var tbody = document.getElementById('presensi-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    var selectedTgl = document.getElementById('presensi-tanggal') ? document.getElementById('presensi-tanggal').value : '';
    var selectedClass = document.getElementById('presensi-kelas-select') ? document.getElementById('presensi-kelas-select').value : '';
    var selectedMapel = document.getElementById('presensi-mapel-select') ? document.getElementById('presensi-mapel-select').value : 'HARIAN';

    if (!selectedClass || !selectedTgl) {
        tbody.innerHTML = '<tr><td colspan="5" class="p-8 text-center text-slate-400 dark:text-slate-500 font-medium italic">Pilih tanggal dan kelas terlebih dahulu.</td></tr>';
        updatePresensiSummary(0, 0, 0, 0, 0);
        return;
    }

    // Ambil daftar siswa berdasarkan kelas terpilih
    var studentsInClass = (appState.students || []).filter(function(s) {
        return s && (s.classId === selectedClass || s.kelas === selectedClass);
    });

    if (studentsInClass.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="p-8 text-center text-slate-400 dark:text-slate-500 font-medium italic">Tidak ada siswa terdaftar di kelas ini.</td></tr>';
        updatePresensiSummary(0, 0, 0, 0, 0);
        return;
    }

    // Kunci Penyimpanan: Acuan Harian Utama & Spesifik per Mata Pelajaran
    var harianKey = selectedTgl + '_' + selectedClass + '_HARIAN';
    var spesifikKey = selectedTgl + '_' + selectedClass + '_' + selectedMapel;

    if (!appState.presensiRecords) appState.presensiRecords = {};

    // Logika Pewarisan: Ambil data spesifik mapel jika sudah pernah diubah, 
    // jika belum ada, wariskan dari data presensi harian utama (HARIAN)
    var baseRecord = appState.presensiRecords[harianKey] || {};
    var currentRecord = appState.presensiRecords[spesifikKey] || baseRecord;

    var countH = 0, countS = 0, countI = 0, countA = 0;

    studentsInClass.forEach(function(s, idx) {
        var status = currentRecord[s.id] || 'H'; // Default Hadir

        if (status === 'H' || status === 'Hadir') countH++;
        else if (status === 'S' || status === 'Sakit') countS++;
        else if (status === 'I' || status === 'Izin') countI++;
        else if (status === 'A' || status === 'Alpa') countA++;

        var namaSiswa = s.nama || s.name || '-';
        var initials = namaSiswa.split(' ').map(function(n) { return n[0]; }).slice(0, 2).join('').toUpperCase();
        if (!initials) initials = 'MS';

        var tr = document.createElement('tr');
        tr.setAttribute('data-student-id', s.id);
        tr.className = "hover:bg-indigo-50/40 dark:hover:bg-slate-700/50 transition border-b border-slate-100 dark:border-slate-700/60 text-xs";
        tr.innerHTML = `
            <td class="p-3 text-center text-slate-400 dark:text-slate-500 font-bold">${idx + 1}</td>
            <td class="p-3">
                <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 font-bold flex items-center justify-center text-[10px] shrink-0 border border-indigo-200 dark:border-indigo-800">${initials}</div>
                    <div>
                        <p class="font-bold text-slate-800 dark:text-slate-200">${namaSiswa}</p>
                        <p class="text-[10px] text-slate-400 dark:text-slate-500 font-mono">NISN: ${s.nisn || '-'}</p>
                    </div>
                </div>
            </td>
            <td class="p-3 text-center">
                <span class="inline-block max-w-[150px] bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 px-3 py-1.5 rounded-xl text-[10px] font-bold border border-indigo-200 dark:border-indigo-800 leading-snug text-center shadow-xs">
                    ${s.ketunaan || '-'}
                </span>
            </td>
            <td class="p-3 text-center">
                <div class="inline-flex rounded-xl p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 gap-1 status-container" data-student-id="${s.id}">
                    <button type="button" onclick="setStudentStatus('${s.id}', 'H')" class="btn-status-${s.id} px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${status === 'H' || status === 'Hadir' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}">H</button>
                    <button type="button" onclick="setStudentStatus('${s.id}', 'S')" class="btn-status-${s.id} px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${status === 'S' || status === 'Sakit' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}">S</button>
                    <button type="button" onclick="setStudentStatus('${s.id}', 'I')" class="btn-status-${s.id} px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${status === 'I' || status === 'Izin' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}">I</button>
                    <button type="button" onclick="setStudentStatus('${s.id}', 'A')" class="btn-status-${s.id} px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${status === 'A' || status === 'Alpa' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}">A</button>
                </div>
            </td>
            <td class="p-3 text-center text-slate-400 dark:text-slate-500">-</td>
        `;
        tbody.appendChild(tr);
    });

    updatePresensiSummary(countH, countS, countI, countA, studentsInClass.length);
}

function setStudentStatus(studentId, status) {
    var tanggalEl = document.getElementById('presensi-tanggal');
    var kelasEl = document.getElementById('presensi-kelas-select');
    var mapelEl = document.getElementById('presensi-mapel-select');

    var selectedTgl = tanggalEl ? tanggalEl.value : '';
    var selectedClass = kelasEl ? kelasEl.value : '';
    var selectedMapel = mapelEl ? mapelEl.value : 'HARIAN';
    
    if (!selectedTgl || !selectedClass) {
        if (typeof showToast === 'function') showToast("Pilih tanggal dan kelas terlebih dahulu!");
        else alert("Pilih tanggal dan kelas terlebih dahulu!");
        return;
    }

    var harianKey = selectedTgl + '_' + selectedClass + '_HARIAN';
    var targetKey = selectedTgl + '_' + selectedClass + '_' + selectedMapel;
    
    if (!appState.presensiRecords) appState.presensiRecords = {};
    
    if (!appState.presensiRecords[targetKey]) {
        appState.presensiRecords[targetKey] = Object.assign({}, appState.presensiRecords[harianKey] || {});
    }

    appState.presensiRecords[targetKey][studentId] = status;
    
    // Perbarui tabel secara reaktif seketika
    loadPresensiTable();
}

function updatePresensiSummary(h, s, i, a, total) {
    if (document.getElementById('summary-hadir')) document.getElementById('summary-hadir').innerText = h;
    if (document.getElementById('summary-sakit')) document.getElementById('summary-sakit').innerText = s;
    if (document.getElementById('summary-izin')) document.getElementById('summary-izin').innerText = i;
    if (document.getElementById('summary-alpa')) document.getElementById('summary-alpa').innerText = a;
    if (document.getElementById('summary-total')) document.getElementById('summary-total').innerText = total;
}

function handleSavePresensi(e) {
    if (e && typeof e.preventDefault === 'function') {
        e.preventDefault();
    }

    var selectedTgl = document.getElementById('presensi-tanggal').value;
    var selectedClass = document.getElementById('presensi-kelas-select').value;
    var selectedMapel = document.getElementById('presensi-mapel-select') ? document.getElementById('presensi-mapel-select').value : 'HARIAN';

    if (!selectedTgl || !selectedClass) {
        if (typeof showToast === 'function') showToast("Pilih tanggal dan kelas terlebih dahulu!");
        else alert("Pilih tanggal dan kelas terlebih dahulu!");
        return;
    }

    var harianKey = selectedTgl + '_' + selectedClass + '_HARIAN';
    var targetKey = selectedTgl + '_' + selectedClass + '_' + selectedMapel;

    if (!appState.presensiRecords) appState.presensiRecords = {};
    if (!appState.presensiRecords[targetKey]) {
        appState.presensiRecords[targetKey] = Object.assign({}, appState.presensiRecords[harianKey] || {});
    }

    var rows = document.querySelectorAll('#presensi-table-body tr');
    rows.forEach(function(tr) {
        var studentId = tr.getAttribute('data-student-id');
        if (studentId) {
            var activeBtn = tr.querySelector('.status-container button.bg-emerald-600, .status-container button.bg-amber-500, .status-container button.bg-blue-600, .status-container button.bg-rose-600');
            if (activeBtn) {
                var statusText = activeBtn.textContent.trim();
                appState.presensiRecords[targetKey][studentId] = statusText;
            }
        }
    });

    if (targetKey !== harianKey && !appState.presensiRecords[harianKey]) {
        appState.presensiRecords[harianKey] = Object.assign({}, appState.presensiRecords[targetKey]);
    }

    // Simpan ke LocalStorage & Firebase Realtime Database[span_0](start_span)[span_0](end_span)
    if (typeof saveAppState === 'function') {
        saveAppState();
    } else {
        localStorage.setItem('simpatik_backup_state', JSON.stringify(appState));
    }

    if (typeof savePresensiData === 'function') {
        savePresensiData();
    } else if (typeof firebase !== 'undefined' && firebase.apps.length) {
        firebase.database().ref('simpatik_data/presensiRecords').set(appState.presensiRecords);
    }

    if (typeof showToast === 'function') {
        showToast("Presensi berhasil disimpan dan disinkronkan!");
    } else {
        alert("Presensi berhasil disimpan dan disinkronkan!");
    }
}
