// Logika Modul Rekapitulasi & Cetak PDF
function setPresetRekapRange(e, type) {
    if (e) e.preventDefault();
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const startInput = document.getElementById('filter-rekap-start-date');
    const endInput = document.getElementById('filter-rekap-end-date');

    if (!startInput || !endInput) return;

    if (type === 'today') {
        startInput.value = todayStr;
        endInput.value = todayStr;
    } else if (type === 'this_week') {
        const dayOfWeek = today.getDay();
        const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const monday = new Date(today);
        monday.setDate(today.getDate() + distanceToMonday);
        startInput.value = monday.toISOString().split('T')[0];
        endInput.value = todayStr;
    } else if (type === 'this_month') {
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        startInput.value = firstDay.toISOString().split('T')[0];
        endInput.value = todayStr;
    }
    renderRekapModule();
}

function renderRekapModule() {
    const startInput = document.getElementById('filter-rekap-start-date');
    const endInput = document.getElementById('filter-rekap-end-date');
    const classInput = document.getElementById('filter-rekap-kelas');

    const startDate = (startInput && startInput.value) ? startInput.value : new Date().toISOString().split('T')[0];
    const endDate = (endInput && endInput.value) ? endInput.value : startDate;
    const filterKelas = classInput ? classInput.value : 'ALL';

    let periodLabel = `${new Date(startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - ${new Date(endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    if (startDate === endDate) {
        periodLabel = new Date(startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    if (document.getElementById('rekap-presensi-period-label')) document.getElementById('rekap-presensi-period-label').innerText = periodLabel;
    if (document.getElementById('rekap-jurnal-period-label')) document.getElementById('rekap-jurnal-period-label').innerText = periodLabel;

    const tbodyPresensi = document.getElementById('rekap-table-presensi-body');
    if (tbodyPresensi) {
        tbodyPresensi.innerHTML = '';
        const activeStudentIds = (appState.students || []).map(s => s.id);
        const classesToRender = filterKelas === 'ALL' 
            ? (appState.classes || []) 
            : (appState.classes || []).filter(c => c.id === filterKelas);

        if (classesToRender.length === 0) {
            tbodyPresensi.innerHTML = `<tr><td colspan="8" class="p-4 text-center text-slate-400 font-medium">Tidak ada kelas yang terdaftar.</td></tr>`;
        } else {
            classesToRender.forEach((c, idx) => {
                const totalSiswaKelas = (appState.students || []).filter(s => s.classId === c.id).length;
                let hadir = 0, izin = 0, sakit = 0, alpa = 0, totalRecords = 0;

                Object.keys(appState.presensiRecords || {}).forEach(key => {
                    const parts = key.split('_');
                    const tgl = parts[0], classId = parts[1];

                    if (classId === c.id && tgl >= startDate && tgl <= endDate) {
                        const recMap = appState.presensiRecords[key] || {};
                        Object.keys(recMap).forEach(sId => {
                            if (activeStudentIds.includes(sId)) {
                                totalRecords++;
                                const st = recMap[sId];
                                if (st === 'H' || st === 'Hadir') hadir++;
                                else if (st === 'I' || st === 'Izin') izin++;
                                else if (st === 'S' || st === 'Sakit') sakit++;
                                else if (st === 'A' || st === 'Alpa') alpa++;
                            }
                        });
                    }
                });

                const percentHadir = totalRecords > 0 ? Math.round((hadir / totalRecords) * 100) : 0;

                const tr = document.createElement('tr');
                tr.className = "hover:bg-slate-50 transition";
                tr.innerHTML = `
                    <td class="p-3 text-center text-slate-400 font-bold">${idx + 1}</td>
                    <td class="p-3 font-extrabold text-slate-800">${c.name}</td>
                    <td class="p-3 text-center font-bold text-slate-600">${totalSiswaKelas} Siswa</td>
                    <td class="p-3 text-center font-bold text-emerald-700">${hadir}</td>
                    <td class="p-3 text-center font-bold text-blue-700">${izin}</td>
                    <td class="p-3 text-center font-bold text-amber-700">${sakit}</td>
                    <td class="p-3 text-center font-bold text-rose-700">${alpa}</td>
                    <td class="p-3 text-center">
                        <span class="px-2.5 py-1 rounded-full text-[11px] font-black ${percentHadir >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
                            ${percentHadir}%
                        </span>
                    </td>
                `;
                tbodyPresensi.appendChild(tr);
            });
        }
    }

    const tbodyJurnal = document.getElementById('rekap-table-jurnal-body');
    if (tbodyJurnal) {
        tbodyJurnal.innerHTML = '';
        const journals = appState.journals || [];
        let filteredJurnal = journals.filter(j => {
            const inRange = j.tanggal >= startDate && j.tanggal <= endDate;
            const matchKelas = filterKelas === 'ALL' || j.classId === filterKelas;
            return inRange && matchKelas;
        });

        if (filteredJurnal.length === 0) {
            tbodyJurnal.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-slate-400 font-medium">Tidak ada aktivitas jurnal KBM pada rentang tanggal terpilih.</td></tr>`;
        } else {
            filteredJurnal.forEach((j, idx) => {
                const tr = document.createElement('tr');
                tr.className = "hover:bg-slate-50 transition";
                tr.innerHTML = `
                    <td class="p-3 text-center text-slate-400 font-bold">${idx + 1}</td>
                    <td class="p-3 font-semibold text-slate-600 shrink-0">${j.tanggal}</td>
                    <td class="p-3 font-extrabold text-indigo-900">${j.guru}</td>
                    <td class="p-3"><span class="px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-[10px]">${getClassName(j.classId)}</span><br><span class="text-slate-500 font-medium">${j.mapel}</span></td>
                    <td class="p-3"><strong class="text-slate-800 font-bold block">${j.materi}</strong></td>
                `;
                tbodyJurnal.appendChild(tr);
            });
        }
    }
}

function triggerPrintReport(e) {
    if (e) e.preventDefault();
    window.print();
}
