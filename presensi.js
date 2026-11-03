// ==========================================================================
// Modul Presensi Murid SIMPATIK SLBN 2 PELAIHARI
// ==========================================================================

function renderPresensiForm() {
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

    if (!selectedClass) {
        tbody.innerHTML = '<tr><td colspan="5" class="p-4 text-center text-slate-400 font-medium">Pilih kelas terlebih dahulu.</td></tr>';
        updatePresensiSummary(0, 0, 0, 0, 0);
        return;
    }

    // Ambil daftar siswa berdasarkan kelas terpilih
    var studentsInClass = (appState.students || []).filter(function(s) {
        return s && (s.classId === selectedClass || s.kelas === selectedClass);
    });

    if (studentsInClass.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="p-4 text-center text-slate-400 font-medium">Tidak ada siswa terdaftar di kelas ini.</td></tr>';
        updatePresensiSummary(0, 0, 0, 0, 0);
        return;
    }

    var recordKey = selectedTgl + '_' + selectedClass;
    var currentRecord = (appState.presensiRecords && appState.presensiRecords[recordKey]) ? appState.presensiRecords[recordKey] : {};

    var countH = 0, countS = 0, countI = 0, countA = 0;

    studentsInClass.forEach(function(s, idx) {
        var status = currentRecord[s.id] || 'H'; // Default Hadir

        if (status === 'H' || status === 'Hadir') countH++;
        else if (status === 'S' || status === 'Sakit') countS++;
        else if (status === 'I' || status === 'Izin') countI++;
        else if (status === 'A' || status === 'Alpa') countA++;

        var tr = document.createElement('tr');
        tr.className = "hover:bg-slate-50 transition border-b border-slate-100";
        tr.innerHTML = `
            <td class="p-3 text-center text-slate-500 font-bold">${idx + 1}</td>
            <td class="p-3 font-bold text-slate-800">${s.nama || s.name || '-'} <div class="text-[10px] text-slate-400 font-normal">NISN: ${s.nisn || '-'}</div></td>
            <td class="p-3"><span class="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-lg text-[10px] font-bold border border-indigo-200">${s.ketunaan || '-'}</span></td>
            <td class="p-3 text-center">
                <div class="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200 gap-1">
                    <button type="button" onclick="setStudentStatus('${s.id}', 'H')" class="px-2.5 py-1 rounded-lg text-xs font-bold transition ${status === 'H' || status === 'Hadir' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}">H</button>
                    <button type="button" onclick="setStudentStatus('${s.id}', 'S')" class="px-2.5 py-1 rounded-lg text-xs font-bold transition ${status === 'S' || status === 'Sakit' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}">S</button>
                    <button type="button" onclick="setStudentStatus('${s.id}', 'I')" class="px-2.5 py-1 rounded-lg text-xs font-bold transition ${status === 'I' || status === 'Izin' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}">I</button>
                    <button type="button" onclick="setStudentStatus('${s.id}', 'A')" class="px-2.5 py-1 rounded-lg text-xs font-bold transition ${status === 'A' || status === 'Alpa' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}">A</button>
                </div>
            </td>
            <td class="p-3 text-center text-slate-400">-</td>
        `;
        tbody.appendChild(tr);
    });

    updatePresensiSummary(countH, countS, countI, countA, studentsInClass.length);
}

function setStudentStatus(studentId, status) {
    var selectedTgl = document.getElementById('presensi-tanggal').value;
    var selectedClass = document.getElementById('presensi-kelas-select').value;
    if (!selectedTgl || !selectedClass) return;

    var recordKey = selectedTgl + '_' + selectedClass;
    if (!appState.presensiRecords) appState.presensiRecords = {};
    if (!appState.presensiRecords[recordKey]) appState.presensiRecords[recordKey] = {};

    appState.presensiRecords[recordKey][studentId] = status;
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
    if (e) e.preventDefault();
    if (typeof saveAppState === 'function') saveAppState();
    if (typeof savePresensiData === 'function') savePresensiData();
    if (typeof showToast === 'function') showToast("Presensi berhasil disimpan!");
}
