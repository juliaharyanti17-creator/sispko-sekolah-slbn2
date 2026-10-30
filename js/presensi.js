// Logika Modul Presensi Siswa dengen Override Mapel
function getPresensiBaseKey() {
    const date = document.getElementById('presensi-tanggal').value;
    const classSelect = document.getElementById('presensi-kelas-select');
    const classId = classSelect ? classSelect.value : '';
    return `${date}_${classId}`;
}

function getPresensiMapelKey(mapelName) {
    const baseKey = getPresensiBaseKey();
    if (!mapelName || mapelName === 'GENERAL') return baseKey;
    return `${baseKey}_${mapelName}`;
}

function loadPresensiTable() {
    const classSelect = document.getElementById('presensi-kelas-select');
    const mapelSelect = document.getElementById('presensi-mapel-select');
    const selectedMapel = mapelSelect ? mapelSelect.value : 'GENERAL';

    if (!classSelect || !classSelect.value) {
        document.getElementById('label-presensi-kelas').innerText = "-";
        document.getElementById('presensi-table-body').innerHTML = `<tr><td colspan="5" class="p-6 text-center text-slate-400 font-medium">Belum ada kelas terpilih atau diampu.</td></tr>`;
        calculatePresensiCounters([]);
        return;
    }
    const classId = classSelect.value;
    document.getElementById('label-presensi-kelas').innerText = `${getClassName(classId)} (${selectedMapel})`;

    const baseKey = getPresensiBaseKey();
    const mapelKey = getPresensiMapelKey(selectedMapel);
    const classStudents = (appState.students || []).filter(s => s.classId === classId);
    const tbody = document.getElementById('presensi-table-body');

    if (!appState.presensiRecords) appState.presensiRecords = {};
    
    if (!appState.presensiRecords[baseKey]) {
        appState.presensiRecords[baseKey] = classStudents.map(s => ({
            studentId: s.id, status: 'Hadir', notes: ''
        }));
    }

    const baseList = appState.presensiRecords[baseKey];
    const mapelOverrideList = (selectedMapel !== 'GENERAL' && appState.presensiRecords[mapelKey]) 
        ? appState.presensiRecords[mapelKey] 
        : [];

    tbody.innerHTML = '';

    if (classStudents.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="p-6 text-center text-slate-400 font-medium">Belum ada siswa terdaftar di kelas ini.</td></tr>`;
        calculatePresensiCounters([]);
        return;
    }

    const currentDisplayList = [];

    classStudents.forEach((student, index) => {
        let baseRecord = baseList.find(r => r.studentId === student.id);
        if (!baseRecord) {
            baseRecord = { studentId: student.id, status: 'Hadir', notes: '' };
            baseList.push(baseRecord);
        }

        let overrideRecord = mapelOverrideList.find(r => r.studentId === student.id);
        const activeStatus = overrideRecord ? overrideRecord.status : baseRecord.status;
        const activeNotes = overrideRecord ? overrideRecord.notes : baseRecord.notes;

        currentDisplayList.push({ studentId: student.id, status: activeStatus, notes: activeNotes });

        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-50/80 transition";
        tr.innerHTML = `
            <td class="p-3.5 text-center text-slate-400 font-bold">${index + 1}</td>
            <td class="p-3.5">
                <p class="font-extrabold text-slate-800 text-xs sm:text-sm">${student.name}</p>
                <p class="text-[10px] text-slate-400 font-semibold">NISN: ${student.nisn}</p>
            </td>
            <td class="p-3.5 text-center">
                <span class="px-2 py-1 rounded-lg bg-amber-100 text-amber-900 font-bold text-[10px] inline-block border border-amber-200">
                    ${student.ketunaan || 'Belum diisi'}
                </span>
            </td>
            <td class="p-3.5 text-center">
                <div class="inline-flex rounded-xl border border-slate-200 bg-slate-100/80 p-1 gap-1">
                    ${renderPresensiRadioBtn(student.id, 'Hadir', activeStatus)}
                    ${renderPresensiRadioBtn(student.id, 'Izin', activeStatus)}
                    ${renderPresensiRadioBtn(student.id, 'Sakit', activeStatus)}
                    ${renderPresensiRadioBtn(student.id, 'Alpa', activeStatus)}
                </div>
            </td>
            <td class="p-3.5">
                <input type="text" value="${activeNotes || ''}" onchange="updatePresensiNotes('${student.id}', this.value)" placeholder="Catatan/keterangan..." class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500">
            </td>
        `;
        tbody.appendChild(tr);
    });

    calculatePresensiCounters(currentDisplayList);
}

function renderPresensiRadioBtn(studentId, statusType, activeStatus) {
    const isChecked = activeStatus === statusType;
    let activeStyle = "text-slate-600 hover:text-slate-900";
    if (isChecked) {
        if (statusType === 'Hadir') activeStyle = "bg-emerald-600 text-white font-black shadow-xs";
        else if (statusType === 'Izin') activeStyle = "bg-blue-600 text-white font-black shadow-xs";
        else if (statusType === 'Sakit') activeStyle = "bg-amber-600 text-white font-black shadow-xs";
        else if (statusType === 'Alpa') activeStyle = "bg-rose-600 text-white font-black shadow-xs";
    }
    return `<button type="button" onclick="updatePresensiStatus(event, '${studentId}', '${statusType}')" class="px-2.5 py-1 text-[11px] rounded-lg transition-all cursor-pointer ${activeStyle}">${statusType}</button>`;
}

function updatePresensiStatus(e, studentId, newStatus) {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    const mapelSelect = document.getElementById('presensi-mapel-select');
    const selectedMapel = mapelSelect ? mapelSelect.value : 'GENERAL';
    
    const baseKey = getPresensiBaseKey();
    const mapelKey = getPresensiMapelKey(selectedMapel);

    if (selectedMapel === 'GENERAL' || (appState.currentUser && appState.currentUser.role === 'walikelas')) {
        if (!appState.presensiRecords[baseKey]) return;
        const target = appState.presensiRecords[baseKey].find(r => r.studentId === studentId);
        if (target) target.status = newStatus;
    } else {
        if (!appState.presensiRecords[mapelKey]) appState.presensiRecords[mapelKey] = [];
        let target = appState.presensiRecords[mapelKey].find(r => r.studentId === studentId);
        if (!target) {
            target = { studentId: studentId, status: newStatus, notes: '' };
            appState.presensiRecords[mapelKey].push(target);
        } else {
            target.status = newStatus;
        }
    }

    saveAppState();
    loadPresensiTable();
}

function updatePresensiNotes(studentId, noteText) {
    const mapelSelect = document.getElementById('presensi-mapel-select');
    const selectedMapel = mapelSelect ? mapelSelect.value : 'GENERAL';
    
    const baseKey = getPresensiBaseKey();
    const mapelKey = getPresensiMapelKey(selectedMapel);

    if (selectedMapel === 'GENERAL' || (appState.currentUser && appState.currentUser.role === 'walikelas')) {
        if (!appState.presensiRecords[baseKey]) return;
        const target = appState.presensiRecords[baseKey].find(r => r.studentId === studentId);
        if (target) target.notes = noteText;
    } else {
        if (!appState.presensiRecords[mapelKey]) appState.presensiRecords[mapelKey] = [];
        let target = appState.presensiRecords[mapelKey].find(r => r.studentId === studentId);
        if (!target) {
            target = { studentId: studentId, status: 'Hadir', notes: noteText };
            appState.presensiRecords[mapelKey].push(target);
        } else {
            target.notes = noteText;
        }
    }

    saveAppState();
}

function bulkSetPresensiStatus(e, statusType) {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    const baseKey = getPresensiBaseKey();
    if (!appState.presensiRecords[baseKey]) return;
    appState.presensiRecords[baseKey].forEach(r => r.status = statusType);
    saveAppState();
    loadPresensiTable();
    showToast(`Semua siswa di-set ${statusType}`);
}

function calculatePresensiCounters(records) {
    let hadir = 0, izin = 0, sakit = 0, alpa = 0;
    records.forEach(r => {
        if (r.status === 'Hadir') hadir++;
        else if (r.status === 'Izin') izin++;
        else if (r.status === 'Sakit') sakit++;
        else if (r.status === 'Alpa') alpa++;
    });
    document.getElementById('counter-hadir').innerText = hadir;
    document.getElementById('counter-izin').innerText = izin;
    document.getElementById('counter-sakit').innerText = sakit;
    document.getElementById('counter-alpa').innerText = alpa;
    document.getElementById('counter-total').innerText = records.length;
}

function savePresensiExplicit(e) {
    if (e) e.preventDefault();
    saveAppState();
    showToast("Data Presensi Siswa tersimpan!");
}